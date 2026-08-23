/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase/client';
import { addNotification } from './notificationsStore';

export type ReviewType = 'code_review' | 'mock_interview' | 'resume_review' | 'system_design';
export type ReviewStatus = 'pending' | 'in_review' | 'completed' | 'declined';
export type FeedbackOutcome = 'exceeds_expectations' | 'approved' | 'needs_work';

export interface RubricItem {
  score: number; // 1 to 5
  criteria: string;
  comments: string;
}

export interface StructuredRubrics {
  codeQuality: RubricItem;
  architecture: RubricItem;
  jobReadiness: RubricItem;
  communication?: RubricItem;
}

export interface StructuredFeedback {
  id: string;
  requestId: string;
  mentorId: string;
  mentorName: string;
  mentorEmail?: string;
  mentorSpecialization: string;
  createdAt: string;
  outcome: FeedbackOutcome;
  overallScore: number; // calculated average 1.0 - 5.0
  executiveSummary: string;
  rubrics: StructuredRubrics;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendedResources: { title: string; url: string; type?: string }[];
  actionableNextSteps: string;
  isReadByLearner: boolean;
}

export interface ReviewRequest {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerEmail?: string;
  learnerExperienceYears?: number | string;
  mentorId?: string; // Specific mentor if assigned/targeted
  mentorName?: string;
  mentorEmail?: string;
  trackSlug: string;
  trackTitle: string;
  milestoneId?: string;
  milestoneTitle: string;
  type: ReviewType;
  submissionTitle: string;
  repoUrl?: string;
  liveDemoUrl?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  notes?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  feedback?: StructuredFeedback;
}

const STORAGE_KEY_REQUESTS = 'crp_review_requests';
const STORAGE_KEY_FEEDBACKS = 'crp_mentor_feedbacks';

// Sample Seed data for first-time learners so they have an authentic review to explore immediately
const SEED_REQUESTS: ReviewRequest[] = [
  {
    id: 'req_seed_1',
    learnerId: 'default_learner',
    learnerName: 'Learner',
    learnerEmail: 'learner@careerready.dev',
    mentorId: 'mock_alex_fe',
    mentorName: 'Alex Martinez',
    mentorEmail: 'alex.martinez@cloudscale.io',
    trackSlug: 'frontend-developer',
    trackTitle: 'Frontend Developer',
    milestoneId: 'n6',
    milestoneTitle: '6. Capstone Project & Portfolio Review',
    type: 'code_review',
    submissionTitle: 'Production Task Management SaaS (React + TypeScript + Tailwind)',
    repoUrl: 'https://github.com/learner/task-management-saas',
    liveDemoUrl: 'https://task-saas-demo.vercel.app',
    notes: 'Implemented full optimistic UI, custom keyboard shortcuts, and responsive dark mode. Looking for feedback on state modularity and accessibility.',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    feedback: {
      id: 'fb_seed_1',
      requestId: 'req_seed_1',
      mentorId: 'mock_alex_fe',
      mentorName: 'Alex Martinez',
      mentorEmail: 'alex.martinez@cloudscale.io',
      mentorSpecialization: 'Frontend Developer',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      outcome: 'exceeds_expectations',
      overallScore: 4.8,
      executiveSummary: 'Outstanding implementation of optimistic UI and component isolation. The code reflects professional production practices with clean TypeScript typings and zero hydration mismatches.',
      rubrics: {
        codeQuality: {
          score: 5,
          criteria: 'TypeScript typings, naming clarity, modular component decomposition, and zero dead code.',
          comments: 'Exemplary strict typing across custom hooks and Redux/Context state slices. DRY utility functions.'
        },
        architecture: {
          score: 5,
          criteria: 'State management scalability, folder hierarchy, and separation of UI from data fetching.',
          comments: 'Clean separation between presentational components and custom hook data providers. Great query caching patterns.'
        },
        jobReadiness: {
          score: 4.5,
          criteria: 'Error boundary resiliency, accessibility (ARIA), responsive mobile viewport handling, and CI/CD tests.',
          comments: 'Keyboard navigation is flawless. Suggest adding automated Playwright tests in GitHub Actions to make this resume-ready.'
        },
        communication: {
          score: 5,
          criteria: 'PR descriptions, README documentation, architectural decision records (ADRs).',
          comments: 'README has clear setup instructions, architecture diagrams, and test suite execution commands.'
        }
      },
      keyStrengths: [
        'Polished responsive design with mathematical padding and fluid Tailwind layout',
        'Rock-solid TypeScript interfaces with no implicit `any` escape hatches',
        'Optimistic state updates provide instantaneous feedback with rollback error handling'
      ],
      areasForImprovement: [
        'Add Playwright or Vitest unit tests for the core state reducer logic',
        'Wrap asynchronous API error handlers in an accessible Toast or Alert banner component'
      ],
      recommendedResources: [
        { title: 'Kent C. Dodds: Testing JavaScript Principles', url: 'https://testingjavascript.com', type: 'Course' },
        { title: 'WebAIM: Accessible Form Controls & ARIA Live Regions', url: 'https://webaim.org/techniques/forms/', type: 'Documentation' }
      ],
      actionableNextSteps: 'Deploy this project to Vercel/Cloud Run, link your GitHub commit history on your LinkedIn profile, and schedule a 30-min Mock Technical Screen.',
      isReadByLearner: false
    }
  }
];

