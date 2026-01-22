import React from 'react';
import { Download } from 'lucide-react';

export const Bio: React.FC = () => {
  return (
    <div className="bg-brand-cream min-h-screen py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Parcours Professionnel</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une trajectoire multidisciplinaire marquée par la rigueur juridique et la curiosité sociologique.
          </p>
        </div>

        {/* Timeline / Content */}
        <div className="space-y-12">
          
          {/* Section 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-brand-primary text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
                01
              </div>
              <h2 className="ml-6 text-2xl font-serif font-bold text-brand-dark">Formation Académique</h2>
            </div>
            <div className="pl-16 md:pl-20 border-l-2 border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Maîtrise en Anthropologie</h3>
                <p className="text-brand-accent text-sm font-semibold">Université Laval, Québec</p>
                <p className="mt-2 text-gray-600">
                  Recherches approfondies sur les structures sociales. Auteur du mémoire référencé dans les collections de l'université.
                </p>
                <a href="https://akosaa.fsaa.ulaval.ca/fileadmin/Fichiers/Ressources/Memoires/Memoire_MHMP/Bertrand_GerbierMemoire_finalise__28Juin2017.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center mt-3 text-sm text-brand-primary hover:underline">
                  <Download className="w-4 h-4 mr-1" /> Consulter le mémoire
                </a>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Formation à la Magistrature</h3>
                <p className="text-brand-accent text-sm font-semibold">École de la Magistrature (EMA)</p>
                <p className="mt-2 text-gray-600">
                  Formation rigoureuse aux fonctions de juge, éthique judiciaire et procédure.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-brand-accent text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
                02
              </div>
              <h2 className="ml-6 text-2xl font-serif font-bold text-brand-dark">Expérience Juridique</h2>
            </div>
            <div className="pl-16 md:pl-20 border-l-2 border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Avocat</h3>
                <p className="text-gray-500 text-sm">Barreau de Port-au-Prince</p>
                <p className="mt-2 text-gray-600">
                  Pratique actuelle en situation d'incompatibilité, conservant le titre et l'expertise tout en exerçant d'autres fonctions publiques ou académiques. Spécialisation en droit civil et administratif.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Magistrat</h3>
                <p className="text-gray-500 text-sm">Juridictions Haïtiennes</p>
                <p className="mt-2 text-gray-600">
                  Expérience dans l'application de la loi, la rédaction de jugements et la gestion d'audiences, apportant une perspective interne sur le système judiciaire.
                </p>
              </div>
            </div>
          </div>

           {/* Section 3 */}
           <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-gray-700 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
                03
              </div>
              <h2 className="ml-6 text-2xl font-serif font-bold text-brand-dark">Recherche & Anthropologie</h2>
            </div>
            <div className="pl-16 md:pl-20 border-l-2 border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Approche Interprétativiste</h3>
                <p className="mt-2 text-gray-600">
                  Adoption d'une méthodologie qui privilégie le sens que les acteurs sociaux donnent à leurs actions. Analyse des conflits non seulement sous l'angle légal, mais comme révélateurs de dynamiques culturelles profondes.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};