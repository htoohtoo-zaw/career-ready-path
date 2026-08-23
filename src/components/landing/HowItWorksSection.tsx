/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserCheck, GitFork, MessageSquareShare, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      icon: UserCheck,
      badge: t('howItWorks.step1Badge'),
    },
    {
      number: '02',
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      icon: GitFork,
      badge: t('howItWorks.step2Badge'),
    },
    {
      number: '03',
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      icon: MessageSquareShare,
      badge: t('howItWorks.step3Badge'),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-zinc-900/40 border-y border-zinc-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3 mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-green-500">
            {t('howItWorks.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t('howItWorks.title')}
          </h2>
          <p className="text-base text-zinc-400">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-green-500/20 via-green-500/40 to-green-500/20 -translate-y-8 z-0 pointer-events-none" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative z-10 flex flex-col items-start p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-green-500/40 transition-all duration-300 group shadow-xl"
              >
                {/* Step Number & Badge */}
                <div className="w-full flex items-center justify-between mb-6">
                  <span className="text-3xl font-black font-mono text-green-500/30 group-hover:text-green-500 transition-colors">
                    {step.number}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-900 text-green-400 border border-green-500/20">
                    {step.badge}
                  </span>
                </div>

                {/* Icon Container */}
                <div className="mb-5 p-3.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 group-hover:bg-green-500 group-hover:text-zinc-950 transition-all duration-300">
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-green-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom decorative bar */}
                <div className="w-full mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                  <span>{t('howItWorks.stepOf', { number: idx + 1 })}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
