import { PDFDocument } from 'pdf-lib';
import type { PDFFile } from '../types';
import { extractBookmarks, addBookmarks, type BookmarkItem } from './pdfBookmarks';

export interface MergeInput {
  pdfFile: PDFFile;
  selectedPages?: number[];
}

export async function mergePDFs(
  items: MergeInput[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const total = items.length;
  
  const allBookmarks: BookmarkItem[] = [];
  let currentPageOffset = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const sourcePdf = await PDFDocument.load(item.pdfFile.buffer);
    
    const pageIndices = item.selectedPages 
      ? item.selectedPages.map(p => p - 1)
      : sourcePdf.getPageIndices();
    
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => mergedPdf.addPage(page));
    
    const sourceBookmarks = await extractBookmarks(sourcePdf);
    if (sourceBookmarks.length > 0) {
      const adjustedBookmarks = adjustBookmarkPageIndices(sourceBookmarks, pageIndices, currentPageOffset);
      
      allBookmarks.push({
        title: item.pdfFile.name.replace('.pdf', ''),
        pageIndex: currentPageOffset,
        children: adjustedBookmarks
      });
    } else {
      allBookmarks.push({
        title: item.pdfFile.name.replace('.pdf', ''),
        pageIndex: currentPageOffset,
        children: []
      });
    }
    
    currentPageOffset += copiedPages.length;
    onProgress?.(i + 1, total);
  }
  
  if (allBookmarks.length > 0) {
    await addBookmarks(mergedPdf, allBookmarks);
  }
  
  return mergedPdf.save();
}

function adjustBookmarkPageIndices(
  bookmarks: BookmarkItem[],
  selectedPageIndices: number[],
  offset: number
): BookmarkItem[] {
  return bookmarks
    .filter(b => selectedPageIndices.includes(b.pageIndex))
    .map(bookmark => {
      const newIndex = selectedPageIndices.indexOf(bookmark.pageIndex);
      return {
        title: bookmark.title,
        pageIndex: newIndex + offset,
        children: adjustBookmarkPageIndices(bookmark.children, selectedPageIndices, offset)
      };
    });
}
