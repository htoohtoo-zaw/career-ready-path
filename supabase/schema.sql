-- ==============================================================================
-- CAREER READY PATH PLATFORM — COMPLETE SUPABASE DATABASE SCHEMA
-- Version: 1.0.4
-- Target Database: Supabase PostgreSQL
-- Description: Complete SQL migration script including Enums, Core Tables,
-- Roadmap Tables, Courses, Analytics, Change Requests, Indexes, Triggers,
-- Helper Functions, and Row Level Security (RLS) Policies.
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
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
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          public.user_role NOT NULL DEFAULT 'learner',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reference table for IT career job roles (e.g., Frontend Developer, Cloud Engineer)
CREATE TABLE IF NOT EXISTS public.job_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learner specific profile and onboarding state
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_job_role_id      UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  education_background    public.education_background,
  weekly_study_hours      public.weekly_study_hours,
  onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentor specific profile, credentials, and KYC status
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio                     TEXT,
  linkedin_url            TEXT,
  resume_path             TEXT,          -- Path to PDF in Supabase Storage bucket
  booking_url             TEXT,          -- External scheduling URL (Calendly, ADPList, etc.)
  specialization_role_id  UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  kyc_status              public.kyc_status NOT NULL DEFAULT 'not_submitted',
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

-- Predefined IT Career Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_role_id     UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  difficulty      public.roadmap_difficulty NOT NULL DEFAULT 'beginner',
  estimated_weeks INT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tree nodes representing sequential steps/topics in a roadmap
CREATE TABLE IF NOT EXISTS public.roadmap_nodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id      UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,  -- NULL = root node
  title           TEXT NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  position_x      FLOAT DEFAULT 0,   -- Coordinates for React Flow graph layout persistence
  position_y      FLOAT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform-curated learning resources attached to roadmap nodes
CREATE TABLE IF NOT EXISTS public.roadmap_node_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id         UUID NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  resource_type   public.resource_type NOT NULL DEFAULT 'article',
  embed_url       TEXT,              -- YouTube embed URL if resource_type is video
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. MENTOR CONTRIBUTED CONTENT
-- ==============================================================================

