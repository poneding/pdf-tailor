interface PageThumbnailProps {
  thumbnail: string;
  pageNumber: number;
  selected?: boolean;
  onClick?: () => void;
}

export function PageThumbnail({ 
  thumbnail, 
  pageNumber, 
  selected = false,
  onClick 
}: PageThumbnailProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-150
        ${selected 
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' 
          : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
        }
      `}
    >
      <img 
        src={thumbnail} 
        alt={`Page ${pageNumber}`}
        className="w-full h-auto"
      />
      <div className={`
        absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium
        ${selected ? 'bg-blue-500 text-white' : 'bg-gray-800/70 text-white'}
      `}>
        {pageNumber}
      </div>
    </div>
  );
}
