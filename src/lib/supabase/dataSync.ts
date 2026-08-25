/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured, toValidUuid, isValidUuid } from './client';
import { CVData } from '../../types/cv';
import { LearnerProfile, CustomizedRoadmap } from '../learnerStore';
import { MentorshipApplication, LearnerReview, MentorProfile } from '../mentorReviewStore';

/**
 * Cross-Device Synchronization Engine
 * Bridges local state with Supabase database tables to enable multi-device continuity.
 */

// ==========================================
// 1. LEARNER PROFILE & ROADMAP PROGRESS SYNC
// ==========================================

export async function pushLearnerProgressToSupabase(
  userId: string,
  profile: LearnerProfile,
  roadmap?: CustomizedRoadmap | null
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const validUserId = toValidUuid(userId);

    // 1. Ensure profile record exists
    if (profile.fullName || profile.user_id) {
      await (supabase.from('profiles' as any) as any).upsert({
        id: validUserId,
        full_name: profile.fullName || 'Learner',
        role: 'learner',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // 2. Upsert learner_profiles with full roadmap payload (nodes, progress, notes)
    const payload: any = {
      user_id: validUserId,
      target_role: profile.targetRole,
      education_background: profile.educationBackground,
      weekly_study_hours: profile.weeklyStudyHours,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    if (roadmap) {
      payload.customized_roadmap = roadmap;
    }

    const { error } = await (supabase.from('learner_profiles' as any) as any)
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn('Learner profile sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Could not push learner profile to Supabase:', err?.message);
    return false;
  }
}

export async function pullLearnerProgressFromSupabase(userId: string): Promise<{
  profile: LearnerProfile | null;
  roadmap: CustomizedRoadmap | null;
} | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const validUserId = toValidUuid(userId);
    const { data, error } = await (supabase.from('learner_profiles' as any) as any)
      .select('*, profile:profiles(*)')
      .or(`user_id.eq.${validUserId}${userId !== validUserId ? `,user_id.eq.${userId}` : ''}`)
      .maybeSingle();

    if (error || !data) return null;

    const profile: LearnerProfile = {
      user_id: data.user_id,
      fullName: data.profile?.full_name || data.full_name || 'Learner',
      targetRole: data.target_role || 'Full Stack Developer',
      targetRoleSlug: data.target_role ? data.target_role.toLowerCase().replace(/\s+/g, '-') : 'full-stack-developer',
      educationBackground: data.education_background || 'undergraduate',
      weeklyStudyHours: data.weekly_study_hours || '10_20',
      createdAt: data.created_at || new Date().toISOString(),
    };

    let roadmap: CustomizedRoadmap | null = null;
    if (data.customized_roadmap) {
      try {
        roadmap = typeof data.customized_roadmap === 'string'
          ? JSON.parse(data.customized_roadmap)
          : data.customized_roadmap;
      } catch (e) {}
    }

    return { profile, roadmap };
  } catch (err: any) {
    console.warn('Could not pull learner progress from Supabase:', err?.message);
    return null;
  }
}

// ==========================================
// 2. CV & ATS DATA SYNC ACROSS DEVICES
// ==========================================

export async function pushActiveCVToSupabase(userId: string, cv: CVData): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const validUserId = toValidUuid(userId);
    // We store the user's active CV in the customized_cv column of learner_profiles or in metadata
    const { error } = await (supabase.from('learner_profiles' as any) as any)
      .upsert({
        user_id: validUserId,
        customized_cv: cv,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      // Fallback: update in profiles table metadata if learner_profiles column doesn't exist
      await (supabase.from('profiles' as any) as any)
        .update({
          raw_user_meta_data: { active_cv: cv }
        })
        .eq('id', validUserId);
    }
    return true;
  } catch (err: any) {
    console.warn('Could not push CV to Supabase:', err?.message);
    return false;
  }
}

