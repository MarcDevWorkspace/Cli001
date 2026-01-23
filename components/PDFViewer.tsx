import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    data: string; // Base64 PDF data
    title?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ data, title = 'Document' }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
    };

    const changeScale = (delta: number) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.5));
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = data;
        link.download = `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`bg-gray-100 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Page précédente"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm min-w-[80px] text-center">
                        {pageNumber} / {numPages}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Page suivante"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changeScale(-0.25)}
                        disabled={scale <= 0.5}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        title="Zoom arrière"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => changeScale(0.25)}
                        disabled={scale >= 2.5}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        title="Zoom avant"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                        title="Télécharger"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                        title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div className={`overflow-auto bg-gray-200 flex justify-center ${isFullscreen ? 'h-[calc(100vh-48px)]' : 'max-h-[70vh]'}`}>
                <Document
                    file={data}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center py-20 text-red-600">
                            Erreur lors du chargement du PDF
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                    />
                </Document>
            </div>
        </div>
    );
};
