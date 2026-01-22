import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../services/storage';
import { authService } from '../../services/auth';
import { Post } from '../../types';
import { Save, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

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

          // Max width/height to help reduce size initially
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

          // Iteratively reduce quality until it fits
          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Simple heuristic: if > 300KB, reduce quality drastically
          // Accurate 300KB check: (length * 3/4) - padding = bytes
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

    await db.savePost(postData);
    setLoading(false);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-brand-primary px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl text-white font-bold">{id ? 'Modifier la publication' : 'Nouvelle publication'}</h1>
            <span className="text-blue-200 text-sm">Mode Éditeur</span>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="Titre de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extrait (Résumé)</label>
                  <textarea
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="Bref résumé pour l'aperçu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                    {featuredImage ? (
                      <div className="relative">
                        <img src={featuredImage} alt="Cover preview" className="w-full h-48 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setFeaturedImage('')}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-48">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Cliquez pour ajouter une image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded border border-gray-100 h-fit">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                    placeholder="Droit, Société,..."
                  />
                </div>

                <div className="flex items-center pt-2">
                  <input
                    id="published"
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publier immédiatement
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu (Markdown supporté)</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary outline-none font-mono text-sm bg-gray-50"
                placeholder="# Introduction..."
              />
              <p className="text-xs text-gray-500 mt-2">Utilisez Markdown pour formater le texte.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center bg-brand-primary hover:bg-blue-900 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {loading ? 'Enregistrement...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};