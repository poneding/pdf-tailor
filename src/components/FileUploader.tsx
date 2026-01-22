import { useCallback, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  progress?: number;
}

export function FileUploader({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = false,
  disabled = false,
  progress = 0
}: FileUploaderProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  }, [disabled, multiple, onFilesSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFilesSelected]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        ${disabled ? 'opacity-80 cursor-not-allowed' : ''}
      `}
    >
      {progress > 0 && progress < 100 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-3 relative z-10">
        <UploadCloud
          className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`}
          strokeWidth={1.5}
        />

        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {progress > 0 && progress < 100
              ? t('fileUploader.processing', { progress: Math.round(progress).toString() })
              : (isDragging ? t('fileUploader.dragging') : t('fileUploader.dropHere'))
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {progress > 0 && progress < 100
              ? t('fileUploader.pleaseWait')
              : `${t('fileUploader.orClick')} ${multiple ? t('fileUploader.multipleSupported') : ''}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
