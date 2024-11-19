import React from 'react';
import { usePDFStore } from '../store/pdfStore';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface PDFControlsProps {
  className?: string;
}

export const PDFControls: React.FC<PDFControlsProps> = ({ className = '' }) => {
  const {
    currentPage,
    numPages,
    scale,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
  } = usePDFStore();

  return (
    <div
      className={`flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg ${className}`}
    >
      <button
        onClick={prevPage}
        disabled={currentPage <= 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium">
        Page {currentPage} of {numPages}
      </span>

      <button
        onClick={nextPage}
        disabled={currentPage >= numPages}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300" />

      <button
        onClick={zoomOut}
        disabled={scale <= 0.5}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>

      <button
        onClick={zoomIn}
        disabled={scale >= 2}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300" />

      <button
        onClick={() => document.documentElement.requestFullscreen()}
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Enter fullscreen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
};