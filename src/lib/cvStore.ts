/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CVData,
  WorkExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  CVSkills,
  ATSCheckResult,
  CVTemplateId,
} from '../types/cv';
import { getStoredRequests } from './feedbackStore';
import { pushActiveCVToSupabase, pullActiveCVFromSupabase } from './supabase/dataSync';
import { isSupabaseConfigured } from './supabase/client';
import { getAuthSession } from './learnerStore';

// Common power action verbs used by ATS parsers
export const ATS_POWER_ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'implemented', 'optimized',
  'refactored', 'orchestrated', 'automated', 'streamlined', 'deployed',
  'designed', 'developed', 'scaled', 'accelerated', 'reduced', 'increased',
  'boosted', 'integrated', 'established', 'delivered', 'revamped', 'migrated',
  'constructed', 'consolidated', 'standardized', 'formulated', 'directed',
  'mentored', 'facilitated', 'executed', 'benchmarked', 'diagnosed', 'resolved'
];

export const WEAK_PASSIVE_WORDS = [
  'helped', 'worked on', 'assisted', 'responsible for', 'handled',
  'duties included', 'tried to', 'participated in', 'did'
];

export const DEFAULT_FRONTEND_CV: CVData = {
  id: 'cv_default_frontend',
  title: 'Senior Frontend & UI Engineer CV',
  personalInfo: {
    fullName: 'Alex Morgan',
    headline: 'Senior Frontend Engineer | React, TypeScript & Scalable Web Architectures',
    email: 'alex.morgan.dev@email.com',
    phone: '+1 (555) 382-9104',
    location: 'San Francisco, CA (Open to Remote)',
    linkedinUrl: 'https://linkedin.com/in/alexmorgandev',
    githubUrl: 'https://github.com/alexmorgandev',
    portfolioUrl: 'https://alexmorgan.dev',
  },
  summary:
    'Impact-driven Senior Frontend Engineer with 4+ years of experience engineering high-performance Single Page Applications (SPAs) and accessible enterprise design systems. Spearheaded frontend state refactoring that reduced Initial Page Load Latency by 42% for over 250,000 monthly active users. Specialized in React, TypeScript, Next.js, and automated CI/CD testing.',
  skills: {
    languages: ['TypeScript', 'JavaScript (ES2024)', 'HTML5', 'CSS3/SCSS', 'SQL'],
    frameworks: ['React 19', 'Next.js 15', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'React Query'],
    toolsAndDatabases: ['Vite', 'Webpack', 'Git/GitHub Actions', 'PostgreSQL', 'Redis', 'Jest', 'Playwright'],
    cloudAndDevOps: ['Docker', 'AWS S3/CloudFront', 'Vercel', 'Supabase', 'Cloudflare CDN'],
    architectureAndPractices: [
      'Micro-Frontends', 'Design Systems (WCAG AA Accessibility)', 'REST & GraphQL APIs', 'Performance Profiling', 'CI/CD Automation'
    ],
    softSkills: ['Cross-functional Leadership', 'Agile/Scrum', 'Technical Mentorship', 'Code Review Best Practices']
  },
  workExperience: [
    {
      id: 'exp_1',
      company: 'CloudScale Technologies',
      role: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2023',
      endDate: 'Present',
      isCurrent: true,
      highlights: [
        'Architected and deployed a modular component design system in TypeScript and Tailwind, standardizing 45+ UI modules across 3 product squads and accelerating feature ship velocity by 35%.',
        'Spearheaded performance optimization of real-time analytics dashboard, reducing bundle size from 4.2MB to 1.1MB and boosting Google Lighthouse Performance Score from 62 to 98.',
        'Engineered optimistic UI mutation caching with React Query, decreasing perceived API roundtrip latency by 60% for 180,000+ daily interactive user operations.',
        'Mentored 4 junior and mid-level software engineers through structured weekly code reviews and bi-weekly architecture brown-bags.'
      ],
      techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'React Query', 'Jest', 'Vercel']
    },
    {
      id: 'exp_2',
      company: 'Apex Digital Solutions',
      role: 'Frontend Software Developer',
      location: 'San Jose, CA',
      startDate: 'Aug 2020',
      endDate: 'Dec 2022',
      isCurrent: false,
      highlights: [
        'Developed customer-facing subscription billing portal handling $1.8M+ in recurring monthly transactions with zero critical downtime.',
        'Refactored legacy AngularJS codebase into modern React 18 with 100% strict TypeScript typings, slashing runtime error tickets by 48%.',
        'Automated end-to-end regression testing pipelines using Playwright in GitHub Actions, catching 95%+ of regression bugs prior to production staging.'
      ],
      techStack: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Playwright', 'Git']
    }
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science (B.S.)',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2016',
      endDate: '2020',
      gpa: '3.8 / 4.0',
      honors: 'Dean\'s Honor List'
    }
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'Distributed Real-Time Task Management SaaS',
      role: 'Lead Architect & Developer',
      date: '2024',
      highlights: [
        'Engineered full-stack collaborative Kanban SaaS supporting live multi-cursor synchronization with WebSockets and optimistic offline state persistence.',
        'Integrated Supabase PostgreSQL Row Level Security (RLS) and granular Role-Based Access Control (RBAC) supporting 10,000 concurrent simulated sessions.'
      ],
      techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'WebSockets'],
      liveUrl: 'https://tasksaas-demo.vercel.app',
      githubUrl: 'https://github.com/alexmorgandev/task-management-saas'
    },
    {
      id: 'proj_2',
      title: 'Career Ready Path Capstone & Portfolio',
      role: 'Full-Stack Developer',
      date: '2024',
      highlights: [
        'Built production roadmap navigation and mentor rubric feedback review workstation scoring 4.8/5.0 in verified mentor assessments.',
        'Designed accessible WCAG 2.1 AA compliant UI layout supporting dynamic light/dark thematic tokens.'
      ],
      techStack: ['TypeScript', 'Vite', 'Tailwind CSS', 'Supabase'],
      githubUrl: 'https://github.com/alexmorgandev/career-ready-path'
    }
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services (AWS)',
      issueDate: '2023',
      expiryDate: '2026',
      credentialId: 'AWS-ASA-994821',
      credentialUrl: 'https://aws.amazon.com/verification'
    },
    {
      id: 'cert_2',
      name: 'Meta Certified Front-End Developer Professional',
      issuer: 'Meta / Coursera',
      issueDate: '2022',
      credentialId: 'META-FED-38291'
    }
  ],
  targetJob: {
    targetRole: 'Senior Frontend Engineer / Staff UI Architect',
    companyName: 'Tier 1 Tech / High-Growth SaaS',
    jobDescription: 'Looking for a Senior Frontend Engineer proficient in React, TypeScript, Next.js, performance optimization, design systems, and automated testing (Jest, Playwright) with proven experience delivering scalable web applications.',
    keyRequirements: ['React', 'TypeScript', 'Next.js', 'Performance Optimization', 'Tailwind CSS', 'Automated Testing', 'Design Systems', 'CI/CD']
  },
  designSettings: {
    template: 'classic-ats',
    fontFamily: 'sans',
    fontSize: 'base',
    spacing: 'normal',
    accentColor: '#16a34a',
    showDividers: true,
    showSectionIcons: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY_ACTIVE_CV = 'crp_active_ats_cv';
const STORAGE_KEY_CV_LIST = 'crp_saved_cvs_list';

export function getActiveCV(): CVData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_CV);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CV, JSON.stringify(DEFAULT_FRONTEND_CV));
      return DEFAULT_FRONTEND_CV;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_FRONTEND_CV;
  }
}

