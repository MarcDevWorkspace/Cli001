import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/storage';
import { Post, Category } from '../types';
import { ArrowRight, BookOpen } from 'lucide-react';

export const Publications: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedPosts, fetchedCategories] = await Promise.all([
        db.getPublishedPosts(),
        db.getAllCategories()
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Group posts by category
  const categorizedPosts = React.useMemo(() => {
    const grouped: Record<string, Post[]> = {};

    // Sort categories explicitly if needed, but they are fetched sorted by name
    categories.forEach(cat => {
      grouped[cat.name] = posts.filter(p => p.category === cat.name);
    });

    // Handle "Uncategorized" or posts with categories not in the official list
    const knownCategoryNames = categories.map(c => c.name);
    const otherPosts = posts.filter(p => !p.category || !knownCategoryNames.includes(p.category));

    if (otherPosts.length > 0) {
      grouped['Autres'] = otherPosts;
    }

    return grouped;
  }, [posts, categories]);

  // Handle scroll to section
  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Filter out empty categories for display
  const displayableCategories = categories.filter(c => categorizedPosts[c.name]?.length > 0);
  if (categorizedPosts['Autres']?.length > 0) {
    displayableCategories.push({ id: 'others', name: 'Autres', slug: 'autres' });
  }

  return (
    <div className="bg-brand-cream min-h-screen animate-fade-in text-gray-800">

      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BookOpen className="w-12 h-12 text-brand-accent mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">
            Publications & Recherches
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
            Un répertoire analytique explorant les intersections du droit, de la sociologie et de l'anthropologie.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar Navigation - Sticky on Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                Sommaire
              </h3>
              <nav className="space-y-1">
                {displayableCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group flex items-center justify-between ${activeCategory === cat.name
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-white hover:text-brand-primary hover:shadow-sm'
                      }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs opacity-60 ${activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-brand-primary'}`}>
                      {categorizedPosts[cat.name]?.length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {displayableCategories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 font-serif text-lg">Aucune publication disponible pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {displayableCategories.map(cat => (
                  <div key={cat.id} id={`category-${cat.name}`} className="scroll-mt-24">

                    {/* Category Header */}
                    <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-8">
                      <h2 className="text-3xl font-serif font-bold text-gray-900">
                        {cat.name}
                      </h2>
                      <span className="text-sm font-medium text-gray-500">
                        {categorizedPosts[cat.name]?.length} article{categorizedPosts[cat.name]?.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {categorizedPosts[cat.name]?.map((post) => (
                        <article
                          key={post.id}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group h-full"
                        >
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            {post.featuredImage ? (
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <BookOpen className="w-12 h-12 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                            <div className="absolute bottom-4 left-4 text-white">
                              <span className="text-xs font-bold bg-brand-accent/90 px-2 py-1 rounded backdrop-blur-sm text-brand-dark mb-2 inline-block">
                                {new Date(post.publishedAt || '').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors leading-tight">
                              <Link to={`/post/${post.slug}`}>
                                <span className="absolute inset-0" />
                                {post.title}
                              </Link>
                            </h3>

                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                              {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                              <div className="flex gap-2">
                                {post.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <span className="flex items-center text-brand-primary text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Lire <ArrowRight className="w-4 h-4 ml-1" />
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};