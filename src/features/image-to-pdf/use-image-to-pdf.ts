"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { toImageProcessingError } from "@/lib/image/errors";

import { loadSelectedImage, revokeSelectedImages } from "./add-images";
import { buildPdfFilename } from "./filenames";
import type { ImageInputFormatConfig } from "./formats";
import { generatePdf } from "./generate-pdf";
import { DEFAULT_PAGE_SETTINGS, type PageSettings } from "./layout";
import { moveItem } from "./reorder";
import type { GeneratedPdf, ImageToPdfState, SelectedImage } from "./types";

const INITIAL_STATE: ImageToPdfState = {
  phase: "idle",
  images: [],
  settings: DEFAULT_PAGE_SETTINGS,
  pendingCount: 0,
  notices: [],
  progress: null,
  result: null,
  error: null,
};

/**
 * The synchronous source of truth for one selection. Event handlers mutate
 * it immediately and then mirror it into React state, so an action that
 * follows another in the same tick (add image, then Create PDF) always sees
 * current data. Disposing a session aborts any work and revokes every
 * object URL it owns.
 */
interface Session {
  images: readonly SelectedImage[];
  settings: PageSettings;
  result: GeneratedPdf | null;
  lifetime: AbortController;
  /** Controller for the generation currently running, if any. */
  run: AbortController | null;
}

function createSession(): Session {
  return {
    images: [],
    settings: DEFAULT_PAGE_SETTINGS,
    result: null,
    lifetime: new AbortController(),
    run: null,
  };
}

function disposeSession(session: Session): void {
  session.run?.abort();
  session.run = null;
  session.lifetime.abort();
  revokeSelectedImages(session.images);
  session.images = [];
  if (session.result) URL.revokeObjectURL(session.result.objectUrl);
  session.result = null;
}

/** Any change to inputs makes an existing PDF stale. */
function invalidateResult(session: Session): void {
  if (session.result) URL.revokeObjectURL(session.result.objectUrl);
  session.result = null;
}

export function useImageToPdf(format: ImageInputFormatConfig) {
  const [state, setState] = useState<ImageToPdfState>(INITIAL_STATE);
  const sessionRef = useRef<Session>(createSession());

  // Dispose on unmount, then install a fresh session so the ref never keeps
  // pointing at an aborted one. React Strict Mode runs this cleanup once on
  // mount in development; without the replacement every later file read
  // would be treated as cancelled and the pending counter would never clear.
  useEffect(() => {
    return () => {
      disposeSession(sessionRef.current);
      sessionRef.current = createSession();
    };
  }, []);

  /** Mirror the session into React state, with an optional patch on top. */
  const sync = useCallback((patch: Partial<ImageToPdfState> = {}) => {
    const session = sessionRef.current;
    setState((previous) => ({
      ...previous,
      images: session.images,
      settings: session.settings,
      result: session.result,
      phase: session.run
        ? "generating"
        : session.result
          ? "complete"
          : session.images.length > 0
            ? "ready"
            : "idle",
      ...patch,
    }));
  }, []);

  const addFiles = useCallback(
    async (files: readonly File[]) => {
      if (files.length === 0) return;
      const session = sessionRef.current;
      invalidateResult(session);
      setState((previous) => ({
        ...previous,
        result: null,
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
            phase: session.run ? "generating" : "ready",
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
      invalidateResult(session);
      sync({ error: null });
    },
    [sync],
  );

  const moveImage = useCallback(
    (from: number, to: number) => {
      const session = sessionRef.current;
      const images = moveItem(session.images, from, to);
      if (images === session.images) return;
      session.images = images;
      invalidateResult(session);
      sync({ error: null });
    },
    [sync],
  );

  const updateSettings = useCallback(
    (patch: Partial<PageSettings>) => {
      const session = sessionRef.current;
      session.settings = { ...session.settings, ...patch };
      invalidateResult(session);
      sync({ error: null });
    },
    [sync],
  );

  const dismissNotices = useCallback(() => {
    setState((previous) => ({ ...previous, notices: [] }));
  }, []);

  const create = useCallback(async () => {
    const session = sessionRef.current;
    if (session.images.length === 0 || session.run) return;

    const run = new AbortController();
    session.run = run;
    invalidateResult(session);
    const images = session.images;
    const settings = session.settings;
    const isCurrent = () =>
      sessionRef.current === session && session.run === run && !run.signal.aborted;

    sync({ error: null, progress: { current: 1, total: images.length } });

    try {
      const { blob, pageCount } = await generatePdf(images, {
        format,
        settings,
        signal: run.signal,
        onProgress: (progress) => {
          if (isCurrent()) setState((previous) => ({ ...previous, progress }));
        },
      });
      if (!isCurrent()) return;
      session.run = null;
      session.result = {
        blob,
        objectUrl: URL.createObjectURL(blob),
        filename: buildPdfFilename(images.map((image) => image.name)),
        size: blob.size,
        pageCount,
      };
      sync({ progress: null });
    } catch (error) {
      if (!isCurrent()) return;
      session.run = null;
      const failure = toImageProcessingError(error);
      sync({ phase: "error", progress: null, error: failure.message });
    }
  }, [format, sync]);

  const cancel = useCallback(() => {
    const session = sessionRef.current;
    if (!session.run) return;
    session.run.abort();
    session.run = null;
    sync({ progress: null });
  }, [sync]);

  const reset = useCallback(() => {
    disposeSession(sessionRef.current);
    sessionRef.current = createSession();
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    addFiles,
    removeImage,
    moveImage,
    updateSettings,
    dismissNotices,
    create,
    cancel,
    reset,
  } as const;
}

export type ImageToPdfController = ReturnType<typeof useImageToPdf>;
export type { SelectedImage };
