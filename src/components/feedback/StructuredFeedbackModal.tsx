/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Star, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck, Github, ExternalLink, BookOpen, ArrowRight, Award, Compass, MessageSquare } from 'lucide-react';
import { ReviewRequest, StructuredFeedback, markFeedbackAsRead } from '../../lib/feedbackStore';

interface StructuredFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ReviewRequest | null;
}

export const StructuredFeedbackModal: React.FC<StructuredFeedbackModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  useEffect(() => {
    if (isOpen && request && request.feedback && !request.feedback.isReadByLearner) {
      markFeedbackAsRead(request.id);
    }
  }, [isOpen, request]);

  if (!isOpen || !request || !request.feedback) return null;

  const { feedback } = request;

  const getOutcomeStyles = () => {
    switch (feedback.outcome) {
      case 'exceeds_expectations':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          badgeText: '🌟 Exceeds Expectations',
          glow: 'from-emerald-500/20 via-zinc-900 to-zinc-900',
          scoreColor: 'text-emerald-400',
        };
      case 'approved':
        return {
          badge: 'bg-green-500/15 text-green-400 border-green-500/30',
          badgeText: '✅ Milestone Approved',
          glow: 'from-green-500/20 via-zinc-900 to-zinc-900',
          scoreColor: 'text-green-400',
        };
      case 'needs_work':
      default:
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          badgeText: '⚠️ Revisions Recommended',
          glow: 'from-amber-500/20 via-zinc-900 to-zinc-900',
          scoreColor: 'text-amber-400',
        };
    }
  };

  const styles = getOutcomeStyles();

  const rubricItems = [
    {
      key: 'codeQuality',
      title: 'Code Quality & Cleanliness',
      data: feedback.rubrics.codeQuality,
      icon: <Award className="h-4 w-4 text-emerald-400" />,
    },
    {
      key: 'architecture',
      title: 'Architecture & System Design',
      data: feedback.rubrics.architecture,
      icon: <Compass className="h-4 w-4 text-blue-400" />,
    },
    {
      key: 'jobReadiness',
      title: 'Job Readiness & Industry Standards',
      data: feedback.rubrics.jobReadiness,
      icon: <ShieldCheck className="h-4 w-4 text-purple-400" />,
    },
    ...(feedback.rubrics.communication
      ? [
          {
            key: 'communication',
            title: 'Technical Communication & Docs',
            data: feedback.rubrics.communication,
            icon: <MessageSquare className="h-4 w-4 text-amber-400" />,
          },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className={`p-6 sm:p-8 bg-gradient-to-b ${styles.glow} border-b border-zinc-800 space-y-4`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${styles.badge}`}>
                  {styles.badgeText}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {request.trackTitle} • {request.milestoneTitle}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {request.submissionTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mentor Profile Bar & Overall Score */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-green-400 font-bold font-mono text-base shadow-inner">
                {feedback.mentorName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-100">
                  <span>{feedback.mentorName}</span>
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xs text-zinc-400">
                  {feedback.mentorSpecialization} • Reviewed on {new Date(feedback.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Composite Score Card */}
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-800/90 px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Overall Rubric:</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-green-400 text-green-400" />
                <span className={`text-xl font-extrabold ${styles.scoreColor}`}>
                  {feedback.overallScore}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[68vh] overflow-y-auto divide-y divide-zinc-800/60">
          
          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-400" />
              Executive Mentor Summary
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-inner">
              "{feedback.executiveSummary}"
            </p>

            {/* Project links if provided */}
            {(request.repoUrl || request.liveDemoUrl) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {request.repoUrl && (
                  <a
                    href={request.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 transition-colors font-mono"
                  >
                    <Github className="h-3.5 w-3.5" />
                    View Submission Repo &rarr;
                  </a>
                )}
                {request.liveDemoUrl && (
                  <a
                    href={request.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 transition-colors font-mono"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Application Demo &rarr;
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Detailed Rubric Cards */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Rubric Assessment Breakdown (1 – 5 Scale)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {rubricItems.map((item) => {
                if (!item.data) return null;
                const score = item.data.score;
                const scorePercent = (score / 5) * 100;

                return (
                  <div
                    key={item.key}
                    className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <h4 className="font-bold text-white text-sm">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold font-mono text-green-400">
                          {score} / 5
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 font-mono">
                      Evaluation Criteria: {item.data.criteria}
                    </p>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                      <strong className="text-zinc-400 font-medium block mb-1">Mentor Observation:</strong>
                      {item.data.comments}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Key Strengths */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Key Demonstrated Strengths
              </h4>
              <ul className="space-y-2">
                {feedback.keyStrengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-xs text-zinc-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Actionable Areas to Polish
              </h4>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((imp, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/20 text-xs text-zinc-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">→</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Steps & Resources */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-400" />
              Recommended Resources &amp; Next Action Items
            </h3>

            {feedback.actionableNextSteps && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-green-500/30 text-xs text-zinc-200 leading-relaxed space-y-1">
                <span className="font-bold text-green-400 uppercase tracking-wider font-mono text-[10px] block">
                  Next Milestone Objective:
                </span>
                <p>{feedback.actionableNextSteps}</p>
              </div>
            )}

            {feedback.recommendedResources && feedback.recommendedResources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {feedback.recommendedResources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group text-left"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {res.type || 'Resource'}
                      </span>
                      <p className="text-xs font-semibold text-white group-hover:text-green-400 transition-colors">
                        {res.title}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-green-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            ID: {feedback.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            Close Rubric
          </button>
        </div>

      </div>
    </div>
  );
};
