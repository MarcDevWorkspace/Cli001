import React, { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Link,
    Image as ImageIcon,
    List,
    ListOrdered,
    Quote,
    Code,
    Eye,
    Edit3
} from 'lucide-react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Commencez à écrire..."
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [isUploading, setIsUploading] = useState(false);

    // Insert text at cursor position
    const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || placeholder;

        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newText);

        // Set cursor position after insert
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [value, onChange]);

    // Compress and insert image
    const compressAndInsertImage = useCallback(async (file: File) => {
        setIsUploading(true);

        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimension for inline images
                    const MAX_DIMENSION = 800;
                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to fit within reasonable size
                    let quality = 0.8;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);

                    while (dataUrl.length * 0.75 > 150 * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    // Insert markdown image at cursor
                    const altText = file.name.replace(/\.[^/.]+$/, '');
                    insertAtCursor(`\n![${altText}](${dataUrl})\n`);
                    setIsUploading(false);
                    resolve();
                };
                img.onerror = (error) => {
                    setIsUploading(false);
                    reject(error);
                };
            };
            reader.onerror = (error) => {
                setIsUploading(false);
                reject(error);
            };
        });
    }, [insertAtCursor]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await compressAndInsertImage(file);
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Échec du traitement de l'image.");
            }
        }
        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toolbarButtons = [
        { icon: Bold, action: () => insertAtCursor('**', '**', 'texte gras'), title: 'Gras' },
        { icon: Italic, action: () => insertAtCursor('*', '*', 'texte italique'), title: 'Italique' },
        { icon: Heading1, action: () => insertAtCursor('\n# ', '\n', 'Titre principal'), title: 'Titre 1' },
        { icon: Heading2, action: () => insertAtCursor('\n## ', '\n', 'Sous-titre'), title: 'Titre 2' },
        { type: 'separator' },
        { icon: List, action: () => insertAtCursor('\n- ', '\n', 'élément de liste'), title: 'Liste' },
        { icon: ListOrdered, action: () => insertAtCursor('\n1. ', '\n', 'élément numéroté'), title: 'Liste numérotée' },
        { icon: Quote, action: () => insertAtCursor('\n> ', '\n', 'citation'), title: 'Citation' },
        { icon: Code, action: () => insertAtCursor('`', '`', 'code'), title: 'Code' },
        { type: 'separator' },
        { icon: Link, action: () => insertAtCursor('[', '](https://)', 'texte du lien'), title: 'Lien' },
        {
            icon: ImageIcon,
            action: () => fileInputRef.current?.click(),
            title: 'Insérer une image',
            loading: isUploading
        },
    ];

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-1.5">
                <div className="flex items-center gap-0.5">
                    {toolbarButtons.map((btn, index) =>
                        btn.type === 'separator' ? (
                            <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
                        ) : (
                            <button
                                key={index}
                                type="button"
                                onClick={btn.action}
                                disabled={btn.loading}
                                title={btn.title}
                                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                {btn.icon && <btn.icon className="w-4 h-4" />}
                            </button>
                        )
                    )}
                </div>

                {/* Mobile view toggle */}
                <div className="flex md:hidden items-center gap-1 bg-gray-200 rounded p-0.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('edit')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                            }`}
                    >
                        <Edit3 className="w-3 h-3 inline mr-1" />Écrire
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                            }`}
                    >
                        <Eye className="w-3 h-3 inline mr-1" />Aperçu
                    </button>
                </div>
            </div>

            {/* Hidden file input for images */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />

            {/* Editor Content */}
            <div className="flex flex-col md:flex-row min-h-[400px]">
                {/* Editor Pane */}
                <div className={`flex-1 ${activeTab !== 'edit' ? 'hidden md:block' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-full min-h-[400px] p-4 font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none bg-gray-50"
                        style={{ lineHeight: '1.6' }}
                    />
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-gray-200" />

                {/* Preview Pane */}
                <div className={`flex-1 ${activeTab !== 'preview' ? 'hidden md:block' : ''}`}>
                    <div className="p-4 prose prose-sm max-w-none h-full overflow-auto bg-white">
                        {value ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    img: ({ node, ...props }) => (
                                        <img
                                            {...props}
                                            className="max-w-full h-auto rounded-lg shadow-sm my-4"
                                            loading="lazy"
                                        />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" />
                                    ),
                                    code: ({ node, inline, ...props }: any) => (
                                        inline
                                            ? <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
                                            : <code {...props} className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono" />
                                    ),
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-4">
                                            <table {...props} className="min-w-full border-collapse border border-gray-300" />
                                        </div>
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th {...props} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td {...props} className="border border-gray-300 px-4 py-2" />
                                    ),
                                }}
                            >
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 italic">L'aperçu apparaîtra ici...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                <span>{value.length} caractères</span>
                <span className="hidden md:inline">Markdown avec support GFM (tableaux, etc.)</span>
            </div>
        </div>
    );
};