export function getStoredRequests(): ReviewRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(SEED_REQUESTS));
      return SEED_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_REQUESTS;
  }
}

export function saveStoredRequests(requests: ReviewRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('crp_feedback_updated'));
  } catch (e) {}
}

/**
 * Fetch all review requests relevant to the current user (as learner or mentor)
 */
export async function fetchReviewRequests(options: {
  userId?: string;
  email?: string;
  role?: string;
  trackSlug?: string;
}): Promise<ReviewRequest[]> {
  const localRequests = getStoredRequests();
  const { userId, email, role, trackSlug } = options;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('review_requests' as any) as any)
        .select('*, feedback:mentor_feedback(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database records to ReviewRequest
        const dbRequests: ReviewRequest[] = data.map((d: any) => ({
          id: d.id,
          learnerId: d.learner_id,
          learnerName: d.learner_name,
          learnerEmail: d.learner_email,
          learnerExperienceYears: d.learner_experience_years,
          mentorId: d.mentor_id,
          mentorName: d.mentor_name,
          mentorEmail: d.mentor_email,
          trackSlug: d.track_slug,
          trackTitle: d.track_title,
          milestoneId: d.milestone_id,
          milestoneTitle: d.milestone_title,
          type: d.type,
          submissionTitle: d.submission_title,
          repoUrl: d.repo_url,
          liveDemoUrl: d.live_demo_url,
          preferredDate: d.preferred_date,
          preferredTimeSlot: d.preferred_time_slot,
          notes: d.notes,
          status: d.status,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          feedback: d.feedback ? {
            id: d.feedback.id,
            requestId: d.feedback.request_id,
            mentorId: d.feedback.mentor_id,
            mentorName: d.feedback.mentor_name,
            mentorSpecialization: d.feedback.mentor_specialization,
            createdAt: d.feedback.created_at,
            outcome: d.feedback.outcome,
            overallScore: d.feedback.overall_score,
            executiveSummary: d.feedback.executive_summary,
            rubrics: d.feedback.rubrics,
            keyStrengths: d.feedback.key_strengths || [],
            areasForImprovement: d.feedback.areas_for_improvement || [],
            recommendedResources: d.feedback.recommended_resources || [],
            actionableNextSteps: d.feedback.actionable_next_steps,
            isReadByLearner: d.feedback.is_read_by_learner ?? true
          } : undefined
        }));

        // Merge local seed or user created if missing from DB
        const dbIds = new Set(dbRequests.map(r => r.id));
        const merged = [...dbRequests, ...localRequests.filter(r => !dbIds.has(r.id))];
        saveStoredRequests(merged);
        return filterRequestsByRole(merged, options);
      }
    } catch (e) {
      console.warn('Supabase review requests sync note:', e);
    }
  }

  return filterRequestsByRole(localRequests, options);
}

function filterRequestsByRole(
  requests: ReviewRequest[],
  options: { userId?: string; email?: string; role?: string; trackSlug?: string }
): ReviewRequest[] {
  const { userId, email, role, trackSlug } = options;

  if (role === 'admin') {
    return requests;
  }

  if (role === 'approved_mentor' || role === 'mentor' || role === 'pending_mentor') {
    // Mentors see requests assigned to them OR open requests matching their track/specialization
    return requests.filter(r => {
      if (r.mentorId && (r.mentorId === userId || (email && r.mentorEmail?.toLowerCase() === email.toLowerCase()))) {
        return true;
      }
      if (!r.mentorId && trackSlug && r.trackSlug === trackSlug) {
        return true;
      }
      return true; // Display track-relevant requests in the mentor queue
    });
  }

  // Learner role: see own requests
  if (userId) {
    return requests.filter(r => 
      r.learnerId === userId || 
      (email && r.learnerEmail?.toLowerCase() === email.toLowerCase()) ||
      r.learnerId === 'default_learner'
    );
  }

  return requests;
}

/**
 * Submit a new Review or Mock Interview Request
 */
