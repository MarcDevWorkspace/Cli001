import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Linkedin, BookOpen, User, Home, ShieldCheck } from 'lucide-react';
import { authService } from '../services/auth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState(authService.isAuthenticated());

  React.useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => {
    return location.pathname === path ? "text-brand-primary font-bold border-b-2 border-brand-primary" : "text-gray-600 hover:text-brand-primary";
  };

  const navLinks = [
    { path: '/', label: 'Accueil', icon: <Home className="w-4 h-4 mr-2" /> },
    { path: '/bio', label: 'Parcours', icon: <User className="w-4 h-4 mr-2" /> },
    { path: '/publications', label: 'Publications', icon: <BookOpen className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm fixed w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo / Name */}
            <div className="flex-shrink-0 flex flex-col justify-center">
              <Link to="/" className="font-serif text-2xl font-bold text-brand-dark tracking-tight">
                Bertrand Gerbier
              </Link>
              <span className="text-xs uppercase tracking-widest text-brand-accent mt-1">Magistrat, Avocat & Anthropologue</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="ml-4 px-4 py-2 border border-brand-primary text-brand-primary rounded-full text-xs hover:bg-brand-primary hover:text-white transition-all"
                >
                  Administration
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-500 hover:text-gray-900 focus:outline-none p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-brand-primary bg-blue-50"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> Administration
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-brand-cream border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-serif font-semibold mb-4 text-white">Bertrand Gerbier</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Avocat au Barreau de Port-au-Prince, Magistrat de formation et chercheur en anthropologie.
                Dédié à l'étude des intersections entre droit formel et réalités sociales.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><Link to="/bio" className="text-gray-300 hover:text-white text-sm">Parcours Professionnel</Link></li>
                <li><Link to="/publications" className="text-gray-300 hover:text-white text-sm">Publications & Recherches</Link></li>
                {!isAdmin && <li><Link to="/admin" className="text-gray-300 hover:text-white text-sm">Accès Administrateur</Link></li>}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Contact & Réseaux</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="mailto:contact@bertrandgerbier.com" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                  contact@bertrandgerbier.com
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Bertrand Gerbier. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};