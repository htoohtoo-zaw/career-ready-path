/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { POSITION_TO_SLUG_MAP, SLUG_TO_POSITION_MAP } from './mentorRoadmapSync';

export interface ReviewMetrics {
  codeFeedback: number; // 1-5
  clarity: number; // 1-5
  responsiveness: number; // 1-5
  careerAdvice: number; // 1-5
}

export interface LearnerReview {
  id: string;
  mentorId: string;
  learnerId?: string;
  learnerName: string;
  learnerRole: string; // e.g. "Junior Frontend Dev", "Self-Taught Engineer", "Career Switcher"
  learnerAvatar?: string;
  overallRating: number; // 1-5
  metrics: ReviewMetrics;
  reviewTitle: string;
  reviewText: string;
  trackName: string; // e.g. "Frontend Developer", "DevOps Track", "Backend Mastery"
  tags: string[];
  createdAt: string;
  verifiedLearner: boolean;
  helpfulCount: number;
  likedBy: string[]; // user IDs / emails who voted helpful
}

export interface MentorCreatedRoadmap {
  id: string;
  title: string;
  slug: string;
  category?: string;
  difficulty?: string;
  estimated_weeks?: number;
  description?: string;
}

export interface MentorProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  experienceYears: number;
  trackSlug: string; // 'frontend-developer' | 'backend-developer' | 'full-stack-developer' | 'devops-engineer' | 'data-scientist'
  careerRoadmapSlug?: string;
  careerRoadmapTitle?: string;
  createdRoadmaps?: MentorCreatedRoadmap[];
  category: string;
  specialties: string[];
  bio: string;
  verified: boolean;
  hourlyRate: string;
  userId?: string;
  email?: string;
  specialization?: string;
  educationBackground?: string;
  workExperience?: string;
  certification?: string;
  resumePath?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  availability?: string;
  offerings?: string[];
  programTitle?: string;
  programDescription?: string;
  googleFormUrl?: string;
  isProgramPublished?: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  rating: number; // dynamically computed average
  totalReviews: number;
  metricAverages: ReviewMetrics;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface MentorshipApplication {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  roadmapTrack: string;
  skillLevel: string;
  githubOrPortfolio?: string;
  goals: string;
  preferredPace: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'rejected';
  acceptedAt?: string;
  mentorNotes?: string;
  createdAt: string;
}

export interface ReviewFormInput {
  mentorId: string;
  learnerName: string;
  learnerRole: string;
  overallRating: number;
  metrics: ReviewMetrics;
  reviewTitle: string;
  reviewText: string;
  trackName: string;
  tags: string[];
}

const STORAGE_KEY_MENTORS = 'crp_mentors_data_v2';
const STORAGE_KEY_REVIEWS = 'crp_learner_reviews_v2';
const STORAGE_KEY_APPLICATIONS = 'crp_learner_mentorship_applications_v1';

