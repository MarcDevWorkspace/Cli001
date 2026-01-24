import React, { useState, useRef, useCallback, useMemo } from 'react';
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
    Edit3,
    Columns
} from 'lucide-react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Delimiter used to separate visible content from hidden image data
const IMAGE_DATA_DELIMITER = '\n\n<!-- IMAGE_DATA -->\n';

// Regex to match image placeholders: ![alt](image:id)
const IMAGE_PLACEHOLDER_REGEX = /!\[([^\]]*)\]\(image:([a-zA-Z0-9_-]+)\)/g;

// Regex to match image data entries: [image:id]: data:...
const IMAGE_DATA_ENTRY_REGEX = /^\[image:([a-zA-Z0-9_-]+)\]: (.+)$/gm;

/**
 * Extracts the visible content (before delimiter) and the image data map
 */
function parseContent(fullContent: string): { visibleContent: string; imageMap: Map<string, string> } {
    const imageMap = new Map<string, string>();

    const delimiterIndex = fullContent.indexOf(IMAGE_DATA_DELIMITER);
    if (delimiterIndex === -1) {
        // No image data section, check for legacy inline base64 images and convert them
        return { visibleContent: fullContent, imageMap };
    }

    const visibleContent = fullContent.substring(0, delimiterIndex);
    const dataSection = fullContent.substring(delimiterIndex + IMAGE_DATA_DELIMITER.length);

    // Parse image data entries
    let match;
    const regex = new RegExp(IMAGE_DATA_ENTRY_REGEX.source, 'gm');
    while ((match = regex.exec(dataSection)) !== null) {
        const id = match[1];
        const data = match[2];
        imageMap.set(id, data);
    }

    return { visibleContent, imageMap };
}

/**
 * Combines visible content and image map back into full content for storage
 */
function serializeContent(visibleContent: string, imageMap: Map<string, string>): string {
    if (imageMap.size === 0) {
        return visibleContent;
    }

    let dataSection = '';
    imageMap.forEach((data, id) => {
        dataSection += `[image:${id}]: ${data}\n`;
    });

    return visibleContent + IMAGE_DATA_DELIMITER + dataSection;
}

/**
 * Transforms visible content by replacing image placeholders with actual data URLs for rendering
 */
function transformForRendering(visibleContent: string, imageMap: Map<string, string>): string {
    return visibleContent.replace(IMAGE_PLACEHOLDER_REGEX, (match, alt, id) => {
        const dataUrl = imageMap.get(id);
        if (dataUrl) {
            return `![${alt}](${dataUrl})`;
        }
        return match; // Keep original if not found
    });
}

/**
 * Generates a short unique ID for images
 */
