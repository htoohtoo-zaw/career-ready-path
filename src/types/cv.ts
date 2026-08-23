/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  highlights: string[];
  techStack: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role: string;
  date?: string;
  highlights: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  associatedMilestoneId?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CVSkills {
  languages: string[];
  frameworks: string[];
  toolsAndDatabases: string[];
  cloudAndDevOps: string[];
  architectureAndPractices: string[];
  softSkills: string[];
}

export interface CVPersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  photoUrl?: string;
}

export interface CVTargetJob {
  targetRole: string;
  companyName?: string;
  jobDescription?: string;
  keyRequirements?: string[];
}

export type CVTemplateId = 'classic-ats' | 'modern-tech' | 'engineering-star' | 'compact-executive';
export type CVFontFamily = 'sans' | 'serif' | 'mono';
export type CVSpacingDensity = 'compact' | 'normal' | 'spacious';
export type CVPhotoShape = 'circle' | 'rounded' | 'square';

export interface CVDesignSettings {
  template: CVTemplateId;
  fontFamily: CVFontFamily;
  fontSize: 'sm' | 'base' | 'lg';
  spacing: CVSpacingDensity;
  accentColor: string;
  showDividers: boolean;
  showSectionIcons: boolean;
  showPhoto?: boolean;
  photoShape?: CVPhotoShape;
}

export interface CVData {
  id: string;
  userId?: string;
  title: string;
  personalInfo: CVPersonalInfo;
  summary: string;
  skills: CVSkills;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  targetJob: CVTargetJob;
  designSettings: CVDesignSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ATSCheckResult {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Work';
  summary: string;
  breakdown: {
    contactCompleteness: { score: number; max: number; status: 'pass' | 'warning' | 'fail'; message: string };
    actionVerbs: { score: number; max: number; status: 'pass' | 'warning' | 'fail'; count: number; verbsFound: string[]; message: string };
    quantifiedMetrics: { score: number; max: number; status: 'pass' | 'warning' | 'fail'; metricsCount: number; message: string };
    skillsAndKeywords: { score: number; max: number; status: 'pass' | 'warning' | 'fail'; matchedCount: number; targetCount: number; matched: string[]; missing: string[]; message: string };
    layoutAndReadability: { score: number; max: number; status: 'pass' | 'warning' | 'fail'; message: string };
  };
  actionableTips: {
    id: string;
    type: 'critical' | 'improvement' | 'strength';
    title: string;
    description: string;
    suggestedFix?: string;
  }[];
}
