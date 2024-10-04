
const pdf_url = "https://sidd-bucket-digital.blr1.digitaloceanspaces.com/test.pdf";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDFStore } from '../store/pdfStore';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


console.log(pdfjs.version)

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs"

interface PDFViewerProps {
  url: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, className = '' }) => {
  const { currentPage, setNumPages, scale } = usePDFStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfData, setPdfData] = React.useState<ArrayBuffer | null>(null);

  React.useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await fetch("http://localhost:8080/pdf/123", {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }

        const arrayBuffer = await response.arrayBuffer();
        setPdfData(arrayBuffer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setLoading(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading PDF: {error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      {pdfData && (
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="flex justify-center"
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale * 2}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={null}
          />
        </Document>
      )}
    </div>
  );
};


const PdfView = () => {

  return (
    <>      <div className="max-w-[90%] mx-auto bg-black p-8 rounded-3xl shadow-2xl">
      <div className="aspect-video bg-white rounded-lg overflow-hidden">
        <PDFViewer url={pdf_url} className="w-full h-full" />
      </div>
    </div>


    </>

  );





}

export default PdfView
