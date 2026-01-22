import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/storage';
import { Post } from '../types';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

export const Publications: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await db.getPublishedPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-white min-h-screen py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-gray-200 pb-8 mb-12">
          <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Publications & Ouvrages</h1>
          <p className="text-gray-600 text-lg">
            Répertoire des articles, mémoires et réflexions juridiques et sociologiques.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucune publication pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {posts.map((post) => (
              <article key={post.id} className="group relative flex flex-col md:flex-row gap-8 items-start bg-white rounded-lg overflow-hidden">
                {post.featuredImage && (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-[4/3] overflow-hidden rounded-lg shadow-sm bg-gray-100">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center text-brand-accent font-semibold">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.publishedAt || '').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {post.tags.map(tag => (
                      <span key={tag} className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                        <Tag className="w-3 h-3 mr-1" /> {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h2 className="text-2xl font-serif font-bold text-brand-dark mb-3 group-hover:text-brand-primary transition-colors">
                    <Link to={`/post/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-brand-primary font-medium group-hover:underline">
                    Lire l'article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};