export async function pullActiveCVFromSupabase(userId: string): Promise<CVData | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const validUserId = toValidUuid(userId);
    const { data, error } = await (supabase.from('learner_profiles' as any) as any)
      .select('customized_cv')
      .eq('user_id', validUserId)
      .maybeSingle();

    if (!error && data?.customized_cv) {
      const cv = typeof data.customized_cv === 'string'
        ? JSON.parse(data.customized_cv)
        : data.customized_cv;
      return cv;
    }

    // Fallback check in profiles table metadata
    const { data: profData } = await (supabase.from('profiles' as any) as any)
      .select('raw_user_meta_data')
      .eq('id', validUserId)
      .maybeSingle();

    if (profData?.raw_user_meta_data?.active_cv) {
      return profData.raw_user_meta_data.active_cv;
    }
    return null;
  } catch (err: any) {
    console.warn('Could not pull CV from Supabase:', err?.message);
    return null;
  }
}

// ==========================================
// 3. MENTOR PROFILES & KYC SYNC
// ==========================================

export async function pushMentorProfileToSupabase(details: {
  userId?: string;
  email?: string;
  fullName?: string;
  profilePicUrl?: string;
  specialization?: string;
  bio?: string;
  educationBackground?: string;
  certification?: string;
  workExperience?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  selectedTags?: string[];
  programTitle?: string;
  programDescription?: string;
  googleFormUrl?: string;
  isProgramPublished?: boolean;
  resumePath?: string;
  kycStatus?: string;
  experienceYears?: number;
}): Promise<{ success: boolean; userId: string }> {
  if (!isSupabaseConfigured()) {
    const fallbackId = details.userId || toValidUuid(details.email || 'mentor');
    return { success: false, userId: fallbackId };
  }

  try {
    const cleanEmail = (details.email || '').toLowerCase().trim();
    let effectiveUserId: string | null = null;

    // 1. If we have an active Supabase auth user, use that ID
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user?.id && isValidUuid(authUser.user.id)) {
        effectiveUserId = authUser.user.id;
      }
    } catch (e) {}

    // 2. Check if a profile with this email already exists in profiles table
    if (!effectiveUserId && cleanEmail) {
      try {
        const { data: existingProfile } = await (supabase.from('profiles' as any) as any)
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (existingProfile?.id && isValidUuid(existingProfile.id)) {
          effectiveUserId = existingProfile.id;
        }
      } catch (e) {}
    }

    // 3. Check if provided userId is a valid UUID
    if (!effectiveUserId && details.userId && isValidUuid(details.userId)) {
      effectiveUserId = details.userId;
    }

    // 4. Generate deterministic UUID if still not resolved
    if (!effectiveUserId) {
      effectiveUserId = toValidUuid(cleanEmail || details.userId || 'mentor_' + Date.now());
    }

    const assignedRole = details.kycStatus === 'approved' ? 'approved_mentor' : 'pending_mentor';

    // 5. Ensure parent profile exists in profiles table
    const profilePayload: any = {
      id: effectiveUserId,
      full_name: details.fullName || (cleanEmail ? cleanEmail.split('@')[0] : 'Mentor'),
      role: assignedRole,
      updated_at: new Date().toISOString(),
    };
    if (cleanEmail) {
      profilePayload.email = cleanEmail;
    }
    if (details.profilePicUrl) {
      profilePayload.avatar_url = details.profilePicUrl;
    }

    const { error: profErr } = await (supabase.from('profiles' as any) as any)
      .upsert(profilePayload, { onConflict: 'id' });

    if (profErr) {
      console.warn('Supabase profiles upsert notice:', profErr.message);
    }

    // 6. Upsert mentor_profiles
    const mentorPayload: any = {
      user_id: effectiveUserId,
      bio: details.bio || 'Specialized in engineering mentorship, code reviews, and career roadmaps.',
      linkedin_url: details.linkedinUrl || null,
      experience_years: details.experienceYears || 5,
      resume_path: details.resumePath || null,
      specialization: details.specialization || 'Full Stack Developer',
      tags: details.selectedTags && details.selectedTags.length > 0 ? details.selectedTags : ['Full Stack Developer', 'System Design', 'Code Reviews'],
      program_title: details.programTitle || null,
      program_description: details.programDescription || null,
      google_form_url: details.googleFormUrl || null,
      is_program_published: details.isProgramPublished !== undefined ? details.isProgramPublished : true,
      education_background: details.educationBackground || null,
      certification: details.certification || null,
      work_experience: details.workExperience || null,
      github_url: details.githubUrl || null,
      twitter_url: details.twitterUrl || null,
      website_url: details.websiteUrl || null,
      kyc_status: details.kycStatus || 'pending',
      kyc_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: mentorErr } = await (supabase.from('mentor_profiles' as any) as any)
      .upsert(mentorPayload, { onConflict: 'user_id' });

    if (mentorErr) {
      console.warn('Supabase mentor_profiles upsert notice:', mentorErr.message);
      return { success: false, userId: effectiveUserId };
    }

    return { success: true, userId: effectiveUserId };
  } catch (err: any) {
    console.warn('Could not push mentor profile to Supabase:', err?.message);
    return { success: false, userId: toValidUuid(details.userId || details.email) };
  }
}

