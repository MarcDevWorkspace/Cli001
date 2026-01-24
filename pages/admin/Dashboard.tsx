import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/storage';
import { authService } from '../../services/auth';
import { Post } from '../../types';
import { Plus, Edit2, Trash2, Eye, LogOut, Calendar, Search, FileText, Home, User, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await db.getAllPosts();
      // Sort by created date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(data);
    } catch (err) {
      console.error("[Dashboard] loadPosts failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      await db.deletePost(id);
      loadPosts();
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  return (
    <div className="min-h-screen bg-brand-cream text-gray-800 font-sans">

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 mb-12">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-serif font-bold text-xl shadow-md">
              BG
            </div>
            <span className="font-serif font-bold text-xl tracking-wide text-gray-900">Bertrand Gerbier</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Accueil
            </Link>
            <Link to="/bio" className="text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1">
              <User className="w-4 h-4" /> Parcours
            </Link>
            <Link to="/publications" className="text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Publications
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
            <Link
              to="/admin/editor"
              className="flex items-center px-5 py-2.5 bg-brand-primary text-white rounded-full hover:bg-blue-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Publication
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">Tableau de bord</h1>
            <p className="text-gray-500 text-lg font-light">
              Gérez vos articles et publications.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-serif font-bold text-brand-primary">{publishedCount}</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">En ligne</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-serif font-bold text-gray-400">{draftCount}</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Brouillons</span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-8 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none shadow-sm transition-all"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300 flex flex-col h-full"
              >
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FileText className="w-12 h-12 opacity-50" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {post.published ? (
                      <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-green-100 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Publié
                      </span>
                    ) : (
                      <span className="bg-white/90 backdrop-blur-sm text-yellow-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-yellow-100 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Brouillon
                      </span>
                    )}
                  </div>

                  {/* PDF Badge */}
                  {post.contentType === 'pdf' && (
                    <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      PDF
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4 flex-grow">
                    <h3 className="font-serif font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                      {post.title}
                    </h3>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wide font-medium bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                    <Link
                      to={`/post/${post.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-brand-primary p-2 rounded-full hover:bg-blue-50 transition-colors"
                      title="Voir l'article"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/admin/editor/${post.id}`}
                        className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-primary transition-colors shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Éditer</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Commencez par créer votre première publication pour alimenter le portail.
            </p>
            <Link
              to="/admin/editor"
              className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};