function generateImageId(): string {
    return 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Commencez à écrire..."
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('edit');
    const [isUploading, setIsUploading] = useState(false);

    // Parse the full content into visible content and image map
    const { visibleContent, imageMap } = useMemo(() => parseContent(value), [value]);

    // Transform content for preview rendering
    const contentForPreview = useMemo(() => transformForRendering(visibleContent, imageMap), [visibleContent, imageMap]);

    // Handle changes in the visible textarea
    const handleVisibleContentChange = useCallback((newVisibleContent: string) => {
        // Re-serialize with the existing image map
        const fullContent = serializeContent(newVisibleContent, imageMap);
        onChange(fullContent);
    }, [imageMap, onChange]);

    // Insert text at cursor position
    const insertAtCursor = useCallback((before: string, after: string = '', placeholderText: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = visibleContent.substring(start, end) || placeholderText;

        const newVisibleContent = visibleContent.substring(0, start) + before + selectedText + after + visibleContent.substring(end);
        handleVisibleContentChange(newVisibleContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [visibleContent, handleVisibleContentChange]);

    // Compress and insert image
    const compressAndInsertImage = useCallback(async (file: File) => {
        console.log("[MarkdownEditor] Starting image compression for:", file.name);
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

                    console.log("[MarkdownEditor] Image compressed. Final size approx:", Math.round(dataUrl.length * 0.75 / 1024), "KB");

                    // Generate a unique ID for this image
                    const imageId = generateImageId();
                    const altText = file.name.replace(/\.[^/.]+$/, '');

                    // Add the image data to the map
                    const newImageMap = new Map(imageMap);
                    newImageMap.set(imageId, dataUrl);

                    // Create the placeholder markdown
                    const imagePlaceholder = `![${altText}](image:${imageId})`;

                    const textarea = textareaRef.current;
                    if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;

                        const before = visibleContent.substring(0, start);
                        const after = visibleContent.substring(end);

                        // Insert placeholder in visible content
                        const newVisibleContent = before + imagePlaceholder + after;

                        // Serialize with updated image map
                        const fullContent = serializeContent(newVisibleContent, newImageMap);
                        onChange(fullContent);

                        console.log("[MarkdownEditor] Image inserted with ID:", imageId);

                        // Restore cursor to after the placeholder
                        setTimeout(() => {
                            textarea.focus();
                            const newCursorPos = start + imagePlaceholder.length;
                            textarea.setSelectionRange(newCursorPos, newCursorPos);
                        }, 0);
                    }

                    setIsUploading(false);
                    resolve();
                };
                img.onerror = (error) => {
                    console.error("[MarkdownEditor] Image load error:", error);
                    setIsUploading(false);
                    reject(error);
                };
            };
            reader.onerror = (error) => {
                console.error("[MarkdownEditor] FileReader error:", error);
                setIsUploading(false);
                reject(error);
            };
        });
    }, [visibleContent, imageMap, onChange]);

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
            {/* Toolbar - Full Header */}
            <div className="sticky top-0 z-40 mb-4 transition-all duration-300">
                <div className="flex items-center justify-between bg-white shadow-sm border border-gray-100 rounded-lg p-2 w-full">
                    {/* Tool Buttons */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {toolbarButtons.map((btn, index) =>
                            btn.type === 'separator' ? (
                                <div key={index} className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
                            ) : (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={btn.action}
                                    disabled={btn.loading}
                                    title={btn.title}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {btn.icon && <btn.icon className="w-5 h-5" />}
                                </button>
                            )
                        )}
                    </div>

                    {/* View Toggles - Segmented Control */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-4 border border-gray-200 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('edit')}
                            title="Éditer"
                            className={`p-1.5 rounded-md transition-all ${activeTab === 'edit'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('split')}
                            title="Côte à côte"
                            className={`p-1.5 rounded-md transition-all ${activeTab === 'split'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Columns className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            title="Aperçu seul"
                            className={`p-1.5 rounded-md transition-all ${activeTab === 'preview'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
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
            <div className="min-h-[500px]">
                <div className={`grid h-full gap-6 ${activeTab === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>

                    {/* Editor Pane - shows only visible content (no Base64) */}
                    {(activeTab === 'edit' || activeTab === 'split') && (
                        <div className="h-full">
                            <textarea
                                ref={textareaRef}
                                value={visibleContent}
                                onChange={(e) => handleVisibleContentChange(e.target.value)}
                                placeholder={placeholder}
                                className="w-full h-full min-h-[500px] font-serif text-lg text-gray-800 resize-none border-0 focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder-gray-300"
                            />
                        </div>
                    )}

                    {/* Preview Pane */}
                    {(activeTab === 'preview' || activeTab === 'split') && (
                        <div className={`h-full ${activeTab === 'split' ? 'border-l border-gray-100 pl-6' : ''}`}>
                            <div className="prose prose-lg prose-slate max-w-none text-gray-800">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose prose-lg prose-slate max-w-none"
                                    urlTransform={(url) => {
                                        // Allow data: URLs for inline Base64 images
                                        if (url && url.startsWith('data:')) {
                                            return url;
                                        }
                                        return url;
                                    }}
                                    components={{
                                        img: ({ node, ...props }) => (
                                            <img {...props} className="rounded-lg shadow-sm max-w-full" loading="lazy" />
                                        )
                                    }}
                                >
                                    {contentForPreview}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Character Count - shows visible content length */}
            <div className={`fixed bottom-4 text-xs text-gray-300 pointer-events-none transition-all duration-300 ${activeTab === 'split' ? 'right-[50%]' : 'right-[340px]'}`}>
                {visibleContent.length} caractères
            </div>
        </div>
    );
};
