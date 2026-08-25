/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Download, Printer, Copy, Sparkles, UploadCloud, Compass, 
  RotateCcw, Check, Plus, Trash2, Edit3, Target, Eye, Code, 
  CheckCircle2, Briefcase, GraduationCap, Award, Layers, Zap, 
  ChevronRight, ChevronLeft, ArrowRight, Share2, ExternalLink, HelpCircle, X,
  Loader2, ScrollText, LayoutGrid, CheckSquare, Camera, User, Image as ImageIcon, Sliders
} from 'lucide-react';
import { generateATSPDF } from '../utils/generatePdf';
import { 
  CVData, WorkExperienceItem, EducationItem, ProjectItem, CertificationItem, 
  CVTemplateId, CVFontFamily, CVSpacingDensity, CVPhotoShape 
} from '../types/cv';
import { 
  getActiveCV, saveActiveCV, calculateATSScore, DEFAULT_FRONTEND_CV, 
  exportCVToPlainText, ATS_POWER_ACTION_VERBS, hydrateActiveCVFromSupabase
} from '../lib/cvStore';
import { CVDocumentPreview } from '../components/cv/CVDocumentPreview';
import { ATSScoreCard } from '../components/cv/ATSScoreCard';
import { CVImportModal } from '../components/cv/CVImportModal';
import { RoadmapImportModal } from '../components/cv/RoadmapImportModal';
import { useToast } from '../context/ToastContext';

type EditorTab = 'contact' | 'summary' | 'experience' | 'skills' | 'projects' | 'education' | 'certifications' | 'targetJob' | 'atsAudit' | 'design';

const SAMPLE_TECH_AVATARS = [
  {
    name: 'Alex',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    title: 'Frontend Engineer'
  },
  {
    name: 'Jordan',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Full Stack Dev'
  },
  {
    name: 'Elena',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Lead Architect'
  },
  {
    name: 'Marcus',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'DevOps / SRE'
  }
];

