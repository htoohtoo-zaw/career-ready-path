/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, Linkedin, FileText, CheckCircle2, ArrowRight, AlertCircle, Loader2, X, XCircle, User, GraduationCap, Award, Briefcase, Globe, Github, Twitter, Plus, Edit2, Trash2, Check, Settings, Sparkles, BookOpen, Clock, HeartHandshake, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { setAuthSession, getAuthSession, hasPermission, DEFAULT_NODES_BY_CATEGORY } from '../lib/learnerStore';
import { PREDEFINED_ROADMAP_NODES, CATEGORY_PRESET_NODES } from '../lib/roadmapPresets';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { addNotification } from '../lib/notificationsStore';
import { ROADMAP_POSITIONS } from '../lib/mentorRoadmapSync';
import { downloadMentorCV } from '../lib/cvDownload';
import { MentorPortalDashboard } from '../components/mentor/MentorPortalDashboard';

export const ApplyMentorPage: React.FC = () => {
  const navigate = useNavigate();

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('Frontend Developer');
  const [selectedTags, setSelectedTags] = useState<string[]>(['React', 'TypeScript']);
  const [submitted, setSubmitted] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Trustworthy Profile Setup States
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [educationBackground, setEducationBackground] = useState('');
  const [certification, setCertification] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Mentorship Program Offering States
  const [programTitle, setProgramTitle] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');

  // Portal tab: 'profile' | 'program' | 'roadmaps'
  const [activePortalTab, setActivePortalTab] = useState<'profile' | 'program' | 'roadmaps'>('profile');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Custom Roadmaps State
  const [isRoadmapFormOpen, setIsRoadmapFormOpen] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(null);
  const [roadmapsTick, setRoadmapsTick] = useState(0);
  const [rmTitle, setRmTitle] = useState('');
  const [rmCategory, setRmCategory] = useState('Frontend');
  const [rmDifficulty, setRmDifficulty] = useState('Beginner');
  const [rmWeeks, setRmWeeks] = useState(8);
  const [rmDescription, setRmDescription] = useState('');
  const [rmNodes, setRmNodes] = useState<{
    id: string;
    title: string;
    description: string;
    resources: { title: string; url: string; type: string }[];
  }[]>([]);

  const handleCategoryChange = (newCat: string) => {
    setRmCategory(newCat);
    if (!editingRoadmapId || rmNodes.length === 0) {
      const defaultNodes = CATEGORY_PRESET_NODES[newCat] || CATEGORY_PRESET_NODES['Engineering'];
      setRmNodes(defaultNodes);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn) return;

    const checkKycStatus = async () => {
      // 1. Check local applications cache
      const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
      let foundLocalApp = null;
      try {
        const localApps = JSON.parse(localAppsStr);
        foundLocalApp = localApps.find((app: any) => app.email?.toLowerCase() === session.email?.toLowerCase());
      } catch (e) {
        console.warn('Error parsing local applications cache:', e);
      }

      if (foundLocalApp) {
        setKycStatus(foundLocalApp.kycStatus);
        setRejectionReason(foundLocalApp.kycRejectionReason);
        if (foundLocalApp.kycStatus === 'pending') {
          setSubmitted(true);
        } else {
          setSubmitted(foundLocalApp.kycStatus === 'approved' || foundLocalApp.kycStatus === 'rejected');
        }
        if (foundLocalApp.bio) setBio(foundLocalApp.bio);
        if (foundLocalApp.linkedinUrl) setLinkedinUrl(foundLocalApp.linkedinUrl);
        if (foundLocalApp.experienceYears) setExperienceYears(foundLocalApp.experienceYears);
        if (foundLocalApp.specialization) setSpecialization(foundLocalApp.specialization);
        if (foundLocalApp.selectedTags) setSelectedTags(foundLocalApp.selectedTags);
        if (foundLocalApp.resumePath) {
          setResumePath(foundLocalApp.resumePath);
          setFileName(foundLocalApp.resumePath.split('/').pop()?.split('_').slice(1).join('_') || 'resume.pdf');
        }

        // Load trustworthy profile details from application object
        if (foundLocalApp.profilePicUrl) setProfilePicUrl(foundLocalApp.profilePicUrl);
        if (foundLocalApp.educationBackground) setEducationBackground(foundLocalApp.educationBackground);
        if (foundLocalApp.certification) setCertification(foundLocalApp.certification);
        if (foundLocalApp.workExperience) setWorkExperience(foundLocalApp.workExperience);
        if (foundLocalApp.githubUrl) setGithubUrl(foundLocalApp.githubUrl);
        if (foundLocalApp.twitterUrl) setTwitterUrl(foundLocalApp.twitterUrl);
        if (foundLocalApp.websiteUrl) setWebsiteUrl(foundLocalApp.websiteUrl);
        if (foundLocalApp.programTitle) setProgramTitle(foundLocalApp.programTitle);
        if (foundLocalApp.programDescription) setProgramDescription(foundLocalApp.programDescription);
        if (foundLocalApp.googleFormUrl) setGoogleFormUrl(foundLocalApp.googleFormUrl);
        return;
      }

      // 2. Check Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: mentorProfile, error } = await (supabase as any)
              .from('mentor_profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();

            if (!error && mentorProfile) {
              setKycStatus(mentorProfile.kyc_status);
              setRejectionReason(mentorProfile.kyc_rejection_reason);
              if (mentorProfile.kyc_status === 'pending') {
                setSubmitted(true);
              } else {
                setSubmitted(mentorProfile.kyc_status === 'approved' || mentorProfile.kyc_status === 'rejected');
              }
              if (mentorProfile.bio) setBio(mentorProfile.bio);
              if (mentorProfile.linkedin_url) setLinkedinUrl(mentorProfile.linkedin_url);
              if (mentorProfile.experience_years) setExperienceYears(mentorProfile.experience_years);
              if (mentorProfile.specialization) setSpecialization(mentorProfile.specialization);
              if (mentorProfile.tags) setSelectedTags(mentorProfile.tags);
              if (mentorProfile.resume_path) {
                setResumePath(mentorProfile.resume_path);
                setFileName(mentorProfile.resume_path.split('/').pop()?.split('_').slice(1).join('_') || 'resume.pdf');
              }
              
              // Cache locally
              try {
                const pendingApplication = {
                  userId: user.id,
                  email: session.email,
                  fullName: session.name || session.email?.split('@')[0] || 'Pending Mentor',
                  bio: mentorProfile.bio,
                  linkedinUrl: mentorProfile.linkedin_url,
                  experienceYears: mentorProfile.experience_years,
                  resumePath: mentorProfile.resume_path,
                  specialization: mentorProfile.specialization,
                  selectedTags: mentorProfile.tags,
                  kycStatus: mentorProfile.kyc_status,
                  kycRejectionReason: mentorProfile.kyc_rejection_reason,
                  submittedAt: mentorProfile.kyc_submitted_at || new Date().toISOString()
                };
                localStorage.setItem('crp_local_mentor_applications', JSON.stringify([pendingApplication]));
              } catch (e) {}
              return;
            }
          }
        } catch (dbErr: any) {
          console.warn('Could not query mentor profile from DB:', dbErr.message);
        }
      }

      // 3. Fallback: If no application is found anywhere, leave the form open to fill.
      // After registration state, we automatically keep the KYC form open for them.
      if (session.role === 'pending_mentor') {
        setSubmitted(false);
        setKycStatus(null);
      } else if (session.role === 'approved_mentor' || session.role === 'mentor') {
        setKycStatus('approved');
        setSubmitted(true);
      } else {
        setSubmitted(false);
        setKycStatus(null);
      }
    };

    checkKycStatus();
  }, []);

  // CV Upload States
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [resumePath, setResumePath] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customTagInput, setCustomTagInput] = useState('');
  const tagsList = ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Next.js', 'PostgreSQL', 'AWS', 'System Design', 'Career Coaching', 'Figma', 'Python', 'Docker', 'GraphQL', 'Cybersecurity'];
  const rolesList = ROADMAP_POSITIONS;

  const toggleTag = (tag: string) => {
    if (selectedTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t.toLowerCase() !== tag.toLowerCase()));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (selectedTags.length > 1) {
      setSelectedTags(selectedTags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()));
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    setErrorMsg(null);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setUploading(true);

    // Convert file to base64 for local storage safety fallback
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      try {
        localStorage.setItem(`cv_base64_${selectedFile.name}`, base64String);
        if (session.email) {
          localStorage.setItem(`cv_base64_${session.email.toLowerCase()}`, base64String);
        }
        if (session.userId) {
          localStorage.setItem(`cv_base64_${session.userId}`, base64String);
        }
      } catch (e) {
        console.warn('LocalStorage base64 quota exceeded, stored in memory only');
      }
    };
    reader.readAsDataURL(selectedFile);

    // Try uploading to Supabase Storage bucket 'kyc-documents'
    let path = `kyc-fallbacks/${Date.now()}_${selectedFile.name}`;
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'offline_user';
        const filePath = `${userId}/${Date.now()}_${selectedFile.name}`;
        
        // Ensure bucket exists or proceed with upload
        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, selectedFile, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          path = data.path;
        } else {
          console.warn('Storage upload error (proceeding with fallback path):', error?.message);
          path = `kyc-fallbacks/${filePath}`;
        }
      } catch (err: any) {
        console.warn('Supabase storage not accessible, using fallback:', err.message);
      }
    }
    
    setResumePath(path);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resumePath) {
      setErrorMsg('Please upload your resume / CV PDF before submitting.');
      return;
    }

    setUploading(true);
    const session = getAuthSession();
    
    // Save locally
    const fallbackId = session.userId || 'user_' + Date.now();
    setAuthSession('pending_mentor', session.email, session.name || session.email?.split('@')[0] || 'Mentor', fallbackId);

    // Prepare profile info to store in local storage registry
    try {
      const pendingApplication = {
        userId: fallbackId,
        email: session.email,
        fullName: session.name || session.email?.split('@')[0] || 'Pending Mentor',
        bio,
        linkedinUrl,
        experienceYears,
        resumePath,
        specialization,
        selectedTags,
        kycStatus: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
      const localApps = JSON.parse(localAppsStr);
      const filtered = localApps.filter((app: any) => app.email?.toLowerCase() !== session.email?.toLowerCase());
      filtered.push(pendingApplication);
      localStorage.setItem('crp_local_mentor_applications', JSON.stringify(filtered));

      // Also save to our main registry
      const registryStr = localStorage.getItem('career_ready_registry') || '{}';
      const registry: Record<string, any> = JSON.parse(registryStr);
      registry[(session.email || '').toLowerCase()] = { role: 'pending_mentor', fullName: pendingApplication.fullName, userId: session.userId };
      localStorage.setItem('career_ready_registry', JSON.stringify(registry));
    } catch (err) {
      console.warn('Local storage write failed:', err);
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Update the user role in profiles to pending_mentor
          await (supabase as any)
            .from('profiles')
            .update({ role: 'pending_mentor' })
            .eq('id', user.id);

          // 2. Insert or update mentor_profiles table
          const { error: mentorErr } = await (supabase as any)
            .from('mentor_profiles')
            .upsert({
              user_id: user.id,
              bio,
              linkedin_url: linkedinUrl,
              experience_years: experienceYears,
              resume_path: resumePath,
              kyc_status: 'pending',
              kyc_submitted_at: new Date().toISOString(),
              kyc_rejection_reason: null
            }, { onConflict: 'user_id' });

          if (mentorErr) throw mentorErr;

          // 3. Insert user permissions or notify Admin
          await addNotification(
            'New Mentor KYC Application',
            `${session.name || user.email} applied as ${specialization}. Professional credentials are ready for your review.`,
            'kyc',
            null // Null targets all admins / global system feed
          );
        }
      } catch (err: any) {
        console.warn('Database write failed, fallback mechanism active:', err.message);
      }
    }

    // Still send notification to local state to make sure admin views it instantly
    await addNotification(
      'New Mentor KYC Application',
      `${session.name || session.email} applied as ${specialization}. Professional credentials are ready for your review.`,
      'kyc',
      null
    );

    setUploading(false);
    setKycStatus('pending');
    setSubmitted(true);
    setIsEditing(false);
  };


  const session = getAuthSession();
  const isLoggedIn = session.isLoggedIn;

  if (isLoggedIn && (kycStatus === "approved" || session.role === "approved_mentor" || session.role === "mentor") && !isEditing) {
    return (
      <div className="py-8 md:py-12 bg-zinc-950 min-h-screen text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MentorPortalDashboard onEditKyc={() => setIsEditing(true)} />
        </div>
      </div>
    );
  }


  return (
    <div className="py-12 md:py-20 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Mentor KYC Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Apply as an Industry Mentor
          </h1>
          <p className="text-base text-zinc-400">
            Submit your professional credentials and CV for admin review. Once approved, your profile goes live on targeted career roadmaps.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-6 shadow-2xl animate-in fade-in duration-350">
            <div className="h-16 w-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 mx-auto animate-pulse">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              To apply as an industry mentor and submit your KYC credentials, please sign up or log in to your account first. This allows us to link your application securely to your profile.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/login?intent=mentor"
                className="px-6 py-3 rounded-full bg-green-600 text-sm font-semibold text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
              >
                Log In to Account
              </Link>
              <Link
                to="/auth/signup?intent=mentor"
                className="px-6 py-3 rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white transition-colors border border-zinc-700"
              >
                Sign Up as Mentor
              </Link>
            </div>
          </div>
        ) : (kycStatus === "pending" || submitted) && !isEditing ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your Application is Under Review</h2>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Thank you for stepping up to guide IT learners! Our admin team is reviewing your resume and LinkedIn profile. You will receive an email confirmation once approved.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
              >
                View / Edit Form
              </button>
              <Link
                to="/"
                className="px-6 py-3 rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white transition-colors border border-zinc-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-6 shadow-2xl">
            {isEditing && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 flex-wrap gap-2">
                <span className="text-sm font-semibold text-green-400">
                  {kycStatus === 'approved' ? 'Viewing Approved Application' : 'Viewing Pending Application'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadMentorCV({
                      fullName: session.name,
                      email: session.email,
                      specialization,
                      bio,
                      linkedinUrl,
                      resumePath: resumePath || fileName,
                      educationBackground,
                      workExperience,
                      certification,
                      selectedTags
                    })}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-green-400 hover:text-green-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Download CV (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Back to Status
                  </button>
                </div>
              </div>
            )}

            {kycStatus === 'rejected' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex gap-3 items-start animate-in slide-in-from-top-2 duration-200">
                <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Application Declined</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {rejectionReason || 'Please review your bio, resume, or LinkedIn link. Make sure they meet professional industry guidelines.'}
                  </p>
                  <p className="text-xs text-green-400 mt-2 font-medium">You can correct the details below and re-submit for review.</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Specialization (Target Track)
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-medium text-zinc-100 focus:outline-none focus:border-green-500"
              >
                {rolesList.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                LinkedIn Profile URL <span className="text-green-500">*</span>
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Years of Experience <span className="text-green-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">⏳</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={experienceYears}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) > 0) setExperienceYears(val);
                  }}
                  placeholder="e.g. 5"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Resume / CV Upload (PDF, max 5 MB) <span className="text-green-500">*</span>
              </label>
              
              {errorMsg && (
                <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />

              <div
                onClick={handleFileSelectClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-zinc-950/50 group ${
                  isDragging
                    ? 'border-green-500 bg-green-500/5'
                    : fileName
                    ? 'border-green-500/40 bg-zinc-900/60'
                    : 'border-zinc-800 hover:border-green-500/50 hover:bg-zinc-900/20'
                }`}
              >
                {uploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 text-green-400 mx-auto animate-spin" />
                    <p className="text-sm font-medium text-zinc-200">Processing resume...</p>
                  </div>
                ) : fileName ? (
                  <div className="space-y-3">
                    <FileText className="h-8 w-8 text-green-400 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-white">{fileName}</p>
                      <p className="text-xs text-zinc-400">Click or drag &amp; drop to replace CV</p>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadMentorCV({
                            fullName: session.name,
                            email: session.email,
                            specialization,
                            bio,
                            linkedinUrl,
                            resumePath: resumePath || fileName,
                            educationBackground,
                            workExperience,
                            certification,
                            selectedTags
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all shadow-md shadow-green-600/10 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Download CV (PDF)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-zinc-500 group-hover:text-green-400 mx-auto mb-1 transition-colors" />
                    <p className="text-sm font-medium text-zinc-300">Click to browse or drag &amp; drop your resume PDF</p>
                    <p className="text-xs text-zinc-500">Only PDF files are supported, up to 5 MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Mentor Bio (50–500 characters) <span className="text-green-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                min-length={50}
                max-length={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your experience, what topics you enjoy mentoring, and your mentorship style..."
                className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Expertise Tags Input & Quick Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Expertise Tags <span className="text-green-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              {/* Active Selected Tags Display */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  Active Selected Tags:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic">
                      No tags selected. Add custom tags below or pick from quick presets.
                    </span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-green-500/15 text-green-300 border border-green-500/30"
                      >
                        <span className="text-green-400">✓</span>
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          title="Remove tag"
                          className="hover:text-white p-0.5 rounded hover:bg-green-500/20 text-green-400 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Custom Input Field */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Type any custom expertise tag (e.g. Docker, Rust, Kubernetes, CI/CD)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  disabled={!customTagInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-md shadow-green-600/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Tag
                </button>
              </div>

              {/* Predefined Quick Tabs */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-zinc-400 block mb-2">
                  Quick Select Predefined Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag) => {
                    const isSelected = selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-green-600/20 border border-green-500 text-green-300 font-semibold'
                            : 'bg-zinc-950 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 text-base font-semibold text-white hover:bg-green-500 shadow-lg shadow-green-600/20 transition-all cursor-pointer"
              >
                Submit KYC for Admin Review
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-center text-zinc-500">
              By submitting, you confirm that your credentials are accurate. Admin decisions are typically processed within 24–48 hours.
            </p>

          </form>
        )}

        {/* Public Profile Preview Modal */}
        {showPreviewModal && (
          <div 
            id="mentor-preview-modal" 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPreviewModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
          >
            <div id="mentor-preview-card" className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 cursor-default">
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  <h3 className="text-base font-bold text-white">Trustworthy Mentor Profile (Live Preview)</h3>
                </div>
                <button
                  type="button"
                  id="close-preview-modal-btn"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body / Scrollable Content */}
              <div className="p-6 sm:p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* Profile Main Intro Card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-zinc-850 pb-6 text-center sm:text-left">
                  <div className="h-20 w-20 rounded-full bg-zinc-800 border-2 border-green-500/30 overflow-hidden flex items-center justify-center font-bold text-3xl text-green-400 shrink-0 shadow-lg">
                    {profilePicUrl ? (
                      <img src={profilePicUrl} alt={session.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (session.name || 'M')[0].toUpperCase()
                    )}
                  </div>
                  <div className="space-y-2.5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                      <h4 className="text-xl font-extrabold text-white">{session.name || 'Your Name'}</h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 self-center">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Industry Mentor
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400">
                      Specializes in: <span className="text-green-400 font-semibold">{specialization || 'Not specified'}</span>
                    </p>
                    <p className="text-xs text-zinc-500">{session.email}</p>
                    
                    {/* Social Handles Icons Bar */}
                    <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-1.5">
                      {linkedinUrl && (
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="LinkedIn Profile">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="GitHub Profile">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {twitterUrl && (
                        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Twitter / X">
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {websiteUrl && (
                        <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Personal Website">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* About & Bio */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Professional Bio</h5>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 border border-zinc-850 p-4 rounded-2xl italic">
                    "{bio || 'No bio written yet. Fill out your background under the Profile tab!'}"
                  </p>
                </div>

                {/* Tags List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Core Expertise Tags</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.length > 0 ? (
                      selectedTags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-600">No tags chosen.</span>
                    )}
                  </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Experience Card */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <Briefcase className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Experience</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {workExperience || 'Not specified yet.'}
                    </p>
                  </div>

                  {/* Education Card */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <GraduationCap className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Education</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {educationBackground || 'Not specified yet.'}
                    </p>
                  </div>

                  {/* Certifications Card */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <Award className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Certificates</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {certification || 'Not specified yet.'}
                    </p>
                  </div>
                </div>

                {/* Mentorship Program Offerings Section */}
                <div className="border-t border-zinc-850 pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5 text-green-400" />
                    <h5 className="text-sm font-bold text-white">Mentorship Program Offerings</h5>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 space-y-4">
                    <div>
                      <h6 className="text-sm font-bold text-white">{programTitle || 'Standard Mentorship offering'}</h6>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {programDescription || 'Apply to gain exclusive access to private syllabus guidance, weekly reviews, and career counseling.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between flex-wrap gap-4">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Link: {googleFormUrl ? <span className="text-green-500 truncate inline-block max-w-[200px] align-bottom">{googleFormUrl}</span> : 'No active external application link configured.'}
                      </span>
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-full bg-green-600/30 text-green-400 border border-green-500/20 text-xs font-semibold cursor-not-allowed"
                      >
                        Request Mentorship (Preview)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
                <button
                  type="button"
                  id="close-preview-modal-footer-btn"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
