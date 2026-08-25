/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase/client';
import { pushLearnerProgressToSupabase, pullLearnerProgressFromSupabase } from './supabase/dataSync';

export interface LearnerProfile {
  id?: string;
  user_id?: string;
  fullName?: string;
  targetRole: string;
  targetRoleSlug: string;
  educationBackground: string;
  weeklyStudyHours: string;
  createdAt: string;
}

export interface RoadmapNodeProgress {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  notes?: string;
  custom?: boolean;
}

export interface CustomizedRoadmap {
  roleTitle: string;
  slug: string;
  adjustedWeeks: number;
  category: string;
  nodes: RoadmapNodeProgress[];
}

const STORAGE_KEY_PROFILE = 'crp_learner_profile';
const STORAGE_KEY_ROADMAP = 'crp_customized_roadmap';

export const JOB_ROLES_CATALOG = [
  { title: 'Frontend Developer', slug: 'frontend-developer', baseWeeks: 24, category: 'Engineering' },
  { title: 'Backend Developer', slug: 'backend-developer', baseWeeks: 20, category: 'Engineering' },
  { title: 'Full Stack Developer', slug: 'full-stack-developer', baseWeeks: 32, category: 'Engineering' },
  { title: 'Data Scientist', slug: 'data-scientist', baseWeeks: 28, category: 'Data & AI' },
  { title: 'Data Analyst', slug: 'data-analyst', baseWeeks: 16, category: 'Data & AI' },
  { title: 'DevOps Engineer', slug: 'devops-engineer', baseWeeks: 26, category: 'Cloud & Infrastructure' },
  { title: 'Cloud Engineer', slug: 'cloud-engineer', baseWeeks: 24, category: 'Cloud & Infrastructure' },
  { title: 'Mobile Developer (React Native)', slug: 'mobile-developer-react-native', baseWeeks: 22, category: 'Engineering' },
  { title: 'UI/UX Designer', slug: 'ui-ux-designer', baseWeeks: 18, category: 'Design & Product' },
  { title: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', baseWeeks: 24, category: 'Security & QA' },
  { title: 'QA / Test Engineer', slug: 'qa-test-engineer', baseWeeks: 16, category: 'Security & QA' },
  { title: 'Product Manager (Technical)', slug: 'product-manager-technical', baseWeeks: 20, category: 'Design & Product' },
  { title: 'AI / Machine Learning Engineer', slug: 'ai-ml-engineer', baseWeeks: 30, category: 'Data & AI' },
  { title: 'Blockchain / Web3 Developer', slug: 'blockchain-developer', baseWeeks: 22, category: 'Engineering' },
];

export const DEFAULT_NODES_BY_CATEGORY: Record<string, RoadmapNodeProgress[]> = {
  'Engineering': [
    { id: 'n1', title: '1. Computer Science Foundations & Git', description: 'Core data structures, algorithm efficiency, version control workflows, and CLI command proficiency.', completed: true },
    { id: 'n2', title: '2. Programming Language Mastery', description: 'Deep dive into TypeScript/JavaScript, memory management, asynchronous execution, and type safety.', completed: false },
    { id: 'n3', title: '3. Frameworks & Component Architecture', description: 'Modern reactive UI frameworks (React/Next.js), state management, hooks, and component reusability.', completed: false },
    { id: 'n4', title: '4. API Design & Database Integration', description: 'RESTful endpoints, GraphQL, SQL vs NoSQL schemas, authentication (JWT/OAuth), and ORM integration.', completed: false },
    { id: 'n5', title: '5. Testing, CI/CD & Deployment', description: 'Unit testing with Jest/Vitest, end-to-end Cypress automation, Docker containers, and cloud deployment.', completed: false },
    { id: 'n6', title: '6. Capstone Project & Portfolio Review', description: 'Build a full-stack production application, conduct system design reviews, and mock technical interviews with mentors.', completed: false },
  ],
  'Data & AI': [
    { id: 'n1', title: '1. Python, SQL & Data Wrangling', description: 'Advanced SQL queries, pandas/numpy dataframes, exploratory data analysis, and cleaning dirty datasets.', completed: true },
    { id: 'n2', title: '2. Statistical Analysis & Visualization', description: 'Probability distributions, A/B testing rigor, matplotlib/seaborn charts, and interactive dashboards.', completed: false },
    { id: 'n3', title: '3. Machine Learning Foundations', description: 'Supervised vs unsupervised learning, regression, classification trees, scikit-learn pipeline optimization.', completed: false },
    { id: 'n4', title: '4. Deep Learning & LLM Integration', description: 'Neural networks, PyTorch, fine-tuning transformer models, and prompt engineering with Gemini API.', completed: false },
    { id: 'n5', title: '5. MLOps & Model Deployment', description: 'Model serving with FastAPI, containerized inference engines, tracking experiments, and monitoring drift.', completed: false },
  ],
  'Cloud & Infrastructure': [
    { id: 'n1', title: '1. Linux Administration & Networking', description: 'Bash scripting, SSH security, TCP/IP protocols, DNS resolution, and firewall configurations.', completed: true },
    { id: 'n2', title: '2. Containerization & Orchestration', description: 'Docker multi-stage builds, Kubernetes pod management, Helm charts, and service meshes.', completed: false },
    { id: 'n3', title: '3. Infrastructure as Code (IaC)', description: 'Terraform state management, AWS/GCP cloud resource provisioning, and immutable infrastructure.', completed: false },
    { id: 'n4', title: '4. CI/CD Pipeline Automation', description: 'GitHub Actions, automated security scanning, zero-downtime blue/green deployments.', completed: false },
    { id: 'n5', title: '5. Observability & Chaos Engineering', description: 'Prometheus metrics, Grafana dashboards, centralized logging, and incident response runbooks.', completed: false },
  ],
  'Design & Product': [
    { id: 'n1', title: '1. User Research & Persona Mapping', description: 'Conducting user interviews, synthesis workshops, journey mapping, and problem statement definition.', completed: true },
    { id: 'n2', title: '2. Information Architecture & Wireframing', description: 'Card sorting, user flow diagrams, low-fidelity wireframes, and rapid interactive prototyping.', completed: false },
    { id: 'n3', title: '3. High-Fidelity UI & Design Systems', description: 'Figma auto-layout mastery, component tokens, accessibility (WCAG 2.1 AA), and responsive scaling.', completed: false },
    { id: 'n4', title: '4. Usability Testing & Analytics', description: 'Moderated user tests, heatmaps, iterative refinement based on quantitative feedback metrics.', completed: false },
    { id: 'n5', title: '5. Developer Handoff & Portfolio Presentation', description: 'Documenting design specs, pairing with frontend engineers, and publishing comprehensive case studies.', completed: false },
  ],
  'Security & QA': [
    { id: 'n1', title: '1. Networking & Security Fundamentals', description: 'OSI model, encryption protocols (TLS/SSL), identity and access management (IAM), and threat modeling.', completed: true },
    { id: 'n2', title: '2. Vulnerability Assessment & Penetration Testing', description: 'OWASP Top 10 vulnerabilities, automated scanners, ethical hacking techniques, and report drafting.', completed: false },
    { id: 'n3', title: '3. Test Automation & QA Frameworks', description: 'Playwright/Cypress end-to-end testing, API validation with Postman, and performance benchmarking.', completed: false },
    { id: 'n4', title: '4. Security Operations & Incident Response', description: 'SIEM log analysis, intrusion detection systems, malware triage, and post-mortem documentation.', completed: false },
  ],
};

export type UserRole = 'learner' | 'pending_mentor' | 'approved_mentor' | 'mentor' | 'admin' | null;

export interface AuthSession {
  role: UserRole;
  email?: string;
  name?: string;
  userId?: string;
  isLoggedIn: boolean;
}

const STORAGE_KEY_ROLE = 'crp_user_role';
const STORAGE_KEY_EMAIL = 'crp_user_email';
const STORAGE_KEY_NAME = 'crp_user_name';
const STORAGE_KEY_USER_ID = 'crp_user_id';

export function getAuthSession(): AuthSession {
  let role = (localStorage.getItem(STORAGE_KEY_ROLE) as UserRole) || null;
  const email = localStorage.getItem(STORAGE_KEY_EMAIL) || undefined;
  const name = localStorage.getItem(STORAGE_KEY_NAME) || undefined;
  const userId = localStorage.getItem(STORAGE_KEY_USER_ID) || undefined;

  // Sync role with career_ready_registry if updated there
  if (email) {
    try {
      const registryStr = localStorage.getItem('career_ready_registry') || '{}';
      const registry = JSON.parse(registryStr);
      const regUser = registry[email.toLowerCase()];
      if (regUser && regUser.role && regUser.role !== role) {
        role = regUser.role;
        localStorage.setItem(STORAGE_KEY_ROLE, role);
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    role,
    email,
    name,
    userId,
    isLoggedIn: !!role || !!email || !!userId,
  };
}

export function setAuthSession(role: UserRole, email?: string, name?: string, userId?: string): void {
  if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
  if (email) localStorage.setItem(STORAGE_KEY_EMAIL, email);
  if (name) localStorage.setItem(STORAGE_KEY_NAME, name);
  if (userId) localStorage.setItem(STORAGE_KEY_USER_ID, userId);
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY_ROLE);
  localStorage.removeItem(STORAGE_KEY_EMAIL);
  localStorage.removeItem(STORAGE_KEY_NAME);
  localStorage.removeItem(STORAGE_KEY_USER_ID);
}

export function saveLearnerProfile(profile: LearnerProfile): CustomizedRoadmap {
  const session = getAuthSession();
  const enhancedProfile: LearnerProfile = {
    ...profile,
    user_id: profile.user_id || session.userId || 'user_' + Date.now(),
    fullName: profile.fullName || session.name || session.email?.split('@')[0] || 'Learner',
  };
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(enhancedProfile));
  
  // Ensure learner role is recorded in session
  setAuthSession('learner', session.email, enhancedProfile.fullName, enhancedProfile.user_id);
  
  // Calculate adjusted weeks based on study hours
  const jobRole = JOB_ROLES_CATALOG.find(r => r.slug === enhancedProfile.targetRoleSlug) || JOB_ROLES_CATALOG[0];
  let adjustedWeeks = jobRole.baseWeeks;
  if (enhancedProfile.weeklyStudyHours === '20_plus') {
    adjustedWeeks = Math.max(8, Math.round(jobRole.baseWeeks * 0.65)); // 35% faster
  } else if (enhancedProfile.weeklyStudyHours === '10_20') {
    adjustedWeeks = Math.max(10, Math.round(jobRole.baseWeeks * 0.85)); // 15% faster
  } else if (enhancedProfile.weeklyStudyHours === '5_10') {
    adjustedWeeks = Math.round(jobRole.baseWeeks * 1.25); // 25% longer
  }

  // Generate default nodes based on category, prioritizing custom mentor-curated nodes if they exist
  let baseNodes = DEFAULT_NODES_BY_CATEGORY[jobRole.category] || DEFAULT_NODES_BY_CATEGORY['Engineering'];
  try {
    const customNodesKey = `crp_roadmap_nodes_${jobRole.slug}`;
    const customNodesStr = localStorage.getItem(customNodesKey);
    if (customNodesStr) {
      const customNodes = JSON.parse(customNodesStr);
      if (Array.isArray(customNodes) && customNodes.length > 0) {
        baseNodes = customNodes.map((n: any, idx: number) => ({
          id: n.id || `node_${idx}_${Date.now()}`,
          title: n.title,
          description: n.description,
          completed: false,
          notes: n.notes || '',
        }));
      }
    }
  } catch (e) {
    console.warn('Could not load custom mentor nodes for onboarding:', e);
  }

  const roadmap: CustomizedRoadmap = {
    roleTitle: jobRole.title,
    slug: jobRole.slug,
    adjustedWeeks,
    category: jobRole.category,
    nodes: JSON.parse(JSON.stringify(baseNodes)), // Clone
  };

  localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(roadmap));

  // Push profile and customized roadmap with nodes to Supabase for multi-device sync
  if (isSupabaseConfigured() && enhancedProfile.user_id) {
    pushLearnerProgressToSupabase(enhancedProfile.user_id, enhancedProfile, roadmap).catch((err) => {
      console.warn('Background Supabase learner profile sync note:', err);
    });
  }

  return roadmap;
}

