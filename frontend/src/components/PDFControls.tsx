import React, { useEffect } from 'react';
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
  ws?: WebSocket;
  isTeacher?: boolean;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  className = '',
  ws,
  isTeacher = false
}) => {
  const {
    currentPage,
    numPages,
    scale,
    nextPage,
    prevPage,
    setScale
  } = usePDFStore();

  const sendPDFSignal = (action: string, value?: number) => {
    if (isTeacher && ws) {
      console.log("Sending pdf Signal  ", action)
      ws.send(JSON.stringify({
        type: 'pdf-control',
        roomId: "room1",
        action,
        value
      }));
    }
  };

  const handleNextPage = () => {
    if (isTeacher) {
      nextPage();
      sendPDFSignal('next-page');
    }
  };

  const handlePrevPage = () => {
    if (isTeacher) {
      prevPage();
      sendPDFSignal('prev-page');
    }
  };

  const handleZoomIn = () => {
    console.log(scale)
    const newScale = Math.min(scale + 0.25, 3);
    setScale(newScale);
    if (isTeacher) {
      sendPDFSignal('zoom-in');
    }
  };

  const handleZoomOut = () => {
    console.log(scale)
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
    if (isTeacher) {
      sendPDFSignal('zoom-out');
    }
  };

  useEffect(() => {
    if (!isTeacher && ws) {

      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log("\n Message Received in Control comp : ", data)

        if (data.type === 'pdf-control') {
          switch (data.action) {
            case 'next-page':
              nextPage();
              break;
            case 'prev-page':
              prevPage();
              break;
            case 'zoom-in':
              handleZoomIn()
              break;
            case 'zoom-out':
              handleZoomOut()
              break;
            default:
              break;
          }
        }
      };

      const pdfEventHandler = (event: MessageEvent) => {
        handleMessage(event);
      };


      ws.addEventListener('message', pdfEventHandler);

      return () => ws.removeEventListener('message', pdfEventHandler);
    }
  }, [ws, isTeacher, nextPage, prevPage, setScale]);

  if (!isTeacher) {
    return (
      <div className={`flex items-center gap-4 bg-slate-500 backdrop-blur-sm p-4 rounded-lg shadow-lg ${className}`}>
        <span className="text-sm font-medium text-white">
          Page {currentPage} of {numPages} - {Math.round(scale * 100)}%
        </span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-4 bg-slate-500 backdrop-blur-sm p-4 rounded-lg shadow-lg ${className}`}>
      <button
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-white">
        Page {currentPage} of {numPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage >= numPages}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="w-px h-6 bg-gray-300" />
      <button
        onClick={handleZoomOut}
        disabled={scale <= 0.5}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-white">{Math.round(scale * 100)}%</span>
      <button
        onClick={handleZoomIn}
        disabled={scale >= 2}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <div className="w-px h-6 bg-gray-300" />
      <button
        onClick={() => document.documentElement.requestFullscreen()}
        className="p-2 rounded-full hover:bg-gray-100 text-white"
        aria-label="Enter fullscreen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
};
