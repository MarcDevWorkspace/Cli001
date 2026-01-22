import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale, BookOpen, GraduationCap } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-brand-primary text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              Droit, Justice et <br/>
              <span className="text-brand-accent italic">Réalités Sociales</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light mb-8 leading-relaxed">
              Le carrefour intellectuel de Bertrand Gerbier. Une approche anthropologique de la magistrature et de la pratique du droit en Haïti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/publications" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-primary bg-white hover:bg-gray-100 transition-all shadow-lg">
                Lire les publications
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/bio" className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-all">
                Découvrir le parcours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Cards */}
      <section className="py-16 bg-brand-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-brand-dark">Domaines d'Expertise</h2>
            <div className="w-24 h-1 bg-brand-accent mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-brand-primary">
              <Scale className="h-10 w-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Avocat & Magistrat</h3>
              <p className="text-gray-600 leading-relaxed">
                Une pratique juridique ancrée dans l'expérience de la magistrature et une compréhension fine du Barreau de Port-au-Prince.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-brand-accent">
              <GraduationCap className="h-10 w-10 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Anthropologue</h3>
              <p className="text-gray-600 leading-relaxed">
                Une approche interprétativiste des phénomènes sociaux, liant les textes de loi aux pratiques culturelles vivantes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-gray-600">
              <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Chercheur</h3>
              <p className="text-gray-600 leading-relaxed">
                Production académique rigoureuse, mémoires et articles analysant les structures sociétales haïtiennes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quote */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="font-serif text-2xl md:text-3xl italic text-gray-700 leading-relaxed">
            "Comprendre la loi ne suffit pas. Il faut comprendre l'homme qui la subit et la société qui la crée."
          </blockquote>
          <cite className="block mt-6 text-brand-primary font-bold not-italic">— Bertrand Gerbier</cite>
        </div>
      </section>
    </div>
  );
};