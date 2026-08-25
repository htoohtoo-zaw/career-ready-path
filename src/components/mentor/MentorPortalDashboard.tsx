/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Sparkles,
  HeartHandshake,
  User,
  Plus,
  Edit2,
  Edit3,
  Trash2,
  FileText,
  Users,
  Compass,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Twitter,
  Linkedin,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Settings,
  AlertCircle,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Radio,
  ExternalLink,
  Mail,
  Clock,
  XCircle,
  Send
} from 'lucide-react';
import { getAuthSession, hasPermission } from '../../lib/learnerStore';
import {
  getAllMentorshipApplications,
  getMentors,
  MentorshipApplication,
  updateMentorshipApplicationStatus,
  hydrateMentorshipDataFromSupabase
} from '../../lib/mentorReviewStore';
import { CATEGORY_PRESET_NODES, PREDEFINED_ROADMAP_NODES } from '../../lib/roadmapPresets';
import { ROADMAP_POSITIONS } from '../../lib/mentorRoadmapSync';
import { downloadMentorCV } from '../../lib/cvDownload';
import { addNotification } from '../../lib/notificationsStore';
import { resetScrollPosition } from '../layout/ScrollToTop';
import {
  pushMentorProfileToSupabase,
  pushCreatedRoadmapToSupabase
} from '../../lib/supabase/dataSync';
import { isSupabaseConfigured } from '../../lib/supabase/client';

interface MentorPortalDashboardProps {
  onEditKyc?: () => void;
}