/**
 * Auto-syncs any pending mentor applications saved in localStorage to Supabase
 * Ensures tables are immediately populated in Supabase across devices.
 */
export async function syncAllLocalMentorApplicationsToSupabase(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  let syncedCount = 0;
  try {
    const appsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    const apps = JSON.parse(appsStr);

    for (const app of apps) {
      if (app && (app.email || app.userId || app.fullName)) {
        const res = await pushMentorProfileToSupabase({
          userId: app.userId,
          email: app.email,
          fullName: app.fullName,
          profilePicUrl: app.profilePicUrl,
          specialization: app.specialization,
          bio: app.bio,
          educationBackground: app.educationBackground,
          certification: app.certification,
          workExperience: app.workExperience,
          linkedinUrl: app.linkedinUrl,
          githubUrl: app.githubUrl,
          twitterUrl: app.twitterUrl,
          websiteUrl: app.websiteUrl,
          selectedTags: app.selectedTags || app.tags,
          programTitle: app.programTitle,
          programDescription: app.programDescription,
          googleFormUrl: app.googleFormUrl,
          isProgramPublished: app.isProgramPublished,
          resumePath: app.resumePath,
          kycStatus: app.kycStatus || 'pending',
          experienceYears: app.experienceYears,
        });

        if (res.success) {
          syncedCount++;
        }
      }
    }
  } catch (e) {
    console.warn('Error during bulk local mentor auto-sync:', e);
  }

  return syncedCount;
}

export async function fetchAllDbMentorsFromSupabase(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await (supabase.from('mentor_profiles' as any) as any)
      .select('*, profiles(id, email, full_name, role, avatar_url)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err: any) {
    console.warn('Could not fetch mentors from Supabase:', err?.message);
    return [];
  }
}

// ==========================================
// 4. MENTORSHIP APPLICATIONS / REQUESTS SYNC
// ==========================================

export async function pushMentorshipApplicationToSupabase(app: MentorshipApplication): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload = {
      id: app.id,
      learner_id: app.learnerId,
      learner_name: app.learnerName,
      learner_email: app.learnerEmail,
      mentor_id: app.mentorId,
      mentor_name: app.mentorName,
      roadmap_track: app.roadmapTrack,
      skill_level: app.skillLevel,
      github_or_portfolio: app.githubOrPortfolio,
      goals: app.goals,
      preferred_pace: app.preferredPace,
      status: app.status,
      mentor_notes: app.mentorNotes,
      accepted_at: app.acceptedAt,
      created_at: app.createdAt || new Date().toISOString(),
    };

    const { error } = await (supabase.from('mentorship_requests' as any) as any)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Mentorship application sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Could not push mentorship application to Supabase:', err?.message);
    return false;
  }
}

