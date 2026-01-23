import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../services/storage';
import { authService } from '../../services/auth';
import { Post } from '../../types';
import { Save, ArrowLeft, Image as ImageIcon, X, CheckCircle } from 'lucide-react';
import { MarkdownEditor } from '../../components/MarkdownEditor';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setPublished(post.published);
    }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const postData: Post = {
      id: id || Date.now().toString(),
      slug,
      title,
      excerpt,
      content,
      featuredImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      published,
      publishedAt: published ? new Date().toISOString() : null,
      createdAt: id ? (await db.getAllPosts()).find(p => p.id === id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      author: 'Bertrand Gerbier'
    };

    try {
      await db.savePost(postData);
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 800);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-primary to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center text-blue-200 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Retour</span>
              </button>
              <div className="h-6 w-px bg-blue-400/50" />
              <h1 className="text-xl font-bold">
                {id ? 'Modifier la publication' : 'Nouvelle publication'}
              </h1>
            </div>
            <span className="text-blue-200 text-sm font-medium px-3 py-1 bg-blue-900/30 rounded-full">
              Mode Éditeur
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Meta Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Informations de base</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Title & Excerpt */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow text-lg"
                      placeholder="Titre de l'article"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Extrait <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-shadow"
                      placeholder="Bref résumé pour l'aperçu..."
                    />
                  </div>
                </div>

                {/* Right: Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Image de couverture</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-blue-50/50 transition-all text-center h-36">
                    {featuredImage ? (
                      <div className="relative h-full">
                        <img src={featuredImage} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setFeaturedImage('')}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg transition-transform hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full p-4">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Cliquez pour ajouter</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Contenu de l'article</h2>
              <span className="text-xs text-gray-500">Markdown avec aperçu en direct</span>
            </div>
            <div className="p-6">
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Commencez à écrire votre article ici... Utilisez le bouton image de la barre d'outils pour insérer des images."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Tags */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                    placeholder="Droit, Société, ..."
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {published ? 'Publié' : 'Brouillon'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${saveSuccess
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-brand-primary hover:bg-blue-900 text-white'
                  } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Enregistré!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};