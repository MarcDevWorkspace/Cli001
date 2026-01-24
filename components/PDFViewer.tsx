import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, ChevronUp } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    data: string; // Base64 PDF data
    title?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ data, title = 'Document' }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = data;
        link.download = `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        setShowScrollTop(scrollTop > 300);
    };

    const scrollToTop = () => {
        const container = document.getElementById('pdf-scroll-container');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate array of page numbers
    const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

    return (
        <div className="relative">
            {/* Floating Download Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 text-sm font-medium border border-gray-100"
                    title="Télécharger le PDF"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Télécharger</span>
                </button>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-20 p-3 bg-brand-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
                    title="Retour en haut"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}

            {/* PDF Pages Container - Scrollable Stack */}
            <div
                id="pdf-scroll-container"
                className="max-h-[85vh] overflow-y-auto scroll-smooth"
                onScroll={handleScroll}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                }}
            >
                <Document
                    file={data}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
                            <p className="text-gray-400 text-sm">Chargement du document...</p>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
                            <span className="text-lg">⚠️</span>
                            <p>Erreur lors du chargement du PDF</p>
                        </div>
                    }
                >
                    {/* Render all pages as stacked paper sheets */}
                    <div className="flex flex-col items-center gap-8 py-8">
                        {pageNumbers.map((pageNum) => (
                            <div
                                key={pageNum}
                                className="relative group"
                            >
                                {/* Paper sheet with elegant shadow */}
                                <div className="bg-white rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                                    <Page
                                        pageNumber={pageNum}
                                        scale={1.0}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="block"
                                        width={Math.min(700, typeof window !== 'undefined' ? window.innerWidth - 80 : 700)}
                                    />
                                </div>

                                {/* Subtle page number indicator */}
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                                        {pageNum} / {numPages}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Document>

                {/* End of document indicator */}
                {!isLoading && numPages > 0 && (
                    <div className="flex flex-col items-center pb-8 pt-4 gap-3">
                        <div className="w-16 h-px bg-gray-200"></div>
                        <p className="text-xs text-gray-400">
                            Fin du document • {numPages} page{numPages > 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
