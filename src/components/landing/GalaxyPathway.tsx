/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft,
  Compass,
  FileText,
  Flame,
  Star,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// 3D image assets generated for nodes
import iconCode3D from '../../assets/images/icon_3d_code_1787365090978.jpg';
import iconCloud3D from '../../assets/images/icon_3d_cloud_1787365105737.jpg';
import iconAi3D from '../../assets/images/icon_3d_ai_1787365119820.jpg';
import iconMentor3D from '../../assets/images/icon_3d_mentor_1787365135019.jpg';
import heroGalaxyPathway from '../../assets/images/hero_3d_galaxy_pathway_1787365075771.jpg';

export interface GalaxyNode {
  id: string;
  stepNumber: number;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  iconImage: string;
  fallbackIcon: string;
  colorScheme: {
    accent: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
  };
  tags: string[];
  trackLink: string;
  actionText: string;
  coords: { x: number; y: number }; // percentage coordinates for desktop curved canvas
}

export const GalaxyPathway: React.FC = () => {
  const { t } = useLanguage();
  const [activeNodeId, setActiveNodeId] = useState<string>('frontend');
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodes: GalaxyNode[] = [
    {
      id: 'frontend',
      stepNumber: 1,
      titleKey: 'hero.node1Title',
      subtitleKey: 'hero.node1Subtitle',
      descKey: 'hero.node1Desc',
      iconImage: iconCode3D,
      fallbackIcon: '💻',
      colorScheme: {
        accent: '#22c55e',
        border: 'border-green-500/40',
        glow: 'rgba(34, 197, 94, 0.4)',
        badgeBg: 'bg-green-500/10',
        badgeText: 'text-green-400',
      },
      tags: ['HTML5 & CSS3', 'JavaScript ES6+', 'React 18', 'TypeScript', 'Tailwind CSS'],
      trackLink: '/roadmaps/frontend-developer',
      actionText: 'Frontend Roadmap',
      coords: { x: 8, y: 55 },
    },
    {
      id: 'backend',
      stepNumber: 2,
      titleKey: 'hero.node2Title',
      subtitleKey: 'hero.node2Subtitle',
      descKey: 'hero.node2Desc',
      iconImage: iconCloud3D,
      fallbackIcon: '⚡',
      colorScheme: {
        accent: '#10b981',
        border: 'border-emerald-500/40',
        glow: 'rgba(16, 185, 129, 0.4)',
        badgeBg: 'bg-emerald-500/10',
        badgeText: 'text-emerald-400',
      },
      tags: ['Node.js & Express', 'PostgreSQL', 'REST & GraphQL', 'Auth & Security', 'Redis'],
      trackLink: '/roadmaps/full-stack-developer',
      actionText: 'Full Stack Roadmap',
      coords: { x: 26, y: 22 },
    },
    {
      id: 'devops',
      stepNumber: 3,
      titleKey: 'hero.node3Title',
      subtitleKey: 'hero.node3Subtitle',
      descKey: 'hero.node3Desc',
      iconImage: iconCloud3D,
      fallbackIcon: '☁️',
      colorScheme: {
        accent: '#06b6d4',
        border: 'border-cyan-500/40',
        glow: 'rgba(6, 182, 212, 0.4)',
        badgeBg: 'bg-cyan-500/10',
        badgeText: 'text-cyan-400',
      },
      tags: ['Docker Containers', 'Kubernetes', 'CI/CD Pipelines', 'AWS & Cloud', 'Terraform'],
      trackLink: '/roadmaps/devops-engineer',
      actionText: 'DevOps Roadmap',
      coords: { x: 45, y: 68 },
    },
    {
      id: 'ai',
      stepNumber: 4,
      titleKey: 'hero.node4Title',
      subtitleKey: 'hero.node4Subtitle',
      descKey: 'hero.node4Desc',
      iconImage: iconAi3D,
      fallbackIcon: '🧠',
      colorScheme: {
        accent: '#8b5cf6',
        border: 'border-purple-500/40',
        glow: 'rgba(139, 92, 246, 0.4)',
        badgeBg: 'bg-purple-500/10',
        badgeText: 'text-purple-400',
      },
      tags: ['Python 3', 'Pandas & NumPy', 'Generative AI & LLMs', 'Vector DBs', 'Model Fine-tuning'],
      trackLink: '/roadmaps/data-scientist',
      actionText: 'Data Science Roadmap',
      coords: { x: 64, y: 25 },
    },
    {
      id: 'mentor',
      stepNumber: 5,
      titleKey: 'hero.node5Title',
      subtitleKey: 'hero.node5Subtitle',
      descKey: 'hero.node5Desc',
      iconImage: iconMentor3D,
      fallbackIcon: '⭐',
      colorScheme: {
        accent: '#f59e0b',
        border: 'border-amber-500/40',
        glow: 'rgba(245, 158, 11, 0.4)',
        badgeBg: 'bg-amber-500/10',
        badgeText: 'text-amber-400',
      },
      tags: ['Learner Ratings & Reviews', '100% KYC Verified Mentors', 'Code Review Scorecards', 'Transparent Feedback'],
      trackLink: '/mentors',
      actionText: 'Mentors & Reviews',
      coords: { x: 80, y: 70 },
    },
    {
      id: 'career-ready',
      stepNumber: 6,
      titleKey: 'hero.node6Title',
      subtitleKey: 'hero.node6Subtitle',
      descKey: 'hero.node6Desc',
      iconImage: heroGalaxyPathway,
      fallbackIcon: '🚀',
      colorScheme: {
        accent: '#ec4899',
        border: 'border-pink-500/40',
        glow: 'rgba(236, 72, 153, 0.4)',
        badgeBg: 'bg-pink-500/10',
        badgeText: 'text-pink-400',
      },
      tags: ['ATS CV Generator', 'Live Project Portfolios', 'Tech Career Ready', 'Hiring Network'],
      trackLink: '/cv-generator',
      actionText: 'ATS CV Builder',
      coords: { x: 94, y: 35 },
    },
  ];

  // Auto-tour timer
  useEffect(() => {
    if (!isPlayingTour) return;
    const interval = setInterval(() => {
      setActiveNodeId((curr) => {
        const currIndex = nodes.findIndex((n) => n.id === curr);
        const nextIndex = (currIndex + 1) % nodes.length;
        return nodes[nextIndex].id;
      });
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlayingTour, nodes]);

  const activeNode = nodes.find((n) => n.id === (hoveredNodeId || activeNodeId)) || nodes[0];
  const activeIndex = nodes.findIndex((n) => n.id === activeNode.id);

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + nodes.length) % nodes.length;
    setActiveNodeId(nodes[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % nodes.length;
    setActiveNodeId(nodes[nextIndex].id);
  };

  return (
    <div id="galaxy-career-pathway" className="relative w-full mt-10 rounded-3xl bg-zinc-950 border border-zinc-800/90 p-4 sm:p-6 lg:p-8 overflow-hidden shadow-2xl">
      {/* Background Cosmic Starfield & Nebula Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial Nebula Orbs */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[90px]" />
        
        {/* Subtle Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Header bar with controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-green-400 animate-pulse" />
            <span>{t('hero.galaxyPathwayBadge')}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t('hero.galaxyPathwayTitle')}</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            {t('hero.galaxyPathwaySubtitle')}
          </p>
        </div>

        {/* Guided Tour playback controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            id="galaxy-tour-toggle-btn"
            onClick={() => setIsPlayingTour(!isPlayingTour)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              isPlayingTour
                ? 'bg-green-500 text-zinc-950 border-green-400 shadow-md shadow-green-500/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            {isPlayingTour ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Tour Playing</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-green-400" />
                <span>Auto Guided Tour</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
            <button
              type="button"
              id="galaxy-prev-node-btn"
              onClick={handlePrev}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Previous Milestone"
              aria-label="Previous Milestone"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-zinc-400">
              {activeIndex + 1}/{nodes.length}
            </span>
            <button
              type="button"
              id="galaxy-next-node-btn"
              onClick={handleNext}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Next Milestone"
              aria-label="Next Milestone"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Galaxy Interactive Canvas / Track */}
      <div className="relative z-10 my-6">
        
        {/* DESKTOP CURVED GALAXY TRACK VIEW (Hidden on small screens) */}
        <div className="hidden lg:block relative w-full h-[360px] rounded-2xl bg-zinc-950/60 border border-zinc-800/60 overflow-hidden select-none">
          
          {/* Background Cosmic Starfield Art Texture */}
          <div className="absolute inset-0 opacity-25">
            <img 
              src={heroGalaxyPathway} 
              alt="Cosmic galaxy highway" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          {/* SVG Luminous Curved Pathway Stream */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 360" preserveAspectRatio="none">
            <defs>
              <linearGradient id="galaxyRoadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing background path line */}
            <path
              d="M 80 198 C 180 80, 320 80, 450 245 C 560 380, 700 80, 800 252 C 860 340, 910 180, 940 126"
              fill="none"
              stroke="url(#galaxyRoadGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              opacity="0.5"
            />

            {/* Core illuminated path */}
            <path
              d="M 80 198 C 180 80, 320 80, 450 245 C 560 380, 700 80, 800 252 C 860 340, 910 180, 940 126"
              fill="none"
              stroke="url(#galaxyRoadGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-galaxy-flow"
            />

            {/* Orbiting Stardust Particles on Path */}
            <circle cx="80" cy="198" r="6" fill="#22c55e" className="animate-pulse" />
            <circle cx="260" cy="79" r="6" fill="#10b981" className="animate-pulse" />
            <circle cx="450" cy="245" r="6" fill="#06b6d4" className="animate-pulse" />
            <circle cx="640" cy="90" r="6" fill="#8b5cf6" className="animate-pulse" />
            <circle cx="800" cy="252" r="6" fill="#f59e0b" className="animate-pulse" />
            <circle cx="940" cy="126" r="7" fill="#ec4899" className="animate-pulse" />
          </svg>

          {/* 3D Milestone Nodes Along the Curved Galaxy Pathway */}
          {nodes.map((node, index) => {
            const isSelected = activeNode.id === node.id;
            const isHovered = hoveredNodeId === node.id;
            
            // Map percentage coords to CSS
            const leftPct = `${node.coords.x}%`;
            const topPct = `${node.coords.y}%`;

            return (
              <div
                key={node.id}
                id={`galaxy-node-${node.id}`}
                style={{ left: leftPct, top: topPct }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 group`}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => {
                  setActiveNodeId(node.id);
                  setIsPlayingTour(false);
                }}
              >
                {/* Orbital Pulsing Rings */}
                <div 
                  className={`absolute -inset-4 rounded-full transition-all duration-500 pointer-events-none ${
                    isSelected || isHovered 
                      ? 'opacity-100 scale-125 animate-pulse-orbital' 
                      : 'opacity-0 scale-90'
                  }`}
                  style={{
                    border: `2px dashed ${node.colorScheme.accent}`,
                    boxShadow: `0 0 25px ${node.colorScheme.glow}`
                  }}
                />

                {/* 3D Icon Sphere Container */}
                <div 
                  className={`relative w-16 h-16 rounded-2xl p-1.5 transition-all duration-300 transform ${
                    isSelected 
                      ? 'scale-110 -translate-y-2 ring-4 ring-green-400/50 shadow-2xl' 
                      : isHovered 
                        ? 'scale-105 -translate-y-1 ring-2 ring-white/40' 
                        : index % 2 === 0 ? 'animate-float-slow' : 'animate-float-reverse'
                  } bg-zinc-900/90 border ${node.colorScheme.border} backdrop-blur-md overflow-hidden`}
                  style={{
                    boxShadow: isSelected ? `0 12px 30px -5px ${node.colorScheme.glow}` : undefined
                  }}
                >
                  {/* 3D Icon Render */}
                  <img
                    src={node.iconImage}
                    alt={t(node.titleKey)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl filter contrast-110 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Step Number Tag */}
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-zinc-950/90 border border-zinc-700/80 text-[10px] font-bold text-white flex items-center justify-center shadow">
                    {node.stepNumber}
                  </div>

                  {/* Active Beacon Dot */}
                  {isSelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  )}
                </div>

                {/* Compact Floating Label */}
                <div className={`mt-2 text-center transition-all duration-200 ${
                  isSelected ? 'opacity-100 translate-y-0' : 'opacity-80 group-hover:opacity-100'
                }`}>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap border shadow-sm ${
                    isSelected 
                      ? 'bg-zinc-900 border-green-400 text-white font-extrabold ring-1 ring-green-400/40' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                  }`}>
                    {t(node.titleKey)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE / TABLET HORIZONTAL STEPPER WITH 3D ICONS */}
        <div className="lg:hidden flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x">
          {nodes.map((node) => {
            const isSelected = activeNode.id === node.id;
            return (
              <button
                key={node.id}
                type="button"
                id={`galaxy-mobile-node-${node.id}`}
                onClick={() => {
                  setActiveNodeId(node.id);
                  setIsPlayingTour(false);
                }}
                className={`snap-center shrink-0 w-44 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `bg-zinc-900 border-green-400 ring-2 ring-green-400/30 shadow-lg`
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-700 shrink-0 bg-zinc-950">
                    <img 
                      src={node.iconImage} 
                      alt={t(node.titleKey)} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">Node 0{node.stepNumber}</span>
                    <span className={`text-xs font-bold truncate block ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {t(node.titleKey)}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-1">
                  {t(node.subtitleKey)}
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE MILESTONE SPOTLIGHT CARD & QUICK ROADMAP JUMP */}
        <div 
          id="active-galaxy-milestone-panel"
          className="mt-4 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300"
        >
          {/* Milestone Background Aura */}
          <div 
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all duration-500"
            style={{ backgroundColor: activeNode.colorScheme.glow }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: 3D Node Artwork + Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              
              {/* 3D Icon Glass Sphere Showcase */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 bg-zinc-950 border border-zinc-700/80 shadow-2xl shrink-0">
                <img
                  src={activeNode.iconImage}
                  alt={t(activeNode.titleKey)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl filter saturate-125"
                />
                <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono font-bold text-green-400">
                  #{activeNode.stepNumber}
                </div>
              </div>

              {/* Title, Subtitle, Description */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeNode.colorScheme.badgeBg} ${activeNode.colorScheme.badgeText} ${activeNode.colorScheme.border}`}>
                    {t(activeNode.subtitleKey)}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Milestone {activeNode.stepNumber} of {nodes.length}
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {t(activeNode.titleKey)}
                </h4>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  {t(activeNode.descKey)}
                </p>

                {/* Tech pills */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {activeNode.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Direct Navigation CTA button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 md:pt-0">
              <Link
                to={activeNode.trackLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{t('hero.exploreNode')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* Footer hint */}
      <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-green-400" />
          <span>{t('hero.clickNodeHint')}</span>
        </span>
        <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500">
          Career Ready Guided Orbit &bull; Open Curriculum
        </span>
      </div>

    </div>
  );
};
