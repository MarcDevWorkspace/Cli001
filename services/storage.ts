import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db as firestore } from './firebase';
import { Post } from '../types';

const COLLECTION_NAME = 'posts';

// Fallback seed data (only used if DB is empty)
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
  }
];

class StorageService {
  private seeding = false;

  async getAllPosts(): Promise<Post[]> {
    console.log("[Storage] getAllPosts called");
    try {
      const q = query(collection(firestore, COLLECTION_NAME));
      console.log("[Storage] Executing Firestore query...");
      const querySnapshot = await getDocs(q);
      console.log(`[Storage] Query returned. Docs found: ${querySnapshot.size}`);

      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        posts.push(doc.data() as Post);
      });

      // If DB is empty and we haven't tried seeding yet
      if (posts.length === 0 && !this.seeding) {
        console.log("[Storage] Database empty. Starting one-time seed...");
        this.seeding = true;
        // Don't await this blocking the UI, but ensure we don't trigger it again
        this.seedData().catch(err => console.error("[Storage] Seeding failed", err));
        console.log("[Storage] Returning INITIAL_POSTS as fallback immediately");
        return INITIAL_POSTS;
      }

      console.log(`[Storage] returning ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error("[Storage] Error getting posts:", error);
      return [];
    }
  }

  async getPublishedPosts(): Promise<Post[]> {
    console.log("[Storage] getPublishedPosts called");
    try {
      const q = query(
        collection(firestore, COLLECTION_NAME),
        where("published", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        posts.push(doc.data() as Post);
      });
      console.log(`[Storage] Found ${posts.length} published posts`);

      // Client-side sort if composed index is missing
      return posts.sort((a, b) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
    } catch (error) {
      console.error("[Storage] Error getting published posts:", error);
      return [];
    }
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    console.log(`[Storage] getPostBySlug: ${slug}`);
    try {
      const q = query(collection(firestore, COLLECTION_NAME), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("[Storage] Post found");
        return querySnapshot.docs[0].data() as Post;
      }
      console.log("[Storage] Post not found");
      return undefined;
    } catch (error) {
      console.error("[Storage] Error getting post by slug:", error);
      return undefined;
    }
  }

  async savePost(post: Post): Promise<Post> {
    console.log(`[Storage] savePost called. ID: ${post.id}, Title: ${post.title}`);
    console.log(`[Storage] Payload size check - Image length: ${post.featuredImage?.length || 0} chars`);
    try {
      // Use post.id as the document ID
      await setDoc(doc(firestore, COLLECTION_NAME, post.id), post);
      console.log("[Storage] Post saved successfully to Firestore");
      return post;
    } catch (error) {
      console.error("[Storage] Error saving post:", error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestore, COLLECTION_NAME, id));
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  private async seedData() {
    console.log("Seeding database...");
    for (const post of INITIAL_POSTS) {
      await this.savePost(post);
    }
  }
}

export const db = new StorageService();