export const MentorPortalDashboard: React.FC<MentorPortalDashboardProps> = ({ onEditKyc }) => {
  const session = getAuthSession();

  // Active Tab: 'tracks' | 'program' | 'profile'
  const [activeTab, setActiveTab] = useState<'tracks' | 'program' | 'profile' | 'requests'>('tracks');

  useEffect(() => {
    resetScrollPosition();
  }, [activeTab]);

  // Trustworthy Profile states
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [specialization, setSpecialization] = useState('Frontend Developer');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [educationBackground, setEducationBackground] = useState('');
  const [certification, setCertification] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['React', 'TypeScript']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [resumePath, setResumePath] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Mentee Applications
  const [mentorApps, setMentorApps] = useState<MentorshipApplication[]>([]);
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  // Mentorship Program states
  const [programTitle, setProgramTitle] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [isProgramPublished, setIsProgramPublished] = useState<boolean>(true);

  // Roadmaps CRUD state
  const [mentorRoadmaps, setMentorRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any | null>(null);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(null);
  const [roadmapsTick, setRoadmapsTick] = useState(0);

  // Roadmap Form state
  const [rmTitle, setRmTitle] = useState('');
  const [rmCategory, setRmCategory] = useState('Engineering');
  const [rmDifficulty, setRmDifficulty] = useState('beginner');
  const [rmWeeks, setRmWeeks] = useState(12);
  const [rmDescription, setRmDescription] = useState('');
  const [rmNodes, setRmNodes] = useState<{
    id: string;
    title: string;
    description: string;
    resources: { title: string; url: string; type: string }[];
  }[]>([]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const tagsList = [
    'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Next.js',
    'PostgreSQL', 'AWS', 'System Design', 'Career Coaching',
    'Figma', 'Python', 'Docker', 'GraphQL', 'Cybersecurity'
  ];

  // Load Initial Mentor Data
  useEffect(() => {
    if (!session.isLoggedIn) return;

    // 1. Load application & profile details
    const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    let foundApp: any = null;
    try {
      const apps = JSON.parse(localAppsStr);
      foundApp = apps.find((a: any) =>
        a.userId === session.userId || a.email?.toLowerCase() === session.email?.toLowerCase()
      );
    } catch (e) {}

    const customProfileStr = localStorage.getItem(`crp_mentor_profile_details_${session.userId}`);
    let customProfile: any = null;
    try {
      if (customProfileStr) customProfile = JSON.parse(customProfileStr);
    } catch (e) {}

    const merged = { ...(foundApp || {}), ...(customProfile || {}) };

    if (merged.profilePicUrl) setProfilePicUrl(merged.profilePicUrl);
    if (merged.specialization) setSpecialization(merged.specialization);
    if (merged.bio) setBio(merged.bio);
    if (merged.linkedinUrl) setLinkedinUrl(merged.linkedinUrl);
    if (merged.githubUrl) setGithubUrl(merged.githubUrl);
    if (merged.twitterUrl) setTwitterUrl(merged.twitterUrl);
    if (merged.websiteUrl) setWebsiteUrl(merged.websiteUrl);
    if (merged.educationBackground) setEducationBackground(merged.educationBackground);
    if (merged.certification) setCertification(merged.certification);
    if (merged.workExperience) setWorkExperience(merged.workExperience);
    if (merged.selectedTags && Array.isArray(merged.selectedTags) && merged.selectedTags.length > 0) {
      setSelectedTags(merged.selectedTags);
    }
    if (merged.resumePath) setResumePath(merged.resumePath);
    if (merged.programTitle) setProgramTitle(merged.programTitle);
    if (merged.programDescription) setProgramDescription(merged.programDescription);
    if (merged.googleFormUrl) setGoogleFormUrl(merged.googleFormUrl);
    if (merged.isProgramPublished !== undefined) {
      setIsProgramPublished(Boolean(merged.isProgramPublished));
    } else if (merged.programTitle || merged.googleFormUrl) {
      setIsProgramPublished(true);
    } else {
      setIsProgramPublished(true);
    }

    // 2. Load custom roadmaps
    loadRoadmaps();
  }, [session.userId, session.email, roadmapsTick]);

  const loadRoadmaps = () => {
    const allStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    try {
      const all = JSON.parse(allStr);
      const mine = all.filter((rm: any) => rm.mentorId === session.userId || rm.mentorEmail === session.email);
      setMentorRoadmaps(mine);
      if (mine.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(mine[0]);
      }
    } catch (e) {
      setMentorRoadmaps([]);
    }
  };

  const loadMentorApps = () => {
    if (!session.isLoggedIn) return;
    const allApps = getAllMentorshipApplications();
    const allMentors = getMentors();
    const myProfile = allMentors.find(
      m => m.email?.toLowerCase() === session.email?.toLowerCase() ||
           m.name === session.name ||
           (session.userId && m.id === session.userId)
    );
    
    const mine = allApps.filter(app => {
      if (myProfile && app.mentorId === myProfile.id) return true;
      if (session.userId && app.mentorId === session.userId) return true;
      if (app.mentorName === session.name) return true;
      return false;
    });
    setMentorApps(mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadMentorApps();
    if (isSupabaseConfigured()) {
      hydrateMentorshipDataFromSupabase(session.userId).then(() => loadMentorApps());
    }
    const handleAppUpdate = () => loadMentorApps();
    window.addEventListener('crp_mentorship_applications_updated', handleAppUpdate);
    return () => window.removeEventListener('crp_mentorship_applications_updated', handleAppUpdate);
  }, [session.isLoggedIn, session.email, session.name, session.userId]);

  // Accept mentorship application & launch prefilled email composer
  const handleAcceptAndEmail = (app: MentorshipApplication) => {
    // 1. Update persistent store status to accepted
    updateMentorshipApplicationStatus(app.id, 'accepted');

    // 2. Dispatch real-time notification to the learner
    addNotification(
      'Mentorship Application Accepted! 🎉',
      `${session.name || 'Your mentor'} has accepted your 1-on-1 mentorship application for "${app.roadmapTrack}". Check your email to begin your cohort journey!`,
      'mentor_announcement',
      app.learnerId
    );

    // 3. Local mentor notification & feedback
    setSavedSuccessMsg(`Accepted mentorship request from ${app.learnerName}! Opening email composer...`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);

    // 4. Reload applications state
    loadMentorApps();

    // 5. Pre-fill detailed email subject & body
    const subject = encodeURIComponent(`Mentorship Application Accepted: ${app.roadmapTrack} | Career Ready Path`);
    const body = encodeURIComponent(
      `Hi ${app.learnerName},\n\n` +
      `Great news! I am delighted to accept your 1-on-1 mentorship application for the "${app.roadmapTrack}" track on Career Ready Path.\n\n` +
      `I have reviewed your learning goals:\n` +
      `"${app.goals}"\n\n` +
      `To kick things off, let's schedule our introductory kickoff call to align on your weekly milestones and preferred pace (${app.preferredPace}).\n\n` +
      `Please reply with your current availability and timezone over the coming week.\n\n` +
      `Looking forward to collaborating and helping you accelerate your career goals!\n\n` +
      `Best regards,\n${session.name || 'Your Mentor'}\nCareer Ready Path Mentorship`
    );

    // Open mail client
    window.location.href = `mailto:${app.learnerEmail}?subject=${subject}&body=${body}`;
  };

  // Decline application with confirmation
  const handleDeclineRequest = (app: MentorshipApplication) => {
    if (!window.confirm(`Are you sure you want to decline the mentorship request from ${app.learnerName}?`)) return;
    updateMentorshipApplicationStatus(app.id, 'rejected');
    addNotification(
      'Mentorship Application Update',
      `Your mentorship application for "${app.roadmapTrack}" could not be accepted at this time due to mentor capacity.`,
      'mentor_announcement',
      app.learnerId
    );
    setSavedSuccessMsg(`Application from ${app.learnerName} marked as declined.`);
    setTimeout(() => setSavedSuccessMsg(null), 3500);
    loadMentorApps();
  };

  // Tag Handlers
  const toggleTag = (tag: string) => {
    if (selectedTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t.toLowerCase() !== tag.toLowerCase()));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
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

  const removeTag = (tagToRemove: string) => {
    if (selectedTags.length > 1) {
      setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
    }
  };

  // Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      userId: session.userId,
      email: session.email,
      fullName: session.name || 'Mentor',
      profilePicUrl,
      specialization,
      bio,
      educationBackground,
      certification,
      workExperience,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      websiteUrl,
      selectedTags,
      programTitle,
      programDescription,
      googleFormUrl,
      isProgramPublished,
      resumePath,
    };

    localStorage.setItem(`crp_mentor_profile_details_${session.userId}`, JSON.stringify(details));

    // Sync back into main applications array
    const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    try {
      const localApps = JSON.parse(localAppsStr);
      const idx = localApps.findIndex((app: any) =>
        app.userId === session.userId || app.email?.toLowerCase() === session.email?.toLowerCase()
      );
      if (idx >= 0) {
        localApps[idx] = { ...localApps[idx], ...details, kycStatus: 'approved' };
      } else {
        localApps.push({ ...details, kycStatus: 'approved', submittedAt: new Date().toISOString() });
      }
      localStorage.setItem('crp_local_mentor_applications', JSON.stringify(localApps));
    } catch (err) {}

    // Multi-device sync to Supabase
    if (isSupabaseConfigured() && session.userId) {
      pushMentorProfileToSupabase({
        userId: session.userId,
        email: session.email,
        fullName: session.name || 'Mentor',
        profilePicUrl,
        specialization,
        bio,
        educationBackground,
        certification,
        workExperience,
        linkedinUrl,
        githubUrl,
        twitterUrl,
        websiteUrl,
        selectedTags,
        programTitle,
        programDescription,
        googleFormUrl,
        isProgramPublished,
        resumePath,
        kycStatus: 'approved'
      }).catch((e) => console.warn('Supabase mentor push notice:', e));
    }

    addNotification('Profile Saved! 👤', 'Your trustworthy mentor profile details have been synchronized.', 'system', session.userId);
    setSavedSuccessMsg('Profile details saved successfully!');
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  // Toggle Program Publish Status directly
  const handleToggleProgramPublish = (overrideState?: boolean) => {
    const nextState = overrideState !== undefined ? overrideState : !isProgramPublished;
    setIsProgramPublished(nextState);

    const customProfileStr = localStorage.getItem(`crp_mentor_profile_details_${session.userId}`);
    let customProfile: any = {};
    try {
      if (customProfileStr) customProfile = JSON.parse(customProfileStr);
    } catch (e) {}

    const updatedDetails = {
      ...customProfile,
      userId: session.userId,
      email: session.email,
      fullName: session.name || 'Mentor',
      profilePicUrl,
      specialization,
      bio,
      educationBackground,
      certification,
      workExperience,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      websiteUrl,
      selectedTags,
      programTitle,
      programDescription,
      googleFormUrl,
      isProgramPublished: nextState,
      resumePath,
    };

    localStorage.setItem(`crp_mentor_profile_details_${session.userId}`, JSON.stringify(updatedDetails));

    const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    try {
      const localApps = JSON.parse(localAppsStr);
      const idx = localApps.findIndex((app: any) =>
        app.userId === session.userId || app.email?.toLowerCase() === session.email?.toLowerCase()
      );
      if (idx >= 0) {
        localApps[idx] = { ...localApps[idx], ...updatedDetails, kycStatus: 'approved' };
      } else {
        localApps.push({ ...updatedDetails, kycStatus: 'approved', submittedAt: new Date().toISOString() });
      }
      localStorage.setItem('crp_local_mentor_applications', JSON.stringify(localApps));
    } catch (err) {}

    if (nextState) {
      addNotification('Program Published! 🚀', 'Your mentorship cohort offering is now live and publicly visible on your mentor profile.', 'system', session.userId);
      setSavedSuccessMsg('Mentorship Program Published! Live on your public profile.');
    } else {
      addNotification('Program Unpublished 🔒', 'Your mentorship cohort is now unpublished (Draft mode) and hidden from learners.', 'system', session.userId);
      setSavedSuccessMsg('Mentorship Program Unpublished (Hidden from public learners).');
    }
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  // Save Mentorship Program
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      userId: session.userId,
      email: session.email,
      fullName: session.name || 'Mentor',
      profilePicUrl,
      specialization,
      bio,
      educationBackground,
      certification,
      workExperience,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      websiteUrl,
      selectedTags,
      programTitle,
      programDescription,
      googleFormUrl,
      isProgramPublished,
      resumePath,
    };

    localStorage.setItem(`crp_mentor_profile_details_${session.userId}`, JSON.stringify(details));

    const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    try {
      const localApps = JSON.parse(localAppsStr);
      const idx = localApps.findIndex((app: any) =>
        app.userId === session.userId || app.email?.toLowerCase() === session.email?.toLowerCase()
      );
      if (idx >= 0) {
        localApps[idx] = { ...localApps[idx], ...details, kycStatus: 'approved' };
      } else {
        localApps.push({ ...details, kycStatus: 'approved', submittedAt: new Date().toISOString() });
      }
      localStorage.setItem('crp_local_mentor_applications', JSON.stringify(localApps));
    } catch (err) {}

    if (isProgramPublished) {
      addNotification('Mentorship Cohort Active! 🎓', 'Your Google Form application link and program offerings are now published and active.', 'system', session.userId);
      setSavedSuccessMsg('Mentorship Program published and saved successfully!');
    } else {
      addNotification('Program Saved as Draft 📝', 'Your mentorship cohort details were saved in draft mode (Unpublished).', 'system', session.userId);
      setSavedSuccessMsg('Mentorship Program saved as Unpublished Draft (Hidden from learners).');
    }
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  // Open Roadmap Modal for Creating
  const handleOpenCreateRoadmap = () => {
    setEditingRoadmapId(null);
    setRmTitle(`${specialization} Masterclass Track`);
    setRmCategory('Engineering');
    setRmDifficulty('beginner');
    setRmWeeks(12);
    setRmDescription(`A comprehensive sequential curriculum curated by ${session.name || 'Mentor'} to master industry best practices.`);
    const defaultNodes = CATEGORY_PRESET_NODES['Engineering'] || [];
    setRmNodes(defaultNodes);
    setIsRoadmapModalOpen(true);
  };

  // Open Roadmap Modal for Editing
  const handleOpenEditRoadmap = (rm: any) => {
    setEditingRoadmapId(rm.id);
    setRmTitle(rm.title);
    setRmCategory(rm.category || 'Engineering');
    setRmDifficulty(rm.difficulty || 'beginner');
    setRmWeeks(rm.estimated_weeks || 12);
    setRmDescription(rm.description || '');

    const customKey = `crp_roadmap_nodes_${rm.slug}`;
    const customStr = localStorage.getItem(customKey);
    let loadedNodes = [];
    if (customStr) {
      try {
        loadedNodes = JSON.parse(customStr);
      } catch (e) {}
    }
    if (!loadedNodes || loadedNodes.length === 0) {
      loadedNodes = PREDEFINED_ROADMAP_NODES[rm.slug] || CATEGORY_PRESET_NODES[rm.category] || CATEGORY_PRESET_NODES['Engineering'];
    }
    setRmNodes(loadedNodes);
    setIsRoadmapModalOpen(true);
  };

  // Save Roadmap & Nodes
  const handleSaveRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rmTitle.trim() || !rmDescription.trim()) {
      alert('Please enter a track title and overview description.');
      return;
    }

    const allStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    let allList = [];
    try { allList = JSON.parse(allStr); } catch (e) {}

    const slug = rmTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const oldRoadmap = editingRoadmapId ? allList.find((x: any) => x.id === editingRoadmapId) : null;
    const oldSlug = oldRoadmap ? oldRoadmap.slug : null;

    if (editingRoadmapId) {
      allList = allList.map((x: any) => {
        if (x.id === editingRoadmapId) {
          return {
            ...x,
            title: rmTitle,
            slug,
            category: rmCategory,
            difficulty: rmDifficulty,
            estimated_weeks: rmWeeks,
            description: rmDescription,
            mentorId: session.userId,
            mentorName: session.name || 'Verified Mentor',
            mentorEmail: session.email,
            mentorPic: profilePicUrl,
          };
        }
        return x;
      });
    } else {
      const newRm = {
        id: 'roadmap_' + Date.now(),
        title: rmTitle,
        slug,
        category: rmCategory,
        difficulty: rmDifficulty,
        estimated_weeks: rmWeeks,
        description: rmDescription,
        mentorId: session.userId,
        mentorName: session.name || 'Verified Mentor',
        mentorEmail: session.email,
        mentorPic: profilePicUrl,
      };
      allList.push(newRm);
    }

    localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(allList));
    localStorage.setItem(`crp_roadmap_nodes_${slug}`, JSON.stringify(rmNodes));

    if (oldSlug && oldSlug !== slug) {
      localStorage.removeItem(`crp_roadmap_nodes_${oldSlug}`);
    }

    addNotification(
      editingRoadmapId ? 'Roadmap Updated 🗺️' : 'Track Published 🗺️',
      `Curriculum for "${rmTitle}" with ${rmNodes.length} milestone modules is saved.`,
      'system',
      session.userId
    );

    setIsRoadmapModalOpen(false);
    setRoadmapsTick(prev => prev + 1);
  };

  // Delete Roadmap
  const handleDeleteRoadmap = (rmId: string, rmSlug: string) => {
    const allStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    try {
      const all = JSON.parse(allStr);
      const filtered = all.filter((x: any) => x.id !== rmId);
      localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(filtered));
      if (rmSlug) {
        localStorage.removeItem(`crp_roadmap_nodes_${rmSlug}`);
      }
      addNotification('Track Deleted 🗺️', 'The selected roadmap track was removed.', 'system', session.userId);
    } catch (e) {}
    setDeletingRoadmapId(null);
    setRoadmapsTick(prev => prev + 1);
  };

  const totalMilestones = mentorRoadmaps.reduce((acc, curr) => {
    const customKey = `crp_roadmap_nodes_${curr.slug}`;
    const customStr = localStorage.getItem(customKey);
    if (customStr) {
      try {
        return acc + JSON.parse(customStr).length;
      } catch (e) {}
    }
    return acc + 6;
  }, 0);

  return (
    <div id="mentor-portal-dashboard" className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Confirmation Alert */}
      {savedSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-green-500/40 text-green-300 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Mentor Profile Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-zinc-800 border-2 border-green-500/30 overflow-hidden flex items-center justify-center font-bold text-2xl text-green-400 shadow-lg">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt={session.name || 'Mentor'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (session.name || 'M')[0].toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-zinc-900 flex items-center justify-center text-zinc-950" title="KYC Verified Mentor">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {session.name || 'Verified Mentor'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Mentor
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                Domain Specialization: <span className="text-green-400 font-semibold">{specialization}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono pt-1">
                <span>{session.email}</span>
                {linkedinUrl && (
                  <>
                    <span>•</span>
                    <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline flex items-center gap-1">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  </>
                )}
                {githubUrl && (
                  <>
                    <span>•</span>
                    <a href={githubUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white flex items-center gap-1">
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              id="preview-public-profile-btn"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-green-400 hover:text-green-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="h-4 w-4" />
              Preview Public Card
            </button>

            <button
              type="button"
              id="download-mentor-cv-btn"
              onClick={() => downloadMentorCV({
                fullName: session.name,
                email: session.email,
                specialization,
                bio,
                linkedinUrl,
                resumePath,
                educationBackground,
                workExperience,
                certification,
                selectedTags
              })}
              className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="h-4 w-4 text-green-400" />
              Download CV
            </button>

            {onEditKyc && (
              <button
                type="button"
                id="edit-kyc-details-btn"
                onClick={onEditKyc}
                className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Audit KYC
              </button>
            )}

            <Link
              to="/roadmaps"
              className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-green-600/20"
            >
              <Compass className="h-4 w-4" />
              Browse Roadmaps
            </Link>
          </div>

        </div>
      </div>

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Target Tracks</span>
            <div className="text-2xl font-black text-white">{mentorRoadmaps.length}</div>
            <p className="text-[11px] text-zinc-400">Published Learning Paths</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-green-400">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Syllabus Depth</span>
            <div className="text-2xl font-black text-green-400">{totalMilestones}</div>
            <p className="text-[11px] text-zinc-400">Total Sequential Milestones</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-green-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Mentorship Cohort</span>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              {googleFormUrl ? (
                isProgramPublished ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Published &amp; Active
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <EyeOff className="h-4 w-4" /> Draft / Unpublished
                  </span>
                )
              ) : (
                <span className="text-zinc-500 flex items-center gap-1">
                  Not Configured
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
              {isProgramPublished ? (programTitle || 'Live on Public Profile') : 'Hidden from Learners'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-green-400">
            <HeartHandshake className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Tab Navigation Bar */}
      <div className="border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          
          <button
            type="button"
            id="tab-tracks"
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'tracks'
                ? 'border-green-500 text-green-400 bg-green-500/5 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Curriculum &amp; Syllabus Studio</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300">
              {mentorRoadmaps.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-program"
            onClick={() => setActiveTab('program')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'program'
                ? 'border-green-500 text-green-400 bg-green-500/5 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Mentorship Program Offering</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isProgramPublished 
                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isProgramPublished ? 'Published' : 'Draft'}
            </span>
          </button>

          <button
            type="button"
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-green-500 text-green-400 bg-green-500/5 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Trustworthy Profile &amp; Bio</span>
          </button>
          
          <button
            type="button"
            id="tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-green-500 text-green-400 bg-green-500/5 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mentee Requests</span>
            {mentorApps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-[10px] font-mono text-green-400 border border-green-500/30">
                {mentorApps.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'tracks' && (
          <button
            type="button"
            id="create-track-action-btn"
            onClick={handleOpenCreateRoadmap}
            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-green-600/10 mb-2 sm:mb-0"
          >
            <Plus className="h-4 w-4" />
            Create Target Track
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CURRICULUM & SYLLABUS STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'tracks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {mentorRoadmaps.length === 0 ? (
            <div className="p-12 rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-4">
              <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 mx-auto">
                <BookOpen className="h-8 w-8 text-green-400" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Custom Tracks Published Yet</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  As an industry mentor, you can author structured career tracks with milestone modules, code challenges, and curated references for your students.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateRoadmap}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all inline-flex items-center gap-2 shadow-lg shadow-green-600/20"
              >
                <Plus className="h-4 w-4" />
                Author Your First Track
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorRoadmaps.map((rm) => {
                const customKey = `crp_roadmap_nodes_${rm.slug}`;
                const customStr = localStorage.getItem(customKey);
                let nodeCount = 6;
                if (customStr) {
                  try {
                    nodeCount = JSON.parse(customStr).length;
                  } catch (e) {}
                }

                return (
                  <div
                    key={rm.id}
                    className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 shadow-xl flex flex-col justify-between gap-5 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          rm.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          rm.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {rm.difficulty || 'Beginner'}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 font-semibold">
                          {rm.estimated_weeks || 12} Weeks
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">
                          {rm.title}
                        </h4>
                        <p className="text-xs font-mono text-zinc-400 mt-0.5">{rm.category || 'Engineering'}</p>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {rm.description || 'Comprehensive step-by-step career path syllabus.'}
                      </p>

                      <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1 font-semibold text-zinc-300">
                          <Sparkles className="h-3.5 w-3.5 text-green-400" />
                          {nodeCount} Milestone Modules
                        </span>
                        <Link
                          to={`/roadmaps/${rm.slug}`}
                          className="text-green-400 hover:text-green-300 text-xs font-semibold flex items-center gap-1 hover:underline"
                        >
                          Live View &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      {deletingRoadmapId === rm.id ? (
                        <div className="flex items-center gap-1.5 bg-red-950/60 p-1.5 rounded-xl border border-red-900 w-full justify-between">
                          <span className="text-[10px] text-red-300 font-bold px-1">Delete track?</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoadmap(rm.id, rm.slug)}
                              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-[10px] text-white font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingRoadmapId(null)}
                              className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditRoadmap(rm)}
                            className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-green-400" />
                            Edit Curriculum
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRoadmapId(rm.id)}
                            className="p-2 rounded-xl bg-zinc-950 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                            title="Delete Track"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MENTORSHIP PROGRAM OFFERING & COHORT */}
      {/* ========================================================================= */}
      {activeTab === 'program' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Visibility & Publish Control Banner */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isProgramPublished
              ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-green-950/30 border-green-500/40 shadow-green-950/10'
              : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20 border-amber-500/30 shadow-amber-950/10'
          }`}>
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isProgramPublished
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {isProgramPublished ? (
                  <Radio className="h-5 w-5 animate-pulse" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Program Visibility:
                  </h4>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    isProgramPublished
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {isProgramPublished ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        Published &amp; Live
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Unpublished (Draft)
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isProgramPublished
                    ? 'Your mentorship cohort is publicly visible on your mentor profile, roadmaps, and exploration cards.'
                    : 'Your mentorship cohort is saved in draft mode and hidden from public learner views.'}
                </p>
              </div>
            </div>

            {/* Quick Interactive Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <span className="text-xs font-mono text-zinc-400 hidden md:inline">
                {isProgramPublished ? 'Publicly Visible' : 'Hidden from Learners'}
              </span>
              <button
                type="button"
                id="toggle-program-publish-btn"
                onClick={() => handleToggleProgramPublish()}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                  isProgramPublished ? 'bg-green-600 border-green-500' : 'bg-zinc-800 border-zinc-700'
                }`}
                aria-label="Toggle mentorship program offering publish state"
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isProgramPublished ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Pane (Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveProgram} className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl">
                <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5 text-green-400" />
                      Configure Mentorship Program Offering
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Offer 1-on-1 mentorship cohorts to career learners. Provide an external Google Form URL so prospective students can apply directly to you.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Mentorship Cohort Title <span className="text-green-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={programTitle}
                      onChange={(e) => setProgramTitle(e.target.value)}
                      placeholder="e.g. Advanced Frontend Architecture & Interview Prep Cohort"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Cohort Description &amp; What You Offer <span className="text-green-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={programDescription}
                      onChange={(e) => setProgramDescription(e.target.value)}
                      placeholder="Describe your mentorship format: bi-weekly 1-on-1 calls, mock system design reviews, CV critique, or capstone guidance..."
                      className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Google Form Application URL <span className="text-green-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={googleFormUrl}
                      onChange={(e) => setGoogleFormUrl(e.target.value)}
                      placeholder="https://docs.google.com/forms/d/e/.../viewform"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 font-mono"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      💡 Learners visiting your roadmaps will see an "Apply for Mentorship" button that opens this form securely.
                    </p>
                  </div>

                  {/* Inline Toggle Checkbox */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isProgramPublished ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-amber-400" />
                        )}
                        Publish Offering on Public Profile
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        {isProgramPublished
                          ? 'This cohort offering is active and visible to all learners.'
                          : 'This cohort offering is currently unpublished (Draft mode).'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsProgramPublished(!isProgramPublished)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        isProgramPublished ? 'bg-green-600 border-green-500' : 'bg-zinc-800 border-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isProgramPublished ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleProgramPublish()}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isProgramPublished ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                        <span>Unpublish Offering</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                        <span>Publish Offering Now</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-md shadow-green-600/20 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Mentorship Program ({isProgramPublished ? 'Published' : 'Draft'})</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Card Pane (Col 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider block mb-0.5">
                    Learner-Facing Preview
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Live simulation of your public profile cohort card.
                  </p>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border shrink-0 ${
                  isProgramPublished
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {isProgramPublished ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live &amp; Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Unpublished (Draft)
                    </>
                  )}
                </span>
              </div>

              {/* Status Notice if Draft */}
              {!isProgramPublished && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300 leading-relaxed">
                  <EyeOff className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Currently Hidden:</span> Learners visiting your mentor profile will not see this mentorship card until you toggle it to Published.
                  </div>
                </div>
              )}

              <div className={`p-6 rounded-3xl bg-zinc-900 border space-y-5 shadow-xl transition-all ${
                isProgramPublished ? 'border-green-500/30' : 'border-zinc-800 opacity-90'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-lg text-green-400">
                      {profilePicUrl ? (
                        <img src={profilePicUrl} alt={session.name || 'Mentor'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        (session.name || 'M')[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{session.name || 'Your Name'}</h4>
                      <p className="text-xs text-green-400 font-semibold">{specialization}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Cohort
                  </span>
                </div>

                <div className="space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white">
                      {programTitle || 'Custom Mentorship Program'}
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {programDescription || 'Comprehensive 1-on-1 mentorship with code reviews, mock interviews, and career counseling.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {googleFormUrl ? 'Google Form Linked ✓' : 'No link added yet'}
                  </span>
                  <button
                    type="button"
                    disabled={!googleFormUrl}
                    onClick={() => {
                      if (googleFormUrl) window.open(googleFormUrl, '_blank');
                    }}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    <HeartHandshake className="h-3.5 w-3.5" />
                    Apply for Mentorship
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRUSTWORTHY PROFILE & BIO */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Pane: Photo, Specialization, Socials & Tags (Col 6) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Photo & Specialization */}
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Visual Identity &amp; Specialization
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Profile Headshot
                    </label>
                    <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-lg text-green-400 overflow-hidden shrink-0">
                        {profilePicUrl ? (
                          <img src={profilePicUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          'P'
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={profilePicUrl}
                          onChange={(e) => setProfilePicUrl(e.target.value)}
                          placeholder="Paste direct photo URL (https://...)"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="profile-pic-file-upload-dashboard"
                            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-200 cursor-pointer transition-colors border border-zinc-700"
                          >
                            Upload Local Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfilePicUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="profile-pic-file-upload-dashboard"
                          />
                          {profilePicUrl && (
                            <button
                              type="button"
                              onClick={() => setProfilePicUrl('')}
                              className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Primary Domain Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500 font-semibold"
                    >
                      {ROADMAP_POSITIONS.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Social Handles & Portfolio */}
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Portfolio &amp; Social Links
                </h3>

                <div className="space-y-3">
                  <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="LinkedIn: https://linkedin.com/in/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="relative">
                    <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub: https://github.com/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="relative">
                    <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="Twitter: https://x.com/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Personal Website: https://yourdomain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Core Expertise Tags */}
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
                    Core Expertise Tags ({selectedTags.length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-green-500/15 text-green-300 border border-green-500/30"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-white p-0.5 rounded text-green-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
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
                    placeholder="Type skill tag (e.g. Next.js, Docker)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tagsList.map((tag) => {
                      const isSel = selectedTags.some(t => t.toLowerCase() === tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSel
                              ? 'bg-green-600/20 border border-green-500 text-green-300 font-semibold'
                              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Pane: Bio, Work Experience, Education, Certifications (Col 6) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience &amp; Background
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Mentor Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your mentoring philosophy, domain background, and how you help learners..."
                      className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                      Professional Work Experience
                    </label>
                    <textarea
                      rows={3}
                      value={workExperience}
                      onChange={(e) => setWorkExperience(e.target.value)}
                      placeholder="Senior Engineer at Stripe (2022-Present), Full Stack Engineer at Shopify (2019-2022)..."
                      className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-zinc-500" />
                      Education Background
                    </label>
                    <textarea
                      rows={2}
                      value={educationBackground}
                      onChange={(e) => setEducationBackground(e.target.value)}
                      placeholder="B.S. in Computer Science from University of Waterloo, or self-taught developer story..."
                      className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-zinc-500" />
                      Certifications &amp; Accreditations
                    </label>
                    <textarea
                      rows={2}
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      placeholder="AWS Certified Solutions Architect, Google Professional Cloud Architect..."
                      className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-green-600/20 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Save Trustworthy Profile
                  </button>
                </div>
              </div>

            </div>

          </div>

        </form>
      )}

      {/* TAB 5: MENTEE REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Mentorship Applications &amp; Inquiries
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Learners who have submitted 1-on-1 mentorship requests. Click <strong className="text-green-400 font-semibold">Accept and Email</strong> to officially accept the learner and launch your pre-filled email onboarding.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setAppFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    appFilter === 'all'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({mentorApps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    appFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Pending ({mentorApps.filter(a => a.status !== 'accepted' && a.status !== 'rejected').length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppFilter('accepted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    appFilter === 'accepted'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Accepted ({mentorApps.filter(a => a.status === 'accepted').length})
                </button>
              </div>
            </div>

            {mentorApps.length === 0 ? (
              <div className="p-12 rounded-3xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center space-y-4">
                <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 mx-auto">
                  <HeartHandshake className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">No mentorship applications yet</h4>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-2">
                    When learners submit a 1-on-1 mentorship application from your profile, their requests will appear here for review and acceptance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentorApps
                  .filter(app => {
                    if (appFilter === 'pending') return app.status !== 'accepted' && app.status !== 'rejected';
                    if (appFilter === 'accepted') return app.status === 'accepted';
                    return true;
                  })
                  .map((app) => {
                    const isAccepted = app.status === 'accepted';
                    const isRejected = app.status === 'rejected';

                    return (
                      <div
                        key={app.id}
                        id={`mentor-app-card-${app.id}`}
                        className={`p-6 rounded-3xl bg-zinc-950 border flex flex-col space-y-5 transition-all relative ${
                          isAccepted
                            ? 'border-green-500/40 bg-gradient-to-b from-green-950/10 to-zinc-950 shadow-lg shadow-green-950/20'
                            : isRejected
                            ? 'border-zinc-850 opacity-70'
                            : 'border-zinc-800/90 hover:border-amber-500/40'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center font-bold uppercase shrink-0 text-sm ${
                              isAccepted
                                ? 'bg-green-950/60 border-green-500/40 text-green-300'
                                : 'bg-zinc-850 border-zinc-700 text-zinc-200'
                            }`}>
                              {app.learnerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{app.learnerName}</h4>
                              </div>
                              <span className="text-[11px] text-zinc-400 block font-mono">
                                {app.learnerEmail}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isAccepted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/30 text-[11px] font-semibold font-mono">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                Accepted
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-medium">
                                <XCircle className="h-3 w-3" />
                                Declined
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold font-mono">
                                <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Track & Skill Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3 text-green-400" />
                            {app.roadmapTrack} Track
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 capitalize">
                            Level: <strong className="text-zinc-200">{app.skillLevel}</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono ml-auto">
                            {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        
                        {/* Body Details */}
                        <div className="space-y-3.5 flex-grow">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-semibold">
                              Learner's Stated Goals &amp; Needs
                            </span>
                            <div className="text-xs text-zinc-200 leading-relaxed bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800/80 italic">
                              "{app.goals}"
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                              <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">Preferred Cadence</span>
                              <span className="text-zinc-200 font-medium mt-0.5 block">{app.preferredPace}</span>
                            </div>
                            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                              <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">Portfolio / GitHub</span>
                              {app.githubOrPortfolio ? (
                                <a
                                  href={app.githubOrPortfolio.startsWith('http') ? app.githubOrPortfolio : `https://${app.githubOrPortfolio}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-green-400 hover:text-green-300 hover:underline font-medium truncate flex items-center gap-1 mt-0.5"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">View Link</span>
                                </a>
                              ) : (
                                <span className="text-zinc-500 text-[11px] mt-0.5 block">Not provided</span>
                              )}
                            </div>
                          </div>

                          {isAccepted && (
                            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-[11px] text-green-300 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                              <span>Accepted on {app.acceptedAt ? new Date(app.acceptedAt).toLocaleDateString() : 'Active'}. Learner notified.</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Footer: "Accept and Email" */}
                        <div className="pt-4 border-t border-zinc-850/80 flex items-center gap-3">
                          <button
                            type="button"
                            id={`accept-and-email-btn-${app.id}`}
                            onClick={() => handleAcceptAndEmail(app)}
                            className={`flex-1 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                              isAccepted
                                ? 'bg-zinc-900 hover:bg-zinc-850 text-green-400 border border-green-500/40 hover:border-green-500'
                                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20 hover:shadow-green-600/30'
                            }`}
                          >
                            {isAccepted ? (
                              <>
                                <Check className="h-4 w-4 text-green-400" />
                                <Mail className="h-4 w-4" />
                                Accepted ✓ (Email Again)
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                <Mail className="h-4 w-4" />
                                Accept and Email
                              </>
                            )}
                          </button>

                          {!isAccepted && !isRejected && (
                            <button
                              type="button"
                              id={`decline-app-btn-${app.id}`}
                              onClick={() => handleDeclineRequest(app)}
                              className="px-3.5 py-3 rounded-2xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 text-xs font-semibold transition-all cursor-pointer"
                              title="Decline request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROADMAP CREATION & SYLLABUS EDITOR MODAL */}
      {/* ========================================================================= */}
      {isRoadmapModalOpen && (
        <div
          id="roadmap-editor-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRoadmapModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        >
          <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh] cursor-default">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-zinc-900/60">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  {editingRoadmapId ? 'Edit Target Track & Syllabus' : 'Author New Career Track'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Design a sequential curriculum with milestone modules and curated links for your learners.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoadmapModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Dual-Pane Body */}
            <form onSubmit={handleSaveRoadmap} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Pane: Track Metadata (Col 5) */}
                <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 lg:border-r border-zinc-800 pb-6 lg:pb-0 lg:pr-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                    <Settings className="h-4 w-4" />
                    1. Track Metadata
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Track Title <span className="text-green-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rmTitle}
                      onChange={(e) => setRmTitle(e.target.value)}
                      placeholder="e.g. Full-Stack TypeScript & Cloud Architecture"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Domain
                      </label>
                      <select
                        value={rmCategory}
                        onChange={(e) => {
                          setRmCategory(e.target.value);
                          if (!editingRoadmapId || rmNodes.length === 0) {
                            const defaultNodes = CATEGORY_PRESET_NODES[e.target.value] || CATEGORY_PRESET_NODES['Engineering'];
                            setRmNodes(defaultNodes);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Data & AI">Data &amp; AI</option>
                        <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
                        <option value="Design & Product">Design &amp; Product</option>
                        <option value="Security & QA">Security &amp; QA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Difficulty
                      </label>
                      <select
                        value={rmDifficulty}
                        onChange={(e) => setRmDifficulty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500 capitalize"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      required
                      value={rmWeeks}
                      onChange={(e) => setRmWeeks(parseInt(e.target.value) || 12)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Curriculum Overview
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={rmDescription}
                      onChange={(e) => setRmDescription(e.target.value)}
                      placeholder="Outline target outcomes, tools taught, and capstone milestones..."
                      className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-green-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right Pane: Sequential Modules Builder (Col 7) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      2. Sequential Curriculum Modules ({rmNodes.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newNode = {
                          id: 'node_' + Date.now(),
                          title: 'New Syllabus Module',
                          description: 'Specify the topics, projects, or tasks for this sequential step.',
                          resources: [
                            { title: 'Official Documentation', url: 'https://developer.mozilla.org', type: 'documentation' }
                          ]
                        };
                        setRmNodes([...rmNodes, newNode]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Module
                    </button>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[50vh] pr-1">
                    {rmNodes.map((node, nodeIdx) => (
                      <div key={node.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">
                              Step {nodeIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-[200px]">
                              {node.title || 'Untitled Module'}
                            </span>
                          </div>
                          
                          {/* Reordering and Deleting */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={nodeIdx === 0}
                              onClick={() => {
                                if (nodeIdx === 0) return;
                                const list = [...rmNodes];
                                const temp = list[nodeIdx];
                                list[nodeIdx] = list[nodeIdx - 1];
                                list[nodeIdx - 1] = temp;
                                setRmNodes(list);
                              }}
                              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                              title="Move Step Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={nodeIdx === rmNodes.length - 1}
                              onClick={() => {
                                if (nodeIdx === rmNodes.length - 1) return;
                                const list = [...rmNodes];
                                const temp = list[nodeIdx];
                                list[nodeIdx] = list[nodeIdx + 1];
                                list[nodeIdx + 1] = temp;
                                setRmNodes(list);
                              }}
                              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                              title="Move Step Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = rmNodes.filter((_, idx) => idx !== nodeIdx);
                                setRmNodes(list);
                              }}
                              className="p-1 rounded bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400"
                              title="Delete Step"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          required
                          value={node.title}
                          onChange={(e) => {
                            const list = [...rmNodes];
                            list[nodeIdx].title = e.target.value;
                            setRmNodes(list);
                          }}
                          placeholder="Module Title (e.g. Component Architecture & State Machine)"
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-green-500 font-semibold"
                        />

                        <textarea
                          rows={2}
                          required
                          value={node.description}
                          onChange={(e) => {
                            const list = [...rmNodes];
                            list[nodeIdx].description = e.target.value;
                            setRmNodes(list);
                          }}
                          placeholder="Module objectives and learning checkpoints..."
                          className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setIsRoadmapModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all shadow-md shadow-green-600/20 flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  {editingRoadmapId ? 'Save Track & Curriculum' : 'Publish Target Track'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLIC PROFILE LIVE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div
          id="mentor-preview-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        >
          <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 cursor-default">
            
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-400" />
                <h3 className="text-base font-bold text-white">Trustworthy Mentor Profile (Live Preview)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-zinc-850 pb-6 text-center sm:text-left">
                <div className="h-20 w-20 rounded-2xl bg-zinc-800 border-2 border-green-500/30 overflow-hidden flex items-center justify-center font-bold text-2xl text-green-400 shrink-0 shadow-lg">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt={session.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (session.name || 'M')[0].toUpperCase()
                  )}
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h4 className="text-xl font-bold text-white">{session.name || 'Your Name'}</h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 self-center">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Industry Mentor
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400">
                    Specializes in: <span className="text-green-400 font-semibold">{specialization}</span>
                  </p>
                  <p className="text-xs text-zinc-400">{session.email}</p>
                </div>
              </div>

              {bio && (
                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Bio</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-850 italic">
                    "{bio}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <Briefcase className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Experience</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {workExperience || 'Not specified.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <GraduationCap className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Education</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {educationBackground || 'Not specified.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <Award className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Certifications</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {certification || 'Not specified.'}
                  </p>
                </div>
              </div>

              {programTitle && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-green-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Active Mentorship Cohort</h5>
                  </div>
                  <h6 className="text-sm font-bold text-white">{programTitle}</h6>
                  <p className="text-xs text-zinc-400 leading-relaxed">{programDescription}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
