/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Code2, Users, FileText, Cpu, Github, ExternalLink, Calendar, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { ReviewType, createReviewRequest } from '../../lib/feedbackStore';
import { useToast } from '../../context/ToastContext';
import { getAuthSession } from '../../lib/learnerStore';

interface RequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackSlug: string;
  trackTitle: string;
  initialMilestoneTitle?: string;
  initialMilestoneId?: string;
  initialMentor?: {
    userId: string;
    fullName: string;
    email?: string;
    specialization?: string;
  } | null;
  availableMentors?: any[];
  onSuccess?: () => void;
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({
  isOpen,
  onClose,
  trackSlug,
  trackTitle,
  initialMilestoneTitle,
  initialMilestoneId,
  initialMentor,
  availableMentors = [],
  onSuccess,
}) => {
  const toast = useToast();
  const session = getAuthSession();

  const [reviewType, setReviewType] = useState<ReviewType>('code_review');
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState(initialMilestoneTitle || 'Capstone Project & Portfolio Review');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('14:00 - 15:00 UTC');
  const [notes, setNotes] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>(initialMentor?.userId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reviewTypes = [
    {
      id: 'code_review',
      label: 'Code & Architecture Review',
      description: 'Receive line-by-line critique on typing, architecture, scalability, and code cleanliness.',
      icon: <Code2 className="h-4 w-4" />,
    },
    {
      id: 'mock_interview',
      label: '1-on-1 Mock Interview',
      description: 'Live 45-min technical screen covering system design, live coding, and behavioral questions.',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'resume_review',
      label: 'Portfolio & Resume Critique',
      description: 'Get actionable suggestions to optimize project case studies and recruiter appeal.',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'system_design',
      label: 'System Design Deep Dive',
      description: 'Review database schemas, caching layers, and microservices architecture.',
      icon: <Cpu className="h-4 w-4" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionTitle.trim()) {
      toast.error('Please enter a title for your request');
      return;
    }

    setIsSubmitting(true);
    try {
      const chosenMentor = availableMentors.find(m => m.userId === selectedMentorId) || initialMentor;

      await createReviewRequest({
        learnerId: session.userId || 'user_' + Date.now(),
        learnerName: session.name || session.email?.split('@')[0] || 'Learner',
        learnerEmail: session.email,
        learnerExperienceYears: experienceYears.trim() || undefined,
        mentorId: chosenMentor ? chosenMentor.userId : undefined,
        mentorName: chosenMentor ? (chosenMentor.fullName || chosenMentor.name) : undefined,
        mentorEmail: chosenMentor ? chosenMentor.email : undefined,
        trackSlug,
        trackTitle,
        milestoneId: initialMilestoneId,
        milestoneTitle: milestoneTitle.trim(),
        type: reviewType,
        submissionTitle: submissionTitle.trim(),
        repoUrl: repoUrl.trim() || undefined,
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        preferredDate: preferredDate || undefined,
        preferredTimeSlot: reviewType === 'mock_interview' ? preferredTimeSlot : undefined,
        notes: notes.trim() || undefined,
      });

      toast.success(
        'Request Submitted Successfully!',
        `Your ${reviewType === 'mock_interview' ? 'Mock Interview' : 'Review'} request was sent to ${chosenMentor ? chosenMentor.fullName || chosenMentor.name : 'the mentor team'}.`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to submit review request', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Mentorship &amp; Feedback
              </span>
              <span className="text-xs font-mono text-zinc-400">{trackTitle}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Request Mentor Review or Mock Interview
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Review Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              Select Interaction Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviewTypes.map((t) => {
                const isSelected = reviewType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setReviewType(t.id as ReviewType)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-green-500/10 border-green-500 text-white ring-1 ring-green-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <span className={isSelected ? 'text-green-400' : 'text-zinc-500'}>
                        {t.icon}
                      </span>
                      <span>{t.label}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submission Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Project / Session Title *
            </label>
            <input
              type="text"
              required
              placeholder={
                reviewType === 'code_review'
                  ? 'e.g. E-Commerce Microservices Backend (Node + Redis + Postgres)'
                  : reviewType === 'mock_interview'
                  ? 'e.g. Senior Frontend Architecture & Live Coding Preparation'
                  : 'e.g. Full-Stack Developer Resume & GitHub Portfolio Review'
              }
              value={submissionTitle}
              onChange={(e) => setSubmissionTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Years of Experience *
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 2"
              value={experienceYears}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) > 0) setExperienceYears(val);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Milestone Node */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Related Milestone
              </label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Capstone Project & Portfolio Review"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Target Mentor Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Assign to Mentor
              </label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
              >
                <option value="">Any Available Verified Mentor</option>
                {availableMentors.map((m: any) => (
                  <option key={m.userId || m.email} value={m.userId}>
                    {m.fullName || m.name} ({m.specialization || 'Industry Mentor'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Links for Code Review */}
          {reviewType !== 'mock_interview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5 text-zinc-400" />
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  Live Preview / Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Scheduling for Mock Interview */}
          {reviewType === 'mock_interview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-green-400" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-green-400" />
                  Preferred Time Slot
                </label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
                >
                  <option value="10:00 - 11:00 UTC">Morning (10:00 – 11:00 UTC)</option>
                  <option value="14:00 - 15:00 UTC">Afternoon (14:00 – 15:00 UTC)</option>
                  <option value="18:00 - 19:00 UTC">Evening (18:00 – 19:00 UTC)</option>
                  <option value="21:00 - 22:00 UTC">Late Evening (21:00 – 22:00 UTC)</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes & Questions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Specific Questions or Areas of Focus
            </label>
            <textarea
              rows={3}
              placeholder="What specifically would you like feedback on? (e.g. 'I want feedback on whether my database indexing is optimal for 100k queries/sec', or 'How to explain this design in a junior interview?')"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-green-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
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
              {isSubmitting ? 'Submitting...' : 'Submit Request to Mentors'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
