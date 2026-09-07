/**
 * Triggers a browser download for an object URL through a temporary anchor.
 * The caller owns the URL's lifetime.
 */
export function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Downloads a Blob through a short-lived object URL. The URL is revoked after
 * the browser has had ample time to start the download.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
