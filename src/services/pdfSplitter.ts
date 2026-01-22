import { PDFDocument } from 'pdf-lib';
import type { SplitOptions, SplitResult } from '../types';
import { parsePageRanges, generateSplitRanges, formatPageRange } from '../utils';
import { extractBookmarks, filterBookmarksForPages, addBookmarks } from './pdfBookmarks';

export async function splitPDF(
  buffer: ArrayBuffer,
  options: SplitOptions,
  originalFileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<SplitResult[]> {
  const sourcePdf = await PDFDocument.load(buffer);
  const totalPages = sourcePdf.getPageCount();
  const results: SplitResult[] = [];
  
  const sourceBookmarks = await extractBookmarks(sourcePdf);
  
  const baseName = originalFileName.replace(/\.pdf$/i, '');
  
  let pageGroups: number[][] = [];
  
  switch (options.mode) {
    case 'byPageCount':
      if (options.pageCount && options.pageCount > 0) {
        const ranges = generateSplitRanges(totalPages, 'byPageCount', options.pageCount);
        pageGroups = ranges.map(r => 
          Array.from({ length: r.end - r.start + 1 }, (_, i) => r.start + i)
        );
      }
      break;
      
    case 'byParts':
      if (options.parts && options.parts > 0) {
        const ranges = generateSplitRanges(totalPages, 'byParts', options.parts);
        pageGroups = ranges.map(r => 
          Array.from({ length: r.end - r.start + 1 }, (_, i) => r.start + i)
        );
      }
      break;
      
    case 'custom':
      if (options.ranges) {
        pageGroups = parsePageRanges(options.ranges, totalPages);
      }
      break;
      
    case 'extractAll':
      pageGroups = Array.from({ length: totalPages }, (_, i) => [i + 1]);
      break;
  }
  
  const total = pageGroups.length;
  
  for (let i = 0; i < pageGroups.length; i++) {
    const group = pageGroups[i];
    const newPdf = await PDFDocument.create();
    const pageIndices = group.map(p => p - 1);
    
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    if (sourceBookmarks.length > 0) {
      const filteredBookmarks = filterBookmarksForPages(sourceBookmarks, pageIndices);
      if (filteredBookmarks.length > 0) {
        await addBookmarks(newPdf, filteredBookmarks);
      }
    }
    
    const pdfBytes = await newPdf.save();
    const pageRange = formatPageRange(group);
    
    results.push({
      name: `${baseName}_${i + 1}_pages_${pageRange.replace(/,\s*/g, '-')}.pdf`,
      data: pdfBytes,
      pageRange
    });
    
    onProgress?.(i + 1, total);
  }
  
  return results;
}
