/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle, Plus, Trash2, Github, ExternalLink, Sparkles, Award, ShieldCheck, Compass, MessageSquare } from 'lucide-react';
import { ReviewRequest, FeedbackOutcome, submitMentorFeedback } from '../../lib/feedbackStore';
import { useToast } from '../../context/ToastContext';
import { getAuthSession } from '../../lib/learnerStore';

interface MentorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ReviewRequest | null;
  onSuccess?: () => void;
}

export const MentorReviewModal: React.FC<MentorReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
}) => {
  const toast = useToast();
  const session = getAuthSession();

  const [outcome, setOutcome] = useState<FeedbackOutcome>('approved');
  const [executiveSummary, setExecutiveSummary] = useState('');
  
  // Rubrics state (1 - 5 scale)
  const [codeQualityScore, setCodeQualityScore] = useState(4.5);
  const [codeQualityComments, setCodeQualityComments] = useState('');

  const [architectureScore, setArchitectureScore] = useState(4.0);
  const [architectureComments, setArchitectureComments] = useState('');

  const [jobReadinessScore, setJobReadinessScore] = useState(4.0);
  const [jobReadinessComments, setJobReadinessComments] = useState('');

  const [communicationScore, setCommunicationScore] = useState(4.5);
  const [communicationComments, setCommunicationComments] = useState('');

  // Strengths
  const [strengths, setStrengths] = useState<string[]>([
    'Clean component hierarchy and modular state boundaries.',
    'Clear responsive styling with high contrast readability.'
  ]);
  const [newStrength, setNewStrength] = useState('');

  // Improvements
  const [improvements, setImprovements] = useState<string[]>([
    'Add automated unit/integration tests with Vitest or Jest.',
    'Improve error boundary handling on network timeouts.'
  ]);
  const [newImprovement, setNewImprovement] = useState('');

  // Recommended Resources
  const [resources, setResources] = useState<{ title: string; url: string; type: string }[]>([
    { title: 'Testing Principles & Mocking Best Practices', url: 'https://testingjavascript.com', type: 'Tutorial' }
  ]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  // Next steps
  const [actionableNextSteps, setActionableNextSteps] = useState(
    'Proceed to the next milestone and prepare for a mock technical screen.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const averageScore = Number(
    ((codeQualityScore + architectureScore + jobReadinessScore + communicationScore) / 4).toFixed(1)
  );

  const handleAddStrength = () => {
    if (!newStrength.trim()) return;
    setStrengths([...strengths, newStrength.trim()]);
    setNewStrength('');
  };

  const handleRemoveStrength = (idx: number) => {
    setStrengths(strengths.filter((_, i) => i !== idx));
  };

  const handleAddImprovement = () => {
    if (!newImprovement.trim()) return;
    setImprovements([...improvements, newImprovement.trim()]);
    setNewImprovement('');
  };

  const handleRemoveImprovement = (idx: number) => {
    setImprovements(improvements.filter((_, i) => i !== idx));
  };

  const handleAddResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setResources([...resources, { title: newResTitle.trim(), url: newResUrl.trim(), type: 'Documentation' }]);
    setNewResTitle('');
    setNewResUrl('');
  };

  const handleRemoveResource = (idx: number) => {
    setResources(resources.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveSummary.trim()) {
      toast.error('Please write an executive summary for the learner.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMentorFeedback(request.id, {
        mentorId: session.userId || 'mentor_' + Date.now(),
        mentorName: session.name || session.email?.split('@')[0] || 'Mentor',
        mentorEmail: session.email,
        mentorSpecialization: request.trackTitle || 'Industry Mentor',
        outcome,
        executiveSummary: executiveSummary.trim(),
        rubrics: {
          codeQuality: {
            score: codeQualityScore,
            criteria: 'Typing rigor, naming clarity, component decomposition, and zero dead code.',
            comments: codeQualityComments.trim() || 'Solid code structure and standard convention adherence.',
          },
          architecture: {
            score: architectureScore,
            criteria: 'State management scalability, folder hierarchy, and separation of concerns.',
            comments: architectureComments.trim() || 'Well organized modules with clean data flow.',
          },
          jobReadiness: {
            score: jobReadinessScore,
            criteria: 'Error boundary handling, accessibility, responsiveness, and deployment readiness.',
            comments: jobReadinessComments.trim() || 'Meets industry expectations for junior/mid roles.',
          },
          communication: {
            score: communicationScore,
            criteria: 'Documentation clarity, PR descriptions, and task communication.',
            comments: communicationComments.trim() || 'Clear readme and project notes.',
          },
        },
        keyStrengths: strengths,
        areasForImprovement: improvements,
        recommendedResources: resources,
        actionableNextSteps: actionableNextSteps.trim(),
      });

      toast.success(
        'Review Submitted!',
        `Structured feedback successfully dispatched to ${request.learnerName} for "${request.submissionTitle}".`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Error submitting review', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-mono uppercase">
                Conduct Structured Review
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Learner: {request.learnerName}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {request.submissionTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Track: {request.trackTitle} • Milestone: {request.milestoneTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmitReview} className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* Learner Context & Links */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Learner Submission Details &amp; Questions
            </h3>
            {request.notes && (
              <p className="text-xs text-zinc-300 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850">
                "{request.notes}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {request.repoUrl && (
                <a
                  href={request.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:underline font-mono"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub Repository &rarr;
                </a>
              )}
              {request.liveDemoUrl && (
                <a
                  href={request.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:underline font-mono"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Preview Demo &rarr;
                </a>
              )}
            </div>
          </div>

          {/* Outcome & Overall Verdict */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Overall Milestone Outcome
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOutcome('exceeds_expectations')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  outcome === 'exceeds_expectations'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base block mb-1">🌟</span>
                <span className="text-xs font-bold block">Exceeds Expectations</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('approved')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  outcome === 'approved'
                    ? 'bg-green-500/15 border-green-500 text-green-300 ring-1 ring-green-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base block mb-1">✅</span>
                <span className="text-xs font-bold block">Approved / Ready</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('needs_work')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  outcome === 'needs_work'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base block mb-1">⚠️</span>
                <span className="text-xs font-bold block">Needs Revisions</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Executive Mentor Summary *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide an encouraging high-level evaluation of their code architecture, engineering maturity, and preparedness."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 leading-relaxed"
            />
          </div>

          {/* Rubrics (1 to 5 sliders) */}
          <div className="space-y-4 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Detailed Rubric Scoring
              </h3>
              <div className="flex items-center gap-1.5 font-mono text-xs text-green-400 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                <Star className="h-3 w-3 fill-green-400" />
                <span>Calculated Average: <strong>{averageScore} / 5.0</strong></span>
              </div>
            </div>

            {/* Code Quality */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Code Quality &amp; Cleanliness
                </span>
                <span className="text-xs font-mono font-bold text-green-400">{codeQualityScore} / 5.0</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={codeQualityScore}
                onChange={(e) => setCodeQualityScore(parseFloat(e.target.value))}
                className="w-full accent-green-500 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Specific comments on types, variable naming, component cleanliness..."
                value={codeQualityComments}
                onChange={(e) => setCodeQualityComments(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Architecture */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-blue-400" />
                  Architecture &amp; System Design
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">{architectureScore} / 5.0</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={architectureScore}
                onChange={(e) => setArchitectureScore(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Comments on state management, folder organization, API boundaries..."
                value={architectureComments}
                onChange={(e) => setArchitectureComments(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Job Readiness */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  Job Readiness &amp; Best Practices
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">{jobReadinessScore} / 5.0</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={jobReadinessScore}
                onChange={(e) => setJobReadinessScore(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Comments on testing, error resiliency, responsiveness, accessibility..."
                value={jobReadinessComments}
                onChange={(e) => setJobReadinessComments(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Communication */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  Technical Communication &amp; Docs
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{communicationScore} / 5.0</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={communicationScore}
                onChange={(e) => setCommunicationScore(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Comments on README documentation, PR descriptions..."
                value={communicationComments}
                onChange={(e) => setCommunicationComments(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Strengths List */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Key Strengths (Bullet Points)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Strong understanding of async promise pipelines"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500"
              />
              <button
                type="button"
                onClick={handleAddStrength}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {strengths.map((str, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300">
                  <span>✓ {str}</span>
                  <button type="button" onClick={() => handleRemoveStrength(idx)} className="text-zinc-500 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400">
              Actionable Areas for Improvement
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Add debounce on search input to reduce render thrashing"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddImprovement}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {improvements.map((imp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300">
                  <span>→ {imp}</span>
                  <button type="button" onClick={() => handleRemoveImprovement(idx)} className="text-zinc-500 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Next Steps */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Actionable Next Steps / Advice
            </label>
            <textarea
              rows={2}
              value={actionableNextSteps}
              onChange={(e) => setActionableNextSteps(e.target.value)}
              placeholder="e.g. Deploy to Vercel and begin preparing for system design interviews."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-zinc-950 text-xs sm:text-sm font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? 'Publishing...' : 'Publish Structured Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
