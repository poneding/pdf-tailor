import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function renderPageThumbnail(
  buffer: ArrayBuffer,
  pageNumber: number,
  scale: number = 0.3
): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
  pdf.destroy();
  
  return dataUrl;
}

export async function renderAllThumbnails(
  buffer: ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
  const pageCount = pdf.numPages;
  const thumbnails: string[] = [];
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.3 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    thumbnails.push(canvas.toDataURL('image/jpeg', 0.7));
    onProgress?.(i, pageCount);
  }
  
  pdf.destroy();
  return thumbnails;
}

export async function getPDFPageCount(buffer: ArrayBuffer): Promise<number> {
  const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
  const count = pdf.numPages;
  pdf.destroy();
  return count;
}
