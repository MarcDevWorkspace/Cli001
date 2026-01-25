import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { db } from '../services/storage';
import { Post } from '../types';

export const Home: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const posts = await db.getPublishedPosts();
      setLatestPosts(posts.slice(0, 3));
      setLoading(false);
    };
    fetchLatest();
  }, []);

  return (
    <div className="animate-fade-in font-sans text-gray-800">

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-brand-dark text-white overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=2070"
            alt="Justice et Droit"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-block mb-6 px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-brand-accent text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
              Portail Officiel
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8 tracking-tight">
              Droit, Justice & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-orange-200">
                Réalités Sociales
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 leading-relaxed max-w-2xl border-l-4 border-brand-accent pl-6">
              Le carrefour intellectuel de Bertrand Gerbier. Une approche anthropologique de la magistrature et de la pratique du droit en Haïti.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/publications"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-accent text-brand-dark text-lg font-bold rounded-lg hover:bg-white transition-all shadow-lg hover:shadow-brand-accent/20 hover:-translate-y-1"
              >
                Lire les publications
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/bio"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-lg font-medium rounded-lg text-white hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Découvrir le parcours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Publications Section - New! */}
      <section className="py-24 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">À la Une</h2>
              <div className="h-1 w-20 bg-brand-primary rounded-full"></div>
            </div>
            <Link to="/publications" className="text-brand-primary font-bold hover:text-brand-dark transition-colors flex items-center group">
              Voir toute la bibliothèque <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              latestPosts.map(post => (
                <Link to={`/post/${post.slug}`} key={post.id} className="group block h-full">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100/50 hover:border-brand-primary/20 transform hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/20" />
                        </div>
                      )}

                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/95 backdrop-blur-md text-brand-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Récemment'}
                      </div>

                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <span className="text-brand-primary font-bold text-sm group-hover:underline decoration-2 underline-offset-4 decoration-brand-accent">
                        Lire l'article
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Expertise Cards */}
      <section className="py-24 bg-white relative">
        {/* Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-cream rounded-full opacity-50 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-6">Domaines d'Expertise</h2>
            <p className="text-lg text-gray-500 font-light">
              Une démarche pluridisciplinaire unique qui enrichit l'analyse juridique par la profondeur des sciences sociales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gray-50 p-10 rounded-2xl hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Scale className="w-32 h-32" />
              </div>
              <Scale className="h-12 w-12 text-brand-primary group-hover:text-brand-accent mb-6 transition-colors" />
              <h3 className="text-2xl font-serif font-bold mb-4">Avocat & Magistrat</h3>
              <p className="text-gray-600 group-hover:text-blue-100 leading-relaxed font-light">
                Une pratique juridique ancrée dans l'expérience de la magistrature et une compréhension fine des rouages du Barreau de Port-au-Prince.
              </p>
            </div>

            <div className="group bg-gray-50 p-10 rounded-2xl hover:bg-brand-dark hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-32 h-32" />
              </div>
              <GraduationCap className="h-12 w-12 text-brand-dark group-hover:text-brand-accent mb-6 transition-colors" />
              <h3 className="text-2xl font-serif font-bold mb-4">Anthropologue</h3>
              <p className="text-gray-600 group-hover:text-gray-300 leading-relaxed font-light">
                Une approche interprétativiste des phénomènes sociaux, liant les textes de loi abstraits aux pratiques culturelles vivantes.
              </p>
            </div>

            <div className="group bg-gray-50 p-10 rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-32 h-32" />
              </div>
              <BookOpen className="h-12 w-12 text-gray-800 group-hover:text-brand-accent mb-6 transition-colors" />
              <h3 className="text-2xl font-serif font-bold mb-4">Chercheur</h3>
              <p className="text-gray-600 group-hover:text-gray-400 leading-relaxed font-light">
                Production académique rigoureuse, mémoires et articles analysant les structures sociétales haïtiennes en mutation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quote - Premium Dark Style */}
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="mb-8 text-brand-accent/30">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
              <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00012 13.1784 11.3696 11.383 12.0321 11H14.7578L13.2578 4H7.5002C7.5002 4 4.09503 8.35632 4.09503 14.5C4.09503 16.6349 5.25055 19.5 7.6429 20.3213L14.017 21ZM15.4241 11L16.9241 4H22.6817C22.6817 4 26.0868 8.35632 26.0868 14.5C26.0868 16.6349 24.9313 19.5 22.539 20.3213L16.1648 21L16.1648 18C16.1648 16.8954 17.0603 16 18.1648 16H21.1818C21.1817 13.1784 18.8122 11.383 18.1497 11H15.4241Z" transform="translate(-4, 0)" />
            </svg>
          </div>
          <blockquote className="font-serif text-3xl md:text-5xl italic leading-tight tracking-wide">
            "Comprendre la loi ne suffit pas. <br />
            <span className="text-gray-400">Il faut comprendre l'homme qui la subit</span> <br />
            et la société qui la crée."
          </blockquote>
          <cite className="block mt-10 text-brand-accent text-sm font-bold tracking-widest uppercase not-italic">
            — Bertrand Gerbier
          </cite>
        </div>
      </section>
    </div>
  );
};