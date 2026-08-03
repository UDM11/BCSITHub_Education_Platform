// src/components/common/PDFViewer.tsx
import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Loader2, FileText } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set PDF.js worker URL using Vite native worker loader to bundle locally
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PDFViewerProps {
  fileUrl: string;
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive page sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        // Adjust for padding (p-4 is 16px on each side)
        const width = entries[0].contentRect.width;
        setContainerWidth(width > 40 ? width - 8 : width);
      }
    });

    resizeObserver.observe(containerRef.current);
    
    // Set initial width
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 40) {
      setContainerWidth(rect.width - 8);
    }

    return () => resizeObserver.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-premium" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-4 py-2 border-b border-slate-800 text-slate-300 z-10">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-800 active:bg-slate-700 text-slate-300 disabled:text-slate-655 disabled:hover:bg-transparent transition-colors cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold select-none min-w-[70px] text-center">
            Page {pageNumber} of {numPages || "?"}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 active:bg-slate-700 text-slate-300 disabled:text-slate-655 disabled:hover:bg-transparent transition-colors cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:bg-slate-800 active:bg-slate-700 text-slate-300 disabled:text-slate-650 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold min-w-[40px] text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="p-1.5 rounded-lg hover:bg-slate-800 active:bg-slate-700 text-slate-300 disabled:text-slate-650 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg hover:bg-slate-800 active:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto flex justify-center items-start p-4 bg-slate-900 custom-scrollbar select-none relative min-h-[300px]">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-medium">Loading document...</span>
            </div>
          }
          error={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-2">
                <FileText className="w-6 h-6 text-rose-400" />
              </div>
              <p className="text-sm font-bold text-slate-200">Unable to load document</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                The connection failed or the format is invalid. Please try downloading the attachment instead.
              </p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            width={containerWidth}
            className="shadow-premium rounded-lg overflow-hidden border border-slate-950 bg-white"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="flex items-center justify-center min-h-[250px] text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
}
