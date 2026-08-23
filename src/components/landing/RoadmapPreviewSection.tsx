/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Clock, GitCommit, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';
import type { RoadmapDifficulty } from '../../lib/supabase/types';
import { useLanguage } from '../../context/LanguageContext';

interface RoadmapPreviewItem {
  id: string;
  title: string;
  slug: string;
  difficulty: RoadmapDifficulty;
  estimated_weeks: number;
  node_count: number;
  description: string;
}

const FALLBACK_ROADMAPS: RoadmapPreviewItem[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    difficulty: 'beginner',
    estimated_weeks: 24,
    node_count: 8,
    description: 'Build user-facing interfaces with HTML, CSS, JavaScript, and React.',
  },
  {
    id: '2',
    title: 'Backend Developer',
    slug: 'backend-developer',
    difficulty: 'intermediate',
    estimated_weeks: 20,
    node_count: 7,
    description: 'Design server-side APIs, manage SQL databases, and ensure cloud security.',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    difficulty: 'advanced',
    estimated_weeks: 32,
    node_count: 12,
    description: 'Master both frontend interfaces and scalable backend infrastructure.',
  },
  {
    id: '4',
    title: 'DevOps & Cloud Engineer',
    slug: 'devops-engineer',
    difficulty: 'intermediate',
    estimated_weeks: 26,
    node_count: 9,
    description: 'Automate CI/CD pipelines, Docker containerization, and AWS deployments.',
  },
];

export const RoadmapPreviewSection: React.FC = () => {
  const { t } = useLanguage();
  const [roadmaps, setRoadmaps] = useState<RoadmapPreviewItem[]>(FALLBACK_ROADMAPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPublishedRoadmaps() {
      if (!isSupabaseConfigured()) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, slug, difficulty, estimated_weeks, description')
          .eq('is_published', true)
          .limit(4);

        if (!error && data && data.length > 0) {
          // Map to format with fallback node count if not fetched
          const mapped = (data as any[]).map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            difficulty: item.difficulty as RoadmapDifficulty,
            estimated_weeks: item.estimated_weeks || 20,
            node_count: item.slug === 'frontend-developer' ? 8 : 6,
            description: item.description || 'Structured step-by-step career track with curated resources.',
          }));
          setRoadmaps(mapped);
        }
      } catch (err) {
        console.warn('Using fallback roadmaps:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublishedRoadmaps();
  }, []);

  const getDifficultyBadgeColor = (diff: RoadmapDifficulty) => {
    switch (diff) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getDifficultyText = (diff: RoadmapDifficulty) => {
    switch (diff) {
      case 'beginner':
        return t('common.beginner');
      case 'intermediate':
        return t('common.intermediate');
      case 'advanced':
        return t('common.advanced');
      default:
        return diff;
    }
  };

  return (
    <section className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-500 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              {t('roadmapPreview.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('roadmapPreview.title')}
            </h2>
            <p className="text-base text-zinc-400">
              {t('roadmapPreview.subtitle')}
            </p>
          </div>
          <div>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 group px-4 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-all"
            >
              {t('roadmapPreview.viewAllTracks')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Pill-Shaped Roadmap Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmaps.map((map, idx) => (
            <motion.div
              key={map.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link
                to={`/roadmaps/${map.slug}`}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-green-500/60 hover:glow-green transition-all duration-300 h-full"
              >
                <div>
                  {/* Top Pill Bar */}
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getDifficultyBadgeColor(map.difficulty)}`}>
                        {getDifficultyText(map.difficulty)}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {t('roadmapPreview.weeks', { number: map.estimated_weeks })}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1">
                      <GitCommit className="h-3 w-3 text-green-500" />
                      {t('roadmapPreview.nodes', { number: map.node_count })}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 group-hover:text-green-400 transition-colors mb-2 flex items-center justify-between">
                    <span>{map.title}</span>
                    <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {map.description}
                  </p>
                </div>

                {/* Bottom Mini Footer within card */}
                <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    {t('roadmapPreview.interactive')}
                  </span>
                  <span className="text-green-500 font-medium group-hover:underline">{t('roadmapPreview.viewTree')} &rarr;</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner for Free Access */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-green-950/40 via-zinc-900 to-green-950/30 border border-green-500/30 shadow-xl shadow-green-500/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative overflow-hidden group"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-green-500/20 transition-all duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-green-500/15 text-green-400 border border-green-500/30 shadow-inner hidden sm:flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4ff32c]/15 border border-[#4ff32c]/30 text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ff32c] animate-pulse"></span>
                {t('roadmapPreview.freeBannerBadge')}
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">{t('roadmapPreview.freeBannerTitle')}</h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">{t('roadmapPreview.freeBannerDesc')}</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 whitespace-nowrap shrink-0 relative z-10 cursor-pointer"
            >
              <span>{t('roadmapPreview.browseAllBtn')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
