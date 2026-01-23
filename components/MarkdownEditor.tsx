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
        <div className="relative group">
            {/* Toolbar - Sticky */}
            <div className="sticky top-0 z-40 mb-4 transition-opacity duration-200">
                <div className="flex items-center gap-0.5 bg-white shadow-sm border border-gray-100 rounded-lg p-1.5 w-fit">
                    {toolbarButtons.map((btn, index) =>
                        btn.type === 'separator' ? (
                            <div key={index} className="w-px h-5 bg-gray-200 mx-1" />
                        ) : (
                            <button
                                key={index}
                                type="button"
                                onClick={btn.action}
                                disabled={btn.loading}
                                title={btn.title}
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50"
                            >
                                {btn.icon && <btn.icon className="w-4 h-4" />}
                            </button>
                        )
                    )}
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

            {/* Editor Content - Seamless */}
            <div className="min-h-[500px]">
                {activeTab === 'edit' ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-full min-h-[500px] font-serif text-lg text-gray-800 resize-none border-0 focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder-gray-300"
                    />
                ) : (
                    <div className="prose prose-lg prose-slate max-w-none text-gray-800">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose prose-lg prose-slate max-w-none"
                        >
                            {value}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Character Count - Floating bottom right */}
            <div className="fixed bottom-4 right-[340px] text-xs text-gray-300 pointer-events-none">
                {value.length} caractères
            </div>
        </div>
    );
};
