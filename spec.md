# Career Ready Path — Role & Permission Specifications

This document outlines the architecture, data structures, and implementation guidelines for the Role-Based Access Control (RBAC) and Granular Permissions system of the Career Ready Path Platform.

---

## 1. Architectural Overview

The Career Ready Path Platform implements a modern, hybrid Role-Based Access Control (RBAC) model allowing both static role assignments and granular user-specific permission overrides.

### Core User Roles
1. **Learner**: Accesses curated roadmaps, adjusts study frequencies, and tracks learning progress.
2. **Pending Mentor**: Mentors who have submitted an application but are awaiting credential verification and KYC approval.
3. **Approved Mentor**: Industry practitioners authorized to review learning nodes, author specialized courses, and receive mentorship requests.
4. **Admin**: Platform caretakers possessing full read/write abilities over profiles, roadmaps, campaigns, and granular permission structures.

---

## 2. Granular Permissions Catalog

The following granular system claims can be dynamically granted or revoked for any registered user profile by administrators:

| Permission Code | Permission Name | System Access Boundary |
| :--- | :--- | :--- |
| `manage:users` | Manage Users & Roles | Edit profiles, elevate user roles, and manage system administrators. |
| `manage:roadmaps` | Curate Roadmaps & Nodes | Create or update pre-defined career pathways, node steps, and resources. |
| `review:mentors` | Review Mentor Applications | Process pending industrial mentors, review resumes, and run KYC. |
| `send:emails` | Campaign Communications | Draft and dispatch mass announcement email campaigns via Resend. |

---

## 3. Database Schema

The system uses three primary tables in Supabase to maintain high-integrity RBAC states:
1. `public.profiles`: Contains user profiles and their high-level `role` enum.
2. `public.permissions`: Stores the static dictionary of system capability codes.
3. `public.user_permissions`: Junction table recording user-specific overrides.

```
+-------------------+             +-----------------------+             +--------------------+
|  public.profiles  |             | public.user_permissions |             | public.permissions |
+-------------------+             +-----------------------+             +--------------------+
| id (PK, UUID)     |<-----------o| user_id (FK, UUID)     |             | code (PK, TEXT)    |
| email (TEXT)      |             | permission_code (FK)   |o----------->| name (TEXT)        |
| role (user_role)  |             | granted_at (TIMESTAMPTZ)|             | description (TEXT) |
+-------------------+             +-----------------------+             +--------------------+
```

---

## 4. SQL Implementation for Supabase

Execute the following script inside your **Supabase SQL Editor** to bootstrap the permission tables, seed records, and establish Row Level Security (RLS) policies.

```sql
-- ==============================================================================
-- SYSTEM MIGRATION: GRANULAR PERMISSIONS & ROLE-BASED ACCESS CONTROL
-- Target Database: Supabase PostgreSQL
-- Version: 1.1.0
-- ==============================================================================

-- 1. Create permissions reference table
CREATE TABLE IF NOT EXISTS public.permissions (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create junction table for user granular permissions override
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_code)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Anyone can view the catalog of possible permissions
CREATE POLICY "Anyone can view permissions" 
  ON public.permissions FOR SELECT 
  USING (true);

-- Only Admins can modify the definitions of system permissions
CREATE POLICY "Admins manage permissions table" 
  ON public.permissions FOR ALL 
  USING (public.is_admin());

-- Users can inspect their own granular permissions list, Admins can inspect all
CREATE POLICY "Users can view own permissions" 
  ON public.user_permissions FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

-- Only Admins can assign or revoke permissions
CREATE POLICY "Admins manage user permissions" 
  ON public.user_permissions FOR ALL 
  USING (public.is_admin());

-- 5. Seed System Permissions Definition
INSERT INTO public.permissions (code, name, description)
VALUES 
  ('manage:users', 'Manage Users & Roles', 'Ability to edit roles, elevate users, and override system settings.'),
  ('manage:roadmaps', 'Curate Roadmaps & Nodes', 'Modify learning paths, update nodes, and attach reference links.'),
  ('review:mentors', 'Review Mentor Applications', 'Approve or reject pending industry mentors and complete KYC.'),
  ('send:emails', 'Campaign Email Communications', 'Construct and dispatch bulk announcements and newsletters.')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 6. Helper Function to Check for Granular Permissions
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
```

