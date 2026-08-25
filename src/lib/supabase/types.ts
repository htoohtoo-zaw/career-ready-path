/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'learner' | 'pending_mentor' | 'approved_mentor' | 'admin';
export type EducationBackground = 'graduate' | 'undergraduate' | 'self_taught' | 'career_changer' | string;
export type WeeklyStudyHours = '5_10' | '10_20' | '20_plus' | string;
export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | string;
export type ResourceType = 'article' | 'video' | 'documentation' | 'course' | 'project' | string;
export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced' | string;
export type RoadmapChangeType = 
  | 'create_roadmap' 
  | 'update_roadmap' 
  | 'delete_roadmap' 
  | 'add_node' 
  | 'update_node' 
  | 'delete_node' 
  | 'add_resource' 
  | 'update_resource' 
  | 'delete_resource';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          raw_user_meta_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          raw_user_meta_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          raw_user_meta_data?: Json | null;
          updated_at?: string;
        };
      };
      job_roles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      learner_profiles: {
        Row: {
          id: string;
          user_id: string;
          target_role: string | null;
          target_job_role_id: string | null;
          education_background: EducationBackground | null;
          weekly_study_hours: WeeklyStudyHours | null;
          onboarding_completed: boolean;
          customized_roadmap: Json | null;
          customized_cv: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_role?: string | null;
          target_job_role_id?: string | null;
          education_background?: EducationBackground | null;
          weekly_study_hours?: WeeklyStudyHours | null;
          onboarding_completed?: boolean;
          customized_roadmap?: Json | null;
          customized_cv?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          target_role?: string | null;
          target_job_role_id?: string | null;
          education_background?: EducationBackground | null;
          weekly_study_hours?: WeeklyStudyHours | null;
          onboarding_completed?: boolean;
          customized_roadmap?: Json | null;
          customized_cv?: Json | null;
          updated_at?: string;
        };
      };
      mentor_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          twitter_url: string | null;
          website_url: string | null;
          resume_path: string | null;
          booking_url: string | null;
          specialization: string | null;
          specialization_role_id: string | null;
          experience_years: number | null;
          tags: string[] | null;
          program_title: string | null;
          program_description: string | null;
          google_form_url: string | null;
          is_program_published: boolean;
          education_background: string | null;
          certification: string | null;
          work_experience: string | null;
          kyc_status: KycStatus;
          kyc_rejection_reason: string | null;
          kyc_submitted_at: string | null;
          kyc_reviewed_at: string | null;
          kyc_reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          resume_path?: string | null;
          booking_url?: string | null;
          specialization?: string | null;
          specialization_role_id?: string | null;
          experience_years?: number | null;
          tags?: string[] | null;
          program_title?: string | null;
          program_description?: string | null;
          google_form_url?: string | null;
          is_program_published?: boolean;
          education_background?: string | null;
          certification?: string | null;
          work_experience?: string | null;
          kyc_status?: KycStatus;
          kyc_rejection_reason?: string | null;
          kyc_submitted_at?: string | null;
          kyc_reviewed_at?: string | null;
          kyc_reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          resume_path?: string | null;
          booking_url?: string | null;
          specialization?: string | null;
          specialization_role_id?: string | null;
          experience_years?: number | null;
          tags?: string[] | null;
          program_title?: string | null;
          program_description?: string | null;
          google_form_url?: string | null;
          is_program_published?: boolean;
          education_background?: string | null;
          certification?: string | null;
          work_experience?: string | null;
          kyc_status?: KycStatus;
          kyc_rejection_reason?: string | null;
          kyc_submitted_at?: string | null;
          kyc_reviewed_at?: string | null;
          kyc_reviewed_by?: string | null;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
      };
      mentor_profile_tags: {
        Row: {
          mentor_profile_id: string;
          tag_id: string;
        };
        Insert: {
          mentor_profile_id: string;
          tag_id: string;
        };
        Update: {
          mentor_profile_id?: string;
          tag_id?: string;
        };
      };
      roadmaps: {
        Row: {
          id: string;
          job_role_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          difficulty: RoadmapDifficulty;
          estimated_weeks: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          job_role_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          difficulty?: RoadmapDifficulty;
          estimated_weeks?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          job_role_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          difficulty?: RoadmapDifficulty;
          estimated_weeks?: number | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      roadmap_nodes: {
        Row: {
          id: string;
          roadmap_id: string;
          parent_id: string | null;
          title: string;
          description: string | null;
          sort_order: number;
          position_x: number | null;
          position_y: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          roadmap_id: string;
          parent_id?: string | null;
          title: string;
          description?: string | null;
          sort_order?: number;
          position_x?: number | null;
          position_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          roadmap_id?: string;
          parent_id?: string | null;
          title?: string;
          description?: string | null;
          sort_order?: number;
          position_x?: number | null;
          position_y?: number | null;
          updated_at?: string;
        };
      };
      roadmap_node_resources: {
        Row: {
          id: string;
          node_id: string;
          title: string;
          url: string;
          resource_type: ResourceType;
          embed_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          node_id: string;
          title: string;
          url: string;
          resource_type?: ResourceType;
          embed_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          node_id?: string;
          title?: string;
          url?: string;
          resource_type?: ResourceType;
          embed_url?: string | null;
          sort_order?: number;
        };
      };
      courses: {
        Row: {
          id: string;
          mentor_id: string;
          node_id: string | null;
          title: string;
          description: string | null;
          url: string;
          resource_type: ResourceType;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          node_id?: string | null;
          title: string;
          description?: string | null;
          url: string;
          resource_type?: ResourceType;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          mentor_id?: string;
          node_id?: string | null;
          title?: string;
          description?: string | null;
          url?: string;
          resource_type?: ResourceType;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      mentorship_requests: {
        Row: {
          id: string;
          learner_id: string;
          learner_name: string | null;
          learner_email: string | null;
          mentor_id: string;
          mentor_name: string | null;
          mentor_avatar: string | null;
          roadmap_track: string | null;
          skill_level: string | null;
          github_or_portfolio: string | null;
          goals: string | null;
          preferred_pace: string | null;
          status: string;
          mentor_notes: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          learner_id: string;
          learner_name?: string | null;
          learner_email?: string | null;
          mentor_id: string;
          mentor_name?: string | null;
          mentor_avatar?: string | null;
          roadmap_track?: string | null;
          skill_level?: string | null;
          github_or_portfolio?: string | null;
          goals?: string | null;
          preferred_pace?: string | null;
          status?: string;
          mentor_notes?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          learner_id?: string;
          learner_name?: string | null;
          learner_email?: string | null;
          mentor_id?: string;
          mentor_name?: string | null;
          mentor_avatar?: string | null;
          roadmap_track?: string | null;
          skill_level?: string | null;
          github_or_portfolio?: string | null;
          goals?: string | null;
          preferred_pace?: string | null;
          status?: string;
          mentor_notes?: string | null;
          accepted_at?: string | null;
        };
      };
      review_requests: {
        Row: {
          id: string;
          learner_id: string;
          learner_name: string | null;
          learner_email: string | null;
          learner_experience_years: string | null;
          mentor_id: string | null;
          mentor_name: string | null;
          mentor_email: string | null;
          track_slug: string | null;
          track_title: string | null;
          milestone_id: string | null;
          milestone_title: string | null;
          type: string;
          submission_title: string;
          repo_url: string | null;
          live_demo_url: string | null;
          preferred_date: string | null;
          preferred_time_slot: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          learner_id: string;
          learner_name?: string | null;
          learner_email?: string | null;
          learner_experience_years?: string | null;
          mentor_id?: string | null;
          mentor_name?: string | null;
          mentor_email?: string | null;
          track_slug?: string | null;
          track_title?: string | null;
          milestone_id?: string | null;
          milestone_title?: string | null;
          type?: string;
          submission_title: string;
          repo_url?: string | null;
          live_demo_url?: string | null;
          preferred_date?: string | null;
          preferred_time_slot?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          learner_id?: string;
          learner_name?: string | null;
          learner_email?: string | null;
          learner_experience_years?: string | null;
          mentor_id?: string | null;
          mentor_name?: string | null;
          mentor_email?: string | null;
          track_slug?: string | null;
          track_title?: string | null;
          milestone_id?: string | null;
          milestone_title?: string | null;
          type?: string;
          submission_title?: string;
          repo_url?: string | null;
          live_demo_url?: string | null;
          preferred_date?: string | null;
          preferred_time_slot?: string | null;
          notes?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      mentor_feedback: {
        Row: {
          id: string;
          request_id: string;
          mentor_id: string;
          mentor_name: string | null;
          mentor_specialization: string | null;
          outcome: string;
          overall_score: number | null;
          executive_summary: string | null;
          rubrics: Json | null;
          key_strengths: string[] | null;
          areas_for_improvement: string[] | null;
          recommended_resources: Json | null;
          actionable_next_steps: string | null;
          is_read_by_learner: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          request_id: string;
          mentor_id: string;
          mentor_name?: string | null;
          mentor_specialization?: string | null;
          outcome: string;
          overall_score?: number | null;
          executive_summary?: string | null;
          rubrics?: Json | null;
          key_strengths?: string[] | null;
          areas_for_improvement?: string[] | null;
          recommended_resources?: Json | null;
          actionable_next_steps?: string | null;
          is_read_by_learner?: boolean;
          created_at?: string;
        };
        Update: {
          mentor_name?: string | null;
          mentor_specialization?: string | null;
          outcome?: string;
          overall_score?: number | null;
          executive_summary?: string | null;
          rubrics?: Json | null;
          key_strengths?: string[] | null;
          areas_for_improvement?: string[] | null;
          recommended_resources?: Json | null;
          actionable_next_steps?: string | null;
          is_read_by_learner?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          mentor_id: string;
          learner_id: string;
          learner_name: string | null;
          learner_role: string | null;
          overall_rating: number;
          metrics: Json | null;
          review_title: string | null;
          review_text: string | null;
          track_name: string | null;
          tags: string[] | null;
          helpful_count: number;
          liked_by: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          mentor_id: string;
          learner_id: string;
          learner_name?: string | null;
          learner_role?: string | null;
          overall_rating?: number;
          metrics?: Json | null;
          review_title?: string | null;
          review_text?: string | null;
          track_name?: string | null;
          tags?: string[] | null;
          helpful_count?: number;
          liked_by?: string[] | null;
          created_at?: string;
        };
        Update: {
          mentor_id?: string;
          learner_id?: string;
          learner_name?: string | null;
          learner_role?: string | null;
          overall_rating?: number;
          metrics?: Json | null;
          review_title?: string | null;
          review_text?: string | null;
          track_name?: string | null;
          tags?: string[] | null;
          helpful_count?: number;
          liked_by?: string[] | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
        };
      };
      email_campaigns: {
        Row: {
          id: string;
          admin_id: string | null;
          subject: string;
          body_html: string;
          segment: string;
          recipient_count: number;
          sent_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          subject: string;
          body_html: string;
          segment: string;
          recipient_count?: number;
          sent_at?: string;
        };
        Update: {
          admin_id?: string | null;
          subject?: string;
          body_html?: string;
          segment?: string;
          recipient_count?: number;
        };
      };
      roadmap_change_requests: {
        Row: {
          id: string;
          mentor_id: string;
          change_type: RoadmapChangeType;
          roadmap_id: string | null;
          target_node_id: string | null;
          target_resource_id: string | null;
          payload: Json;
          rationale: string | null;
          status: RequestStatus;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          change_type: RoadmapChangeType;
          roadmap_id?: string | null;
          target_node_id?: string | null;
          target_resource_id?: string | null;
          payload: Json;
          rationale?: string | null;
          status?: RequestStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          mentor_id?: string;
          change_type?: RoadmapChangeType;
          roadmap_id?: string | null;
          target_node_id?: string | null;
          target_resource_id?: string | null;
          payload?: Json;
          rationale?: string | null;
          status?: RequestStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      permissions: {
        Row: {
          code: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      user_permissions: {
        Row: {
          user_id: string;
          permission_code: string;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          permission_code: string;
          granted_at?: string;
        };
        Update: {
          user_id?: string;
          permission_code?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_approved_mentor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_my_mentor_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      education_background: EducationBackground;
      weekly_study_hours: WeeklyStudyHours;
      kyc_status: KycStatus;
      resource_type: ResourceType;
      roadmap_difficulty: RoadmapDifficulty;
      roadmap_change_type: RoadmapChangeType;
      request_status: RequestStatus;
    };
  };
}