export async function createReviewRequest(data: {
  learnerId: string;
  learnerName: string;
  learnerEmail?: string;
  learnerExperienceYears?: number | string;
  mentorId?: string;
  mentorName?: string;
  mentorEmail?: string;
  trackSlug: string;
  trackTitle: string;
  milestoneId?: string;
  milestoneTitle: string;
  type: ReviewType;
  submissionTitle: string;
  repoUrl?: string;
  liveDemoUrl?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  notes?: string;
}): Promise<ReviewRequest> {
  const newRequest: ReviewRequest = {
    id: 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const current = getStoredRequests();
  current.unshift(newRequest);
  saveStoredRequests(current);

  // Trigger in-app notification for the mentor or admins
  await addNotification(
    `New ${data.type === 'mock_interview' ? 'Mock Interview' : 'Code Review'} Request`,
    `${data.learnerName} submitted "${data.submissionTitle}" for ${data.trackTitle}.`,
    'system',
    data.mentorId || null
  );

  // Background sync with Supabase
  if (isSupabaseConfigured()) {
    try {
      (supabase.from('review_requests' as any) as any).insert({
        id: newRequest.id,
        learner_id: newRequest.learnerId,
        learner_name: newRequest.learnerName,
        learner_email: newRequest.learnerEmail,
        learner_experience_years: newRequest.learnerExperienceYears,
        mentor_id: newRequest.mentorId,
        mentor_name: newRequest.mentorName,
        mentor_email: newRequest.mentorEmail,
        track_slug: newRequest.trackSlug,
        track_title: newRequest.trackTitle,
        milestone_id: newRequest.milestoneId,
        milestone_title: newRequest.milestoneTitle,
        type: newRequest.type,
        submission_title: newRequest.submissionTitle,
        repo_url: newRequest.repoUrl,
        live_demo_url: newRequest.liveDemoUrl,
        preferred_date: newRequest.preferredDate,
        preferred_time_slot: newRequest.preferredTimeSlot,
        notes: newRequest.notes,
        status: 'pending'
      }).then(({ error }: any) => {
        if (error) console.warn('Supabase request insert note:', error.message);
      });
    } catch (e) {}
  }

  return newRequest;
}

/**
 * Submit structured mentor feedback on a review request
 */
export async function submitMentorFeedback(
  requestId: string,
  feedbackData: {
    mentorId: string;
    mentorName: string;
    mentorEmail?: string;
    mentorSpecialization: string;
    outcome: FeedbackOutcome;
    executiveSummary: string;
    rubrics: StructuredRubrics;
    keyStrengths: string[];
    areasForImprovement: string[];
    recommendedResources: { title: string; url: string; type?: string }[];
    actionableNextSteps: string;
  }
): Promise<StructuredFeedback> {
  const requests = getStoredRequests();
  const targetReqIndex = requests.findIndex(r => r.id === requestId);

  // Calculate composite rubric average score
  const rubricsArray = [
    feedbackData.rubrics.codeQuality.score,
    feedbackData.rubrics.architecture.score,
    feedbackData.rubrics.jobReadiness.score,
    feedbackData.rubrics.communication?.score
  ].filter((s): s is number => typeof s === 'number' && s > 0);

  const calculatedAverage = rubricsArray.length > 0 
    ? Number((rubricsArray.reduce((a, b) => a + b, 0) / rubricsArray.length).toFixed(1))
    : 4.5;

  const feedback: StructuredFeedback = {
    id: 'fb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
    requestId,
    ...feedbackData,
    overallScore: calculatedAverage,
    createdAt: new Date().toISOString(),
    isReadByLearner: false
  };

  if (targetReqIndex !== -1) {
    const updatedReq: ReviewRequest = {
      ...requests[targetReqIndex],
      status: 'completed',
      updatedAt: new Date().toISOString(),
      mentorId: feedbackData.mentorId,
      mentorName: feedbackData.mentorName,
      mentorEmail: feedbackData.mentorEmail,
      feedback
    };
    requests[targetReqIndex] = updatedReq;
    saveStoredRequests(requests);

    // Send high-priority notification to the learner
    const outcomeLabel = feedback.outcome === 'exceeds_expectations' 
      ? '🌟 Exceeds Expectations' 
      : feedback.outcome === 'approved' 
      ? '✅ Approved' 
      : '⚠️ Needs Revisions';

    await addNotification(
      `Mentor Review Completed: ${outcomeLabel}`,
      `${feedbackData.mentorName} completed your structured review for "${updatedReq.submissionTitle}" (${calculatedAverage}/5.0 Score).`,
      'mentor_announcement',
      updatedReq.learnerId
    );
  }

  // Sync to Supabase
  if (isSupabaseConfigured()) {
    try {
      (supabase.from('mentor_feedback' as any) as any).insert({
        id: feedback.id,
        request_id: feedback.requestId,
        mentor_id: feedback.mentorId,
        mentor_name: feedback.mentorName,
        mentor_specialization: feedback.mentorSpecialization,
        outcome: feedback.outcome,
        overall_score: feedback.overallScore,
        executive_summary: feedback.executiveSummary,
        rubrics: feedback.rubrics,
        key_strengths: feedback.keyStrengths,
        areas_for_improvement: feedback.areasForImprovement,
        recommended_resources: feedback.recommendedResources,
        actionable_next_steps: feedback.actionableNextSteps,
        is_read_by_learner: false
      }).then(() => {
        (supabase.from('review_requests' as any) as any)
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', requestId);
      });
    } catch (e) {}
  }

  return feedback;
}

/**
 * Mark a structured feedback as read by learner
 */
export function markFeedbackAsRead(requestId: string): void {
  const requests = getStoredRequests();
  const updated = requests.map(req => {
    if (req.id === requestId && req.feedback) {
      return {
        ...req,
        feedback: { ...req.feedback, isReadByLearner: true }
      };
    }
    return req;
  });
  saveStoredRequests(updated);
}