const INITIAL_MENTORS: Omit<MentorProfile, 'rating' | 'totalReviews' | 'metricAverages' | 'ratingBreakdown'>[] = [
  {
    id: 'mentor_alex_martinez',
    name: 'Alex Martinez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    title: 'Staff Frontend Architect',
    company: 'CloudScale Labs (ex-Vercel)',
    experienceYears: 9,
    trackSlug: 'frontend-developer',
    category: 'Frontend & UI Engineering',
    specialties: ['React & Next.js', 'Web Performance & Core Web Vitals', 'TypeScript Architecture', 'Design Systems'],
    bio: 'Specialized in large-scale Next.js architecture, component libraries, and browser runtime performance optimization. Mentored 150+ engineers transition into senior roles.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'B.S. in Software Engineering, University of Washington',
    workExperience: 'Staff Frontend Engineer @ CloudScale Labs (2022-Present)\nSenior Frontend Engineer @ Vercel Ecosystem (2019-2022)\nFrontend Developer @ Atlassian (2016-2019)',
    certification: 'AWS Certified Cloud Practitioner, Meta Frontend Specialist',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    websiteUrl: 'https://alexmartinez.dev',
    availability: 'Accepting 3 new mentees this month',
    offerings: ['Architecture & Clean Code Audits', 'Portfolio & Resume Polish', 'Deep React & Next.js Mentoring', 'Mock Technical Interviews'],
  },
  {
    id: 'mentor_sarah_jenkins',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    title: 'Principal Backend Engineer',
    company: 'Stripe',
    experienceYears: 11,
    trackSlug: 'backend-developer',
    category: 'Backend & Distributed Systems',
    specialties: ['Distributed Systems', 'Go & Node.js', 'PostgreSQL Optimization', 'High-throughput APIs & Kafka'],
    bio: 'Passionate about concurrency, microservices reliability, and resilient transactional databases. I help learners grasp deep systems design and API resilience.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'M.S. in Computer Science, Stanford University',
    workExperience: 'Principal Backend Engineer @ Stripe (2021-Present)\nStaff Distributed Systems Engineer @ Uber (2017-2021)\nBackend Engineer @ Dropbox (2014-2017)',
    certification: 'Google Cloud Professional Cloud Architect, Confluent Kafka Certified Developer',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    twitterUrl: 'https://twitter.com',
    availability: 'Accepting 2 new mentees this month',
    offerings: ['System Design & High-Load Architecture', 'Database Query Tuning & Postgres Deep Dive', 'Distributed Systems Patterns', 'Backend Career Path Coaching'],
  },
  {
    id: 'mentor_marcus_vance',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    title: 'Lead Cloud & DevOps Engineer',
    company: 'Netflix Infrastructure',
    experienceYears: 10,
    trackSlug: 'devops-engineer',
    category: 'DevOps & Cloud Infrastructure',
    specialties: ['Kubernetes & Helm', 'Terraform & AWS/GCP', 'CI/CD Pipelines (GitHub Actions)', 'Observability & Prometheus'],
    bio: 'Cloud infra engineer who loves helping developers automate continuous delivery, master container orchestration, and pass Cloud Architect certifications.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'B.S. in Computer Engineering, Georgia Tech',
    workExperience: 'Lead Cloud Engineer @ Netflix Infrastructure (2020-Present)\nSenior DevOps Engineer @ Datadog (2017-2020)\nSystems Administrator @ Red Hat (2015-2017)',
    certification: 'Certified Kubernetes Administrator (CKA), AWS Solutions Architect Professional, HashiCorp Terraform Associate',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    availability: 'Accepting 4 new mentees this month',
    offerings: ['CI/CD Pipeline Setup & Best Practices', 'Kubernetes Cluster Architecture', 'Infrastructure as Code (Terraform)', 'Cloud Certification Prep'],
  },
  {
    id: 'mentor_elena_rostova',
    name: 'Dr. Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    title: 'Lead AI & Machine Learning Scientist',
    company: 'DeepMind Ecosystem',
    experienceYears: 8,
    trackSlug: 'data-scientist',
    category: 'AI & Data Science',
    specialties: ['Generative AI & LLMs', 'PyTorch & Transformers', 'Vector Databases & RAG', 'MLOps & Evaluation Pipelines'],
    bio: 'PhD in Computer Science with a focus on Applied ML and LLM agents. Dedicated to making AI engineering practical, grounded, and reproducible for developers.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'Ph.D. in Machine Learning & AI, Oxford University',
    workExperience: 'Lead AI Research Engineer @ DeepMind Ecosystem (2021-Present)\nResearch Scientist @ OpenAI Collaboratory (2019-2021)\nML Engineer @ Amazon AWS AI Labs (2017-2019)',
    certification: 'TensorFlow Developer Certified, NVIDIA Deep Learning Institute Specialist',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    twitterUrl: 'https://twitter.com',
    websiteUrl: 'https://elenarostova.ai',
    availability: 'Accepting 2 new mentees this month',
    offerings: ['LLM Application & RAG System Architecture', 'PyTorch Model Fine-tuning & Evaluation', 'MLOps & Data Pipelines', 'AI Research to Industry Transition'],
  },
  {
    id: 'mentor_david_kim',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    title: 'Senior Full-Stack Architect',
    company: 'Airbnb Ecosystem',
    experienceYears: 8,
    trackSlug: 'full-stack-developer',
    category: 'Full-Stack Mastery',
    specialties: ['React / Node.js / Express', 'Database Modeling & Supabase', 'Authentication & RLS Security', 'Clean Architecture'],
    bio: 'Full-stack builder who guides developers from zero to production deployment. I review clean code structure, full-stack testing, and real portfolio capstones.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'B.S. in Computer Science, UC Berkeley',
    workExperience: 'Senior Full-Stack Architect @ Airbnb Ecosystem (2020-Present)\nFull-Stack Engineer @ Coinbase (2018-2020)\nWeb Engineer @ Shopify (2016-2018)',
    certification: 'MongoDB Certified Developer, AWS Developer Associate',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    availability: 'Accepting 3 new mentees this month',
    offerings: ['Full-Stack Capstone Project Review', 'Supabase & SQL Modeling Best Practices', 'End-to-End Testing & Security', 'Job Interview Readiness'],
  },
  {
    id: 'mentor_priya_sharma',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171ef282570?w=200&auto=format&fit=crop&q=80',
    title: 'Cloud Security & DevSecOps Lead',
    company: 'Datadog Partner Network',
    experienceYears: 12,
    trackSlug: 'devops-engineer',
    category: 'Security & Cloud Systems',
    specialties: ['Cloud Security Posture', 'OWASP Top 10 Hardening', 'IAM & Zero Trust Architecture', 'Docker Security Audits'],
    bio: 'Security researcher and cloud architect. Helping software engineers write bulletproof code and build production environments resistant to exploits.',
    verified: true,
    hourlyRate: 'Free Community Mentor',
    educationBackground: 'M.S. in Cybersecurity & Information Assurance, Carnegie Mellon University',
    workExperience: 'Security Lead @ Datadog Partner Network (2019-Present)\nSenior Security Architect @ Cisco (2015-2019)\nPenetration Tester @ Rapid7 (2012-2015)',
    certification: 'CISSP, Certified Ethical Hacker (CEH), AWS Security Specialty',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    availability: 'Accepting 2 new mentees this month',
    offerings: ['Application Security Code Audits', 'OWASP Top 10 Hands-on Defense', 'Zero Trust Cloud Configuration', 'Cybersecurity Career Roadmaps'],
  },
];