export async function hydrateActiveCVFromSupabase(userId?: string): Promise<CVData | null> {
  const session = getAuthSession();
  const effectiveUserId = userId || session.userId;
  if (!isSupabaseConfigured() || !effectiveUserId) return null;

  try {
    const remoteCV = await pullActiveCVFromSupabase(effectiveUserId);
    if (remoteCV && remoteCV.personalInfo) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CV, JSON.stringify(remoteCV));
      
      const list = getSavedCVList();
      const existingIndex = list.findIndex(c => c.id === remoteCV.id);
      if (existingIndex >= 0) {
        list[existingIndex] = remoteCV;
      } else {
        list.push(remoteCV);
      }
      localStorage.setItem(STORAGE_KEY_CV_LIST, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('crp_cv_updated', { detail: remoteCV }));
      return remoteCV;
    }
  } catch (e) {
    console.warn('Hydrate CV from Supabase note:', e);
  }
  return null;
}

export function saveActiveCV(cv: CVData): void {
  try {
    cv.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_ACTIVE_CV, JSON.stringify(cv));
    
    // Also update in stored list
    const list = getSavedCVList();
    const existingIndex = list.findIndex(c => c.id === cv.id);
    if (existingIndex >= 0) {
      list[existingIndex] = cv;
    } else {
      list.push(cv);
    }
    localStorage.setItem(STORAGE_KEY_CV_LIST, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent('crp_cv_updated', { detail: cv }));

    // Push to Supabase database for multi-device sync
    const session = getAuthSession();
    if (isSupabaseConfigured() && session.userId) {
      pushActiveCVToSupabase(session.userId, cv).catch((err) => {
        console.warn('Background Supabase CV push note:', err);
      });
    }
  } catch (e) {}
}

