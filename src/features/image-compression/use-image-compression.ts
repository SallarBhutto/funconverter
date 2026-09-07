"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { downloadBlob } from "@/lib/files/download";
import { buildZipArchive } from "@/lib/files/zip";
import { toImageProcessingError } from "@/lib/image/errors";
import {
  loadSelectedImage,
  revokeSelectedImages,
  type SelectedImage,
} from "@/lib/image/selected-image";

import { compressImage } from "./compress-image";
import { buildCompressedArchiveName, buildCompressedFilename } from "./filenames";
import type { CompressibleFormatConfig, QualityPreset } from "./formats";
import type { ArchiveStatus, CompressionResult, ImageCompressionState } from "./types";

/**
 * The synchronous source of truth for one selection. Handlers mutate it and
 * mirror it into React state, so consecutive actions in one tick always see
 * current data. Disposing a session aborts any work and revokes every
 * object URL it owns: image previews and result downloads.
 */
interface Session {
  images: readonly SelectedImage[];
  results: Record<string, CompressionResult>;
  preset: QualityPreset;
  lifetime: AbortController;
  run: AbortController | null;
}

function createSession(preset: QualityPreset): Session {
  return { images: [], results: {}, preset, lifetime: new AbortController(), run: null };
}

function revokeResults(results: Record<string, CompressionResult>): void {
  for (const result of Object.values(results)) URL.revokeObjectURL(result.objectUrl);
}

function disposeSession(session: Session): void {
  session.run?.abort();
  session.run = null;
  session.lifetime.abort();
  revokeSelectedImages(session.images);
  session.images = [];
  revokeResults(session.results);
  session.results = {};
}

function initialState(preset: QualityPreset): ImageCompressionState {
  return {
    phase: "idle",
    images: [],
    results: {},
    preset,
    pendingCount: 0,
    notices: [],
    progress: null,
    error: null,
  };
}

