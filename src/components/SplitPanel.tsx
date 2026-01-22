import { useState, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { PageThumbnail } from './PageThumbnail';
import { ProgressBar } from './ProgressBar';
import type { PDFFile, SplitMode, SplitResult } from '../types';
import { getPDFPageCount, renderAllThumbnails, splitPDF } from '../services';
import { generateId, formatFileSize } from '../utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileType, Rocket, Download, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from '../i18n';

export function SplitPanel() {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('byPageCount');
  const [pageCount, setPageCount] = useState(5);
  const [parts, setParts] = useState(2);
  const [customRanges, setCustomRanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [results, setResults] = useState<SplitResult[]>([]);
  
  const handleFilesSelected = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    setProgressLabel(t('splitPanel.loadingPdf'));
    setResults([]);
    
    try {
      const buffer = await file.arrayBuffer();
      const pageCountVal = await getPDFPageCount(buffer);
      
      setProgressLabel(t('splitPanel.generatingPreview'));
      const thumbnails = await renderAllThumbnails(buffer, (current, total) => {
        setProgress((current / total) * 100);
      });
      
      setPdfFile({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        pageCount: pageCountVal,
        buffer,
        thumbnails
      });
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert(t('splitPanel.loadError'));
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel('');
    }
  }, [t]);
  
  const handleSplit = useCallback(async () => {
    if (!pdfFile) return;
    
    setLoading(true);
    setProgress(0);
    setProgressLabel(t('splitPanel.splitting'));
    
    try {
      const splitResults = await splitPDF(
        pdfFile.buffer,
        {
          mode: splitMode,
          pageCount: splitMode === 'byPageCount' ? pageCount : undefined,
          parts: splitMode === 'byParts' ? parts : undefined,
          ranges: splitMode === 'custom' ? customRanges : undefined
        },
        pdfFile.name,
        (current, total) => {
          setProgress((current / total) * 100);
        }
      );
      
      setResults(splitResults);
    } catch (error) {
      console.error('Failed to split PDF:', error);
      alert(t('splitPanel.splitError'));
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel('');
    }
  }, [pdfFile, splitMode, pageCount, parts, customRanges, t]);
  
  const handleDownloadSingle = useCallback((result: SplitResult) => {
    const blob = new Blob([result.data], { type: 'application/pdf' });
    saveAs(blob, result.name);
  }, []);
  
  const handleDownloadAll = useCallback(async () => {
    if (results.length === 0) return;
    
    setLoading(true);
    setProgressLabel(t('splitPanel.packaging'));
    
    try {
      const zip = new JSZip();
      results.forEach(result => {
        zip.file(result.name, result.data);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${pdfFile?.name.replace('.pdf', '')}_split.zip`);
    } catch (error) {
      console.error('Failed to create zip:', error);
      alert(t('splitPanel.packageError'));
    } finally {
      setLoading(false);
      setProgressLabel('');
    }
  }, [results, pdfFile, t]);
  
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setResults([]);
  }, []);
  
  return (
    <div className="space-y-6">
      {!pdfFile ? (
        <FileUploader 
          onFilesSelected={handleFilesSelected} 
          disabled={loading} 
          progress={loading && !pdfFile ? progress : 0}
        />
      ) : (
        <>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <FileType className="w-8 h-8 text-red-500" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{pdfFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('splitPanel.fileInfo', { size: formatFileSize(pdfFile.size), pageCount: pdfFile.pageCount.toString() })}
                </p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {t('splitPanel.remove')}
            </button>
          </div>
          
          <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2">
            {pdfFile.thumbnails.map((thumb, idx) => (
              <PageThumbnail key={idx} thumbnail={thumb} pageNumber={idx + 1} />
            ))}
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg space-y-4 transition-colors">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('splitPanel.splitMode')}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${splitMode === 'byPageCount' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="splitMode" 
                  checked={splitMode === 'byPageCount'}
                  onChange={() => setSplitMode('byPageCount')}
                  className="text-blue-500"
                />
                <span className="text-sm dark:text-gray-300">{t('splitPanel.byPageCount')}</span>
              </label>
              
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${splitMode === 'byParts' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="splitMode"
                  checked={splitMode === 'byParts'}
                  onChange={() => setSplitMode('byParts')}
                  className="text-blue-500"
                />
                <span className="text-sm dark:text-gray-300">{t('splitPanel.byParts')}</span>
              </label>
              
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${splitMode === 'custom' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="splitMode"
                  checked={splitMode === 'custom'}
                  onChange={() => setSplitMode('custom')}
                  className="text-blue-500"
                />
                <span className="text-sm dark:text-gray-300">{t('splitPanel.custom')}</span>
              </label>
              
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${splitMode === 'extractAll' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="splitMode"
                  checked={splitMode === 'extractAll'}
                  onChange={() => setSplitMode('extractAll')}
                  className="text-blue-500"
                />
                <span className="text-sm dark:text-gray-300">{t('splitPanel.extractAll')}</span>
              </label>
            </div>
            
            {splitMode === 'byPageCount' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('splitPanel.perPageSplit')}</span>
                <input
                  type="number"
                  min={1}
                  max={pdfFile.pageCount}
                  value={pageCount}
                  onChange={e => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('splitPanel.pages')}</span>
              </div>
            )}
            
            {splitMode === 'byParts' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('splitPanel.splitInto')}</span>
                <input
                  type="number"
                  min={2}
                  max={pdfFile.pageCount}
                  value={parts}
                  onChange={e => setParts(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('splitPanel.parts')}</span>
              </div>
            )}
            
            {splitMode === 'custom' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customRanges}
                  onChange={e => setCustomRanges(e.target.value)}
                  placeholder={t('splitPanel.rangePlaceholder')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('splitPanel.rangeHint')}
                </p>
              </div>
            )}
          </div>
          
          {loading && (
            <ProgressBar progress={progress} label={progressLabel} />
          )}
          
          <button
            onClick={handleSplit}
            disabled={loading || (splitMode === 'custom' && !customRanges.trim())}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('splitPanel.processingText')}
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                {t('splitPanel.startSplit')}
              </>
            )}
          </button>
          
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('splitPanel.splitResults', { count: results.length.toString() })}</h3>
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('splitPanel.downloadAll')}
                </button>
              </div>
              
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{result.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('splitPanel.pageRange', { range: result.pageRange })}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(result)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('splitPanel.download')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