export function getSavedCVList(): CVData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CV_LIST);
    if (!raw) {
      return [DEFAULT_FRONTEND_CV];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [DEFAULT_FRONTEND_CV];
  }
}

/**
 * Real-time ATS Evaluation Engine
 */
export function calculateATSScore(cv: CVData): ATSCheckResult {
  let totalScore = 0;
  const tips: ATSCheckResult['actionableTips'] = [];

  // 1. Contact & Identity Completeness (Max 20 pts)
  let contactScore = 0;
  const p = cv.personalInfo;
  if (p.fullName && p.fullName.trim().length > 2) contactScore += 4;
  if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) contactScore += 4;
  if (p.phone && p.phone.trim().length > 6) contactScore += 4;
  if (p.location && p.location.trim().length > 2) contactScore += 4;
  if (p.linkedinUrl || p.githubUrl || p.portfolioUrl) contactScore += 4;

  const contactStatus = contactScore >= 16 ? 'pass' : contactScore >= 12 ? 'warning' : 'fail';
  if (contactScore < 16) {
    tips.push({
      id: 'tip_contact',
      type: 'critical',
      title: 'Complete Contact Header Details',
      description: 'Ensure Phone, Email, Location (City, State/Country), and LinkedIn/GitHub links are fully provided.',
      suggestedFix: 'Add missing contact information so recruiter ATS filters do not drop your application.'
    });
  }

  // 2. Action Verbs Power (Max 20 pts)
  const allHighlights = [
    ...cv.workExperience.flatMap(e => e.highlights || []),
    ...cv.projects.flatMap(p => p.highlights || [])
  ];

  const fullText = (
    cv.summary + ' ' + allHighlights.join(' ')
  ).toLowerCase();

  const foundVerbs: string[] = [];
  ATS_POWER_ACTION_VERBS.forEach(verb => {
    if (fullText.includes(verb)) {
      foundVerbs.push(verb);
    }
  });

  const verbCount = foundVerbs.length;
  let actionVerbScore = Math.min(20, Math.round(verbCount * 2.5));
  const actionStatus = actionVerbScore >= 15 ? 'pass' : actionVerbScore >= 10 ? 'warning' : 'fail';

  if (actionVerbScore < 15) {
    tips.push({
      id: 'tip_action_verbs',
      type: 'improvement',
      title: 'Strengthen Action Verbs in Bullet Points',
      description: `You have ${verbCount} power action verbs. Aim for 8+ strong verbs like "Architected", "Engineered", "Optimized", "Refactored", "Spearheaded".`,
      suggestedFix: 'Begin each experience bullet with an impactful past-tense action verb.'
    });
  }

  // 3. Quantifiable Impact & Metrics (Max 20 pts)
  // Look for numbers, %, $, ms, x, X, k, K, M
  const metricRegex = /(\b\d+([.,]\d+)?\s?(%|\$|k|m|ms|sec|x|users|team|squads|features|hours|days|years)\b)|(\$\d+)|(\d+%\b)|(\b\d+\+\b)/gi;
  
  let metricsCount = 0;
  allHighlights.forEach(hl => {
    const matches = hl.match(metricRegex);
    if (matches && matches.length > 0) {
      metricsCount += matches.length;
    }
  });

  let metricScore = Math.min(20, Math.round(metricsCount * 3.5));
  const metricStatus = metricScore >= 14 ? 'pass' : metricScore >= 8 ? 'warning' : 'fail';

  if (metricScore < 14) {
    tips.push({
      id: 'tip_metrics',
      type: 'improvement',
      title: 'Add Quantifiable Results & Metrics',
      description: `Found ${metricsCount} quantified metrics. Top ATS algorithms heavily favor candidate bullets with clear metrics (e.g., "reduced latency by 40%", "served 100k+ users", "$1.5M revenue").`,
      suggestedFix: 'Include measurable percentages, numbers of users, revenue, or speed improvements in your bullets.'
    });
  }

  // 4. Skills & Keyword Matching against Target Job (Max 25 pts)
  const allSkills = [
    ...(cv.skills.languages || []),
    ...(cv.skills.frameworks || []),
    ...(cv.skills.toolsAndDatabases || []),
    ...(cv.skills.cloudAndDevOps || []),
    ...(cv.skills.architectureAndPractices || [])
  ].map(s => s.toLowerCase());

  const targetJobText = (cv.targetJob.jobDescription || '' + ' ' + (cv.targetJob.keyRequirements || []).join(' ')).toLowerCase();
  
  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];

  if (cv.targetJob.keyRequirements && cv.targetJob.keyRequirements.length > 0) {
    cv.targetJob.keyRequirements.forEach(req => {
      const lower = req.toLowerCase().trim();
      if (allSkills.some(s => s.includes(lower) || lower.includes(s)) || fullText.includes(lower)) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });
  } else {
    // Default standard technical keywords check
    const defaultKeywords = ['react', 'typescript', 'javascript', 'api', 'testing', 'git', 'ci/cd', 'performance', 'database'];
    defaultKeywords.forEach(kw => {
      if (allSkills.some(s => s.includes(kw)) || fullText.includes(kw)) {
        matchedSkills.push(kw);
      } else {
        missingSkills.push(kw);
      }
    });
  }

  const totalTargetCount = matchedSkills.length + missingSkills.length;
  const matchRatio = totalTargetCount > 0 ? (matchedSkills.length / totalTargetCount) : 0.8;
  const skillsScore = Math.min(25, Math.round(matchRatio * 25));
  const skillsStatus = skillsScore >= 20 ? 'pass' : skillsScore >= 14 ? 'warning' : 'fail';

  if (missingSkills.length > 0) {
    tips.push({
      id: 'tip_skills',
      type: missingSkills.length > 3 ? 'critical' : 'improvement',
      title: 'Target Job Keyword Alignment',
      description: `Missing key skills from target role: ${missingSkills.slice(0, 4).join(', ')}.`,
      suggestedFix: `Incorporate relevant keywords (${missingSkills.slice(0, 3).join(', ')}) in your Technical Skills or Experience bullet points if you have experience with them.`
    });
  }

  // 5. Structure, Length & Readability (Max 15 pts)
  let structureScore = 0;
  if (cv.summary && cv.summary.length >= 80 && cv.summary.length <= 600) structureScore += 3;
  if (cv.workExperience && cv.workExperience.length >= 1) structureScore += 4;
  if (cv.education && cv.education.length >= 1) structureScore += 3;
  if (cv.projects && cv.projects.length >= 1) structureScore += 3;
  if (allSkills.length >= 6) structureScore += 2;

  const layoutStatus = structureScore >= 12 ? 'pass' : structureScore >= 8 ? 'warning' : 'fail';

  totalScore = contactScore + actionVerbScore + metricScore + skillsScore + structureScore;
  totalScore = Math.min(100, Math.max(10, totalScore));

  let grade: ATSCheckResult['grade'] = 'Needs Work';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';

  let summary = 'Excellent! Your CV is highly ATS-compliant with strong action verbs, quantifiable metrics, and complete structure.';
  if (totalScore < 70) {
    summary = 'Your CV needs key improvements in metrics and keyword density to reliably pass strict enterprise ATS filters (Workday, Taleo, Greenhouse).';
  } else if (totalScore < 85) {
    summary = 'Good foundation. Polish a few bullet points with measurable impact metrics and align your keywords to increase interview callback rates.';
  }

  return {
    score: totalScore,
    grade,
    summary,
    breakdown: {
      contactCompleteness: {
        score: contactScore,
        max: 20,
        status: contactStatus,
        message: contactScore >= 16 ? 'All essential contact identifiers are present.' : 'Incomplete contact details.'
      },
      actionVerbs: {
        score: actionVerbScore,
        max: 20,
        status: actionStatus,
        count: verbCount,
        verbsFound: foundVerbs,
        message: `${verbCount} ATS power action verbs identified.`
      },
      quantifiedMetrics: {
        score: metricScore,
        max: 20,
        status: metricStatus,
        metricsCount,
        message: `${metricsCount} quantified impact metrics detected across experience & projects.`
      },
      skillsAndKeywords: {
        score: skillsScore,
        max: 25,
        status: skillsStatus,
        matchedCount: matchedSkills.length,
        targetCount: totalTargetCount,
        matched: matchedSkills,
        missing: missingSkills,
        message: `${matchedSkills.length}/${totalTargetCount} target skill competencies matched.`
      },
      layoutAndReadability: {
        score: structureScore,
        max: 15,
        status: layoutStatus,
        message: 'Standard clean single-page ATS structure with semantic sections.'
      }
    },
    actionableTips: tips
  };
}