export function getLearnerProfile(): LearnerProfile | null {
  const data = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function syncLearnerProfileAfterLogin(userId: string, email?: string, name?: string): Promise<LearnerProfile> {
  // First check if Supabase has data for cross-device hydration
  if (isSupabaseConfigured() && userId) {
    try {
      const dbResult = await pullLearnerProgressFromSupabase(userId);
      if (dbResult && dbResult.profile) {
        const syncedProfile: LearnerProfile = {
          ...dbResult.profile,
          fullName: dbResult.profile.fullName || name || email?.split('@')[0] || 'Learner',
        };
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(syncedProfile));
        if (dbResult.roadmap) {
          localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(dbResult.roadmap));
        } else {
          saveLearnerProfile(syncedProfile);
        }
        return syncedProfile;
      }
    } catch (err) {
      console.warn('Supabase cross-device pull error, checking local store:', err);
    }
  }

  // Fallback to local profile if present
  let profile = getLearnerProfile();

  // If no profile found anywhere, auto-initialize a default profile so the user never gets an error state
  if (!profile) {
    profile = {
      user_id: userId,
      targetRole: 'Full Stack Developer',
      targetRoleSlug: 'full-stack-developer',
      educationBackground: 'undergraduate',
      weeklyStudyHours: '10_20',
      createdAt: new Date().toISOString(),
      fullName: name || email?.split('@')[0] || 'Learner',
    };
    saveLearnerProfile(profile);
  } else if (name && !profile.fullName) {
    profile.fullName = name;
    saveLearnerProfile(profile);
  }

  return profile;
}