-- Courses or external guides contributed by approved mentors
CREATE TABLE IF NOT EXISTS public.courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  node_id         UUID REFERENCES public.roadmap_nodes(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  url             TEXT NOT NULL,
  resource_type   public.resource_type NOT NULL DEFAULT 'course',
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. ANALYTICS, CAMPAIGNS & ADMIN REVIEW QUEUE
-- ==============================================================================

-- Track learner clicks on mentor mentorship request buttons
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  roadmap_id      UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logs of admin bulk email communications via Resend Edge Function
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  segment         TEXT NOT NULL,       -- e.g., 'all_learners', 'approved_mentors', 'pending_mentors'
  recipient_count INT NOT NULL DEFAULT 0,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queue for mentor-submitted roadmap CRUD proposals (reviewed by Admin)
CREATE TABLE IF NOT EXISTS public.roadmap_change_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  change_type     public.roadmap_change_type NOT NULL,
  roadmap_id      UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,       -- Target roadmap (null for create_roadmap)
  target_node_id  UUID REFERENCES public.roadmap_nodes(id) ON DELETE SET NULL,  -- Target node if applicable
  target_resource_id UUID REFERENCES public.roadmap_node_resources(id) ON DELETE SET NULL,
  payload         JSONB NOT NULL,        -- Proposed fields / full snapshot per change_type
  rationale       TEXT,                  -- Mentor's justification for the change
  status          public.request_status NOT NULL DEFAULT 'pending',
  admin_notes     TEXT,
  reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_learner_profiles_user ON public.learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_kyc ON public.mentor_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_roadmaps_slug ON public.roadmaps(slug);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_roadmap ON public.roadmap_nodes(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_courses_mentor ON public.courses(mentor_id);
CREATE INDEX IF NOT EXISTS idx_courses_node ON public.courses(node_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_change_requests_status ON public.roadmap_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_change_requests_mentor ON public.roadmap_change_requests(mentor_id);

-- ==============================================================================
-- 7. DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Automatically create a profile entry in public.profiles when a new auth.user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'learner'::public.user_role)
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Automatically bootstrap learner profile if user role is learner
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

-- Automatically update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS learner_profiles_updated_at ON public.learner_profiles;
CREATE TRIGGER learner_profiles_updated_at
  BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS mentor_profiles_updated_at ON public.mentor_profiles;
CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS roadmaps_updated_at ON public.roadmaps;
CREATE TRIGGER roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS roadmap_nodes_updated_at ON public.roadmap_nodes;
CREATE TRIGGER roadmap_nodes_updated_at
  BEFORE UPDATE ON public.roadmap_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
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

-- Returns mentor_profile.id for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_my_mentor_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

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
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_change_requests ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view approved mentor public profiles" ON public.profiles;
CREATE POLICY "Anyone can view approved mentor public profiles"
  ON public.profiles FOR SELECT
  USING (role = 'approved_mentor' OR auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile data (cannot elevate role)" ON public.profiles;
CREATE POLICY "Users can update own profile data (cannot elevate role)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- JOB ROLES & TAGS (PUBLIC READ)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view job roles" ON public.job_roles;
CREATE POLICY "Anyone can view job roles"
  ON public.job_roles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage job roles" ON public.job_roles;
CREATE POLICY "Admins manage job roles"
  ON public.job_roles FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage tags" ON public.tags;
CREATE POLICY "Admins manage tags"
  ON public.tags FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- LEARNER PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Learners can view own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can view own learner profile"
  ON public.learner_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Learners can insert own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can insert own learner profile"
  ON public.learner_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Learners can update own learner profile" ON public.learner_profiles;
CREATE POLICY "Learners can update own learner profile"
  ON public.learner_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage learner profiles" ON public.learner_profiles;
CREATE POLICY "Admins manage learner profiles"
  ON public.learner_profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTOR PROFILES & TAGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view approved mentor profiles" ON public.mentor_profiles;
CREATE POLICY "Anyone can view approved mentor profiles"
  ON public.mentor_profiles FOR SELECT
  USING (kyc_status = 'approved' OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can submit own mentor profile for KYC" ON public.mentor_profiles;
CREATE POLICY "Users can submit own mentor profile for KYC"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update own profile if approved or pending" ON public.mentor_profiles;
CREATE POLICY "Mentors can update own profile if approved or pending"
  ON public.mentor_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage mentor profiles and KYC decisions" ON public.mentor_profiles;
CREATE POLICY "Admins manage mentor profiles and KYC decisions"
  ON public.mentor_profiles FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view approved mentor tags" ON public.mentor_profile_tags;
CREATE POLICY "Anyone can view approved mentor tags"
  ON public.mentor_profile_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_profile_id AND (mp.kyc_status = 'approved' OR mp.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Mentors can manage own profile tags" ON public.mentor_profile_tags;
CREATE POLICY "Mentors can manage own profile tags"
  ON public.mentor_profile_tags FOR ALL
  USING (
    mentor_profile_id = public.get_my_mentor_profile_id() OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- ROADMAPS, NODES & RESOURCES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published roadmaps" ON public.roadmaps;
CREATE POLICY "Anyone can view published roadmaps"
  ON public.roadmaps FOR SELECT
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage roadmaps" ON public.roadmaps;
CREATE POLICY "Admins manage roadmaps"
  ON public.roadmaps FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view nodes of published roadmaps" ON public.roadmap_nodes;
CREATE POLICY "Anyone can view nodes of published roadmaps"
  ON public.roadmap_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_nodes.roadmap_id AND (r.is_published = true OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins manage roadmap nodes" ON public.roadmap_nodes;
CREATE POLICY "Admins manage roadmap nodes"
  ON public.roadmap_nodes FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view resources of published roadmap nodes" ON public.roadmap_node_resources;
CREATE POLICY "Anyone can view resources of published roadmap nodes"
  ON public.roadmap_node_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmap_nodes rn
      JOIN public.roadmaps r ON r.id = rn.roadmap_id
      WHERE rn.id = roadmap_node_resources.node_id AND (r.is_published = true OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins manage roadmap resources" ON public.roadmap_node_resources;
CREATE POLICY "Admins manage roadmap resources"
  ON public.roadmap_node_resources FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTOR COURSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published mentor courses" ON public.courses;
CREATE POLICY "Anyone can view published mentor courses"
  ON public.courses FOR SELECT
  USING (is_published = true OR mentor_id = public.get_my_mentor_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Approved mentors can insert own courses" ON public.courses;
CREATE POLICY "Approved mentors can insert own courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    public.is_approved_mentor() AND mentor_id = public.get_my_mentor_profile_id()
  );

DROP POLICY IF EXISTS "Approved mentors can update own courses" ON public.courses;
CREATE POLICY "Approved mentors can update own courses"
  ON public.courses FOR UPDATE
  USING (mentor_id = public.get_my_mentor_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Approved mentors can delete own courses" ON public.courses;
CREATE POLICY "Approved mentors can delete own courses"
  ON public.courses FOR DELETE
  USING (mentor_id = public.get_my_mentor_profile_id() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- MENTORSHIP REQUESTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Learners can insert own mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Learners can insert own mentorship requests"
  ON public.mentorship_requests FOR INSERT
  WITH CHECK (learner_id = auth.uid());

DROP POLICY IF EXISTS "Learners and Mentors can view their own requests" ON public.mentorship_requests;
CREATE POLICY "Learners and Mentors can view their own requests"
  ON public.mentorship_requests FOR SELECT
  USING (
    learner_id = auth.uid()
    OR mentor_id = public.get_my_mentor_profile_id()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Admins manage mentorship requests"
  ON public.mentorship_requests FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- EMAIL CAMPAIGNS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins manage email campaigns"
  ON public.email_campaigns FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- ROADMAP CHANGE REQUESTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Approved mentors can create roadmap change requests" ON public.roadmap_change_requests;
CREATE POLICY "Approved mentors can create roadmap change requests"
  ON public.roadmap_change_requests FOR INSERT
  WITH CHECK (
    public.is_approved_mentor() AND mentor_id = public.get_my_mentor_profile_id()
  );

DROP POLICY IF EXISTS "Mentors can view own change requests" ON public.roadmap_change_requests;
CREATE POLICY "Mentors can view own change requests"
  ON public.roadmap_change_requests FOR SELECT
  USING (mentor_id = public.get_my_mentor_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update and review change requests" ON public.roadmap_change_requests;
CREATE POLICY "Admins can update and review change requests"
  ON public.roadmap_change_requests FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage all change requests" ON public.roadmap_change_requests;
CREATE POLICY "Admins manage all change requests"
  ON public.roadmap_change_requests FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 10. SUPABASE STORAGE CONFIGURATION SUMMARY (COMMENTS)
-- ==============================================================================
-- Run these in Supabase SQL Editor if creating buckets via SQL:
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES 
--   ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
--   ('kyc-documents', 'kyc-documents', false, 5242880, ARRAY['application/pdf'])
-- ON CONFLICT (id) DO NOTHING;
--
-- Storage Policies for 'avatars':
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- Storage Policies for 'kyc-documents':
-- CREATE POLICY "Mentors can upload own KYC documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Admins can view all KYC documents" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND (public.is_admin() OR auth.uid()::text = (storage.foldername(name))[1]));

-- ==============================================================================
-- 11. GRANULAR PERMISSIONS & ROLE-BASED ACCESS CONTROL (OVERRIDES)
-- ==============================================================================

-- Create permissions reference table
CREATE TABLE IF NOT EXISTS public.permissions (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create junction table for user granular permissions override
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_code)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Anyone can view the catalog of possible permissions
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
CREATE POLICY "Anyone can view permissions" 
  ON public.permissions FOR SELECT 
  USING (true);

-- Only Admins can modify the definitions of system permissions
DROP POLICY IF EXISTS "Admins manage permissions table" ON public.permissions;
CREATE POLICY "Admins manage permissions table" 
  ON public.permissions FOR ALL 
  USING (public.is_admin());

-- Users can inspect their own granular permissions list, Admins can inspect all
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions" 
  ON public.user_permissions FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

-- Only Admins can assign or revoke permissions
DROP POLICY IF EXISTS "Admins manage user permissions" ON public.user_permissions;
CREATE POLICY "Admins manage user permissions" 
  ON public.user_permissions FOR ALL 
  USING (public.is_admin());

-- Seed System Permissions Definition
INSERT INTO public.permissions (code, name, description)
VALUES 
  ('manage:users', 'Manage Users & Roles', 'Ability to edit roles, elevate users, and override system settings.'),
  ('manage:roadmaps', 'Curate Roadmaps & Nodes', 'Modify learning paths, update nodes, and attach reference links.'),
  ('review:mentors', 'Review Mentor Applications', 'Approve or reject pending industry mentors and complete KYC.'),
  ('send:emails', 'Campaign Email Communications', 'Construct and dispatch bulk announcements and newsletters.')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Helper Function to Check for Granular Permissions
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_perm_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- If user is an Admin, they implicitly possess all permissions
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Otherwise check the granular overrides
  RETURN EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = p_user_id AND permission_code = p_perm_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ------------------------------------------------------------------------------
-- IN-APP NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null user_id represents a system-wide announcement!
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'system',                       -- 'system', 'kyc', 'roadmap_update', 'mentor_announcement'
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view global notifications and users can view own" ON public.notifications;
CREATE POLICY "Anyone can view global notifications and users can view own"
  ON public.notifications FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notification read state" ON public.notifications;
CREATE POLICY "Users can update own notification read state"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can create/manage notifications" ON public.notifications;
CREATE POLICY "Admins can create/manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());