export async function fetchMentorshipApplicationsFromSupabase(userId?: string): Promise<MentorshipApplication[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = (supabase.from('mentorship_requests' as any) as any).select('*');
    if (userId) {
      query = query.or(`learner_id.eq.${userId},mentor_id.eq.${userId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      mentorId: d.mentor_id,
      mentorName: d.mentor_name || 'Verified Mentor',
      mentorAvatar: d.mentor_avatar,
      learnerId: d.learner_id,
      learnerName: d.learner_name || 'Learner',
      learnerEmail: d.learner_email || '',
      roadmapTrack: d.roadmap_track || 'Engineering',
      skillLevel: d.skill_level || 'Beginner',
      githubOrPortfolio: d.github_or_portfolio,
      goals: d.goals || '',
      preferredPace: d.preferred_pace || '10-20 hrs/week',
      status: d.status || 'pending',
      acceptedAt: d.accepted_at,
      mentorNotes: d.mentor_notes,
      createdAt: d.created_at || new Date().toISOString(),
    }));
  } catch (err: any) {
    console.warn('Could not fetch mentorship applications from Supabase:', err?.message);
    return [];
  }
}

export async function updateMentorshipApplicationInSupabase(
  applicationId: string,
  status: 'pending' | 'accepted' | 'in_progress' | 'rejected',
  mentorNotes?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !applicationId) return false;

  try {
    const updatePayload: any = {
      status,
      ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
      ...(mentorNotes !== undefined ? { mentor_notes: mentorNotes } : {}),
    };

    const { error } = await (supabase.from('mentorship_requests' as any) as any)
      .update(updatePayload)
      .eq('id', applicationId);

    return !error;
  } catch (err: any) {
    console.warn('Could not update mentorship application in Supabase:', err?.message);
    return false;
  }
}

// ==========================================
// 5. LEARNER REVIEWS & RATINGS SYNC
// ==========================================

export async function pushLearnerReviewToSupabase(review: LearnerReview): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload = {
      id: review.id,
      mentor_id: review.mentorId,
      learner_id: review.learnerId,
      learner_name: review.learnerName,
      learner_role: review.learnerRole,
      overall_rating: review.overallRating,
      metrics: review.metrics,
      review_title: review.reviewTitle,
      review_text: review.reviewText,
      track_name: review.trackName,
      tags: review.tags,
      helpful_count: review.helpfulCount || 0,
      liked_by: review.likedBy || [],
      created_at: review.createdAt || new Date().toISOString(),
    };

    const { error } = await (supabase.from('reviews' as any) as any)
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch (err: any) {
    console.warn('Could not push review to Supabase:', err?.message);
    return false;
  }
}

export async function fetchReviewsFromSupabase(): Promise<LearnerReview[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await (supabase.from('reviews' as any) as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return [];

    return data.map((d: any) => ({
      id: d.id,
      mentorId: d.mentor_id,
      learnerId: d.learner_id,
      learnerName: d.learner_name || 'Learner',
      learnerRole: d.learner_role || 'Aspiring Developer',
      overallRating: d.overall_rating || 5,
      metrics: d.metrics || { codeFeedback: 5, clarity: 5, responsiveness: 5, careerAdvice: 5 },
      reviewTitle: d.review_title || 'Excellent Mentorship',
      reviewText: d.review_text || '',
      trackName: d.track_name || 'General Mentorship',
      tags: d.tags || ['🌟 Helpful Review'],
      createdAt: d.created_at || new Date().toISOString(),
      verifiedLearner: true,
      helpfulCount: d.helpful_count || 0,
      likedBy: d.liked_by || [],
    }));
  } catch (err: any) {
    console.warn('Could not fetch reviews from Supabase:', err?.message);
    return [];
  }
}

// ==========================================
// 6. ROADMAPS & NODES SYNC
// ==========================================

export async function pushCreatedRoadmapToSupabase(roadmap: any, nodes?: any[]): Promise<boolean> {
  if (!isSupabaseConfigured() || !roadmap) return false;

  try {
    const roadmapId = roadmap.id || 'rm_' + Date.now();
    
    // 1. Insert into roadmaps
    await (supabase.from('roadmaps' as any) as any).upsert({
      id: roadmapId,
      title: roadmap.title,
      slug: roadmap.slug,
      description: roadmap.description,
      difficulty: roadmap.difficulty || 'beginner',
      estimated_weeks: roadmap.estimated_weeks || 12,
      is_published: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' });

    // 2. Insert nodes if provided
    if (nodes && Array.isArray(nodes) && nodes.length > 0) {
      const dbNodes = nodes.map((n, idx) => ({
        id: n.id || `node_${roadmapId}_${idx}`,
        roadmap_id: roadmapId,
        title: n.title,
        description: n.description,
        sort_order: idx + 1,
        updated_at: new Date().toISOString(),
      }));

      await (supabase.from('roadmap_nodes' as any) as any)
        .upsert(dbNodes, { onConflict: 'id' });
    }

    return true;
  } catch (err: any) {
    console.warn('Could not push custom roadmap to Supabase:', err?.message);
    return false;
  }
}

export async function fetchCustomRoadmapsFromSupabase(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await (supabase.from('roadmaps' as any) as any)
      .select('*, nodes:roadmap_nodes(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err: any) {
    console.warn('Could not fetch custom roadmaps from Supabase:', err?.message);
    return [];
  }
}
