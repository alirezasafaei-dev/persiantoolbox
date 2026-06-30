let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
let pdfLibPromise: Promise<typeof import('pdf-lib')> | null = null;
import type JSZip from 'jszip';

let jszipPromise: Promise<JSZip> | null = null;
let pdfWorkerReady = false;

export function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist');
  }
  return pdfjsPromise;
}

export function loadPdfLib() {
  if (!pdfLibPromise) {
    pdfLibPromise = import('pdf-lib');
  }
  return pdfLibPromise;
}

export function loadJsZip() {
  if (!jszipPromise) {
    jszipPromise = import('jszip').then((mod) => mod.default);
  }
  return jszipPromise;
}

/**
 * Configure pdfjs-dist worker from the public directory.
 * The worker file is copied to public/pdf.worker.min.mjs at install time
 * via the "postinstall" script in package.json.
 * This avoids the unreliable `new URL(..., import.meta.url)` pattern
 * that fails in Next.js production builds.
 */
export async function setupPdfWorker(): Promise<void> {
  if (pdfWorkerReady) {
    return;
  }

  const { GlobalWorkerOptions } = await loadPdfJs();
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  pdfWorkerReady = true;
}