const INITIAL_REVIEWS: LearnerReview[] = [
  {
    id: 'rev_alex_1',
    mentorId: 'mentor_alex_martinez',
    learnerName: 'Kyaw Zin Oo',
    learnerRole: 'Junior Frontend Developer',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 5,
      careerAdvice: 5,
    },
    reviewTitle: 'Exceptional architectural review and React performance insights!',
    reviewText: 'Alex reviewed my React dashboard capstone and pinpointed exact re-render bottlenecks that I struggled with for weeks. His explanation of memoization, custom hooks isolation, and Lighthouse score optimization was crystal clear.',
    trackName: 'Frontend Developer',
    tags: ['⚡ Fast Feedback', '🎯 Pinpoint Code Review', '💡 Inspiring Advice', '🛠️ Pragmatic Solutions'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    verifiedLearner: true,
    helpfulCount: 14,
    likedBy: ['user_sample_1', 'user_sample_2'],
  },
  {
    id: 'rev_alex_2',
    mentorId: 'mentor_alex_martinez',
    learnerName: 'Hsu Myat Noe',
    learnerRole: 'Career Switcher (UI Designer -> Dev)',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 4,
      careerAdvice: 5,
    },
    reviewTitle: 'Patient, encouraging, and highly technical feedback',
    reviewText: 'Coming from a UI design background, I was intimidated by TypeScript generics and state management. Alex broke down concepts with simple visual diagrams and gave me constructive tips to polish my GitHub portfolio.',
    trackName: 'Frontend Developer',
    tags: ['💡 Inspiring Advice', '📝 Great Career Tips', '✨ Patient & Clear'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    verifiedLearner: true,
    helpfulCount: 9,
    likedBy: ['user_sample_3'],
  },
  {
    id: 'rev_sarah_1',
    mentorId: 'mentor_sarah_jenkins',
    learnerName: 'Aung Ko Ko',
    learnerRole: 'Aspiring Backend Engineer',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 5,
      careerAdvice: 4,
    },
    reviewTitle: 'Unbelievable depth on PostgreSQL indexes & ACID transactions',
    reviewText: 'Sarah provided an in-depth review on my RESTful API database schema. She spotted missing composite indexes and explained query plans (EXPLAIN ANALYZE) so thoroughly that I aced my junior backend interview the next week!',
    trackName: 'Backend Developer',
    tags: ['🎯 Pinpoint Code Review', '🛠️ Pragmatic Solutions', '🚀 Interview Prep'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    verifiedLearner: true,
    helpfulCount: 21,
    likedBy: ['user_sample_1', 'user_sample_4'],
  },
  {
    id: 'rev_sarah_2',
    mentorId: 'mentor_sarah_jenkins',
    learnerName: 'Thurein Win',
    learnerRole: 'Full Stack Graduate',
    overallRating: 4,
    metrics: {
      codeFeedback: 5,
      clarity: 4,
      responsiveness: 4,
      careerAdvice: 4,
    },
    reviewTitle: 'Very rigorous code review with real production standards',
    reviewText: 'Sarah treats learner code with the same bar as a production Pull Request at Stripe. Pointed out race conditions in my checkout simulation. Tough feedback, but that is exactly how you grow fast.',
    trackName: 'Backend Developer',
    tags: ['🎯 Pinpoint Code Review', '🛠️ Pragmatic Solutions'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    verifiedLearner: true,
    helpfulCount: 8,
    likedBy: [],
  },
  {
    id: 'rev_marcus_1',
    mentorId: 'mentor_marcus_vance',
    learnerName: 'Myo Min Htet',
    learnerRole: 'DevOps Enthusiast',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 5,
      careerAdvice: 5,
    },
    reviewTitle: 'Helped me demystify Kubernetes manifests and CI/CD pipelines',
    reviewText: 'Marcus walked me through multi-stage Docker builds and Helm charts deployment on Minikube. He shared practical real-world production gotchas that are not found in any standard tutorial.',
    trackName: 'DevOps Engineer',
    tags: ['⚡ Fast Feedback', '🛠️ Pragmatic Solutions', '💡 Inspiring Advice'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    verifiedLearner: true,
    helpfulCount: 17,
    likedBy: ['user_sample_2'],
  },
  {
    id: 'rev_elena_1',
    mentorId: 'mentor_elena_rostova',
    learnerName: 'Nilar Aye',
    learnerRole: 'Data Science Learner',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 5,
      careerAdvice: 5,
    },
    reviewTitle: 'The gold standard for RAG architecture and LLM evaluation',
    reviewText: 'Dr. Elena gave me actionable guidance on vector embedding chunking strategies and hybrid BM25 + dense retrieval. Her review turned my toy project into an enterprise-grade AI portfolio piece.',
    trackName: 'Data Science & AI',
    tags: ['🎯 Pinpoint Code Review', '💡 Inspiring Advice', '📝 Great Career Tips'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    verifiedLearner: true,
    helpfulCount: 19,
    likedBy: ['user_sample_1'],
  },
  {
    id: 'rev_david_1',
    mentorId: 'mentor_david_kim',
    learnerName: 'Zarni Paing',
    learnerRole: 'Self-Taught Web Developer',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 5,
      careerAdvice: 5,
    },
    reviewTitle: 'Practical full-stack advice on Supabase RLS and clean code',
    reviewText: 'David spent time reviewing my full-stack authentication flow and database schema security. He is super responsive, patient, and full of high-leverage software engineering advice.',
    trackName: 'Full-Stack Developer',
    tags: ['⚡ Fast Feedback', '🎯 Pinpoint Code Review', '🛠️ Pragmatic Solutions'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    verifiedLearner: true,
    helpfulCount: 11,
    likedBy: [],
  },
  {
    id: 'rev_priya_1',
    mentorId: 'mentor_priya_sharma',
    learnerName: 'Kaung Set',
    learnerRole: 'Systems Admin',
    overallRating: 5,
    metrics: {
      codeFeedback: 5,
      clarity: 5,
      responsiveness: 4,
      careerAdvice: 5,
    },
    reviewTitle: 'Detailed security audit on my cloud infrastructure code',
    reviewText: 'Priya highlighted critical IAM least-privilege principles and helped me patch environment variable exposure risks. Invaluable guidance from a true cloud security expert.',
    trackName: 'DevOps & Security',
    tags: ['🎯 Pinpoint Code Review', '🛠️ Pragmatic Solutions'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    verifiedLearner: true,
    helpfulCount: 13,
    likedBy: ['user_sample_3'],
  },
];

/**
 * Helper to get all stored reviews
 */
export function getAllReviews(): LearnerReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse learner reviews from storage', e);
    return INITIAL_REVIEWS;
  }
}

