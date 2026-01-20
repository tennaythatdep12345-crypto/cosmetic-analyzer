import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Home() {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0F1117] text-gray-900 dark:text-white selection:bg-pink-500 selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
            {/* Background Effects - Dynamic for Light/Dark */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.4] dark:opacity-[0.02]"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10 text-center">
                <div className="max-w-5xl mx-auto space-y-8">


                    {/* Main Title - Centered & Refined Size */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-in-up delay-100 text-gray-900 dark:text-white">
                        {t('homePage.hero.title1')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient-x">
                            {t('homePage.hero.highlight')}
                        </span>
                        <br />
                        {t('homePage.hero.title2')}
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        {t('homePage.hero.subtitle')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                        <Link
                            to="/analyze"
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                            {t('homePage.hero.cta')}
                        </Link>
                        <Link
                            to="/about"
                            className="px-8 py-4 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-full text-lg font-medium hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-sm flex items-center gap-2 shadow-sm"
                        >
                            {t('homePage.hero.secondaryCta')}
                        </Link>
                    </div>

                    {/* GLOSSY BROWSER MOCKUP (Restored) */}
                    <div className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up delay-500 perspective-1000 group">
                        {/* Glow under */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                        <div className="relative bg-white/80 dark:bg-[#1E2028]/90 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl transform transition-transform hover:rotate-x-2 duration-500">
                            {/* Browser Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/80"></div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-block px-3 py-1 rounded bg-gray-200/50 dark:bg-black/20 text-xs text-gray-500 font-mono">
                                        skinlab.ai/analyze
                                    </div>
                                </div>
                            </div>

                            {/* Window Content */}
                            <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-gray-50/50 dark:bg-gradient-to-b dark:from-gray-900/50 dark:to-black/50">
                                {/* Left: Image Scan */}
                                <div className="w-full md:w-1/3 aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 relative overflow-hidden shadow-inner">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#1a1c23]">
                                        <span className="text-4xl opacity-50">📸</span>
                                    </div>
                                    {/* Product Image Placeholder */}
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
                                    {/* Scan Line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan z-10"></div>
                                    <div className="absolute inset-0 bg-green-500/10 animate-pulse z-0"></div>
                                </div>

                                {/* Right: Result Card Preview */}
                                <div className="flex-1 w-full space-y-4 text-left">
                                    <div className="p-5 rounded-lg bg-green-50 dark:bg-gradient-to-r dark:from-green-500/10 dark:to-transparent border-l-4 border-green-500">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Compatible</h3>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Safe for Sensitive Skin
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { name: 'Glycerin', type: 'Humectant', score: 1 },
                                            { name: 'Centella Asiatica', type: 'Soothing', score: 1 },
                                            { name: 'Fragrance', type: 'Sensitizer', score: 2 }
                                        ].map((ing, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-200">{ing.name}</div>
                                                    <div className="text-xs text-gray-500">{ing.type}</div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${ing.score === 1 ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'}`}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted/Stats Strip */}
            <section className="py-10 border-y border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: t('homePage.stats.ingredients'), val: '50,000+' },
                        { label: t('homePage.stats.brands'), val: '1,200+' },
                        { label: 'Weekly Scans', val: '50k+' },
                        { label: t('homePage.stats.accuracy'), val: '99.8%' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.val}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Specs (New Section) */}
            <section className="py-24 px-6 relative z-10 overflow-hidden bg-white dark:bg-transparent">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative order-2 md:order-1">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                        <img
                            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80"
                            alt="AI Technology"
                            className="relative rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl z-10 hover:scale-[1.02] transition-transform duration-500"
                        />
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {t('homePage.tech.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            {t('homePage.tech.subtitle')}
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                t('homePage.tech.f1'),
                                t('homePage.tech.f2'),
                                t('homePage.tech.f3')
                            ].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">✓</span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* How It Works (Grid) */}
            <section className="py-24 bg-gray-50 dark:bg-[#13151b]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('homePage.howItWorks.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('homePage.howItWorks.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: t('homePage.steps.step1.title'), desc: t('homePage.steps.step1.desc'), icon: '📸' },
                            { step: '02', title: t('homePage.steps.step2.title'), desc: t('homePage.steps.step2.desc'), icon: '🧠' },
                            { step: '03', title: t('homePage.steps.step3.title'), desc: t('homePage.steps.step3.desc'), icon: '✨' }
                        ].map((item, i) => (
                            <div key={i} className="relative p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:shadow-xl dark:hover:bg-white/[0.07] transition-all group">
                                <div className="text-6xl font-bold text-gray-100 dark:text-white/5 absolute top-4 right-4">{item.step}</div>
                                <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-white dark:bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">{t('homePage.testimonials.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                <div className="flex gap-1 text-yellow-500 mb-4">
                                    {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{t(`homePage.testimonials.t${num}.quote`)}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">U{num}</div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">User {num}</div>
                                        <div className="text-xs text-gray-500">{t(`homePage.testimonials.t${num}.role`)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section className="py-24 bg-gray-50 dark:bg-[#13151b]">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('homePage.faq.title')}</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((num) => (
                            <details key={num} className="group bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden open:shadow-md transition-all">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-gray-900 dark:text-white">
                                    <span className="font-medium text-lg">{t(`homePage.faq.q${num}`)}</span>
                                    <span className="transition-transform group-open:rotate-180 text-gray-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                                    {t(`homePage.faq.a${num}`)}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 text-center relative overflow-hidden bg-white dark:bg-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/40 dark:to-purple-900/40 blur-3xl -z-10"></div>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('homePage.cta.title')}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">{t('homePage.cta.subtitle')}</p>
                    <Link
                        to="/analyze"
                        className="inline-flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
                    >
                        {t('homePage.cta.button')}
                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </section>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