---

## 5. UI/UX Interface Guide

An elegant, single-pane system dashboard is built at `/admin-panel` featuring:
* **Real-time Metrics**: Visual cards charting total registrants, active administrators, vetting backlogs, and granted permissions.
* **Granular Role Placement**: Inline native select component to immediately alter user roles (`learner`, `pending_mentor`, `approved_mentor`, `admin`).
* **Active Slider Modals**: Slidover sidebar component letting admins toggle granular permission codes (`manage:users`, `manage:roadmaps`, etc.) on or off with smooth Micro-transitions.
* **SQL Sync Drawer**: Self-contained copying terminal to allow copying the required Supabase schema setup scripts instantly.

---

# Phase 2: Mentor-Mentee Interaction & Structured Feedback System

This section details the architecture, data schemas, rubric structures, and notification specifications for the 1-on-1 Mentorship and Structured Feedback subsystem.

---

## 1. Feature Specifications

### 1.1 Learner Review & Mock Interview Submissions
Learners can request asynchronous project reviews or schedule live mock technical interviews at any milestone along their personalized career roadmap:
- **Code Review**: Learners provide their project title, GitHub repository URL, live deployment URL, target milestone, and specific questions/pain points for mentor evaluation.
- **Mock Technical Interview**: Learners choose their target track milestone, select a preferred date and time slot (Morning, Afternoon, Evening), and specify communication notes.
- **Real-Time Notification Delivery**: Upon feedback submission by a mentor, learners receive real-time banner alert boxes with quick-action links and toast notifications that stay visible until acknowledged.

### 1.2 Mentor Review Workstation & Rubric Scoring
Approved mentors have a dedicated review queue with filters for `All`, `Pending`, and `Completed` submissions:
- **4-Dimensional Standardized Rubrics**:
  1. **Architecture & Clean Code** (1–5 scale): Code organization, modularity, readability, and design pattern adherence.
  2. **Technical Mastery** (1–5 scale): Proper usage of framework primitives, state management, asynchronous handling, and typing.
  3. **Industry Best Practices & Security** (1–5 scale): Input sanitation, error boundaries, performance benchmarks, and Git commit hygiene.
  4. **Communication & Problem Solving** (1–5 scale): Clarify of questions, documentation quality, and self-reflection.
- **Qualitative Constructive Feedback**:
  - Key Strengths Highlight
  - Concrete Areas for Improvement
  - Step-by-Step Action Plan / Next Milestones
- **Outcome Status**:
  - `🌟 Exceeds Expectations` (Composite >= 4.5)
  - `✅ Approved & Proficient` (Composite >= 3.0)
  - `⚠️ Needs Revision` (Composite < 3.0)

---

## 2. Supabase Database Schema for Feedback Subsystem

```
+------------------------------------+             +------------------------------------+
|       public.review_requests       |             |       public.mentor_feedback       |
+------------------------------------+             +------------------------------------+
| id (PK, UUID / TEXT)               |<-----------o| id (PK, UUID / TEXT)               |
| learner_id (FK, UUID)              |             | request_id (FK, UUID)              |
| learner_email (TEXT)               |             | mentor_id (FK, UUID)               |
| learner_name (TEXT)                |             | mentor_email (TEXT)                |
| mentor_id (FK, UUID, NULLABLE)     |             | mentor_name (TEXT)                 |
| track_slug (TEXT)                  |             | code_architecture_score (INT: 1-5) |
| milestone_title (TEXT)             |             | technical_mastery_score (INT: 1-5) |
| type ('code_review' | 'interview') |             | best_practices_score (INT: 1-5)    |
| status ('pending' | 'completed')   |             | problem_solving_score (INT: 1-5)   |
| repo_url (TEXT, NULLABLE)          |             | overall_score (NUMERIC: 1.0-5.0)   |
| live_demo_url (TEXT, NULLABLE)     |             | strengths (TEXT)                   |
| notes (TEXT)                       |             | improvements (TEXT)                |
| created_at (TIMESTAMPTZ)           |             | action_plan (TEXT)                 |
+------------------------------------+             | outcome ('exceeds' | 'approved'..) |
                                                   | created_at (TIMESTAMPTZ)           |
                                                   +------------------------------------+
```

---

## 3. SQL Migrations for Supabase Database

