import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/storage';
import { Post } from '../types';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PDFViewer } from '../components/PDFViewer';

// Constants for image data parsing (must match MarkdownEditor)
const IMAGE_DATA_DELIMITER = '\n\n<!-- IMAGE_DATA -->\n';
const IMAGE_PLACEHOLDER_REGEX = /!\[([^\]]*)\]\(image:([a-zA-Z0-9_-]+)\)/g;
const IMAGE_DATA_ENTRY_REGEX = /^\[image:([a-zA-Z0-9_-]+)\]: (.+)$/gm;

/**
 * Parses content and transforms image placeholders to data URLs for rendering
 */
function prepareContentForRendering(content: string): string {
  const delimiterIndex = content.indexOf(IMAGE_DATA_DELIMITER);

  if (delimiterIndex === -1) {
    // No hidden image data section, return content as-is
    // (might be legacy content with inline base64 or no images)
    return content;
  }

  const visibleContent = content.substring(0, delimiterIndex);
  const dataSection = content.substring(delimiterIndex + IMAGE_DATA_DELIMITER.length);

  // Build image map
  const imageMap = new Map<string, string>();
  let match;
  const regex = new RegExp(IMAGE_DATA_ENTRY_REGEX.source, 'gm');
  while ((match = regex.exec(dataSection)) !== null) {
    imageMap.set(match[1], match[2]);
  }

  // Replace placeholders with data URLs
  return visibleContent.replace(IMAGE_PLACEHOLDER_REGEX, (fullMatch, alt, id) => {
    const dataUrl = imageMap.get(id);
    return dataUrl ? `![${alt}](${dataUrl})` : fullMatch;
  });
}

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

  // Transform content for rendering
  const preparedContent = useMemo(() => {
    if (!post?.content) return '';
    return prepareContentForRendering(post.content);
  }, [post?.content]);

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
            {post.category && (
              <span className="flex items-center text-brand-primary bg-brand-primary/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
            )}
            {post.contentType === 'pdf' && (
              <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                <FileText className="w-3 h-3 mr-1" /> PDF
              </span>
            )}
          </div>
        </header>

        {post.contentType === 'pdf' && post.pdfData ? (
          <div className="mx-auto max-w-4xl">
            <PDFViewer data={post.pdfData} title={post.title} />
          </div>
        ) : (
          <div className="prose prose-lg prose-slate mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 font-serif text-gray-800">
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
            >
              {preparedContent}
            </ReactMarkdown>
          </div>
        )}
      </article>
    </div>
  );
};