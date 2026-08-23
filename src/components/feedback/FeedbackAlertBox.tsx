/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Star, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ReviewRequest, StructuredFeedback } from '../../lib/feedbackStore';

interface FeedbackAlertBoxProps {
  request: ReviewRequest;
  feedback?: StructuredFeedback;
  onOpenDetails?: (request: ReviewRequest) => void;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

export const FeedbackAlertBox: React.FC<FeedbackAlertBoxProps> = ({
  request,
  feedback,
  onOpenDetails,
  onViewDetails,
  onDismiss,
}) => {
  const activeFeedback = feedback || request?.feedback;

  if (!activeFeedback) {
    return null;
  }

  const getOutcomeStyles = () => {
    switch (activeFeedback.outcome) {
      case 'exceeds_expectations':
        return {
          bannerBg: 'bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-zinc-900/80',
          borderColor: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          badgeText: '🌟 Exceeds Expectations',
          glowRing: 'ring-1 ring-emerald-500/30',
        };
      case 'approved':
        return {
          bannerBg: 'bg-gradient-to-r from-green-950/30 via-zinc-900/90 to-zinc-900/80',
          borderColor: 'border-green-500/40',
          badgeBg: 'bg-green-500/15 text-green-400 border-green-500/30',
          badgeText: '✅ Milestone Approved',
          glowRing: 'ring-1 ring-green-500/20',
        };
      case 'needs_work':
      default:
        return {
          bannerBg: 'bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-zinc-900/80',
          borderColor: 'border-amber-500/40',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          badgeText: '⚠️ Revisions Recommended',
          glowRing: 'ring-1 ring-amber-500/20',
        };
    }
  };

  const styles = getOutcomeStyles();

  const handleOpen = () => {
    if (onViewDetails) {
      onViewDetails();
    } else if (onOpenDetails) {
      onOpenDetails(request);
    }
  };

  return (
    <div
      id={`feedback-alert-${request.id}`}
      className={`relative rounded-3xl border ${styles.borderColor} ${styles.bannerBg} ${styles.glowRing} p-5 sm:p-6 shadow-2xl transition-all backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Left icon + content */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-400 shrink-0 shadow-inner">
            <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles.badgeBg}`}>
                {styles.badgeText}
              </span>
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                Reviewed by <strong className="text-zinc-200 font-semibold">{activeFeedback.mentorName || 'Mentor'}</strong>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {activeFeedback.createdAt ? new Date(activeFeedback.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              Feedback Ready: <span className="text-zinc-200 font-normal">{request.submissionTitle}</span>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 max-w-2xl leading-relaxed">
              "{activeFeedback.executiveSummary}"
            </p>

            {/* Quick Rubric Highlights */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                <span className="text-zinc-500">Overall Score:</span>
                <span className="font-bold text-green-400 flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-green-400" />
                  {activeFeedback.overallScore ?? 5.0} / 5.0
                </span>
              </div>
              {activeFeedback.rubrics?.codeQuality && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span>Code Quality:</span>
                  <strong className="text-zinc-200">{activeFeedback.rubrics.codeQuality.score}/5</strong>
                </div>
              )}
              {activeFeedback.rubrics?.architecture && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span>Architecture:</span>
                  <strong className="text-zinc-200">{activeFeedback.rubrics.architecture.score}/5</strong>
                </div>
              )}
              {activeFeedback.rubrics?.jobReadiness && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span>Job Readiness:</span>
                  <strong className="text-zinc-200">{activeFeedback.rubrics.jobReadiness.score}/5</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full sm:w-auto justify-end">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleOpen}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 text-xs sm:text-sm font-bold shadow-lg shadow-green-500/20 hover:shadow-green-400/30 transition-all cursor-pointer"
          >
            <span>View Full Rubric &amp; Action Plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
