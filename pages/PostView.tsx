import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/storage';
import { Post } from '../types';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const PostView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    const loadPost = async () => {
      if (slug) {
        const found = await db.getPostBySlug(slug);
        setPost(found || null);
      }
    };
    loadPost();
  }, [slug]);

  if (post === undefined) return <div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div>;
  if (post === null) return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center">
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">Article non trouvé</h2>
      <Link to="/publications" className="text-brand-primary hover:underline">Retour aux publications</Link>
    </div>
  );

  return (
    <div className="bg-brand-cream min-h-screen py-12 animate-fade-in">
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/publications" className="inline-flex items-center text-gray-500 hover:text-brand-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au répertoire
        </Link>

        {post.featuredImage && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-md">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <header className="mb-10 text-center">
          <div className="flex justify-center gap-2 mb-4">
             {post.tags.map(tag => (
                <span key={tag} className="text-xs font-bold tracking-wider uppercase text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center text-gray-500 text-sm gap-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" /> {post.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Non publié'}
            </span>
          </div>
        </header>

        <div className="prose prose-lg prose-slate mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 font-serif text-gray-800">
           <ReactMarkdown
             components={{
               h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-brand-dark" {...props} />,
               h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-brand-primary" {...props} />,
               h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />,
               p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
               blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-accent pl-4 italic my-4 text-gray-600 bg-gray-50 py-2" {...props} />,
               ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
               li: ({node, ...props}) => <li className="mb-1" {...props} />,
               a: ({node, ...props}) => <a className="text-brand-primary underline hover:text-brand-accent" {...props} />,
             }}
           >
             {post.content}
           </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};