/**
 * Save reviews to localStorage and dispatch update event
 */
function saveReviews(reviews: LearnerReview[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('crp_reviews_updated'));
  } catch (e) {
    console.error('Failed to save learner reviews', e);
  }
}

/**
 * Fetch all mentor profiles enriched with real-time calculated ratings, review stats,
 * their professional career roadmap track, and their custom-created roadmaps.
 */
export function getMentors(): MentorProfile[] {
  const reviews = getAllReviews();

  // 1. Load locally created roadmaps
  let localCreatedRoadmaps: any[] = [];
  try {
    const str = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    localCreatedRoadmaps = JSON.parse(str);
  } catch (e) {}

  // 2. Base mentors
  const baseProfiles: MentorProfile[] = INITIAL_MENTORS.map((base) => {
    const matchedCreated = localCreatedRoadmaps.filter(
      (r) =>
        r.mentorId === base.id ||
        (base.userId && r.mentorId === base.userId) ||
        (base.name && r.mentorName && r.mentorName.toLowerCase() === base.name.toLowerCase())
    );

    // Check if custom profile or kyc details exist for this base mentor
    let customProfile: any = {};
    try {
      const profStr = localStorage.getItem(`crp_mentor_profile_details_${base.id}`);
      if (profStr) customProfile = JSON.parse(profStr);
    } catch (e) {}

    const careerSlug = base.trackSlug;
    const careerTitle = customProfile.specialization || SLUG_TO_POSITION_MAP[base.trackSlug] || base.category || base.title;

    return {
      ...base,
      name: customProfile.fullName || base.name,
      avatar: customProfile.profilePicUrl || base.avatar,
      bio: customProfile.bio || base.bio,
      educationBackground: customProfile.educationBackground || base.educationBackground,
      workExperience: customProfile.workExperience || base.workExperience,
      certification: customProfile.certification || base.certification,
      linkedinUrl: customProfile.linkedinUrl || base.linkedinUrl,
      githubUrl: customProfile.githubUrl || base.githubUrl,
      twitterUrl: customProfile.twitterUrl || base.twitterUrl,
      websiteUrl: customProfile.websiteUrl || base.websiteUrl,
      programTitle: customProfile.programTitle || base.programTitle,
      programDescription: customProfile.programDescription || base.programDescription,
      googleFormUrl: customProfile.googleFormUrl || base.googleFormUrl,
      isProgramPublished:
        customProfile.isProgramPublished !== undefined
          ? customProfile.isProgramPublished
          : true,
      resumePath: customProfile.resumePath,
      specialties: customProfile.selectedTags || base.specialties,
      careerRoadmapSlug: careerSlug,
      careerRoadmapTitle: careerTitle,
      specialization: careerTitle,
      kycStatus: 'approved' as const,
      createdRoadmaps: matchedCreated.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        difficulty: r.difficulty,
        estimated_weeks: r.estimated_weeks,
        description: r.description,
      })),
      rating: 5.0,
      totalReviews: 0,
      metricAverages: { codeFeedback: 5.0, clarity: 5.0, responsiveness: 5.0, careerAdvice: 5.0 },
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  });

  // 3. Load dynamic mentors from applications & custom profile storage
  const dynamicProfiles: MentorProfile[] = [];
  const processedIds = new Set<string>(baseProfiles.map((m) => m.id));
  const processedEmails = new Set<string>();

  try {
    // Check local mentor applications
    const appsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    const apps = JSON.parse(appsStr);

    for (const app of apps) {
      const email = (app.email || '').toLowerCase().trim();
      const userId = app.userId || (email ? 'mentor_' + email.replace(/[^a-z0-9]/g, '') : 'mentor_' + Date.now());

      if (processedIds.has(userId) || (email && processedEmails.has(email))) {
        continue;
      }

      // Check for custom profile details
      let customProfile: any = {};
      try {
        const profStr = localStorage.getItem(`crp_mentor_profile_details_${userId}`);
        if (profStr) customProfile = JSON.parse(profStr);
      } catch (e) {}

      const spec = customProfile.specialization || app.specialization || 'Full Stack Developer';
      const trackSlug =
        POSITION_TO_SLUG_MAP[spec] ||
        spec.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        'full-stack-developer';

      const matchedCreated = localCreatedRoadmaps.filter(
        (r) =>
          r.mentorId === userId ||
          (email && r.mentorEmail && r.mentorEmail.toLowerCase() === email) ||
          (app.fullName && r.mentorName && r.mentorName.toLowerCase() === app.fullName.toLowerCase())
      );

      const name = customProfile.fullName || app.fullName || (email ? email.split('@')[0] : 'Verified Mentor');
      const avatar =
        customProfile.profilePicUrl ||
        app.profilePicUrl ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`;

      dynamicProfiles.push({
        id: userId,
        userId,
        email,
        name,
        avatar,
        title: `Senior ${spec} Mentor`,
        company: 'Industry Practitioner & Mentor',
        experienceYears: 5,
        trackSlug,
        careerRoadmapSlug: trackSlug,
        careerRoadmapTitle: spec,
        specialization: spec,
        category: spec.includes('Data') ? 'Data & AI' : spec.includes('DevOps') || spec.includes('Cloud') ? 'Cloud & Infrastructure' : 'Engineering',
        specialties: customProfile.selectedTags || app.selectedTags || [spec, 'System Design', 'Code Reviews'],
        bio: customProfile.bio || app.bio || `Specialized in ${spec} mentoring, portfolio review, and career roadmaps.`,
        verified: app.kycStatus === 'approved' || true,
        hourlyRate: 'Community Mentor',
        educationBackground: customProfile.educationBackground || app.educationBackground,
        workExperience: customProfile.workExperience || app.workExperience,
        certification: customProfile.certification || app.certification,
        linkedinUrl: customProfile.linkedinUrl || app.linkedinUrl,
        githubUrl: customProfile.githubUrl || app.githubUrl,
        twitterUrl: customProfile.twitterUrl || app.twitterUrl,
        websiteUrl: customProfile.websiteUrl || app.websiteUrl,
        programTitle: customProfile.programTitle || app.programTitle,
        programDescription: customProfile.programDescription || app.programDescription,
        googleFormUrl: customProfile.googleFormUrl || app.googleFormUrl,
        isProgramPublished:
          customProfile.isProgramPublished !== undefined
            ? customProfile.isProgramPublished
            : app.isProgramPublished !== undefined
            ? app.isProgramPublished
            : true,
        resumePath: customProfile.resumePath || app.resumePath,
        kycStatus: app.kycStatus || 'approved',
        availability: 'Open for 1-on-1 mentorship',
        offerings: ['Milestone Code Reviews', 'Roadmap Consultation', 'Live Technical Preparation'],
        createdRoadmaps: matchedCreated.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          category: r.category,
          difficulty: r.difficulty,
          estimated_weeks: r.estimated_weeks,
          description: r.description,
        })),
        rating: 5.0,
        totalReviews: 0,
        metricAverages: { codeFeedback: 5.0, clarity: 5.0, responsiveness: 5.0, careerAdvice: 5.0 },
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });

      processedIds.add(userId);
      if (email) processedEmails.add(email);
    }
  } catch (e) {
    console.warn('Error reading dynamic mentor profiles:', e);
  }

  // 4. Also check if any roadmaps in localCreatedRoadmaps have a mentor not in processedIds
  for (const rm of localCreatedRoadmaps) {
    if (rm.mentorId && !processedIds.has(rm.mentorId)) {
      const spec = rm.category || 'Software Engineer';
      const trackSlug =
        POSITION_TO_SLUG_MAP[spec] ||
        spec.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        'full-stack-developer';

      const matchedCreated = localCreatedRoadmaps.filter((r) => r.mentorId === rm.mentorId);

      dynamicProfiles.push({
        id: rm.mentorId,
        userId: rm.mentorId,
        email: rm.mentorEmail,
        name: rm.mentorName || 'Track Creator & Mentor',
        avatar:
          rm.mentorPic ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        title: `Curriculum Author & ${spec} Lead`,
        company: 'Career Ready Path Instructor',
        experienceYears: 6,
        trackSlug,
        careerRoadmapSlug: trackSlug,
        careerRoadmapTitle: spec,
        specialization: spec,
        category: rm.category || 'Engineering',
        specialties: [rm.title, spec, 'Curriculum Design'],
        bio: `Author and mentor for "${rm.title}". Guiding learners through milestone roadmaps and hands-on projects.`,
        verified: true,
        hourlyRate: 'Free Community Mentor',
        availability: 'Available for questions & reviews',
        offerings: ['Curriculum Guidance', 'Milestone Review', 'Project Architecture Feedback'],
        createdRoadmaps: matchedCreated.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          category: r.category,
          difficulty: r.difficulty,
          estimated_weeks: r.estimated_weeks,
          description: r.description,
        })),
        rating: 5.0,
        totalReviews: 0,
        metricAverages: { codeFeedback: 5.0, clarity: 5.0, responsiveness: 5.0, careerAdvice: 5.0 },
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });

      processedIds.add(rm.mentorId);
    }
  }

  // 5. Combine and compute review stats for each profile
  const allProfiles = [...baseProfiles, ...dynamicProfiles];

  return allProfiles.map((mentor) => {
    const mentorReviews = reviews.filter(
      (r) => r.mentorId === mentor.id || (mentor.userId && r.mentorId === mentor.userId)
    );
    const totalReviews = mentorReviews.length;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumOverall = 0;
    let sumCodeFeedback = 0;
    let sumClarity = 0;
    let sumResponsiveness = 0;
    let sumCareerAdvice = 0;

    mentorReviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.overallRating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
      sumOverall += r.overallRating;
      sumCodeFeedback += r.metrics.codeFeedback || r.overallRating;
      sumClarity += r.metrics.clarity || r.overallRating;
      sumResponsiveness += r.metrics.responsiveness || r.overallRating;
      sumCareerAdvice += r.metrics.careerAdvice || r.overallRating;
    });

    const rating = totalReviews > 0 ? Number((sumOverall / totalReviews).toFixed(1)) : 5.0;

    const metricAverages: ReviewMetrics = {
      codeFeedback: totalReviews > 0 ? Number((sumCodeFeedback / totalReviews).toFixed(1)) : 5.0,
      clarity: totalReviews > 0 ? Number((sumClarity / totalReviews).toFixed(1)) : 5.0,
      responsiveness: totalReviews > 0 ? Number((sumResponsiveness / totalReviews).toFixed(1)) : 5.0,
      careerAdvice: totalReviews > 0 ? Number((sumCareerAdvice / totalReviews).toFixed(1)) : 5.0,
    };

    return {
      ...mentor,
      rating,
      totalReviews,
      metricAverages,
      ratingBreakdown: breakdown,
    };
  });
}

/**
 * Get a specific mentor by ID
 */
export function getMentorById(mentorId: string): MentorProfile | undefined {
  const mentors = getMentors();
  return mentors.find((m) => m.id === mentorId);
}

/**
 * Get all reviews for a specific mentor
 */
export function getReviewsByMentorId(mentorId: string): LearnerReview[] {
  const all = getAllReviews();
  return all
    .filter((r) => r.mentorId === mentorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Submit a new review from a learner
 */
export function submitLearnerReview(input: ReviewFormInput, learnerId?: string): LearnerReview {
  const all = getAllReviews();

  const newReview: LearnerReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mentorId: input.mentorId,
    learnerId: learnerId || `learner_${Date.now()}`,
    learnerName: input.learnerName.trim() || 'Anonymous Learner',
    learnerRole: input.learnerRole.trim() || 'Learner',
    overallRating: input.overallRating,
    metrics: {
      codeFeedback: input.metrics.codeFeedback,
      clarity: input.metrics.clarity,
      responsiveness: input.metrics.responsiveness,
      careerAdvice: input.metrics.careerAdvice,
    },
    reviewTitle: input.reviewTitle.trim(),
    reviewText: input.reviewText.trim(),
    trackName: input.trackName || 'General Mentorship',
    tags: input.tags.length > 0 ? input.tags : ['🌟 Helpful Review'],
    createdAt: new Date().toISOString(),
    verifiedLearner: true,
    helpfulCount: 0,
    likedBy: [],
  };

  const updated = [newReview, ...all];
  saveReviews(updated);
  return newReview;
}

/**
 * Upvote a review as helpful
 */
export function toggleHelpfulVote(reviewId: string, voterId: string = 'current_user'): { helpfulCount: number; isLiked: boolean } {
  const all = getAllReviews();
  let isLiked = false;
  let newCount = 0;

  const updated = all.map((rev) => {
    if (rev.id === reviewId) {
      const likedBy = rev.likedBy || [];
      const index = likedBy.indexOf(voterId);
      let updatedLikedBy: string[];

      if (index > -1) {
        updatedLikedBy = likedBy.filter((id) => id !== voterId);
        isLiked = false;
      } else {
        updatedLikedBy = [...likedBy, voterId];
        isLiked = true;
      }

      newCount = updatedLikedBy.length;
      return {
        ...rev,
        likedBy: updatedLikedBy,
        helpfulCount: newCount,
      };
    }
    return rev;
  });

  saveReviews(updated);
  return { helpfulCount: newCount, isLiked };
}

/**
 * Get all mentorship applications
 */
export function getAllMentorshipApplications(): MentorshipApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse mentorship applications:', e);
    return [];
  }
}

/**
 * Save all mentorship applications
 */
export function saveMentorshipApplications(applications: MentorshipApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
    window.dispatchEvent(new CustomEvent('crp_mentorship_applications_updated'));
  } catch (e) {
    console.error('Failed to save mentorship applications:', e);
  }
}

/**
 * Submit a new mentorship application from a learner
 */
export function submitMentorshipApplication(input: {
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  learnerId?: string;
  learnerName: string;
  learnerEmail: string;
  roadmapTrack: string;
  skillLevel: string;
  githubOrPortfolio?: string;
  goals: string;
  preferredPace: string;
}): MentorshipApplication {
  const all = getAllMentorshipApplications();
  const newApp: MentorshipApplication = {
    id: `ment_app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mentorId: input.mentorId,
    mentorName: input.mentorName,
    mentorAvatar: input.mentorAvatar,
    learnerId: input.learnerId || `learner_${Date.now()}`,
    learnerName: input.learnerName.trim(),
    learnerEmail: input.learnerEmail.trim(),
    roadmapTrack: input.roadmapTrack,
    skillLevel: input.skillLevel,
    githubOrPortfolio: input.githubOrPortfolio?.trim(),
    goals: input.goals.trim(),
    preferredPace: input.preferredPace,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [newApp, ...all];
  saveMentorshipApplications(updated);
  return newApp;
}

/**
 * Get mentorship applications for a specific learner
 */
export function getLearnerMentorshipApplications(learnerId?: string, learnerEmail?: string): MentorshipApplication[] {
  const all = getAllMentorshipApplications();
  if (!learnerId && !learnerEmail) return all;
  return all.filter((app) => (learnerId && app.learnerId === learnerId) || (learnerEmail && app.learnerEmail === learnerEmail));
}

/**
 * Update status of a mentorship application (e.g. accepted, in_progress, rejected)
 */
export function updateMentorshipApplicationStatus(
  applicationId: string,
  status: 'pending' | 'accepted' | 'in_progress' | 'rejected',
  mentorNotes?: string
): MentorshipApplication | null {
  const all = getAllMentorshipApplications();
  const index = all.findIndex((a) => a.id === applicationId);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    status,
    ...(status === 'accepted' ? { acceptedAt: new Date().toISOString() } : {}),
    ...(mentorNotes !== undefined ? { mentorNotes } : {}),
  };

  saveMentorshipApplications(all);
  return all[index];
}