export const CVGeneratorPage: React.FC = () => {
  const { addToast } = useToast();
  const [cv, setCv] = useState<CVData>(getActiveCV());
  const [activeTab, setActiveTab] = useState<EditorTab>('contact');
  const [activePreset, setActivePreset] = useState<'frontend' | 'fullstack' | 'devops' | 'custom'>('frontend');
  const [viewMode, setViewMode] = useState<'tabbed' | 'all'>('tabbed');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [activePreviewMobile, setActivePreviewMobile] = useState<'editor' | 'preview'>('editor');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'languages' | 'frameworks' | 'toolsAndDatabases' | 'cloudAndDevOps' | 'architectureAndPractices' | 'softSkills'>('frameworks');

  const printRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

  const atsResult = calculateATSScore(cv);

  // Hydrate from Supabase on mount for cross-device synchronization
  useEffect(() => {
    hydrateActiveCVFromSupabase().then((remoteCV) => {
      if (remoteCV) {
        setCv(remoteCV);
      }
    });
  }, []);

  // Sync with storage on mount and changes
  useEffect(() => {
    saveActiveCV(cv);
  }, [cv]);

  // Auto scroll active tab into view in the scrollable tab ribbon
  useEffect(() => {
    if (tabButtonRefs.current[activeTab]) {
      tabButtonRefs.current[activeTab]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab]);

  // Tab ribbon horizontal scrolling
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectTab = (tabId: EditorTab) => {
    setActiveTab(tabId);
    if (viewMode === 'all') {
      const el = document.getElementById(`section-${tabId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      editorContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handler for adding missing ATS keywords in 1 click
  const handleAddMissingSkill = (skill: string) => {
    setActivePreset('custom');
    const clean = skill.trim();
    if (!clean) return;

    const lower = clean.toLowerCase();
    let category: keyof typeof cv.skills = 'frameworks';

    if (['typescript', 'javascript', 'python', 'go', 'golang', 'java', 'c++', 'c#', 'sql', 'html', 'css', 'ruby', 'rust', 'php', 'swift', 'kotlin'].includes(lower)) {
      category = 'languages';
    } else if (['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'linux', 'vercel', 'nginx'].some(c => lower.includes(c))) {
      category = 'cloudAndDevOps';
    } else if (['git', 'github', 'postgres', 'postgresql', 'mongodb', 'redis', 'jest', 'playwright', 'vite', 'webpack'].some(t => lower.includes(t))) {
      category = 'toolsAndDatabases';
    }

    if (cv.skills[category].includes(clean)) {
      addToast(`Skill "${clean}" already listed in ${category}!`, 'info');
      return;
    }

    setCv(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], clean]
      }
    }));
    addToast(`Added "${clean}" to ${category}. ATS keyword match score updated!`, 'success');
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setActivePreset('custom');
    setCv(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateDesignSettings = (field: string, value: any) => {
    setCv(prev => ({
      ...prev,
      designSettings: {
        ...prev.designSettings,
        [field]: value
      }
    }));
  };

  // Photo handlers
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCv(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              photoUrl: dataUrl
            },
            designSettings: {
              ...prev.designSettings,
              showPhoto: true
            }
          }));
          addToast('Identity photo uploaded and optimized for your CV!', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectSamplePhoto = (url: string, name: string) => {
    setCv(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        photoUrl: url
      },
      designSettings: {
        ...prev.designSettings,
        showPhoto: true
      }
    }));
    addToast(`Applied sample headshot avatar (${name})!`, 'success');
  };

  const handleRemovePhoto = () => {
    setCv(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        photoUrl: ''
      }
    }));
    addToast('Identity photo removed from CV.', 'info');
  };

  // 1. Work Experience Handlers
  const addWorkExperience = () => {
    const newExp: WorkExperienceItem = {
      id: 'exp_' + Date.now(),
      company: 'Company Name',
      role: 'Software Engineer',
      location: 'Remote / City, State',
      startDate: '2023',
      endDate: 'Present',
      isCurrent: true,
      highlights: [
        'Architected and delivered scalable feature module reducing execution latency by 30%.',
        'Collaborated with cross-functional engineering teams to maintain 99.9% uptime.'
      ],
      techStack: ['TypeScript', 'React', 'Node.js']
    };
    setCv(prev => ({
      ...prev,
      workExperience: [newExp, ...prev.workExperience]
    }));
    addToast('New work experience position added', 'info');
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperienceItem, value: any) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeWorkExperience = (id: string) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
    addToast('Work experience position removed', 'info');
  };

  const addHighlightToExperience = (expId: string) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => {
        if (exp.id === expId) {
          return {
            ...exp,
            highlights: [...exp.highlights, 'Spearheaded implementation improving workflow efficiency by 25%.']
          };
        }
        return exp;
      })
    }));
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => {
        if (exp.id === expId) {
          const newHighlights = [...exp.highlights];
          newHighlights[index] = value;
          return { ...exp, highlights: newHighlights };
        }
        return exp;
      })
    }));
  };

  const removeHighlight = (expId: string, index: number) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => {
        if (exp.id === expId) {
          return {
            ...exp,
            highlights: exp.highlights.filter((_, i) => i !== index)
          };
        }
        return exp;
      })
    }));
  };

  // 2. Project Handlers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: 'proj_' + Date.now(),
      title: 'Full-Stack Web Platform',
      role: 'Lead Architect',
      date: new Date().getFullYear().toString(),
      highlights: [
        'Engineered responsive full-stack platform with real-time state synchronization.',
        'Implemented secure OAuth 2.0 authentication and automated CI/CD deployment.'
      ],
      techStack: ['TypeScript', 'React', 'PostgreSQL', 'Docker'],
      githubUrl: 'https://github.com/username/project'
    };
    setCv(prev => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    addToast('New project added', 'info');
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setCv(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id: string) => {
    setCv(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    addToast('Project removed', 'info');
  };

  // 3. Education Handlers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: 'edu_' + Date.now(),
      institution: 'University / Institute Name',
      degree: 'Bachelor of Science (B.S.)',
      fieldOfStudy: 'Computer Science',
      location: 'City, State',
      startDate: '2019',
      endDate: '2023',
      gpa: '3.7 / 4.0'
    };
    setCv(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setCv(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id: string) => {
    setCv(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  // 4. Certification Handlers
  const addCertification = () => {
    const newCert: CertificationItem = {
      id: 'cert_' + Date.now(),
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2024',
      credentialId: 'AWS-' + Math.floor(100000 + Math.random() * 900000)
    };
    setCv(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const removeCertification = (id: string) => {
    setCv(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  // 5. Skill Tag Management
  const addSkillTag = (category: keyof typeof cv.skills, skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (cv.skills[category].includes(clean)) return;

    setCv(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], clean]
      }
    }));
    setNewSkillInput('');
  };

  const removeSkillTag = (category: keyof typeof cv.skills, skill: string) => {
    setCv(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter(s => s !== skill)
      }
    }));
  };

  // AI Summary Polish helper
  const handlePolishSummary = () => {
    const polished = `Results-oriented ${cv.personalInfo.headline || 'Software Engineer'} with deep expertise in scalable system design, modern component frameworks, and distributed cloud applications. Proven track record of architecting high-impact features, improving application load performance by over 35%, and collaborating across engineering teams to ship reliable software on schedule.`;
    setCv(prev => ({ ...prev, summary: polished }));
    addToast('Professional summary polished with strong action verbs and quantified impact!', 'success');
  };

  // Quick Preset Profiles
  const loadPreset = (presetName: 'frontend' | 'fullstack' | 'devops') => {
    setActivePreset(presetName);
    if (presetName === 'frontend') {
      setCv(DEFAULT_FRONTEND_CV);
      addToast('Loaded Senior Frontend Engineer ATS preset!', 'success');
    } else if (presetName === 'fullstack') {
      setCv({
        ...DEFAULT_FRONTEND_CV,
        title: 'Senior Full Stack Engineer CV',
        personalInfo: {
          ...DEFAULT_FRONTEND_CV.personalInfo,
          fullName: 'Jordan Taylor',
          headline: 'Full-Stack Software Engineer | React, Node.js, PostgreSQL & Cloud DevOps',
        },
        summary: 'Full-Stack Software Engineer with 5+ years of experience architecting end-to-end web applications and high-throughput microservices. Spearheaded database indexing and Redis caching layer that reduced average API response time by 55% for 400,000+ daily requests.',
        skills: {
          languages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
          frameworks: ['React 19', 'Next.js 15', 'Node.js', 'Express', 'Tailwind CSS', 'FastAPI'],
          toolsAndDatabases: ['PostgreSQL', 'Redis', 'MongoDB', 'Docker', 'Git', 'Jest', 'Prisma ORM'],
          cloudAndDevOps: ['AWS (ECS, S3, RDS)', 'Kubernetes', 'CI/CD Pipelines', 'Supabase', 'Terraform'],
          architectureAndPractices: ['Microservices', 'RESTful & GraphQL APIs', 'System Design', 'Event-Driven Architecture'],
          softSkills: ['Team Mentorship', 'Sprint Planning', 'Stakeholder Communication']
        }
      });
      addToast('Loaded Full-Stack Engineer ATS preset!', 'success');
    } else if (presetName === 'devops') {
      setCv({
        ...DEFAULT_FRONTEND_CV,
        title: 'DevOps & Cloud Infrastructure Engineer CV',
        personalInfo: {
          ...DEFAULT_FRONTEND_CV.personalInfo,
          fullName: 'Morgan Vance',
          headline: 'DevOps & Site Reliability Engineer | AWS, Kubernetes, Terraform & CI/CD',
        },
        summary: 'DevOps & SRE Engineer with 4+ years specializing in automated cloud infrastructure, container orchestration, and zero-downtime deployment pipelines. Reduced mean time to recovery (MTTR) by 60% and slashed AWS infrastructure expenditures by $120k annually.',
        skills: {
          languages: ['Bash/Shell', 'Python', 'Go', 'YAML', 'SQL'],
          frameworks: ['Terraform', 'Ansible', 'Helm', 'Prometheus & Grafana'],
          toolsAndDatabases: ['Docker', 'Kubernetes', 'GitHub Actions', 'ArgoCD', 'PostgreSQL', 'Redis'],
          cloudAndDevOps: ['AWS (EKS, Lambda, CloudWatch, VPC)', 'GCP', 'Linux Kernel & Systemd', 'Vault'],
          architectureAndPractices: ['GitOps', 'Zero Trust Architecture', 'Chaos Engineering', 'Infrastructure as Code (IaC)'],
          softSkills: ['Incident Response Lead', 'Blameless Post-Mortems', 'Technical Documentation']
        }
      });
      addToast('Loaded DevOps & Cloud SRE preset!', 'success');
    }
  };

  // 1. Direct High-Quality ATS Vector PDF Download
  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      addToast('Generating ATS-compliant vector PDF...', 'info');

      // Small async tick to allow UI loading state to paint smoothly
      await new Promise(resolve => setTimeout(resolve, 80));

      generateATSPDF(cv);
      addToast('PDF downloaded successfully! (100% ATS text parseable)', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast('Direct PDF generation encountered an issue. Launching print dialog...', 'info');
      handlePrint();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // 2. Clean Browser Print / System PDF
  const handlePrint = () => {
    const printable = document.getElementById('ats-cv-printable-document') || printRef.current;
    if (!printable) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${cv.personalInfo.fullName || 'Resume'} - ATS CV</title>
              <meta charset="utf-8" />
              <style>
                @page {
                  size: A4;
                  margin: 10mm 12mm;
                }
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                  font-family: ${
                    cv.designSettings.fontFamily === 'serif'
                      ? 'Georgia, Cambria, serif'
                      : cv.designSettings.fontFamily === 'mono'
                      ? 'monospace'
                      : 'Arial, Helvetica, sans-serif'
                  };
                }
                body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  padding: 12px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .print\\:hidden, button, svg.print\\:hidden {
                  display: none !important;
                }
                #ats-cv-printable-document {
                  padding: 0 !important;
                  margin: 0 auto !important;
                  max-width: 100% !important;
                  box-shadow: none !important;
                  background: #ffffff !important;
                }
              </style>
            </head>
            <body>
              ${printable.outerHTML}
              <script>
                window.onload = function() {
                  window.focus();
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn('Window open fallback to standard print:', e);
    }
    window.print();
  };

  const handleCopyPlainText = () => {
    const txt = exportCVToPlainText(cv);
    navigator.clipboard.writeText(txt);
    addToast('ATS plain text copied to clipboard! Ready to paste into application forms.', 'success');
  };

  const handleCopyMarkdown = () => {
    const md = `# ${cv.personalInfo.fullName.toUpperCase()}\n**${cv.personalInfo.headline}**\n\n${cv.personalInfo.email} | ${cv.personalInfo.phone} | ${cv.personalInfo.location}\n\n## PROFESSIONAL SUMMARY\n${cv.summary}\n\n## TECHNICAL SKILLS\n- **Languages:** ${cv.skills.languages.join(', ')}\n- **Frameworks:** ${cv.skills.frameworks.join(', ')}\n- **Databases & Tools:** ${cv.skills.toolsAndDatabases.join(', ')}\n- **Cloud & DevOps:** ${cv.skills.cloudAndDevOps.join(', ')}\n\n## WORK EXPERIENCE\n` +
      cv.workExperience.map(e => `### ${e.role} — ${e.company} (${e.startDate} - ${e.endDate})\n` + e.highlights.map(h => `- ${h}`).join('\n')).join('\n\n');
    navigator.clipboard.writeText(md);
    addToast('Markdown version copied to clipboard!', 'success');
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(cv, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.personalInfo.fullName.toLowerCase().replace(/\s+/g, '_')}_cv.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CV exported as JSON Resume!', 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-16 z-30 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-100">
                  Job Readiness Professional CV Generator
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-[11px] font-mono font-bold text-green-400">
                  ATS Score: {atsResult.score}/100
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                High-scoring ATS resume engine • Real-time rubric scanner • One-click PDF & Plain Text export
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Import Trigger */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <UploadCloud className="h-3.5 w-3.5 text-green-400" />
              <span>Import</span>
            </button>

            {/* Roadmap Import */}
            <button
              type="button"
              onClick={() => setIsRoadmapModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-green-500/40 active:scale-95 text-xs font-semibold text-zinc-300 hover:text-green-400 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Compass className="h-3.5 w-3.5 text-green-400" />
              <span className="hidden sm:inline">From Roadmap</span>
            </button>

            {/* Copy Plain Text */}
            <button
              type="button"
              onClick={handleCopyPlainText}
              title="Copy ATS formatted text to paste directly into job applications"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>

            {/* Print / System Dialog */}
            <button
              type="button"
              onClick={handlePrint}
              title="Open browser print / PDF export dialog"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer className="h-3.5 w-3.5 text-zinc-400" />
              <span>Print</span>
            </button>

            {/* Primary Download PDF Action */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {isDownloadingPDF ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>{isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Profiles & Quick Switcher Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-2 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-transparent border border-zinc-800/80 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="font-semibold text-zinc-300">Quick Track Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadPreset('frontend')}
              className={`px-3 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer flex items-center gap-1 ${
                activePreset === 'frontend'
                  ? 'bg-green-500 text-zinc-950 font-bold border border-green-400 shadow-md shadow-green-500/20 ring-1 ring-green-400/40'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-green-500/50 hover:text-green-400'
              }`}
            >
              {activePreset === 'frontend' && <Check className="h-3 w-3 text-zinc-950" />}
              Frontend Engineer
            </button>
            <button
              type="button"
              onClick={() => loadPreset('fullstack')}
              className={`px-3 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer flex items-center gap-1 ${
                activePreset === 'fullstack'
                  ? 'bg-green-500 text-zinc-950 font-bold border border-green-400 shadow-md shadow-green-500/20 ring-1 ring-green-400/40'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-green-500/50 hover:text-green-400'
              }`}
            >
              {activePreset === 'fullstack' && <Check className="h-3 w-3 text-zinc-950" />}
              Full Stack Engineer
            </button>
            <button
              type="button"
              onClick={() => loadPreset('devops')}
              className={`px-3 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer flex items-center gap-1 ${
                activePreset === 'devops'
                  ? 'bg-green-500 text-zinc-950 font-bold border border-green-400 shadow-md shadow-green-500/20 ring-1 ring-green-400/40'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-green-500/50 hover:text-green-400'
              }`}
            >
              {activePreset === 'devops' && <Check className="h-3 w-3 text-zinc-950" />}
              DevOps & SRE
            </button>
            {activePreset === 'custom' && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono border border-zinc-700">
                Customized
              </span>
            )}
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 text-[11px] cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <Download className="h-3 w-3" /> JSON Resume
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle between Editor and Preview */}
      <div className="lg:hidden mx-4 my-3 flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 print:hidden">
        <button
          type="button"
          onClick={() => setActivePreviewMobile('editor')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activePreviewMobile === 'editor'
              ? 'bg-green-600 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ✏️ Edit CV Fields
        </button>
        <button
          type="button"
          onClick={() => setActivePreviewMobile('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePreviewMobile === 'preview'
              ? 'bg-green-600 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview ATS CV ({atsResult.score}/100)
        </button>
      </div>

      {/* Main Workspace Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 space-y-6">
        
        {/* ATS Compatibility Score Hub (Full-Width Top Panel) */}
        <div className="print:hidden">
          <ATSScoreCard
            atsResult={atsResult}
            cv={cv}
            onSelectTab={(tab) => setActiveTab(tab as EditorTab)}
            onAddMissingSkill={handleAddMissingSkill}
            onPolishSummary={handlePolishSummary}
            onOpenTargetJobModal={() => setActiveTab('targetJob')}
          />
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Clean Tabbed Editor (Cols 1-6) */}
          <div className={`lg:col-span-6 space-y-4 print:hidden ${activePreviewMobile === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Editor Container */}
            <div ref={editorContainerRef} className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl overflow-hidden">
              
              {/* Tab Navigation Header with Ribbon Scroll & Active States */}
              <div className="border-b border-zinc-800/80 bg-zinc-950/60 p-2 flex items-center gap-1.5">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => scrollTabs('left')}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shrink-0"
                  title="Scroll tabs left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Scrollable Ribbon */}
                <div
                  ref={tabsScrollRef}
                  className="flex overflow-x-auto scrollbar-none gap-1.5 py-0.5 scroll-smooth flex-1"
                >
                  {[
                    { id: 'contact', label: 'Contact', icon: FileText, count: null },
                    { id: 'summary', label: 'Summary', icon: Sparkles, count: null },
                    { id: 'experience', label: 'Experience', icon: Briefcase, count: cv.workExperience.length },
                    { id: 'skills', label: 'Skills', icon: Zap, count: Object.values(cv.skills).flat().length },
                    { id: 'projects', label: 'Projects', icon: Code, count: cv.projects.length },
                    { id: 'education', label: 'Education', icon: GraduationCap, count: cv.education.length },
                    { id: 'certifications', label: 'Certs', icon: Award, count: cv.certifications.length },
                    { id: 'targetJob', label: 'ATS Target', icon: Target, count: cv.targetJob.keyRequirements?.length },
                    { id: 'atsAudit', label: `ATS Audit`, icon: CheckCircle2, count: `${atsResult.score}/100` },
                    { id: 'design', label: 'Design', icon: Layers, count: null },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        ref={el => { tabButtonRefs.current[tab.id] = el; }}
                        type="button"
                        onClick={() => handleSelectTab(tab.id as EditorTab)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-green-500/15 text-green-400 border border-green-500/50 ring-1 ring-green-500/30 shadow-md font-bold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-green-400' : 'text-zinc-500'}`} />
                        <span>{tab.label}</span>
                        {tab.count !== null && tab.count !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-green-500 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Scroll Right Button */}
                <button
                  type="button"
                  onClick={() => scrollTabs('right')}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shrink-0"
                  title="Scroll tabs right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Tab 1: Personal & Contact Info */}
              {activeTab === 'contact' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Personal & Contact Information</h3>
                      <p className="text-xs text-zinc-400">Essential contact details and optional profile headshot parsed by recruiters.</p>
                    </div>
                  </div>

                  {/* Identity Photo & Headshot Section */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-bold text-zinc-200">Identity Photo / Headshot</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-zinc-400 font-medium cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={cv.designSettings.showPhoto !== false && Boolean(cv.personalInfo.photoUrl)}
                            onChange={(e) => {
                              updateDesignSettings('showPhoto', e.target.checked);
                              if (e.target.checked && !cv.personalInfo.photoUrl) {
                                // apply first sample avatar if none is uploaded
                                handleSelectSamplePhoto(SAMPLE_TECH_AVATARS[0].url, SAMPLE_TECH_AVATARS[0].name);
                              }
                            }}
                            className="rounded border-zinc-700 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900 h-3.5 w-3.5"
                          />
                          <span>Show on CV Document</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Photo Preview Avatar */}
                      <div className="relative shrink-0 group">
                        {cv.personalInfo.photoUrl ? (
                          <img
                            src={cv.personalInfo.photoUrl}
                            alt="Identity photo preview"
                            className={`w-20 h-20 object-cover border-2 border-green-500/50 shadow-md ${
                              cv.designSettings.photoShape === 'square'
                                ? 'rounded-none'
                                : cv.designSettings.photoShape === 'rounded'
                                ? 'rounded-2xl'
                                : 'rounded-full'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-20 h-20 bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 gap-1 ${
                              cv.designSettings.photoShape === 'square'
                                ? 'rounded-none'
                                : cv.designSettings.photoShape === 'rounded'
                                ? 'rounded-2xl'
                                : 'rounded-full'
                            }`}
                          >
                            <User className="h-7 w-7 text-zinc-600" />
                            <span className="text-[10px] text-zinc-500 font-medium">No Photo</span>
                          </div>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Photo Actions & URL */}
                      <div className="space-y-2.5 flex-1 w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            Upload Photo
                          </button>

                          {cv.personalInfo.photoUrl && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}

                          {/* Shape Controls */}
                          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px]">
                            {(['circle', 'rounded', 'square'] as CVPhotoShape[]).map((shape) => {
                              const active = (cv.designSettings.photoShape || 'circle') === shape;
                              return (
                                <button
                                  key={shape}
                                  type="button"
                                  onClick={() => updateDesignSettings('photoShape', shape)}
                                  className={`px-2 py-0.5 rounded-lg capitalize transition-all cursor-pointer ${
                                    active
                                      ? 'bg-zinc-800 text-green-400 font-semibold shadow-xs'
                                      : 'text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  {shape}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-1">
                          <input
                            type="url"
                            value={cv.personalInfo.photoUrl || ''}
                            onChange={(e) => {
                              updatePersonalInfo('photoUrl', e.target.value);
                              if (e.target.value) {
                                updateDesignSettings('showPhoto', true);
                              }
                            }}
                            placeholder="Or paste direct image URL (e.g. GitHub avatar, LinkedIn, Imgur)..."
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:border-green-500 focus:outline-none font-mono placeholder:text-zinc-600"
                          />
                        </div>

                        {/* Sample Tech Avatars Picker */}
                        <div className="space-y-1.5 pt-0.5">
                          <span className="text-[10px] text-zinc-500 block font-medium">Quick Sample Headshots:</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {SAMPLE_TECH_AVATARS.map((avatar, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSamplePhoto(avatar.url, avatar.name)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                  cv.personalInfo.photoUrl === avatar.url
                                    ? 'bg-green-500/10 border-green-500 text-green-300'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                }`}
                              >
                                <img
                                  src={avatar.url}
                                  alt={avatar.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                                <span>{avatar.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ATS Guidance Tip */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-300 font-semibold">ATS Tip: </strong>
                        For applications in the <span className="text-zinc-200 font-medium">US, UK, and Canada</span>, automated ATS scanners and recruiters standardly recommend text-only CVs without photos to prevent unconscious bias. For <span className="text-zinc-200 font-medium">EU, APAC, Latin America</span>, or executive portfolios, a professional headshot is frequently customary. You can toggle it on or off anytime!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">Full Name *</label>
                      <input
                        type="text"
                        value={cv.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">Professional Headline *</label>
                      <input
                        type="text"
                        value={cv.personalInfo.headline}
                        onChange={(e) => updatePersonalInfo('headline', e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer | React, TypeScript"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">Email Address *</label>
                      <input
                        type="email"
                        value={cv.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">Phone Number *</label>
                      <input
                        type="tel"
                        value={cv.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300">Location (City, State/Country) *</label>
                      <input
                        type="text"
                        value={cv.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        placeholder="e.g. San Francisco, CA (Open to Remote)"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={cv.personalInfo.linkedinUrl}
                        onChange={(e) => updatePersonalInfo('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={cv.personalInfo.githubUrl}
                        onChange={(e) => updatePersonalInfo('githubUrl', e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300">Portfolio / Personal Website</label>
                      <input
                        type="url"
                        value={cv.personalInfo.portfolioUrl}
                        onChange={(e) => updatePersonalInfo('portfolioUrl', e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Professional Summary */}
              {activeTab === 'summary' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Professional Summary</h3>
                      <p className="text-xs text-zinc-400">A concise 3-4 sentence hook emphasizing quantified achievements and core skills.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePolishSummary}
                      className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Polish with Action Verbs
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={cv.summary}
                    onChange={(e) => setCv(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Impact-driven Senior Software Engineer with 4+ years of experience..."
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-200 leading-relaxed focus:border-green-500 focus:outline-none"
                  />

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>ATS Tip:</strong> Highlight your total years of experience, primary tech stack (e.g. React, TypeScript), and at least 1 measurable impact metric (e.g. "improved latency by 40%").
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: Work Experience */}
              {activeTab === 'experience' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Work Experience</h3>
                      <p className="text-xs text-zinc-400">Order from most recent. Use STAR method bullet points (Action + Task + Metric Result).</p>
                    </div>
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Position
                    </button>
                  </div>

                  {cv.workExperience.map((exp, idx) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <span className="text-xs font-bold text-zinc-300 font-mono">
                          Position #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWorkExperience(exp.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Job Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateWorkExperience(exp.id, 'role', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-zinc-400">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                              placeholder="e.g. Jan 2022"
                              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-zinc-400">End Date</label>
                            <input
                              type="text"
                              disabled={exp.isCurrent}
                              value={exp.isCurrent ? 'Present' : exp.endDate}
                              onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                              placeholder="e.g. Present"
                              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.isCurrent}
                          onChange={(e) => updateWorkExperience(exp.id, 'isCurrent', e.target.checked)}
                          className="rounded border-zinc-700 text-green-500 focus:ring-green-500"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-xs text-zinc-300 cursor-pointer">
                          I currently work here
                        </label>
                      </div>

                      {/* Bullet Highlights */}
                      <div className="space-y-2 pt-2 border-t border-zinc-850">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-zinc-300">
                            Key Achievements & STAR Highlights ({exp.highlights.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => addHighlightToExperience(exp.id)}
                            className="text-[11px] text-green-400 hover:text-green-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Add Bullet Point
                          </button>
                        </div>

                        {exp.highlights.map((hl, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <span className="text-zinc-500 text-xs mt-1.5">•</span>
                            <textarea
                              rows={2}
                              value={hl}
                              onChange={(e) => updateHighlight(exp.id, hIdx, e.target.value)}
                              placeholder="Spearheaded architecture of..."
                              className="flex-grow rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-200 leading-relaxed focus:border-green-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeHighlight(exp.id, hIdx)}
                              className="p-1 text-zinc-500 hover:text-red-400 mt-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Technical Skills */}
              {activeTab === 'skills' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-100">Technical Skills & Competencies</h3>
                    <p className="text-xs text-zinc-400">Categorized skills help ATS engines match candidate capability profiles accurately.</p>
                  </div>

                  {/* Add Skill Tag Input */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value as any)}
                        className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                      >
                        <option value="languages">Languages</option>
                        <option value="frameworks">Frameworks & Libraries</option>
                        <option value="toolsAndDatabases">Databases & Tools</option>
                        <option value="cloudAndDevOps">Cloud & DevOps</option>
                        <option value="architectureAndPractices">Architecture</option>
                        <option value="softSkills">Soft & Leadership</option>
                      </select>
                      <div className="flex flex-grow gap-2">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillTag(newSkillCategory, newSkillInput);
                            }
                          }}
                          placeholder="Type skill tag (e.g. Next.js 15, GraphQL, Docker) and press Enter"
                          className="flex-grow rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => addSkillTag(newSkillCategory, newSkillInput)}
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 font-bold text-xs cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categorized Tag Lists */}
                  {(['languages', 'frameworks', 'toolsAndDatabases', 'cloudAndDevOps', 'architectureAndPractices', 'softSkills'] as const).map(cat => (
                    <div key={cat} className="space-y-2">
                      <span className="text-xs font-bold text-zinc-300 capitalize">
                        {cat === 'toolsAndDatabases' ? 'Databases & Tools' : cat === 'cloudAndDevOps' ? 'Cloud, DevOps & Infra' : cat.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.skills[cat]?.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 hover:border-zinc-700"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkillTag(cat, skill)}
                              className="text-zinc-500 hover:text-red-400 ml-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Projects */}
              {activeTab === 'projects' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Key Projects & Portfolio</h3>
                      <p className="text-xs text-zinc-400">Showcase production-ready capstone builds, live demos, and GitHub repositories.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Project
                    </button>
                  </div>

                  {cv.projects.map((proj, idx) => (
                    <div key={proj.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <span className="text-xs font-bold text-zinc-300 font-mono">
                          Project #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Role / Contribution</label>
                          <input
                            type="text"
                            value={proj.role}
                            onChange={(e) => updateProject(proj.id, 'role', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Live Demo URL</label>
                          <input
                            type="url"
                            value={proj.liveUrl || ''}
                            onChange={(e) => updateProject(proj.id, 'liveUrl', e.target.value)}
                            placeholder="https://demo.vercel.app"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">GitHub Repository URL</label>
                          <input
                            type="url"
                            value={proj.githubUrl || ''}
                            onChange={(e) => updateProject(proj.id, 'githubUrl', e.target.value)}
                            placeholder="https://github.com/user/repo"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 font-mono"
                          />
                        </div>
                      </div>

                      {/* Project Highlights */}
                      <div className="space-y-2 pt-2 border-t border-zinc-850">
                        <label className="text-[11px] font-semibold text-zinc-300">
                          Architecture Highlights & Engineering Accomplishments
                        </label>
                        {proj.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <span className="text-zinc-500 text-xs mt-1.5">•</span>
                            <input
                              type="text"
                              value={h}
                              onChange={(e) => {
                                const newHls = [...proj.highlights];
                                newHls[hIdx] = e.target.value;
                                updateProject(proj.id, 'highlights', newHls);
                              }}
                              className="flex-grow rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 6: Education */}
              {activeTab === 'education' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Education & Degrees</h3>
                      <p className="text-xs text-zinc-400">University, degree, field of study, graduation year.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Education
                    </button>
                  </div>

                  {cv.education.map((edu, idx) => (
                    <div key={edu.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <span className="text-xs font-bold text-zinc-300 font-mono">
                          Degree #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Institution / University</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Degree & Major</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">Field of Study</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-zinc-400">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              placeholder="2024"
                              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-zinc-400">GPA / Honors</label>
                            <input
                              type="text"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.8/4.0"
                              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 7: Certifications */}
              {activeTab === 'certifications' && (
                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Certifications & Accreditations</h3>
                      <p className="text-xs text-zinc-400">Cloud credentials, developer certifications, and accredited licenses.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Certificate
                    </button>
                  </div>

                  {cv.certifications.map((cert) => (
                    <div key={cert.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-grow">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = cv.certifications.map(c => c.id === cert.id ? { ...c, name: e.target.value } : c);
                            setCv(prev => ({ ...prev, certifications: updated }));
                          }}
                          placeholder="Certificate Name"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200 font-bold"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => {
                              const updated = cv.certifications.map(c => c.id === cert.id ? { ...c, issuer: e.target.value } : c);
                              setCv(prev => ({ ...prev, certifications: updated }));
                            }}
                            placeholder="Issuing Organization (e.g. AWS, Meta)"
                            className="flex-1 rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                          />
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => {
                              const updated = cv.certifications.map(c => c.id === cert.id ? { ...c, issueDate: e.target.value } : c);
                              setCv(prev => ({ ...prev, certifications: updated }));
                            }}
                            placeholder="Year"
                            className="w-20 rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(cert.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 8: Target Job & ATS Matcher */}
              {activeTab === 'targetJob' && (
                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-green-400" />
                      Target Job Description & ATS Alignment
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Paste the exact job listing description to evaluate your keyword match % and identify missing qualifications.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">Target Role Title</label>
                    <input
                      type="text"
                      value={cv.targetJob.targetRole}
                      onChange={(e) => setCv(prev => ({
                        ...prev,
                        targetJob: { ...prev.targetJob, targetRole: e.target.value }
                      }))}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Paste Job Description Text (Requirements & Responsibilities)
                    </label>
                    <textarea
                      rows={6}
                      value={cv.targetJob.jobDescription || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Auto-extract candidate keywords
                        const keywords = val
                          .match(/\b([A-Z][a-zA-Z0-9+#.-]{2,15})\b/g)
                          ?.filter((k, i, arr) => arr.indexOf(k) === i && k.length > 2)
                          .slice(0, 15) || [];
                        setCv(prev => ({
                          ...prev,
                          targetJob: {
                            ...prev.targetJob,
                            jobDescription: val,
                            keyRequirements: keywords
                          }
                        }));
                      }}
                      placeholder="Paste the full job posting text here..."
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-200 leading-relaxed font-mono focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-300 block">
                      Target Keywords Identified ({cv.targetJob.keyRequirements?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.targetJob.keyRequirements?.map((req, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-green-400 font-mono">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: ATS Audit Deep-Dive */}
              {activeTab === 'atsAudit' && (
                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Comprehensive ATS Compatibility Audit
                      </h3>
                      <p className="text-xs text-zinc-400">Deep-dive breakdown into Taleo, Workday, and Greenhouse compliance criteria.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-mono font-bold border border-green-500/30">
                      Score: {atsResult.score}/100
                    </span>
                  </div>

                  <ATSScoreCard
                    atsResult={atsResult}
                    cv={cv}
                    onSelectTab={(tab) => setActiveTab(tab as EditorTab)}
                    onAddMissingSkill={handleAddMissingSkill}
                    onPolishSummary={handlePolishSummary}
                    isDetailedView={true}
                  />
                </div>
              )}

              {/* Tab 9: Design & ATS Template */}
              {activeTab === 'design' && (
                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-100">ATS Layout & Design Preferences</h3>
                    <p className="text-xs text-zinc-400">Choose universally recognized ATS formatting templates.</p>
                  </div>

                  {/* Template Picker */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">Select ATS Template</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'classic-ats', name: 'Classic ATS Standard', desc: '100% clean single-column format for Enterprise Taleo / Workday' },
                        { id: 'modern-tech', name: 'Modern Tech Minimalist', desc: 'Sleek spacing & section dividers for Greenhouse / Lever' },
                        { id: 'engineering-star', name: 'Engineering Impact (STAR)', desc: 'Optimized for quantified metrics and GitHub repositories' },
                        { id: 'compact-executive', name: 'Compact Executive', desc: 'High-density format fitting maximum experience on 1 page' },
                      ].map(tmpl => (
                        <div
                          key={tmpl.id}
                          onClick={() => updateDesignSettings('template', tmpl.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            cv.designSettings.template === tmpl.id
                              ? 'bg-green-500/10 border-green-500 text-zinc-100'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-xs font-bold block">{tmpl.name}</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">{tmpl.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography & Spacing Options with Active States */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">ATS Font Family</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sans', name: 'Arial / Helvetica', sub: 'Standard ATS' },
                          { id: 'serif', name: 'Georgia / Cambria', sub: 'Executive' },
                          { id: 'mono', name: 'Monospace', sub: 'Technical' },
                        ].map(f => {
                          const isFontActive = cv.designSettings.fontFamily === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => updateDesignSettings('fontFamily', f.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isFontActive
                                  ? 'bg-green-500/10 border-green-500 text-green-300 ring-1 ring-green-500/30'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold block">{f.name}</span>
                                {isFontActive && <Check className="h-3 w-3 text-green-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block">{f.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">Spacing & Density</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'compact', name: 'Compact', sub: 'Fit 1 Page' },
                          { id: 'normal', name: 'Balanced', sub: 'Standard' },
                          { id: 'spacious', sub: '2+ Pages', name: 'Spacious' },
                        ].map(d => {
                          const isDensityActive = cv.designSettings.spacing === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => updateDesignSettings('spacing', d.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isDensityActive
                                  ? 'bg-green-500/10 border-green-500 text-green-300 ring-1 ring-green-500/30'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold block">{d.name}</span>
                                {isDensityActive && <Check className="h-3 w-3 text-green-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block">{d.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Identity Photo Layout in Design Tab */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-zinc-300">Identity Photo Display & Shape</label>
                        <label className="text-[11px] text-zinc-400 font-medium cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={cv.designSettings.showPhoto !== false && Boolean(cv.personalInfo.photoUrl)}
                            onChange={(e) => {
                              updateDesignSettings('showPhoto', e.target.checked);
                              if (e.target.checked && !cv.personalInfo.photoUrl) {
                                handleSelectSamplePhoto(SAMPLE_TECH_AVATARS[0].url, SAMPLE_TECH_AVATARS[0].name);
                              }
                            }}
                            className="rounded border-zinc-700 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900 h-3.5 w-3.5"
                          />
                          <span>Render Photo on CV</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'circle', name: 'Circle', sub: 'Standard Avatar' },
                          { id: 'rounded', name: 'Rounded', sub: 'Modern Square' },
                          { id: 'square', name: 'Square', sub: 'Classic Frame' },
                        ].map(s => {
                          const isShapeActive = (cv.designSettings.photoShape || 'circle') === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => updateDesignSettings('photoShape', s.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isShapeActive
                                  ? 'bg-green-500/10 border-green-500 text-green-300 ring-1 ring-green-500/30'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold block">{s.name}</span>
                                {isShapeActive && <Check className="h-3 w-3 text-green-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block">{s.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live CV Document Preview (Cols 7-12) */}
          <div className={`lg:col-span-6 space-y-4 ${activePreviewMobile === 'editor' ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-32 space-y-3">
              {/* Document Status & Quick Print Banner */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs print:hidden shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-semibold text-zinc-200">Live ATS CV Preview</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                    {atsResult.score}/100 Score
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Download high-resolution ATS vector PDF"
                  >
                    {isDownloadingPDF ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                    title="Print / Save via browser dialog"
                  >
                    <Printer className="h-3 w-3 text-zinc-400" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet Container */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2 sm:p-4 overflow-x-auto shadow-2xl">
                <CVDocumentPreview ref={printRef} cv={cv} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Import File / Raw Text Modal */}
      <CVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(parsed) => {
          setCv(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              ...(parsed.personalInfo || {})
            },
            summary: parsed.summary || prev.summary,
            skills: {
              languages: parsed.skills?.languages?.length ? parsed.skills.languages : prev.skills.languages,
              frameworks: parsed.skills?.frameworks?.length ? parsed.skills.frameworks : prev.skills.frameworks,
              toolsAndDatabases: parsed.skills?.toolsAndDatabases?.length ? parsed.skills.toolsAndDatabases : prev.skills.toolsAndDatabases,
              cloudAndDevOps: parsed.skills?.cloudAndDevOps?.length ? parsed.skills.cloudAndDevOps : prev.skills.cloudAndDevOps,
              architectureAndPractices: prev.skills.architectureAndPractices,
              softSkills: prev.skills.softSkills
            },
            workExperience: parsed.workExperience?.length ? parsed.workExperience : prev.workExperience,
            education: parsed.education?.length ? parsed.education : prev.education,
            projects: parsed.projects?.length ? parsed.projects : prev.projects
          }));
        }}
      />

      {/* Roadmap Import Modal */}
      <RoadmapImportModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        onImportProjects={(projects, skills) => {
          setCv(prev => ({
            ...prev,
            projects: [...projects, ...prev.projects],
            skills: {
              ...prev.skills,
              frameworks: Array.from(new Set([...prev.skills.frameworks, ...skills]))
            }
          }));
        }}
      />
    </div>
  );
};