Execute the following script in the **Supabase SQL Editor** to establish the feedback tables, relational constraints, and Row Level Security:

```sql
-- ==============================================================================
-- PHASE 2 MIGRATION: MENTOR-MENTEE INTERACTION & STRUCTURED FEEDBACK
-- Target Database: Supabase PostgreSQL
-- Version: 1.2.0
-- ==============================================================================

-- 1. Create Review Requests Table
CREATE TABLE IF NOT EXISTS public.review_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_email       TEXT NOT NULL,
  learner_name        TEXT NOT NULL,
  mentor_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_email        TEXT,
  mentor_name         TEXT,
  track_slug          TEXT NOT NULL,
  track_title         TEXT NOT NULL,
  milestone_id        TEXT,
  milestone_title     TEXT NOT NULL,
  submission_title    TEXT NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('code_review', 'mock_interview', 'resume_review')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'cancelled')),
  repo_url            TEXT,
  live_demo_url       TEXT,
  notes               TEXT,
  preferred_date      TEXT,
  preferred_time_slot TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Mentor Structured Feedback Table
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id               UUID NOT NULL REFERENCES public.review_requests(id) ON DELETE CASCADE,
  mentor_id                UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_email             TEXT NOT NULL,
  mentor_name              TEXT NOT NULL,
  code_architecture_score  INT NOT NULL CHECK (code_architecture_score BETWEEN 1 AND 5),
  technical_mastery_score  INT NOT NULL CHECK (technical_mastery_score BETWEEN 1 AND 5),
  best_practices_score     INT NOT NULL CHECK (best_practices_score BETWEEN 1 AND 5),
  problem_solving_score    INT NOT NULL CHECK (problem_solving_score BETWEEN 1 AND 5),
  overall_score            NUMERIC(3, 1) NOT NULL CHECK (overall_score BETWEEN 1.0 AND 5.0),
  general_summary          TEXT NOT NULL,
  strengths                TEXT NOT NULL,
  areas_for_improvement    TEXT NOT NULL,
  actionable_plan          TEXT NOT NULL,
  recommended_resources    TEXT,
  outcome                  TEXT NOT NULL CHECK (outcome IN ('exceeds_expectations', 'approved', 'needs_work')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

-- 4. Review Requests RLS Policies
CREATE POLICY "Learners can create their own review requests"
  ON public.review_requests FOR INSERT
  WITH CHECK (auth.uid() = learner_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Learners view own requests and Mentors view assigned track requests"
  ON public.review_requests FOR SELECT
  USING (
    learner_id = auth.uid() 
    OR mentor_id = auth.uid() 
    OR public.has_permission(auth.uid(), 'review:mentors')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'approved_mentor', 'admin'))
  );

CREATE POLICY "Mentors and Admins can update review request statuses"
  ON public.review_requests FOR UPDATE
  USING (
    mentor_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'approved_mentor', 'admin'))
  );

-- 5. Mentor Feedback RLS Policies
CREATE POLICY "Anyone can view feedback for their reviews"
  ON public.mentor_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.review_requests r 
      WHERE r.id = mentor_feedback.request_id AND (r.learner_id = auth.uid() OR r.mentor_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'approved_mentor', 'admin'))
  );

CREATE POLICY "Approved Mentors can insert feedback"
  ON public.mentor_feedback FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'approved_mentor', 'admin'))
    OR auth.uid() IS NOT NULL
  );
```

---

## 4. Toast Notifications & Alert Architecture

1. **Global Toast Provider (`ToastContext.tsx`)**:
   - Manages top-right floating toasts with auto-dismiss (5 seconds), color-coded icon badges (Success: Emerald, Info: Blue, Warning: Amber, Error: Rose), and micro-animations using Lucide icons.
   - Exposed via `useToast()` hook across any view or component.
2. **Feedback Banner Alert Boxes (`FeedbackAlertBox.tsx`)**:
   - Renders at the top of the Learner Dashboard whenever unacknowledged mentor review evaluations exist.
   - Highlights overall composite rubric score, outcome badge, mentor quote preview, and includes instant buttons to inspect full rubric details or dismiss the banner.
3. **Cross-Component Reactivity**:
   - Emits custom browser window events `crp_feedback_updated` upon submission or review creation to ensure instant real-time synchronization between views without manual page reloads.

