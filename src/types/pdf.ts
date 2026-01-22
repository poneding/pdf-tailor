export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
  thumbnails: string[];
}

export type SplitMode = 'byPageCount' | 'byParts' | 'custom' | 'extractAll';

export interface SplitOptions {
  mode: SplitMode;
  pageCount?: number;
  parts?: number;
  ranges?: string;
}

export interface SplitResult {
  name: string;
  data: Uint8Array;
  pageRange: string;
}

export interface MergeItem {
  id: string;
  pdfFile: PDFFile;
  selectedPages: number[];
  order: number;
}

export interface PageRange {
  start: number;
  end: number;
}

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export interface AppState {
  activeTab: 'split' | 'merge';
  splitFile: PDFFile | null;
  mergeFiles: PDFFile[];
  splitOptions: SplitOptions;
  status: ProcessingStatus;
  error: string | null;
  progress: number;
}
