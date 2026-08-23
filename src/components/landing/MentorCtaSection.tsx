/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

export const MentorCtaSection: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    t('mentorCta.benefit1'),
    t('mentorCta.benefit2'),
    t('mentorCta.benefit3'),
    t('mentorCta.benefit4'),
  ];

  return (
    <section id="mentor-cta" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800/80 relative overflow-hidden">
      {/* Subtle green ambient glow on right */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-green-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>{t('mentorCta.badge')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t('mentorCta.title')} <br />
                <span className="text-green-500">{t('mentorCta.titleHighlight')}</span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                {t('mentorCta.subtitle')}
              </p>

              <ul className="space-y-3 pt-2">
                {benefits.map((benefit, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-start gap-3 text-sm sm:text-base text-zinc-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/auth/signup?intent=mentor"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white hover:bg-green-500 glow-green transition-all duration-200 shadow-md shadow-green-600/20 w-full sm:w-auto"
                  >
                    {t('mentorCta.applyBtn')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/apply-mentor"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-6 py-4 text-sm font-semibold text-zinc-300 hover:border-green-500/40 hover:text-white transition-colors w-full sm:w-auto"
                  >
                    {t('mentorCta.viewKycBtn')}
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Right Card Visual Column */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl relative"
              >
                
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold">
                      KYC
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t('mentorCta.kycHeaderTitle')}</h4>
                      <p className="text-xs text-zinc-400">{t('mentorCta.kycHeaderSub')}</p>
                    </div>
                  </div>
                  <Award className="h-6 w-6 text-green-500" />
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('mentorCta.step1Title')}</span>
                    <p className="text-zinc-200">{t('mentorCta.step1Desc')}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('mentorCta.step2Title')}</span>
                    <p className="text-zinc-200">{t('mentorCta.step2Desc')}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 space-y-1">
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t('mentorCta.step3Title')}</span>
                    <p className="text-zinc-100 font-medium">{t('mentorCta.step3Desc')}</p>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-zinc-500 font-mono">
                  {t('common.role')}: <span className="text-green-400 font-bold">approved_mentor</span> &bull; RLS Protected
                </div>

              </motion.div>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  );
};