/**
 * Intelligent Raw Text & Markdown CV Parser
 */
export function parseRawTextToCV(rawText: string): Partial<CVData> {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const result: Partial<CVData> = {
    personalInfo: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    },
    summary: '',
    skills: {
      languages: [],
      frameworks: [],
      toolsAndDatabases: [],
      cloudAndDevOps: [],
      architectureAndPractices: [],
      softSkills: []
    },
    workExperience: [],
    education: [],
    projects: [],
    certifications: []
  };

  if (lines.length === 0) return result;

  // Extract Email
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  if (emailMatch && result.personalInfo) {
    result.personalInfo.email = emailMatch[1];
  }

  // Extract Phone
  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch && result.personalInfo) {
    result.personalInfo.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedinMatch = rawText.match(/(https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  if (linkedinMatch && result.personalInfo) {
    result.personalInfo.linkedinUrl = linkedinMatch[1];
  }

  // Extract GitHub
  const githubMatch = rawText.match(/(https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+)/i);
  if (githubMatch && result.personalInfo) {
    result.personalInfo.githubUrl = githubMatch[1];
  }

  // Name is typically in the first 2 lines
  if (result.personalInfo) {
    const candidateNameLine = lines[0];
    if (candidateNameLine && !candidateNameLine.includes('@') && !candidateNameLine.includes('http') && candidateNameLine.length < 50) {
      result.personalInfo.fullName = candidateNameLine.replace(/[#*]/g, '').trim();
    }
    if (lines[1] && !lines[1].includes('@') && !lines[1].includes('http') && lines[1].length < 80) {
      result.personalInfo.headline = lines[1].replace(/[#*]/g, '').trim();
    }
  }

  // Section parsing state machine
  let currentSection = 'header';
  const sectionContent: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  const sectionKeywords: Record<string, RegExp> = {
    summary: /^(summary|professional summary|about me|profile|executive summary)/i,
    experience: /^(experience|work experience|employment history|work history|professional experience)/i,
    education: /^(education|academic background|qualifications)/i,
    skills: /^(skills|technical skills|technologies|core competencies|areas of expertise)/i,
    projects: /^(projects|personal projects|technical projects|key projects)/i,
    certifications: /^(certifications|licenses|courses|accreditations)/i
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/[#*_]/g, '').trim();
    let detectedSection: string | null = null;

    for (const [secKey, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(line) && line.length < 40) {
        detectedSection = secKey;
        break;
      }
    }

    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    if (currentSection && sectionContent[currentSection]) {
      sectionContent[currentSection].push(lines[i]);
    }
  }

  // Parse Summary
  if (sectionContent.summary.length > 0) {
    result.summary = sectionContent.summary.join(' ').replace(/[#*]/g, '').trim();
  }

  // Parse Skills
  if (sectionContent.skills.length > 0 && result.skills) {
    const rawSkills = sectionContent.skills.join(' ');
    const tokens = rawSkills
      .split(/[,•|;\n]/)
      .map(s => s.replace(/[#*]/g, '').trim())
      .filter(s => s.length > 1 && s.length < 35);

    // Simple categorization
    tokens.forEach(tok => {
      const lower = tok.toLowerCase();
      if (lower.includes('react') || lower.includes('vue') || lower.includes('angular') || lower.includes('next') || lower.includes('tailwind') || lower.includes('redux')) {
        result.skills!.frameworks.push(tok);
      } else if (lower.includes('javascript') || lower.includes('typescript') || lower.includes('python') || lower.includes('java') || lower.includes('golang') || lower.includes('c++') || lower.includes('sql') || lower.includes('rust')) {
        result.skills!.languages.push(tok);
      } else if (lower.includes('aws') || lower.includes('docker') || lower.includes('kubernetes') || lower.includes('gcp') || lower.includes('ci/cd') || lower.includes('azure') || lower.includes('vercel')) {
        result.skills!.cloudAndDevOps.push(tok);
      } else if (lower.includes('postgres') || lower.includes('mongo') || lower.includes('redis') || lower.includes('git') || lower.includes('webpack') || lower.includes('vite') || lower.includes('jest')) {
        result.skills!.toolsAndDatabases.push(tok);
      } else {
        result.skills!.toolsAndDatabases.push(tok);
      }
    });

    // Deduplicate
    result.skills.languages = Array.from(new Set(result.skills.languages));
    result.skills.frameworks = Array.from(new Set(result.skills.frameworks));
    result.skills.toolsAndDatabases = Array.from(new Set(result.skills.toolsAndDatabases));
    result.skills.cloudAndDevOps = Array.from(new Set(result.skills.cloudAndDevOps));
  }

  // Parse Experience
  if (sectionContent.experience.length > 0 && result.workExperience) {
    const expLines = sectionContent.experience;
    let currentExp: WorkExperienceItem | null = null;

    expLines.forEach(l => {
      const clean = l.replace(/[#*]/g, '').trim();
      const isBullet = l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l);

      if (!isBullet && clean.length > 3 && clean.length < 70 && (!currentExp || currentExp.highlights.length > 0)) {
        if (currentExp) {
          result.workExperience!.push(currentExp);
        }
        currentExp = {
          id: 'exp_' + Math.random().toString(36).substr(2, 7),
          company: clean.split(/[-–|,]/)[0]?.trim() || clean,
          role: clean.split(/[-–|,]/)[1]?.trim() || 'Software Engineer',
          location: 'Remote / US',
          startDate: '2022',
          endDate: 'Present',
          isCurrent: true,
          highlights: [],
          techStack: []
        };
      } else if (currentExp && isBullet) {
        currentExp.highlights.push(clean.replace(/^[•\-*0-9.]+\s*/, '').trim());
      }
    });

    if (currentExp) {
      result.workExperience.push(currentExp);
    }
  }

  return result;
}

/**
 * Extract plain text from PDF using pdfjs-dist
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import('pdfjs-dist');
    
    // Set standard worker src if needed or disable worker for direct array parsing
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageStrings + '\n\n';
    }

    return fullText;
  } catch (err: any) {
    console.warn('PDF parsing fallback note:', err);
    // Fallback simple string extraction
    return await file.text();
  }
}

/**
 * Export CV to ATS Plain Text
 */
export function exportCVToPlainText(cv: CVData): string {
  const p = cv.personalInfo;
  let txt = `${p.fullName.toUpperCase()}\n`;
  if (p.headline) txt += `${p.headline}\n`;
  txt += `${p.email} | ${p.phone} | ${p.location}\n`;
  if (p.linkedinUrl || p.githubUrl || p.portfolioUrl) {
    txt += `${[p.linkedinUrl, p.githubUrl, p.portfolioUrl].filter(Boolean).join(' | ')}\n`;
  }
  txt += `\n${'='.repeat(60)}\nPROFESSIONAL SUMMARY\n${'='.repeat(60)}\n`;
  txt += `${cv.summary}\n\n`;

  txt += `${'='.repeat(60)}\nTECHNICAL SKILLS\n${'='.repeat(60)}\n`;
  if (cv.skills.languages?.length) txt += `Languages: ${cv.skills.languages.join(', ')}\n`;
  if (cv.skills.frameworks?.length) txt += `Frameworks & Libraries: ${cv.skills.frameworks.join(', ')}\n`;
  if (cv.skills.toolsAndDatabases?.length) txt += `Databases & Tools: ${cv.skills.toolsAndDatabases.join(', ')}\n`;
  if (cv.skills.cloudAndDevOps?.length) txt += `Cloud & DevOps: ${cv.skills.cloudAndDevOps.join(', ')}\n`;
  if (cv.skills.architectureAndPractices?.length) txt += `Architecture: ${cv.skills.architectureAndPractices.join(', ')}\n`;
  txt += '\n';

  if (cv.workExperience?.length) {
    txt += `${'='.repeat(60)}\nWORK EXPERIENCE\n${'='.repeat(60)}\n`;
    cv.workExperience.forEach(exp => {
      txt += `${exp.role.toUpperCase()} | ${exp.company} (${exp.location})\n`;
      txt += `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}\n`;
      exp.highlights.forEach(hl => {
        txt += `  * ${hl}\n`;
      });
      if (exp.techStack?.length) {
        txt += `  Technologies: ${exp.techStack.join(', ')}\n`;
      }
      txt += '\n';
    });
  }

  if (cv.projects?.length) {
    txt += `${'='.repeat(60)}\nKEY PROJECTS\n${'='.repeat(60)}\n`;
    cv.projects.forEach(proj => {
      txt += `${proj.title.toUpperCase()}${proj.role ? ` | ${proj.role}` : ''}${proj.date ? ` (${proj.date})` : ''}\n`;
      if (proj.liveUrl || proj.githubUrl) {
        txt += `Links: ${[proj.liveUrl, proj.githubUrl].filter(Boolean).join(' | ')}\n`;
      }
      proj.highlights.forEach(hl => {
        txt += `  * ${hl}\n`;
      });
      if (proj.techStack?.length) {
        txt += `  Technologies: ${proj.techStack.join(', ')}\n`;
      }
      txt += '\n';
    });
  }

  if (cv.education?.length) {
    txt += `${'='.repeat(60)}\nEDUCATION\n${'='.repeat(60)}\n`;
    cv.education.forEach(edu => {
      txt += `${edu.degree} in ${edu.fieldOfStudy}\n`;
      txt += `${edu.institution} - ${edu.location} (${edu.startDate} - ${edu.endDate})\n`;
      if (edu.gpa) txt += `GPA: ${edu.gpa}\n`;
      if (edu.honors) txt += `Honors: ${edu.honors}\n`;
      txt += '\n';
    });
  }

  if (cv.certifications?.length) {
    txt += `${'='.repeat(60)}\nCERTIFICATIONS & ACCREDITATIONS\n${'='.repeat(60)}\n`;
    cv.certifications.forEach(cert => {
      txt += `* ${cert.name} - ${cert.issuer} (${cert.issueDate})${cert.credentialId ? ` [ID: ${cert.credentialId}]` : ''}\n`;
    });
  }

  return txt;
}
