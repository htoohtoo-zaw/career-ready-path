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
export type EducationBackground = 'graduate' | 'undergraduate' | 'self_taught' | 'career_changer';
export type WeeklyStudyHours = '5_10' | '10_20' | '20_plus';
export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type ResourceType = 'article' | 'video' | 'documentation' | 'course' | 'project';
export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced';
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
export type RequestStatus = 'pending' | 'approved' | 'rejected';

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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
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
          target_job_role_id: string | null;
          education_background: EducationBackground | null;
          weekly_study_hours: WeeklyStudyHours | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_job_role_id?: string | null;
          education_background?: EducationBackground | null;
          weekly_study_hours?: WeeklyStudyHours | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          target_job_role_id?: string | null;
          education_background?: EducationBackground | null;
          weekly_study_hours?: WeeklyStudyHours | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      mentor_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          linkedin_url: string | null;
          resume_path: string | null;
          booking_url: string | null;
          specialization_role_id: string | null;
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
          resume_path?: string | null;
          booking_url?: string | null;
          specialization_role_id?: string | null;
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
          resume_path?: string | null;
          booking_url?: string | null;
          specialization_role_id?: string | null;
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
          id?: string;
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
          id?: string;
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
          id?: string;
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
          mentor_id: string;
          roadmap_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          mentor_id: string;
          roadmap_id?: string | null;
          created_at?: string;
        };
        Update: {
          learner_id?: string;
          mentor_id?: string;
          roadmap_id?: string | null;
        };
      };
      email_campaigns: {
        Row: {
          id: string;
          admin_id: string;
          subject: string;
          body_html: string;
          segment: string;
          recipient_count: number;
          sent_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          subject: string;
          body_html: string;
          segment: string;
          recipient_count?: number;
          sent_at?: string;
        };
        Update: {
          admin_id?: string;
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
