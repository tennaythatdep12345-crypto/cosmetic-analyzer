import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function About() {
    const { t } = useTranslation();

    const techStack = [
        {
            name: 'React',
            icon: <svg className="w-8 h-8 text-blue-500" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="2" fill="currentColor"></circle><g stroke="currentColor" strokeWidth="1" fill="none"><ellipse rx="10" ry="4.5"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse></g></svg>,
            desc: 'Frontend Framework'
        },
        {
            name: 'TypeScript',
            icon: <svg className="w-8 h-8 text-blue-600" viewBox="0 0 128 128" fill="currentColor"><path d="M1.5 63.915v62.485h124.965V1.5H1.528v62.415zm100.838 52.883H82.935V80.84h19.263v9.068H92.61v26.797H82.935zm-24.93-9.172c0 3.39-1.328 6.43-3.617 8.528-2.61 2.383-5.996 3.035-10.435 3.035-7.79 0-12.822-4.14-12.822-10.55h9.45c.188 2.62 1.63 3.617 3.25 3.617 1.543 0 2.375-.726 2.375-1.922 0-1.285-.852-1.96-3.79-2.903-5.937-1.89-8.773-4.48-8.773-9.58 0-5.835 4.605-9.617 11.234-9.617 6.48 0 10.957 3.523 11.39 9.39h-8.875c-.293-1.83-1.375-2.68-2.695-2.68-1.504 0-2.14.793-2.14 1.735 0 1.25.952 1.832 3.867 2.774 6.273 2.062 8.59 4.74 8.59 9.172zM1.5 63.915" /></svg>,
            desc: 'Type Safety'
        },
        {
            name: 'Tailwind CSS',
            icon: <svg className="w-8 h-8 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" /></svg>,
            desc: 'Styling'
        },
        {
            name: 'Vite',
            icon: <svg className="w-8 h-8 text-purple-500" viewBox="0 0 410 404" fill="none" stroke="currentColor" strokeWidth="20"><path d="M399.6 22.3l-388.9 14.5 186.2 366.8 202.7-381.3z" fill="none" /><path d="M399.6 22.3l-388.9 14.5 186.2 366.8 202.7-381.3z" stroke="currentColor" /></svg>,
            desc: 'Build Tool'
        },
        {
            name: 'Google Gemini',
            icon: <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21.19 10.3c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25h-2.94c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25h2.94zM12 2c.69 0 1.25.56 1.25 1.25v2.94c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25V3.25C10.75 2.56 11.31 2 12 2zm0 15.31c.69 0 1.25.56 1.25 1.25v2.94c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25v-2.94c0-.69.56-1.25 1.25-1.25zm9.19-9.19c.49.49.49 1.28 0 1.77l-2.08 2.08c-.49.49-1.28.49-1.77 0-.49-.49-.49-1.28 0-1.77l2.08-2.08c.49-.49 1.28-.49 1.77 0zm-14.15 14.15c.49.49.49 1.28 0 1.77l-2.08 2.08c-.49.49-1.28.49-1.77 0-.49-.49-.49-1.28 0-1.77l2.08-2.08c.49-.49 1.28-.49 1.77 0zM5.75 12c0-.69-.56-1.25-1.25-1.25H1.56c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25h2.94c.69 0 1.25-.56 1.25-1.25zm1.29-6.31c.49.49.49 1.28 0 1.77L4.96 9.54c-.49.49-1.28.49-1.77 0-.49-.49-.49-1.28 0-1.77l2.08-2.08c.49-.49 1.28-.49 1.77 0zM15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" /></svg>,
            desc: 'AI Analysis'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                        {t('about.title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('about.subtitle')}
                    </p>
                </header>

                {/* Mission Section */}
                <section className="mb-16">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                                    <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('about.mission.title')}</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {t('about.mission.desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology Section */}
                <section className="mb-16">
                    <div className="text-center mb-10">
                        <span className="inline-block p-3 rounded-full bg-blue-50 dark:bg-blue-900/10 mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('about.tech.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
                            {t('about.tech.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform">
                                    {tech.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
        {/* Creator Section */}
      <section className="mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Créateur du projet
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Je m'appelle LE Ba Khanh Hoang, étudiant en 1ère année à l’IUT de Bordeaux, dans le département Génie Chimique – Génie des Procédés.
Je suis particulièrement intéressé par le développement de nouvelles technologies et la création de solutions innovantes, notamment dans le domaine de l’industrie pharmaceutique et cosmétique.
C’est dans cette optique que j’ai développé ce site web, afin d’explorer l’application de l’IA et du digital à l’analyse cosmétique.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            Mon objectif est de continuer à évoluer dans des projets mêlant technologie, sciences et innovation.
          </p>
        </div>
      </section>
                {/* How It Works Grid */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
                        {t('home.howItWorks.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="relative">
                                <span className="text-5xl font-black text-purple-100 dark:text-purple-900/30 mb-4 block">01</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Image</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Prenez ou téléversez une photo de la liste des ingrédients du produit à analyser.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-pink-200 dark:hover:border-pink-800 transition-colors">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="relative">
                                <span className="text-5xl font-black text-pink-100 dark:text-pink-900/30 mb-4 block">02</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Processing</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Google Gemini AI analysera et interprétera chaque ingrédient en quelques secondes.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="relative">
                                <span className="text-5xl font-black text-blue-100 dark:text-blue-900/30 mb-4 block">03</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Detailed Report</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Recevez un rapport détaillé sur la sécurité, les usages et les éventuels risques d’irritation.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="mb-16">
                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30 flex gap-4">
                        <svg className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">
                                {t('about.disclaimer.title')}
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-500/80">
                                {t('about.disclaimer.desc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center pb-8">
                    <div className="bg-gray-900 dark:bg-white rounded-3xl p-10 md:p-16 text-white dark:text-gray-900 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                {t('home.cta.title')}
                            </h2>
                            <p className="text-white/70 dark:text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                                {t('home.cta.subtitle')}
                            </p>
                            <Link
                                to="/analyze"
                                className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg"
                            >
                                <span>{t('common.getStarted')}</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
