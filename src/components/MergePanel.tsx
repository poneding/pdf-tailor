import { useState, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { ProgressBar } from './ProgressBar';
import type { PDFFile } from '../types';
import { getPDFPageCount, renderAllThumbnails, mergePDFs } from '../services';
import { generateId, formatFileSize } from '../utils';
import { saveAs } from 'file-saver';
import { Trash2, MoveUp, MoveDown, Layers, Loader2 } from 'lucide-react';
import { useTranslation } from '../i18n';

export function MergePanel() {
  const { t } = useTranslation();
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const handleFilesSelected = useCallback(async (files: File[]) => {
    setLoading(true);
    setProgress(0);
    
    const newFiles: PDFFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressLabel(t('mergePanel.loadingFile', { name: file.name }));
      
      try {
        const buffer = await file.arrayBuffer();
        const pageCount = await getPDFPageCount(buffer);
        const thumbnails = await renderAllThumbnails(buffer, (current, total) => {
          const fileProgress = (i / files.length) * 100;
          const thumbProgress = (current / total) * (100 / files.length);
          setProgress(fileProgress + thumbProgress);
        });
        
        newFiles.push({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          pageCount,
          buffer,
          thumbnails
        });
      } catch (error) {
        console.error(`Failed to load ${file.name}:`, error);
      }
    }
    
    setPdfFiles(prev => [...prev, ...newFiles]);
    setLoading(false);
    setProgress(0);
    setProgressLabel('');
  }, [t]);
  
  const handleRemove = useCallback((id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  }, []);
  
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setPdfFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  }, []);
  
  const handleMoveDown = useCallback((index: number) => {
    setPdfFiles(prev => {
      if (index === prev.length - 1) return prev;
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  }, []);
  
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setPdfFiles(prev => {
      const newFiles = [...prev];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(index, 0, draggedFile);
      return newFiles;
    });
    setDraggedIndex(index);
  }, [draggedIndex]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);
  
  const handleMerge = useCallback(async () => {
    if (pdfFiles.length < 2) return;
    
    setLoading(true);
    setProgress(0);
    setProgressLabel(t('mergePanel.merging'));
    
    try {
      const mergedData = await mergePDFs(
        pdfFiles.map(pf => ({ pdfFile: pf })),
        (current, total) => {
          setProgress((current / total) * 100);
        }
      );
      
      const blob = new Blob([mergedData], { type: 'application/pdf' });
      saveAs(blob, 'merged.pdf');
    } catch (error) {
      console.error('Failed to merge PDFs:', error);
      alert(t('mergePanel.mergeError'));
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel('');
    }
  }, [pdfFiles, t]);
  
  const handleClear = useCallback(() => {
    setPdfFiles([]);
  }, []);
  
  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);
  
  return (
    <div className="space-y-6">
      <FileUploader 
        onFilesSelected={handleFilesSelected} 
        multiple 
        disabled={loading}
        progress={loading && pdfFiles.length === 0 ? progress : 0}
      />
      
      {loading && pdfFiles.length > 0 && (
        <ProgressBar progress={progress} label={progressLabel} />
      )}
      
      {pdfFiles.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('mergePanel.fileSummary', { fileCount: pdfFiles.length.toString(), totalPages: totalPages.toString() })}
            </p>
            <button
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {t('mergePanel.clearAll')}
            </button>
          </div>
          
          <div className="space-y-2">
            {pdfFiles.map((pdfFile, index) => (
              <div
                key={pdfFile.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg cursor-move
                  transition-all duration-150
                  ${draggedIndex === index ? 'opacity-50 scale-[0.98]' : 'hover:shadow-md dark:hover:bg-gray-750'}
                `}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === pdfFiles.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {pdfFile.thumbnails[0] && (
                    <img 
                      src={pdfFile.thumbnails[0]} 
                      alt="Preview" 
                      className="w-10 h-14 object-cover rounded border dark:border-gray-600"
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(pdfFile.size)} · {pdfFile.pageCount} {t('tabs.pages')}
                  </p>
                </div>
                
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                  {index + 1}
                </span>
                
                <button
                  onClick={() => handleRemove(pdfFile.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleMerge}
            disabled={loading || pdfFiles.length < 2}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('mergePanel.merging')}
              </>
            ) : (
              <>
                <Layers className="w-5 h-5" />
                {t('mergePanel.mergeButton', { totalPages: totalPages.toString() })}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
