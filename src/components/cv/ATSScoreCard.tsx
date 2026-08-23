/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, Sparkles, Target, Zap, 
  Layers, ChevronDown, ChevronUp, FileText, ArrowUpRight, Plus, 
  Check, ArrowRight, ShieldCheck, BarChart3, HelpCircle, RefreshCw
} from 'lucide-react';
import { ATSCheckResult, CVData } from '../../types/cv';

interface ATSScoreCardProps {
  atsResult: ATSCheckResult;
  cv: CVData;
  onSelectTab?: (tab: any) => void;
  onAddMissingSkill?: (skill: string) => void;
  onPolishSummary?: () => void;
  onOpenTargetJobModal?: () => void;
  isDetailedView?: boolean;
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  atsResult,
  cv,
  onSelectTab,
  onAddMissingSkill,
  onPolishSummary,
  onOpenTargetJobModal,
  isDetailedView = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pillars' | 'keywords' | 'tips'>('pillars');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return { text: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/10', stroke: '#22c55e' };
    if (score >= 70) return { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', stroke: '#10b981' };
    if (score >= 55) return { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', stroke: '#f59e0b' };
    return { text: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/10', stroke: '#ef4444' };
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-500/15 text-green-400 border-green-500/40';
      case 'B':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      case 'C':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      default:
        return 'bg-red-500/15 text-red-400 border-red-500/40';
    }
  };

  const b = atsResult.breakdown;
  const scoreColors = getScoreColor(atsResult.score);

  // SVG Circular Gauge calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsResult.score / 100) * circumference;

  return (
    <div id="ats-compatibility-score-container" className="rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-xl overflow-hidden transition-all">
      {/* Top Banner / Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Main Score & Grade Area */}
          <div className="flex items-center gap-4">
            {/* SVG Circular Progress Meter */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-18 w-18 -rotate-90 transform" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-zinc-800"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={scoreColors.stroke}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-mono font-black text-xl leading-none ${scoreColors.text}`}>
                  {atsResult.score}
                </span>
                <span className="text-[10px] text-zinc-400 font-sans font-medium">/100</span>
              </div>
            </div>

            {/* Title, Grade, and ATS Compatibility Note */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  ATS Compatibility Score
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${getGradeBadge(atsResult.grade)}`}>
                  Grade {atsResult.grade}
                </span>
                {atsResult.score >= 80 ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[11px] font-medium border border-green-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Taleo & Workday Ready
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                    <AlertTriangle className="h-3 w-3" /> Optimizations Available
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl line-clamp-2 leading-relaxed">
                {atsResult.summary}
              </p>
            </div>
          </div>

          {/* Target Role & Controls */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            {cv.targetJob?.targetRole ? (
              <button
                type="button"
                onClick={() => onSelectTab ? onSelectTab('targetJob') : onOpenTargetJobModal?.()}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-green-500/50 text-xs font-medium text-zinc-300 hover:text-green-400 transition-all cursor-pointer text-left"
                title="Click to edit target job posting"
              >
                <Target className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <div className="max-w-[170px] truncate">
                  <span className="text-[10px] block text-zinc-500 font-mono uppercase tracking-wider">Target Role</span>
                  <span className="font-semibold text-zinc-200 block truncate">{cv.targetJob.targetRole}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 ml-0.5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab ? onSelectTab('targetJob') : onOpenTargetJobModal?.()}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-dashed border-zinc-700 hover:border-green-500/60 text-xs font-semibold text-zinc-400 hover:text-green-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5 text-green-400" />
                <span>Add Target Job Posting</span>
              </button>
            )}

            {/* Collapse / Expand Button */}
            {!isDetailedView && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title={isCollapsed ? 'Expand ATS Breakdown' : 'Collapse ATS Breakdown'}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* 5 Pillar Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-zinc-800/80">
          
          {/* Pillar 1: Contact */}
          <div 
            onClick={() => onSelectTab?.('contact')}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">1. Contact Details</span>
              {b.contactCompleteness.status === 'pass' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200">
                {b.contactCompleteness.score}/{b.contactCompleteness.max} pts
              </span>
              <span className="text-[10px] text-zinc-400">
                {b.contactCompleteness.status === 'pass' ? '100% Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(b.contactCompleteness.score / b.contactCompleteness.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 2: Action Verbs */}
          <div 
            onClick={() => onSelectTab?.('experience')}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">2. Action Verbs</span>
              {b.actionVerbs.status === 'pass' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200">
                {b.actionVerbs.count} Power Verbs
              </span>
              <span className="text-[10px] text-zinc-400">
                {b.actionVerbs.score}/{b.actionVerbs.max} pts
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(b.actionVerbs.score / b.actionVerbs.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 3: Quantified Metrics */}
          <div 
            onClick={() => onSelectTab?.('experience')}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">3. Metrics & Numbers</span>
              {b.quantifiedMetrics.status === 'pass' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200">
                {b.quantifiedMetrics.metricsCount} Metrics Hits
              </span>
              <span className="text-[10px] text-zinc-400">
                {b.quantifiedMetrics.score}/{b.quantifiedMetrics.max} pts
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(b.quantifiedMetrics.score / b.quantifiedMetrics.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 4: Keywords */}
          <div 
            onClick={() => onSelectTab?.('skills')}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">4. Skills Match</span>
              {b.skillsAndKeywords.status === 'pass' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200">
                {b.skillsAndKeywords.matchedCount}/{b.skillsAndKeywords.targetCount} Matches
              </span>
              <span className="text-[10px] text-zinc-400">
                {b.skillsAndKeywords.score}/{b.skillsAndKeywords.max} pts
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(b.skillsAndKeywords.score / b.skillsAndKeywords.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 5: Layout & Readability */}
          <div 
            onClick={() => onSelectTab?.('design')}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">5. ATS Readability</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-mono font-bold text-green-400">
                100% Clean
              </span>
              <span className="text-[10px] text-zinc-400">
                {b.layoutAndReadability.score}/{b.layoutAndReadability.max} pts
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-green-500 h-full rounded-full w-full" />
            </div>
          </div>

        </div>
      </div>

      {/* Expandable Diagnostic Body */}
      {(!isCollapsed || isDetailedView) && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab('pillars')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'pillars'
                  ? 'bg-zinc-800 text-green-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Rubric Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('keywords')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'keywords'
                  ? 'bg-zinc-800 text-green-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Keyword Gap Analysis ({b.skillsAndKeywords.missing?.length || 0} missing)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('tips')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'tips'
                  ? 'bg-zinc-800 text-green-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommendations ({atsResult.actionableTips.length})</span>
            </button>
          </div>

          {/* SubTab 1: Rubric Breakdown */}
          {activeSubTab === 'pillars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-150">
              
              {/* Contact Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                    Contact & Personal Info
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {b.contactCompleteness.score} / {b.contactCompleteness.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {b.contactCompleteness.message}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cv.personalInfo.fullName ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {cv.personalInfo.fullName ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Full Name
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cv.personalInfo.email ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {cv.personalInfo.email ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Email
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cv.personalInfo.phone ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {cv.personalInfo.phone ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Phone
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cv.personalInfo.location ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {cv.personalInfo.location ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Location
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cv.personalInfo.linkedinUrl ? 'text-green-400 bg-green-500/10' : 'text-zinc-500 bg-zinc-900'}`}>
                    {cv.personalInfo.linkedinUrl ? <Check className="h-3 w-3" /> : '—'} LinkedIn
                  </span>
                </div>
              </div>

              {/* Action Verbs Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    Action Verbs & Impact
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {b.actionVerbs.score} / {b.actionVerbs.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {b.actionVerbs.message}
                </p>
                {b.actionVerbs.verbsFound?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {b.actionVerbs.verbsFound.slice(0, 8).map((v, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-green-400 font-mono">
                        {v}
                      </span>
                    ))}
                    {b.actionVerbs.verbsFound.length > 8 && (
                      <span className="text-[10px] text-zinc-500 self-center">
                        +{b.actionVerbs.verbsFound.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantified Metrics Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-green-400" />
                    Quantified Metrics (STAR Method)
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {b.quantifiedMetrics.score} / {b.quantifiedMetrics.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {b.quantifiedMetrics.message}
                </p>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1">
                  <span className="font-mono text-zinc-200 font-bold">{b.quantifiedMetrics.metricsCount} numeric metrics detected</span>
                  <span>(Target: 4+ metrics across bullet points)</span>
                </div>
              </div>

              {/* Layout & Format Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                    ATS Layout & Syntax
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {b.layoutAndReadability.score} / {b.layoutAndReadability.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {b.layoutAndReadability.message}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-green-400 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Standard headings, 100% single-layer parsable HTML/PDF structure</span>
                </div>
              </div>

            </div>
          )}

          {/* SubTab 2: Keyword Gap Analysis */}
          {activeSubTab === 'keywords' && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">
                    Target Job Keyword Match Rate: {b.skillsAndKeywords.matchedCount} of {b.skillsAndKeywords.targetCount} ({Math.round((b.skillsAndKeywords.matchedCount / (b.skillsAndKeywords.targetCount || 1)) * 100)}%)
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Adding missing keywords directly into your skills or bullet points significantly boosts algorithmic ranking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('targetJob')}
                  className="text-xs text-green-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Edit Target Job <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Matched Keywords */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  Matched Keywords in your CV ({b.skillsAndKeywords.matched?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {b.skillsAndKeywords.matched?.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[11px] font-mono text-green-300">
                      <Check className="h-2.5 w-2.5" />
                      {kw}
                    </span>
                  ))}
                  {(!b.skillsAndKeywords.matched || b.skillsAndKeywords.matched.length === 0) && (
                    <span className="text-xs text-zinc-500 italic">No direct matches yet. Paste target job description.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords with 1-click Add */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Missing Keywords from Target Role ({b.skillsAndKeywords.missing?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {b.skillsAndKeywords.missing?.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onAddMissingSkill?.(kw)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-amber-500/30 hover:border-green-500 hover:bg-green-500/10 text-[11px] font-mono text-amber-300 hover:text-green-300 transition-all cursor-pointer group"
                      title={`Click to add "${kw}" to your CV Technical Skills`}
                    >
                      <span>{kw}</span>
                      <Plus className="h-3 w-3 text-amber-400 group-hover:text-green-400" />
                    </button>
                  ))}
                  {(!b.skillsAndKeywords.missing || b.skillsAndKeywords.missing.length === 0) && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> All target keywords successfully integrated!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Actionable Recommendations */}
          {activeSubTab === 'tips' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {atsResult.actionableTips.map((tip) => (
                <div
                  key={tip.id}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                    tip.type === 'critical'
                      ? 'bg-red-500/5 border-red-500/20 text-red-200'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  {tip.type === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-zinc-100">{tip.title}</p>
                      {tip.id === 'tip_summary_action' && onPolishSummary && (
                        <button
                          type="button"
                          onClick={onPolishSummary}
                          className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-[11px] font-semibold text-green-400 hover:bg-green-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> Auto-Polish Summary
                        </button>
                      )}
                      {tip.id === 'tip_metrics' && onSelectTab && (
                        <button
                          type="button"
                          onClick={() => onSelectTab('experience')}
                          className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          Edit Experience <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                      {tip.id === 'tip_contact' && onSelectTab && (
                        <button
                          type="button"
                          onClick={() => onSelectTab('contact')}
                          className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          Edit Contact <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-[11px]">{tip.description}</p>
                    {tip.suggestedFix && (
                      <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 font-mono leading-relaxed">
                        <span className="text-green-400 font-bold not-font-mono">Example Fix: </span>
                        {tip.suggestedFix}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {atsResult.actionableTips.length === 0 && (
                <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-950 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="font-bold text-zinc-200">Outstanding ATS Optimization!</p>
                  <p className="mt-1 text-[11px]">Your CV meets top-tier automated scanner criteria across all dimensions.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
