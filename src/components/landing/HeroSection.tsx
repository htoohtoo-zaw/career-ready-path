/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, BookOpen, Users, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

// 3D programming language and database icon images
import iconReact3D from '../../assets/images/icon_3d_react_1787367502707.jpg';
import iconNodeJs3D from '../../assets/images/icon_3d_nodejs_1787367547459.jpg';
import iconPython3D from '../../assets/images/icon_3d_python_1787367520037.jpg';
import iconPostgres3D from '../../assets/images/icon_3d_postgres_1787367534987.jpg';

export const HeroSection: React.FC = () => {
  const { t, isBurmese } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      
      {/* 1. CLEAN BACKGROUND NEBULA GLOW */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-green-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* 2. SUBTLE GALAXY PATHWAY LINE BEHIND HERO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <svg
          className="w-full h-full opacity-50"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="simpleGalaxyLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Smooth S-curve pathway */}
          <path
            d="M -50 280 C 300 120, 500 420, 850 200 C 1150 40, 1350 360, 1500 240"
            stroke="url(#simpleGalaxyLine)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            className="animate-galaxy-flow"
          />

          {/* Glowing stardust points on the line */}
          <circle cx="180" cy="210" r="4" fill="#22c55e" className="animate-pulse" />
          <circle cx="680" cy="310" r="4" fill="#10b981" className="animate-pulse" />
          <circle cx="1020" cy="120" r="4" fill="#06b6d4" className="animate-pulse" />
          <circle cx="1320" cy="330" r="4" fill="#22c55e" className="animate-pulse" />
        </svg>
      </div>

      {/* 3. PROGRAMMING LANGUAGE & DATABASE 3D ICONS BESIDE HERO */}
      <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto z-10 hidden lg:block">
        
        {/* Left Side 1: React UI Framework */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            y: [0, -8, 0],
            rotate: [0, 1.2, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2 },
            x: { duration: 0.6, delay: 0.2 },
            scale: { duration: 0.6, delay: 0.2 },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="absolute left-6 xl:left-12 top-24 pointer-events-auto"
        >
          <Link
            to="/roadmaps/frontend-developer"
            title="React & Frontend Track"
            className="group flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-transparent border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10 hover:border-cyan-400 hover:glow-cyan transition-all duration-300"
          >
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl overflow-hidden bg-transparent border border-zinc-800 shrink-0 shadow-sm">
              <img
                src={iconReact3D}
                alt="React 3D Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-cyan-400 block uppercase tracking-wider">UI Framework</span>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">React</span>
            </div>
          </Link>
        </motion.div>

        {/* Left Side 2: TypeScript / Node.js Runtime */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            y: [0, 8, 0],
            rotate: [0, -1.2, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.35 },
            x: { duration: 0.6, delay: 0.35 },
            scale: { duration: 0.6, delay: 0.35 },
            y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="absolute left-12 xl:left-20 bottom-28 pointer-events-auto"
        >
          <Link
            to="/roadmaps/full-stack-developer"
            title="TypeScript & Node.js Backend Track"
            className="group flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-transparent border border-green-500/30 backdrop-blur-md shadow-lg shadow-green-500/10 hover:border-green-400 hover:glow-green transition-all duration-300"
          >
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-sm">
              <img
                src={iconNodeJs3D}
                alt="TypeScript & Node.js 3D Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-green-400 block uppercase tracking-wider">Runtime</span>
              <span className="text-xs font-bold text-white group-hover:text-green-300 transition-colors">TypeScript / Node</span>
            </div>
          </Link>
        </motion.div>

        {/* Right Side 1: Python Language */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            y: [0, -7, 0],
            rotate: [0, -1.2, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.25 },
            x: { duration: 0.6, delay: 0.25 },
            scale: { duration: 0.6, delay: 0.25 },
            y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="absolute right-6 xl:right-12 top-24 pointer-events-auto"
        >
          <Link
            to="/roadmaps/data-scientist"
            title="Python & AI Data Science Track"
            className="group flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-transparent border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-500/10 hover:border-emerald-400 hover:glow-green transition-all duration-300"
          >
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-sm">
              <img
                src={iconPython3D}
                alt="Python 3D Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-emerald-400 block uppercase tracking-wider">Language</span>
              <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Python</span>
            </div>
          </Link>
        </motion.div>

        {/* Right Side 2: PostgreSQL Database */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            y: [0, 8, 0],
            rotate: [0, 1.2, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 },
            x: { duration: 0.6, delay: 0.4 },
            scale: { duration: 0.6, delay: 0.4 },
            y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="absolute right-12 xl:right-20 bottom-28 pointer-events-auto"
        >
          <Link
            to="/roadmaps/backend-developer"
            title="PostgreSQL Database Track"
            className="group flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-transparent border border-blue-500/30 backdrop-blur-md shadow-lg shadow-blue-500/10 hover:border-blue-400 transition-all duration-300"
          >
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-sm">
              <img
                src={iconPostgres3D}
                alt="PostgreSQL Database 3D Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-blue-400 block uppercase tracking-wider">Database</span>
              <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">PostgreSQL</span>
            </div>
          </Link>
        </motion.div>

      </div>

      {/* 4. MAIN HERO SECTION CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
        <motion.div 
          className="text-center max-w-3xl mx-auto space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold shadow-sm"
          >
            // <Sparkles className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white"
          >
            {isBurmese ? (
              <>
                {t('hero.headlineStart')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">
                  {t('hero.headlineHighlight')}
                </span>{' '}
                {t('hero.headlineEnd')}
              </>
            ) : (
              <>
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">path in IT</span> without the noise.
              </>
            )}
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto text-zinc-400"
          >
            {t('hero.subtext')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                to="/onboarding"
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white hover:bg-green-500 glow-green transition-all duration-200 shadow-md shadow-green-600/20"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                to="/roadmaps"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-8 py-4 text-base font-semibold text-zinc-200 hover:border-green-500/50 hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Compass className="h-5 w-5 text-green-400" />
                {t('hero.ctaSecondary')}
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">{t('common.free')}</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Value Prop Icons Bar */}
          <motion.div 
            variants={itemVariants}
            className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto border-t border-zinc-900/80 text-left sm:text-center"
          >
            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/40 sm:border-0">
              <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{t('hero.value1Title')}</h3>
                <p className="text-xs text-zinc-400">{t('hero.value1Desc')}</p>
              </div>
            </div>
            
            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/40 sm:border-0">
              <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{t('hero.value2Title')}</h3>
                <p className="text-xs text-zinc-400">{t('hero.value2Desc')}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/40 sm:border-0">
              <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{t('hero.value3Title')}</h3>
                <p className="text-xs text-zinc-400">{t('hero.value3Desc')}</p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};


