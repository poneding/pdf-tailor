import type { PageRange } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function parsePageRanges(rangeString: string, totalPages: number): number[][] {
  const ranges: number[][] = [];
  const parts = rangeString.split(',').map(s => s.trim()).filter(Boolean);
  
  for (const part of parts) {
    const pages: number[] = [];
    
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pages.push(page);
      }
    }
    
    if (pages.length > 0) {
      ranges.push(pages);
    }
  }
  
  return ranges;
}

export function generateSplitRanges(
  totalPages: number,
  mode: 'byPageCount' | 'byParts',
  value: number
): PageRange[] {
  const ranges: PageRange[] = [];
  
  if (mode === 'byPageCount') {
    for (let i = 0; i < totalPages; i += value) {
      ranges.push({
        start: i + 1,
        end: Math.min(i + value, totalPages)
      });
    }
  } else if (mode === 'byParts') {
    const pagesPerPart = Math.ceil(totalPages / value);
    for (let i = 0; i < value; i++) {
      const start = i * pagesPerPart + 1;
      const end = Math.min((i + 1) * pagesPerPart, totalPages);
      if (start <= totalPages) {
        ranges.push({ start, end });
      }
    }
  }
  
  return ranges;
}

export function formatPageRange(pages: number[]): string {
  if (pages.length === 0) return '';
  if (pages.length === 1) return String(pages[0]);
  
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? String(start) : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? String(start) : `${start}-${end}`);
  
  return ranges.join(', ');
}
