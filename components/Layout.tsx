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
                className="text-brand-dark hover:text-brand-primary focus:outline-none p-2 z-50 relative"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer & Backdrop */}
        <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-20 flex items-center justify-end px-4 border-b border-gray-100">
              {/* Space for the close button which is fixed in the header but relative here visually */}
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Navigation</h3>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-lg font-medium transition-all ${location.pathname === link.path
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark"
                      }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              {isAdmin && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Administration</h3>
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-lg font-medium text-brand-primary bg-blue-50/50 hover:bg-blue-50"
                  >
                    <ShieldCheck className="w-5 h-5 mr-3" />
                    Table de bord
                  </Link>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} Bertrand Gerbier</p>
            </div>
          </div>
        </div>
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