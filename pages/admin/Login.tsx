import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { authService } from '../../services/auth';
    import { Lock } from 'lucide-react';

    export const Login: React.FC = () => {
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const success = await authService.login(password);
        
        if (success) {
          navigate('/admin/dashboard');
        } else {
          setError('Mot de passe incorrect');
          setIsLoading(false);
        }
      };

      return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-brand-dark py-6 px-8 flex justify-between items-center">
               <h2 className="text-white font-serif text-xl font-bold">Administration</h2>
               <Lock className="text-brand-accent w-5 h-5" />
            </div>
            
            <form onSubmit={handleLogin} className="p-8">
              <p className="text-gray-600 mb-6 text-sm">
                Veuillez entrer votre mot de passe pour accéder au panneau d'administration.
                <br/><span className="text-xs text-gray-400">(Hint: admin)</span>
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-blue-900 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 flex justify-center"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Connexion'}
              </button>
            </form>
          </div>
        </div>
      );
    };