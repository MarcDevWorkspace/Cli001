import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../services/storage';
import { authService } from '../../services/auth';
import { Post, Category } from '../../types';
import { slugify } from '../../utils/text';
import {
  Save, ArrowLeft, Image as ImageIcon, X, CheckCircle,
  FileText, Upload, Eye, Settings, ChevronRight, ChevronDown,
  Calendar, User, Plus
} from 'lucide-react';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { PDFViewer } from '../../components/PDFViewer';
import { AutoResizeTextarea } from '../../components/AutoResizeTextarea';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState(false);
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Categories
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // New state for contentType
  const [contentType, setContentType] = useState<'markdown' | 'pdf'>('markdown');
  const [pdfData, setPdfData] = useState<string>('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin');
      return;
    }

    if (id) {
      loadPost(id);
    }
  }, [id, navigate]);

  const loadPost = async (postId: string) => {
    const posts = await db.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setFeaturedImage(post.featuredImage || '');
      setTags(post.tags.join(', '));
      setCategory(post.category || '');
      setPublished(post.published);
      if (post.publishedAt) {
        setPublicationDate(new Date(post.publishedAt).toISOString().split('T')[0]);
      }
      setContentType(post.contentType || 'markdown');
      setPdfData(post.pdfData || '');
    }
  };

  const loadCategories = async () => {
    const cats = await db.getAllCategories();
    setAvailableCategories(cats);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    // Check if distinct
    const slug = slugify(newCategoryName);
    if (availableCategories.some(c => c.slug === slug)) {
      alert("Cette catégorie existe déjà.");
      return;
    }

    const newCat: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      slug
    };

    await db.saveCategory(newCat);
    await loadCategories(); // Refresh list
    setCategory(newCat.name); // Select it
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_DIMENSION = 1200;
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

          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          while (dataUrl.length * 0.75 > 300 * 1024 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const compressedBase64 = await compressImage(file);
        setFeaturedImage(compressedBase64);
        setLoading(false);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image.");
        setLoading(false);
      }
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Veuillez sélectionner un fichier PDF valide.");
        return;
      }

      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        setPdfData(event.target?.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier PDF.");
        setLoading(false);
      };
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    setSaveSuccess(false);

    const slug = slugify(title);

    const postData: Post = {
      id: id || Date.now().toString(),
      slug,
      title,
      excerpt,
      content: contentType === 'markdown' ? content : '',
      contentType,
      featuredImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      category,
      published,
      publishedAt: published ? new Date(publicationDate).toISOString() : null,
      createdAt: id ? (await db.getAllPosts()).find(p => p.id === id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      author: 'Bertrand Gerbier',
      ...(contentType === 'pdf' && pdfData ? { pdfData } : {})
    };

    try {
      await db.savePost(postData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false); // Just reset success state, stay on page for continuous editing
      }, 2000);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-gray-500 hover:text-brand-primary transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm hidden sm:inline">{id ? 'Édition' : 'Brouillon'}</span>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="font-semibold text-gray-800 truncate max-w-[200px]">{title || 'Sans titre'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${saveSuccess ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>
            {saveSuccess ? 'Enregistré' : loading ? 'Enregistrement...' : 'Modifications non enregistrées'}
          </span>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center text-sm font-bold py-2 px-4 rounded-full transition-all ${saveSuccess
              ? 'bg-green-600 text-white'
              : 'bg-brand-primary hover:bg-blue-900 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : saveSuccess ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveSuccess ? 'Terminé' : 'Enregistrer'}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-gray-100 text-brand-primary' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-brand-cream relative">
          <div className={`max-w-4xl mx-auto px-6 py-12 transition-all duration-300 ${isSidebarOpen ? 'mr-[320px]' : ''}`}>
            {/* Title & Excerpt */}
            <div className="mb-8 group">
              <AutoResizeTextarea
                placeholder="Titre de l'article"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4 placeholder-gray-300 group-hover:placeholder-gray-400 transition-colors"
              />
              <AutoResizeTextarea
                placeholder="Ajoutez un court extrait ou sous-titre..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-xl text-gray-500 font-serif italic placeholder-gray-300 group-hover:placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Content Editor */}
            <div className="min-h-[500px]">
              {contentType === 'markdown' ? (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Racontez votre histoire..."
                />
              ) : (
                <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  {!pdfData ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center hover:bg-gray-50 transition-colors group cursor-pointer relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Importer un PDF</h3>
                      <p className="text-gray-400">Glissez-déposez ou cliquez pour sélectionner</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded text-red-600">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Document PDF actif</h3>
                            <p className="text-xs text-gray-500">Prêt à être publié</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPdfData('')}
                          className="text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded border border-red-200 shadow-sm hover:shadow"
                        >
                          Remplacer
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden">
                        <PDFViewer data={pdfData} title={title || 'Aperçu'} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className={`fixed right-0 top-[65px] bottom-0 w-[320px] bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-8">

            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publication</h3>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className={`text-sm font-medium ${published ? 'text-green-600' : 'text-gray-500'}`}>
                  {published ? 'En ligne' : 'Brouillon'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {published && (
                <div className="mt-2">
                  <label className="text-xs text-gray-500 mb-1 block">Date de publication</label>
                  <input
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Format</h3>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setContentType('markdown')}
                  className={`text-sm py-2 px-3 rounded-md transition-all ${contentType === 'markdown' ? 'bg-white shadow text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Article
                </button>
                <button
                  onClick={() => setContentType('pdf')}
                  className={`text-sm py-2 px-3 rounded-md transition-all ${contentType === 'pdf' ? 'bg-white shadow text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  PDF
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags & Catégories</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Catégorie</label>
                  {isCreatingCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-brand-primary rounded-lg text-sm focus:outline-none"
                        placeholder="Nouvelle catégorie..."
                        autoFocus
                      />
                      <button
                        onClick={handleCreateCategory}
                        className="px-3 py-2 bg-brand-primary text-white rounded-lg text-xs hover:bg-blue-900"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setIsCreatingCategory(false)}
                        className="px-2 py-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-shadow appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionner...</option>
                        {availableCategories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsCreatingCategory(true)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors border border-gray-200"
                        title="Créer une catégorie"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Mots-clés (séparés par virgules)</label>
                  <textarea
                    rows={3}
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-shadow resize-none"
                    placeholder="Droit, Politique, ..."
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image de couverture</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg hover:border-brand-primary hover:bg-blue-50/30 transition-all text-center h-40 relative group cursor-pointer overflow-hidden">
                {featuredImage ? (
                  <>
                    <img src={featuredImage} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setFeaturedImage(''); }}
                        className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">Ajouter une image</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Auteur</span>
                <span className="text-gray-600 flex items-center gap-1"><User className="w-3 h-3" /> Bertrand Gerbier</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date de création</span>
                <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};