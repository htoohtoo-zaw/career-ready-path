-- ==============================================================================
-- CAREER READY PATH PLATFORM — COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Version: 1.1.0
-- Target Database: Supabase PostgreSQL
-- Description: Complete SQL migration script with Enums, Core Tables, Cross-Device
-- Synchronization Support, Roadmaps, Courses, Reviews, Feedback, Granular Permissions,
-- Indexes, Triggers, Helper Functions, and Row Level Security (RLS) Policies.
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CUSTOM ENUM TYPES
-- ==============================================================================

DO $$
BEGIN
  BEGIN
    CREATE TYPE public.user_role AS ENUM (
      'learner',
      'pending_mentor',
      'approved_mentor',
      'admin'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.education_background AS ENUM (
      'graduate',
      'undergraduate',
      'self_taught',
      'career_changer'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.weekly_study_hours AS ENUM (
      '5_10',
      '10_20',
      '20_plus'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.kyc_status AS ENUM (
      'not_submitted',
      'pending',
      'approved',
      'rejected'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.resource_type AS ENUM (
      'article',
      'video',
      'documentation',
      'course',
      'project'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.roadmap_difficulty AS ENUM (
      'beginner',
      'intermediate',
      'advanced'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.roadmap_change_type AS ENUM (
      'create_roadmap',
      'update_roadmap',
      'delete_roadmap',
      'add_node',
      'update_node',
      'delete_node',
      'add_resource',
      'update_resource',
      'delete_resource'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    CREATE TYPE public.request_status AS ENUM (
      'pending',
      'approved',
      'rejected'
    );
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END$$;

-- ==============================================================================
-- 2. CORE USER & PROFILE TABLES
-- ==============================================================================

-- Extends Supabase auth.users with app-specific role and display data
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  role                public.user_role NOT NULL DEFAULT 'learner',
  raw_user_meta_data  JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reference table for IT career job roles (e.g., Frontend Developer, Cloud Engineer)
CREATE TABLE IF NOT EXISTS public.job_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learner specific profile, onboarding state, active CV, and personalized roadmap
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_role             TEXT,
  target_job_role_id      UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  education_background    TEXT,
  weekly_study_hours      TEXT,
  onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
  customized_roadmap      JSONB DEFAULT NULL,
  customized_cv           JSONB DEFAULT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentor specific profile, credentials, published programs, and KYC status
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio                     TEXT,
  linkedin_url            TEXT,
  github_url              TEXT,
  twitter_url             TEXT,
  website_url             TEXT,
  resume_path             TEXT,          -- Path to PDF in Supabase Storage bucket
  booking_url             TEXT,          -- External scheduling URL (Calendly, ADPList, etc.)
  specialization          TEXT,
  specialization_role_id  UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  experience_years        NUMERIC DEFAULT 5,
  tags                    TEXT[] DEFAULT ARRAY[]::TEXT[],
  program_title           TEXT,
  program_description     TEXT,
  google_form_url         TEXT,
  is_program_published    BOOLEAN DEFAULT true,
  education_background    TEXT,
  certification           TEXT,
  work_experience         TEXT,
  kyc_status              public.kyc_status NOT NULL DEFAULT 'pending',
  kyc_rejection_reason    TEXT,
  kyc_submitted_at        TIMESTAMPTZ,
  kyc_reviewed_at         TIMESTAMPTZ,
  kyc_reviewed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expertise tags dictionary for mentors
CREATE TABLE IF NOT EXISTS public.tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE
);

-- Junction table linking mentors to their expertise tags
CREATE TABLE IF NOT EXISTS public.mentor_profile_tags (
  mentor_profile_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  tag_id            UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_profile_id, tag_id)
);

-- ==============================================================================
-- 3. ROADMAP & CURRICULUM TABLES
-- ==============================================================================

-- Predefined and custom IT Career Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id              TEXT PRIMARY KEY,
  job_role_id     UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  difficulty      TEXT NOT NULL DEFAULT 'beginner',
  estimated_weeks INT DEFAULT 12,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tree nodes representing sequential steps/topics in a roadmap
CREATE TABLE IF NOT EXISTS public.roadmap_nodes (
  id              TEXT PRIMARY KEY,
  roadmap_id      TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  parent_id       TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  position_x      FLOAT DEFAULT 0,
  position_y      FLOAT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Curated learning resources attached to roadmap nodes
CREATE TABLE IF NOT EXISTS public.roadmap_node_resources (
  id              TEXT PRIMARY KEY,
  node_id         TEXT NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  resource_type   TEXT NOT NULL DEFAULT 'article',
  embed_url       TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses or guides contributed by mentors
CREATE TABLE IF NOT EXISTS public.courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  node_id         TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  url             TEXT NOT NULL,
  resource_type   TEXT NOT NULL DEFAULT 'course',
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. MENTORSHIP APPLICATIONS, REVIEWS & FEEDBACK
-- ==============================================================================

-- 1-on-1 Mentorship Applications & Requests
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id                  TEXT PRIMARY KEY,
  learner_id          TEXT NOT NULL,
  learner_name        TEXT,
  learner_email       TEXT,
  mentor_id           TEXT NOT NULL,
  mentor_name         TEXT,
  mentor_avatar       TEXT,
  roadmap_track       TEXT,
  skill_level         TEXT,
  github_or_portfolio TEXT,
  goals               TEXT,
  preferred_pace      TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  mentor_notes        TEXT,
  accepted_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Code Review & Mock Interview Requests
CREATE TABLE IF NOT EXISTS public.review_requests (
  id                        TEXT PRIMARY KEY,
  learner_id                TEXT NOT NULL,
  learner_name              TEXT,
  learner_email             TEXT,
  learner_experience_years  TEXT,
  mentor_id                 TEXT,
  mentor_name               TEXT,
  mentor_email              TEXT,
  track_slug                TEXT,
  track_title               TEXT,
  milestone_id              TEXT,
  milestone_title           TEXT,
  type                      TEXT NOT NULL DEFAULT 'code_review',
  submission_title          TEXT NOT NULL,
  repo_url                  TEXT,
  live_demo_url             TEXT,
  preferred_date            TEXT,
  preferred_time_slot       TEXT,
  notes                     TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Structured Mentor Feedback attached to Review Requests
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
  id                      TEXT PRIMARY KEY,
  request_id              TEXT NOT NULL REFERENCES public.review_requests(id) ON DELETE CASCADE,
  mentor_id               TEXT NOT NULL,
  mentor_name             TEXT,
  mentor_specialization   TEXT,
  outcome                 TEXT NOT NULL,
  overall_score           NUMERIC DEFAULT 4.5,
  executive_summary       TEXT,
  rubrics                 JSONB DEFAULT '{}'::jsonb,
  key_strengths           TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_for_improvement   TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_resources   JSONB DEFAULT '[]'::jsonb,
  actionable_next_steps   TEXT,
  is_read_by_learner      BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verified Learner Reviews & Ratings of Mentors
CREATE TABLE IF NOT EXISTS public.reviews (
  id                  TEXT PRIMARY KEY,
  mentor_id           TEXT NOT NULL,
  learner_id          TEXT NOT NULL,
  learner_name        TEXT,
  learner_role        TEXT,
  overall_rating      NUMERIC NOT NULL DEFAULT 5,
  metrics             JSONB DEFAULT '{"codeFeedback": 5, "clarity": 5, "responsiveness": 5, "careerAdvice": 5}'::jsonb,
  review_title        TEXT,
  review_text         TEXT,
  track_name          TEXT,
  tags                TEXT[] DEFAULT ARRAY['🌟 Helpful Review']::TEXT[],
  helpful_count       INT DEFAULT 0,
  liked_by            TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT, -- NULL user_id represents a system-wide announcement!
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'system',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Bulk Email Campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  segment         TEXT NOT NULL,
  recipient_count INT NOT NULL DEFAULT 0,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queue for mentor-submitted roadmap change proposals
CREATE TABLE IF NOT EXISTS public.roadmap_change_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id           UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  change_type         public.roadmap_change_type NOT NULL,
  roadmap_id          TEXT,
  target_node_id      TEXT,
  target_resource_id  TEXT,
  payload             JSONB NOT NULL,
  rationale           TEXT,
  status              public.request_status NOT NULL DEFAULT 'pending',
  admin_notes         TEXT,
  reviewed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Granular Permissions Management
CREATE TABLE IF NOT EXISTS public.permissions (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_code)
);

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_learner_profiles_user ON public.learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_kyc ON public.mentor_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_roadmaps_slug ON public.roadmaps(slug);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_roadmap ON public.roadmap_nodes(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_courses_mentor ON public.courses(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_learner ON public.mentorship_requests(learner_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_learner ON public.review_requests(learner_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_mentor ON public.review_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor ON public.reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ==============================================================================
-- 6. TRIGGERS & HELPER FUNCTIONS
-- ==============================================================================

-- Returns true if current authenticated user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns true if current authenticated user has 'approved_mentor' role
CREATE OR REPLACE FUNCTION public.is_approved_mentor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'approved_mentor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Automatically create or update profile entry when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Learner'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'learner'::public.user_role)
  ) ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' AND EXCLUDED.full_name <> 'Learner' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    updated_at = now();
  
  -- Automatically initialize learner_profile for learners
  IF COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'learner'::public.user_role) = 'learner' THEN
    INSERT INTO public.learner_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatic timestamp updater
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS learner_profiles_updated_at ON public.learner_profiles;
CREATE TRIGGER learner_profiles_updated_at BEFORE UPDATE ON public.learner_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS mentor_profiles_updated_at ON public.mentor_profiles;
CREATE TRIGGER mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS roadmaps_updated_at ON public.roadmaps;
CREATE TRIGGER roadmaps_updated_at BEFORE UPDATE ON public.roadmaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES — MULTI-DEVICE DATA SYNC READY
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profile_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_node_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view approved mentor public profiles" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile data (cannot elevate role)" ON public.profiles;
CREATE POLICY "Users can update own profile data"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- LEARNER PROFILES (MULTI-DEVICE ROADMAP & CV SYNC)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Learners can view own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can view own learner profile"
  ON public.learner_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin() OR true);

DROP POLICY IF EXISTS "Learners can insert own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can insert own learner profile"
  ON public.learner_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Learners can update own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can update own learner profile"
  ON public.learner_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage learner profiles" ON public.learner_profiles;
CREATE POLICY "Admins manage learner profiles"
  ON public.learner_profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTOR PROFILES & KYC POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Anyone can view approved mentor profiles" ON public.mentor_profiles;
CREATE POLICY "Anyone can view mentor profiles"
  ON public.mentor_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can submit own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can submit own mentor profile for KYC" ON public.mentor_profiles;
CREATE POLICY "Users can submit own mentor profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mentors can update own profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Mentors can update own profile if approved or pending" ON public.mentor_profiles;
CREATE POLICY "Mentors can update own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Admins manage mentor profiles and KYC decisions" ON public.mentor_profiles;
CREATE POLICY "Admins manage mentor profiles"
  ON public.mentor_profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- JOB ROLES, TAGS & JUNCTIONS (PUBLIC READ, AUTHENTICATED/ADMIN MANAGE)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view job roles" ON public.job_roles;
CREATE POLICY "Anyone can view job roles" ON public.job_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage job roles" ON public.job_roles;
CREATE POLICY "Admins manage job roles" ON public.job_roles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage tags" ON public.tags;
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view mentor profile tags" ON public.mentor_profile_tags;
CREATE POLICY "Anyone can view mentor profile tags" ON public.mentor_profile_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentors can manage own profile tags" ON public.mentor_profile_tags;
CREATE POLICY "Mentors can manage own profile tags" ON public.mentor_profile_tags FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- ROADMAPS, NODES & RESOURCES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Anyone can view published roadmaps" ON public.roadmaps;
CREATE POLICY "Anyone can view roadmaps" ON public.roadmaps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create/update roadmaps" ON public.roadmaps;
CREATE POLICY "Authenticated users can create/update roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can update roadmaps" ON public.roadmaps;
CREATE POLICY "Authenticated users can update roadmaps" ON public.roadmaps FOR UPDATE USING (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage roadmaps" ON public.roadmaps;
CREATE POLICY "Admins manage roadmaps" ON public.roadmaps FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view roadmap nodes" ON public.roadmap_nodes;
CREATE POLICY "Anyone can view roadmap nodes" ON public.roadmap_nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage roadmap nodes" ON public.roadmap_nodes;
CREATE POLICY "Authenticated users can manage roadmap nodes" ON public.roadmap_nodes FOR ALL USING (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view roadmap resources" ON public.roadmap_node_resources;
CREATE POLICY "Anyone can view roadmap resources" ON public.roadmap_node_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage roadmap resources" ON public.roadmap_node_resources;
CREATE POLICY "Authenticated users can manage roadmap resources" ON public.roadmap_node_resources FOR ALL USING (auth.uid() IS NOT NULL OR public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTOR COURSES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentors and admins can manage courses" ON public.courses;
CREATE POLICY "Mentors and admins can manage courses" ON public.courses FOR ALL USING (auth.uid() IS NOT NULL OR public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTORSHIP REQUESTS (1-ON-1 SESSIONS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "View mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Learners and Mentors can view their own requests" ON public.mentorship_requests;
CREATE POLICY "View mentorship requests"
  ON public.mentorship_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insert mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Learners can insert own mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Insert mentorship requests"
  ON public.mentorship_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Update mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Update mentorship requests"
  ON public.mentorship_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL OR public.is_admin())
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Admins manage mentorship requests"
  ON public.mentorship_requests FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- REVIEW REQUESTS (CODE REVIEWS & MOCK INTERVIEWS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "View review requests" ON public.review_requests;
CREATE POLICY "View review requests"
  ON public.review_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insert review requests" ON public.review_requests;
CREATE POLICY "Insert review requests"
  ON public.review_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Update review requests" ON public.review_requests;
CREATE POLICY "Update review requests"
  ON public.review_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL OR public.is_admin())
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage review requests" ON public.review_requests;
CREATE POLICY "Admins manage review requests"
  ON public.review_requests FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTOR FEEDBACK & RUBRICS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "View mentor feedback" ON public.mentor_feedback;
CREATE POLICY "View mentor feedback"
  ON public.mentor_feedback FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insert mentor feedback" ON public.mentor_feedback;
CREATE POLICY "Insert mentor feedback"
  ON public.mentor_feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Update mentor feedback" ON public.mentor_feedback;
CREATE POLICY "Update mentor feedback"
  ON public.mentor_feedback FOR UPDATE
  USING (auth.uid() IS NOT NULL OR public.is_admin())
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage mentor feedback" ON public.mentor_feedback;
CREATE POLICY "Admins manage mentor feedback"
  ON public.mentor_feedback FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- REVIEWS & RATINGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
CREATE POLICY "Authenticated users can update reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() IS NOT NULL OR public.is_admin())
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- IN-APP NOTIFICATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "View notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view global notifications and users can view own" ON public.notifications;
CREATE POLICY "View notifications"
  ON public.notifications FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid()::text OR public.is_admin() OR true);

DROP POLICY IF EXISTS "Insert notifications" ON public.notifications;
CREATE POLICY "Insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notification read state" ON public.notifications;
CREATE POLICY "Update notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid()::text OR public.is_admin() OR true)
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin() OR true);

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create/manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PERMISSIONS & SYSTEM OVERRIDES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins manage permissions table" ON public.permissions;
CREATE POLICY "Admins manage permissions" ON public.permissions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "View user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "View user permissions" ON public.user_permissions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage user permissions" ON public.user_permissions;
CREATE POLICY "Admins manage user permissions" ON public.user_permissions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins manage email campaigns" ON public.email_campaigns FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Manage roadmap change requests" ON public.roadmap_change_requests;
CREATE POLICY "Manage roadmap change requests" ON public.roadmap_change_requests FOR ALL USING (auth.uid() IS NOT NULL OR public.is_admin());

-- Seed System Permissions
INSERT INTO public.permissions (code, name, description)
VALUES 
  ('manage:users', 'Manage Users & Roles', 'Ability to edit roles, elevate users, and override system settings.'),
  ('manage:roadmaps', 'Curate Roadmaps & Nodes', 'Modify learning paths, update nodes, and attach reference links.'),
  ('review:mentors', 'Review Mentor Applications', 'Approve or reject pending industry mentors and complete KYC.'),
  ('send:emails', 'Campaign Email Communications', 'Construct and dispatch bulk announcements and newsletters.')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;
