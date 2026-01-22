# Bertrand Gerbier - Portail Professionnel

Ce projet est un portail web professionnel et un système de gestion de blog (CMS) conçu pour Bertrand Gerbier, Avocat et Anthropologue. Il est construit avec React, TypeScript et Vite.

## 📋 Table des Matières
1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Installation Locale](#installation-locale)
4. [Guide d'Utilisation (Admin)](#guide-dutilisation-admin)
5. [Déploiement (Vercel/Netlify)](#déploiement)
6. [Note sur la Persistance des Données](#note-sur-la-persistance-des-données)

---

## 🏗 Architecture

Le site est une **Single Page Application (SPA)** rapide et responsive.

*   **Frontend**: React 18
*   **Langage**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (Configuré via CDN pour ce template spécifique)
*   **Routing**: React Router Dom
*   **Rendu Contenu**: React Markdown (pour la rédaction d'articles)
*   **Icônes**: Lucide React

### Structure des Dossiers
```
/
├── index.html          # Point d'entrée HTML
├── index.tsx           # Point d'entrée React
├── App.tsx             # Configuration du Routeur
├── types.ts            # Définitions TypeScript
├── components/         # Composants réutilisables (Layout, etc.)
├── pages/              # Pages publiques et admin
│   ├── admin/          # Dashboard, Login, Éditeur
├── services/           # Logique métier
│   ├── auth.ts         # Service d'authentification (simulé)
│   └── storage.ts      # Service de base de données (LocalStorage)
```

---

## 🛠 Prérequis

*   **Node.js**: Version 16.0.0 ou supérieure.
*   **npm**: Habituellement installé avec Node.js.

---

## 💻 Installation Locale

1.  **Cloner le projet** (ou extraire les fichiers) :
    ```bash
    git clone <votre-repo-url>
    cd bertrand-gerbier-portal
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    Le site sera accessible sur `http://localhost:5173`.

---

## 🔐 Guide d'Utilisation (Admin)

Le site comprend un portail d'administration sécurisé pour gérer les publications.

1.  Accédez à l'URL `/admin` ou cliquez sur "Accès Administrateur" dans le pied de page.
2.  **Mot de passe par défaut** : `admin`
3.  **Fonctionnalités** :
    *   **Tableau de bord** : Vue d'ensemble de tous les articles.
    *   **Éditeur** : Rédaction en Markdown, upload d'images, gestion des tags.
    *   **Prévisualisation** : Rendu en temps réel du contenu.

---

## 🚀 Déploiement

Ce projet est statique, ce qui le rend très facile à héberger gratuitement sur des plateformes comme Vercel ou Netlify.

### Option 1 : Vercel (Recommandé)

1.  Créez un compte sur [Vercel](https://vercel.com).
2.  Installez `vercel` CLI ou utilisez l'interface web.
3.  À la racine du projet, lancez :
    ```bash
    npm run build
    ```
    Cela va créer un dossier `dist/` contenant le site optimisé.
4.  Si vous utilisez l'interface web de Vercel :
    *   Importez votre dépôt Git.
    *   Vercel détectera automatiquement Vite.
    *   **Build Command** : `npm run build`
    *   **Output Directory** : `dist`
    *   Cliquez sur **Deploy**.

### Option 2 : Netlify

1.  Créez un compte sur [Netlify](https://netlify.com).
2.  Drag & Drop le dossier `dist/` (généré après `npm run build`) dans l'interface de Netlify, OU connectez votre dépôt Git.
3.  Configuration de build :
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`

### Configuration Importante pour les SPA (Netlify)
Si vous utilisez Netlify, créez un fichier `_redirects` dans le dossier `public/` (ou à la racine de build) avec le contenu suivant pour gérer le routing React :
```
/*  /index.html  200
```

---

## ⚠️ Note sur la Persistance des Données

**Important :** Dans cette version de démonstration, l'application utilise `localStorage` (`services/storage.ts`) pour stocker les nouveaux articles.

Cela signifie que :
1.  **Les données sont stockées dans le navigateur de l'utilisateur.**
2.  Si vous ajoutez un article via l'admin sur votre ordinateur, **les visiteurs ne le verront pas** automatiquement, car ils n'ont pas accès à votre stockage local.

### Pour passer en Production Réelle (CMS Partagé)

Pour que M. Gerbier puisse publier des articles visibles par tous, vous devez connecter le `StorageService` à une vraie base de données.

**Solutions suggérées :**
1.  **Firebase (Google)** : Remplacez les appels `localStorage` dans `storage.ts` par les fonctions `Firestore`. Gratuit pour un faible volume.
2.  **Headless CMS (Contentful, Strapi)** : Utilisez leurs API pour récupérer et écrire le contenu.
3.  **GitHub as Database** : Comme mentionné dans les spécifications initiales, configurez une fonction serverless pour écrire dans un fichier JSON sur GitHub lors de la publication.

Pour l'instant, le site est livré avec des **articles de démonstration (seed data)** qui sont visibles par tout le monde car ils sont codés en dur dans `services/storage.ts`.
