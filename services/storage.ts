import { Post } from '../types';

// Initial seed data based on the user's prompt context
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    slug: 'memoire-mhmp-2017',
    title: 'Mémoire MHMP: Analyse Anthropologique',
    excerpt: 'Une exploration approfondie des structures sociales et juridiques dans le contexte haïtien. Présenté à l\'Université Laval.',
    content: `
# Introduction

Ce mémoire explore les intersections entre le droit coutumier et la justice formelle.

## Contexte
L'étude se base sur des observations participantes et une analyse rigoureuse des textes juridiques en vigueur.

> "L'anthropologie juridique ne se contente pas de décrire les lois, elle interroge leur application vivante."

## Conclusion
Le lien vers le document complet est disponible dans les archives de l'Université Laval.
    `,
    featuredImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb930b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    author: 'Bertrand Gerbier',
    published: true,
    publishedAt: '2017-06-28T12:00:00Z',
    createdAt: '2017-06-28T12:00:00Z',
    tags: ['Anthropologie', 'Droit', 'Université Laval']
  },
  {
    id: '2',
    slug: 'reflexions-sur-le-barreau',
    title: 'Réflexions sur le Barreau de Port-au-Prince',
    excerpt: 'Analyse critique et constructive sur l\'évolution de la pratique du droit en Haïti et les défis contemporains.',
    content: `
En tant qu'avocat en incompatibilité, ma perspective sur le Barreau est unique. Elle combine la rigueur du magistrat et la curiosité de l'anthropologue.

Il est impératif de repenser la formation continue des avocats pour faire face aux défis du XXIe siècle.
    `,
    featuredImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    author: 'Bertrand Gerbier',
    published: true,
    publishedAt: '2023-11-15T10:00:00Z',
    createdAt: '2023-11-15T10:00:00Z',
    tags: ['Droit', 'Port-au-Prince', 'Opinion']
  },
  {
    id: '3',
    slug: 'draft-etude-sociologique',
    title: '[BROUILLON] Étude sociologique en cours',
    excerpt: 'Notes préliminaires sur les dynamiques de pouvoir locales.',
    content: 'Contenu à venir. Notes confidentielles.',
    author: 'Bertrand Gerbier',
    published: false,
    publishedAt: null,
    createdAt: '2024-05-20T09:30:00Z',
    tags: ['Recherche', 'Sociologie']
  }
];

const STORAGE_KEY = 'bertrand_gerbier_posts';

// This class simulates an async database API
// In production, methods would fetch('/api/posts') etc.
class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      }
    }
  }

  async getAllPosts(): Promise<Post[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getPublishedPosts(): Promise<Post[]> {
    const posts = await this.getAllPosts();
    return posts.filter(p => p.published).sort((a, b) => 
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await this.getAllPosts();
    return posts.find(p => p.slug === slug);
  }

  async savePost(post: Post): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const posts = await this.getAllPosts();
    const index = posts.findIndex(p => p.id === post.id);
    
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const posts = await this.getAllPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}

export const db = new StorageService();