export function getCustomizedRoadmap(): CustomizedRoadmap | null {
  const data = localStorage.getItem(STORAGE_KEY_ROADMAP);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function updateCustomizedRoadmap(roadmap: CustomizedRoadmap): void {
  localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(roadmap));
  
  // Also push to Supabase in background for cross-device synchronization
  const session = getAuthSession();
  const profile = getLearnerProfile();
  if (isSupabaseConfigured() && session.userId && profile) {
    pushLearnerProgressToSupabase(session.userId, profile, roadmap).catch((e) => {
      console.warn('Background roadmap progress sync note:', e);
    });
  }
}

export function hasPermission(permissionCode: string): boolean {
  const session = getAuthSession();
  if (!session.isLoggedIn) return false;
  if (session.role === 'admin') return true;
  
  if (session.role === 'approved_mentor' || session.role === 'mentor') {
    if (permissionCode === 'manage:roadmaps') return true;
    const adminPermsStr = localStorage.getItem('crp_admin_permissions') || '{}';
    try {
      const permsMap = JSON.parse(adminPermsStr);
      
      // 1. Try session.userId
      let userPerms = permsMap[session.userId || ''] || [];
      
      // 2. Fallback: Find matching profile ID by email in local profiles list
      if (userPerms.length === 0 && session.email) {
        const localProfilesStr = localStorage.getItem('crp_admin_profiles');
        if (localProfilesStr) {
          try {
            const profiles = JSON.parse(localProfilesStr);
            const foundProfile = profiles.find((p: any) => p.email?.toLowerCase() === session.email?.toLowerCase());
            if (foundProfile && foundProfile.id) {
              userPerms = permsMap[foundProfile.id] || [];
            }
          } catch (e) {}
        }
      }
      
      // 3. Fallback: Try email itself as key
      if (userPerms.length === 0 && session.email) {
        userPerms = permsMap[session.email.toLowerCase()] || [];
      }

      return userPerms.includes(permissionCode);
    } catch {
      return false;
    }
  }
  return false;
}