export function useImageCompression(format: CompressibleFormatConfig) {
  const defaultPreset = format.defaultPreset ?? "balanced";
  const [state, setState] = useState<ImageCompressionState>(() => initialState(defaultPreset));
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus>("idle");
  const sessionRef = useRef<Session>(createSession(defaultPreset));

  // Dispose on unmount, then install a fresh session so the ref never keeps
  // pointing at an aborted one. React Strict Mode runs this cleanup once on
  // mount in development; without the replacement every later file read
  // would be treated as cancelled and the pending counter would never clear.
  useEffect(() => {
    return () => {
      disposeSession(sessionRef.current);
      sessionRef.current = createSession(defaultPreset);
    };
  }, [defaultPreset]);

  /** Mirror the session into React state, with an optional patch on top. */
  const sync = useCallback((patch: Partial<ImageCompressionState> = {}) => {
    const session = sessionRef.current;
    const allDone =
      session.images.length > 0 && session.images.every((image) => session.results[image.id]);
    setState((previous) => ({
      ...previous,
      images: session.images,
      results: { ...session.results },
      preset: session.preset,
      phase: session.run
        ? "compressing"
        : allDone
          ? "complete"
          : session.images.length > 0
            ? "ready"
            : "idle",
      ...patch,
    }));
  }, []);

  /** Results become stale whenever inputs or settings change. */
  const invalidateResults = useCallback((ids?: readonly string[]) => {
    const session = sessionRef.current;
    if (!ids) {
      revokeResults(session.results);
      session.results = {};
      return;
    }
    for (const id of ids) {
      const result = session.results[id];
      if (result) {
        URL.revokeObjectURL(result.objectUrl);
        delete session.results[id];
      }
    }
  }, []);

  const addFiles = useCallback(
    async (files: readonly File[]) => {
      if (files.length === 0) return;
      const session = sessionRef.current;
      setArchiveStatus("idle");
      setState((previous) => ({
        ...previous,
        error: null,
        notices: [],
        pendingCount: previous.pendingCount + files.length,
      }));

      // Decode one at a time so only one full-size bitmap exists at once.
      for (const file of files) {
        if (session.lifetime.signal.aborted) return;
        try {
          const image = await loadSelectedImage(file, format, session.lifetime.signal);
          if (session.lifetime.signal.aborted || sessionRef.current !== session) {
            revokeSelectedImages([image]);
            return;
          }
          session.images = [...session.images, image];
          setState((previous) => ({
            ...previous,
            images: session.images,
            phase: session.run ? "compressing" : "ready",
            pendingCount: Math.max(0, previous.pendingCount - 1),
          }));
        } catch (error) {
          if (session.lifetime.signal.aborted) return;
          const failure = toImageProcessingError(error);
          const notice =
            failure.code === "wrong-format" ? failure.message : `${file.name}: ${failure.message}`;
          setState((previous) => ({
            ...previous,
            pendingCount: Math.max(0, previous.pendingCount - 1),
            notices: [...previous.notices, notice],
          }));
        }
      }
    },
    [format],
  );

  const removeImage = useCallback(
    (id: string) => {
      const session = sessionRef.current;
      const image = session.images.find((candidate) => candidate.id === id);
      if (!image) return;
      revokeSelectedImages([image]);
      session.images = session.images.filter((candidate) => candidate.id !== id);
      invalidateResults([id]);
      setArchiveStatus("idle");
      sync({ error: null });
    },
    [invalidateResults, sync],
  );

  const setPreset = useCallback(
    (preset: QualityPreset) => {
      const session = sessionRef.current;
      if (session.preset === preset) return;
      session.preset = preset;
      invalidateResults();
      setArchiveStatus("idle");
      sync({ error: null });
    },
    [invalidateResults, sync],
  );

  const dismissNotices = useCallback(() => {
    setState((previous) => ({ ...previous, notices: [] }));
  }, []);

  const compress = useCallback(async () => {
    const session = sessionRef.current;
    if (session.images.length === 0 || session.run) return;

    const run = new AbortController();
    session.run = run;
    invalidateResults();
    setArchiveStatus("idle");
    const images = session.images;
    const preset = session.preset;
    const isCurrent = () =>
      sessionRef.current === session && session.run === run && !run.signal.aborted;

    sync({ error: null, progress: { current: 1, total: images.length } });

    try {
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        if (!isCurrent()) return;
        setState((previous) => ({ ...previous, progress: { current: index + 1, total: images.length } }));

        const compressed = await compressImage(image, format, preset, run.signal);
        if (!isCurrent()) return;
        // The image may have been removed while its compression was in flight.
        if (!session.images.some((candidate) => candidate.id === image.id)) continue;

        session.results[image.id] = {
          ...compressed,
          imageId: image.id,
          objectUrl: URL.createObjectURL(compressed.blob),
          filename: buildCompressedFilename(image.name, format.extension),
        };
        sync({ progress: { current: index + 1, total: images.length } });
      }
      if (!isCurrent()) return;
      session.run = null;
      sync({ progress: null });
    } catch (error) {
      if (!isCurrent()) return;
      session.run = null;
      const failure = toImageProcessingError(error);
      sync({ phase: "error", progress: null, error: failure.message });
    }
  }, [format, invalidateResults, sync]);

  const cancel = useCallback(() => {
    const session = sessionRef.current;
    if (!session.run) return;
    session.run.abort();
    session.run = null;
    sync({ progress: null });
  }, [sync]);

  const reset = useCallback(() => {
    disposeSession(sessionRef.current);
    sessionRef.current = createSession(defaultPreset);
    setArchiveStatus("idle");
    setState(initialState(defaultPreset));
  }, [defaultPreset]);

  const downloadAll = useCallback(async () => {
    const session = sessionRef.current;
    const entries = session.images
      .map((image) => session.results[image.id])
      .filter((result): result is CompressionResult => Boolean(result))
      .map((result) => ({ filename: result.filename, blob: result.blob }));
    if (entries.length === 0) return;

    setArchiveStatus("building");
    try {
      const archive = await buildZipArchive(entries);
      if (sessionRef.current !== session) return;
      downloadBlob(archive, buildCompressedArchiveName(format.extension));
      setArchiveStatus("idle");
    } catch {
      if (sessionRef.current === session) setArchiveStatus("error");
    }
  }, [format.extension]);

  return {
    state,
    archiveStatus,
    addFiles,
    removeImage,
    setPreset,
    dismissNotices,
    compress,
    cancel,
    reset,
    downloadAll,
  } as const;
}
