import { PdfProcessingError, throwIfAborted } from "./errors";

/**
 * qpdf-run's browser runner, worker, Emscripten glue and WASM are copied
 * from node_modules by scripts/copy-vendor-assets.mjs and served by Next.js
 * from public/qpdf. The runner is imported by URL at runtime, not bundled:
 * it spawns a classic Worker that `importScripts()` the 68 KB glue, which
 * in turn fetches the 1.8 MB WASM. Nothing is fetched from a CDN.
 */
const QPDF_BASE = "/qpdf";
const QPDF_RUNNER_URL = `${QPDF_BASE}/src/index.js`;
const QPDF_WORKER_URL = `${QPDF_BASE}/src/worker.js`;
const QPDF_JS_URL = `${QPDF_BASE}/lib/qpdf.js`;
const QPDF_WASM_URL = `${QPDF_BASE}/lib/qpdf.wasm`;

/** Generous ceiling for one command; large scans can take a while in WASM. */
const QPDF_TIMEOUT_MS = 10 * 60 * 1000;

/** The subset of qpdf-run's API this code calls (see its index.d.ts). */
interface QpdfRunResult {
  ok: boolean;
  outputs: Record<string, Uint8Array>;
  stderr: string[];
  warnings: string[];
  exitCode: number | null;
}

interface QpdfRunner {
  run(options: {
    inputs: Record<string, Uint8Array>;
    args: string[];
    outputs: string[];
  }): Promise<QpdfRunResult>;
  destroy(): Promise<void>;
}

interface QpdfRunnerModule {
  createQpdfRunner(options: {
    workerUrl: string;
    qpdfJsUrl: string;
    wasmUrl: string;
    timeoutMs: number;
  }): Promise<QpdfRunner>;
}

let runnerPromise: Promise<QpdfRunner> | null = null;

/**
 * Creates the worker-backed runner on first use and keeps it for later runs
 * on the same page. Loading happens only when a qpdf command is actually
 * requested, never on route load.
 */
function getRunner(): Promise<QpdfRunner> {
  runnerPromise ??= (async () => {
    const runtime = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ QPDF_RUNNER_URL
    )) as QpdfRunnerModule;
    return runtime.createQpdfRunner({
      workerUrl: QPDF_WORKER_URL,
      qpdfJsUrl: QPDF_JS_URL,
      wasmUrl: QPDF_WASM_URL,
      timeoutMs: QPDF_TIMEOUT_MS,
    });
  })().catch((error) => {
    runnerPromise = null;
    throw error;
  });
  return runnerPromise;
}

/**
 * Terminates the qpdf worker. qpdf itself cannot be interrupted mid-command,
 * so this is how cancellation works: the worker dies, the pending run
 * rejects, and the next run starts a fresh worker.
 */
export function terminateQpdf(): void {
  const pending = runnerPromise;
  runnerPromise = null;
  pending?.then((runner) => runner.destroy()).catch(() => undefined);
}

function errorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
}

/**
 * Runs one qpdf command with a single input and output file. `args` must
 * already contain the `--` separator and the two filenames.
 */
export async function runQpdf(
  input: Uint8Array,
  args: readonly string[],
  inputName: string,
  outputName: string,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  throwIfAborted(signal);
  const runner = await getRunner();
  throwIfAborted(signal);

  const onAbort = () => terminateQpdf();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const result = await runner.run({
      inputs: { [inputName]: input },
      args: [...args],
      outputs: [outputName],
    });
    const output = result.outputs[outputName];
    if (!result.ok || !output) throw new PdfProcessingError("unknown");
    return output;
  } catch (error) {
    if (signal?.aborted) throw new PdfProcessingError("cancelled");
    if (error instanceof PdfProcessingError) throw error;
    const code = errorCode(error);
    if (code === "QPDF_INIT_FAILED") throw new PdfProcessingError("unsupported", error);
    if (code === "QPDF_TIMEOUT") throw new PdfProcessingError("resources", error);
    throw new PdfProcessingError("invalid", error);
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
