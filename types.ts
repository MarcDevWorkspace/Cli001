export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML content
  contentType?: 'markdown' | 'pdf'; // Default: 'markdown'
  pdfData?: string; // Base64 PDF data for PDF articles
  featuredImage?: string; // Base64 string or URL
  author: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
  category?: string;
}

export interface User {
  username: string;
  isAdmin: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}