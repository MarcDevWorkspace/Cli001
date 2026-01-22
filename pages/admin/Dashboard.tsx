import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/storage';
import { authService } from '../../services/auth';
import { Post } from '../../types';
import { Plus, Edit2, Trash2, Eye, LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadPosts();
  }, [navigate]);

  const loadPosts = async () => {
    const data = await db.getAllPosts();
    // Sort by created date descending
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPosts(data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-500 mt-1">Gérer les publications et le contenu.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 bg-white"
            >
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </button>
            <Link 
              to="/admin/editor" 
              className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-900 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Nouvelle Publication
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.published ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Publié
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link to={`/post/${post.slug}`} target="_blank" className="text-gray-400 hover:text-gray-900" title="Voir">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link to={`/admin/editor/${post.id}`} className="text-brand-primary hover:text-blue-900" title="Éditer">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700" title="Supprimer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
             <div className="p-12 text-center text-gray-500">
               Aucun article trouvé. Commencez par en créer un.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};