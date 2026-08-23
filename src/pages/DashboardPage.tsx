/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Send, Clock, CheckCircle2, Circle, Plus, Edit3, Trash2, BookOpen, Users, Sparkles, ArrowRight, ShieldCheck, HelpCircle, X, ArrowLeft, ExternalLink, Save, Star, MessageSquare, Award, CheckCircle, Clock3, Code2, FileText, ChevronRight } from 'lucide-react';
import { getLearnerProfile, getCustomizedRoadmap, updateCustomizedRoadmap, syncLearnerProfileAfterLogin, getAuthSession, LearnerProfile, CustomizedRoadmap, RoadmapNodeProgress, DEFAULT_NODES_BY_CATEGORY } from '../lib/learnerStore';
import { PREDEFINED_ROADMAP_NODES, CATEGORY_PRESET_NODES } from '../lib/roadmapPresets';
import { isMentorRelatedToRoadmap, TRACK_MOCK_MENTORS } from '../lib/mentorRoadmapSync';
import { MentorPortalDashboard } from '../components/mentor/MentorPortalDashboard';
import { getMentors, MentorProfile, getReviewsByMentorId, getLearnerMentorshipApplications, MentorshipApplication } from '../lib/mentorReviewStore';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [roadmap, setRoadmap] = useState<CustomizedRoadmap | null>(null);
  
  // Custom node modal / inline creation state
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Editing note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Mentor Review & Rating Modal State
        const [availableMentors, setAvailableMentors] = useState<MentorProfile[]>([]);
  const [myApplications, setMyApplications] = useState<MentorshipApplication[]>([]);

  const handleOpenProfileForMentor = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=profile`);
  };

  const handleOpenApplyForMentor = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=apply`);
  };

  const handleOpenReviewWriteForMentor = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=write`);
  };

  const handleOpenReviewListForMentor = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=reviews`);
  };

  const [mentorActiveTab, setMentorActiveTab] = useState<'curriculum' | 'review_queue'>('curriculum');
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // --- Mentor-specific state and handlers ---
  const session = getAuthSession();
  const isMentor = session.isLoggedIn && (session.role === 'approved_mentor' || session.role === 'mentor');
  const isPendingMentor = session.isLoggedIn && session.role === 'pending_mentor';

  // Find mentor specialization
  const getMentorSpecialization = () => {
    try {
      const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
      const localApps = JSON.parse(localAppsStr);
      const userApp = localApps.find((app: any) => app.email?.toLowerCase() === session.email?.toLowerCase());
      return userApp?.specialization || 'Frontend Developer';
    } catch {
      return 'Frontend Developer';
    }
  };
  const specialization = getMentorSpecialization();
  const specSlug = specialization.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const [localRoadmaps, setLocalRoadmaps] = useState<any[]>([]);
  const [selectedMentorRoadmap, setSelectedMentorRoadmap] = useState<any | null>(null);
  
  // Managing general roadmap info (Create/Update)
  const [isEditingMentorRoadmap, setIsEditingMentorRoadmap] = useState(false);
  const [mentorRoadmapDifficulty, setMentorRoadmapDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [mentorRoadmapWeeks, setMentorRoadmapWeeks] = useState(24);
  const [mentorRoadmapCategory, setMentorRoadmapCategory] = useState('Engineering');
  const [mentorRoadmapDesc, setMentorRoadmapDesc] = useState('');

  // Managing dynamic syllabus curriculum nodes for mentor roadmap (CRUD)
  const [mentorNodes, setMentorNodes] = useState<any[]>([]);
  const [isAddingMentorNode, setIsAddingMentorNode] = useState(false);
  const [editingMentorNodeId, setEditingMentorNodeId] = useState<string | null>(null);
  const [mentorNodeTitle, setMentorNodeTitle] = useState('');
  const [mentorNodeDesc, setMentorNodeDesc] = useState('');
  
  // Resources within a node
  const [mentorNodeResources, setMentorNodeResources] = useState<{ title: string; url: string; type: string }[]>([]);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState('documentation');

  const loadMentorData = () => {
    if (!isMentor) return;

    const storedRoadmaps = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    try {
      const parsedRoadmaps = JSON.parse(storedRoadmaps);
      setLocalRoadmaps(parsedRoadmaps);

      // Find our specific roadmap
      const myMap = parsedRoadmaps.find((r: any) => r.slug === specSlug || r.title.toLowerCase() === specialization.toLowerCase());
      if (myMap) {
        setSelectedMentorRoadmap(myMap);
        
        // Load nodes for this roadmap
        const nodeKey = `crp_roadmap_nodes_${myMap.slug}`;
        const storedNodes = localStorage.getItem(nodeKey);
        if (storedNodes) {
          setMentorNodes(JSON.parse(storedNodes));
        } else {
          // Initialize nodes from PREDEFINED_ROADMAP_NODES or CATEGORY_PRESET_NODES
          const defaultNodes = PREDEFINED_ROADMAP_NODES[myMap.slug] || CATEGORY_PRESET_NODES[myMap.category] || CATEGORY_PRESET_NODES['Engineering'];
          setMentorNodes(defaultNodes);
          localStorage.setItem(nodeKey, JSON.stringify(defaultNodes));
        }
      } else {
        setSelectedMentorRoadmap(null);
        setMentorNodes([]);
      }
    } catch (e) {
      console.error('Failed to load mentor roadmaps data:', e);
    }
  };

  const loadMentorsData = () => {
    setAvailableMentors(getMentors());
    const session = getAuthSession();
    if (session.userId || session.email) {
      setMyApplications(getLearnerMentorshipApplications(session.userId, session.email));
    }
  };

  useEffect(() => {
    if (isMentor) {
      loadMentorData();
    }
    loadMentorsData();
    const handleUpdate = () => loadMentorsData();
    window.addEventListener('crp_reviews_updated', handleUpdate);
    window.addEventListener('crp_mentorship_applications_updated', handleUpdate);
    return () => {
      window.removeEventListener('crp_reviews_updated', handleUpdate);
      window.removeEventListener('crp_mentorship_applications_updated', handleUpdate);
    };
  }, [isMentor, specialization]);

  // Create / Initialize the Specific Roadmap
  const handleCreateMentorRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    const newMap = {
      id: 'roadmap_' + Date.now(),
      title: specialization,
      slug: specSlug,
      difficulty: mentorRoadmapDifficulty,
      estimated_weeks: mentorRoadmapWeeks,
      description: mentorRoadmapDesc || `Sequential step-by-step learning track for aspiring ${specialization}s. Curated with documentation, projects, and guidance by industry expert ${session.name || 'Mentor'}.`,
      category: mentorRoadmapCategory,
    };

    const updated = [...localRoadmaps, newMap];
    localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(updated));
    setLocalRoadmaps(updated);
    setSelectedMentorRoadmap(newMap);
    
    // Clear and reload
    setMentorRoadmapDesc('');
    loadMentorData();
  };

  // Update General Roadmap Metadata
  const handleUpdateMentorRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorRoadmap) return;

    const updatedMap = {
      ...selectedMentorRoadmap,
      difficulty: mentorRoadmapDifficulty,
      estimated_weeks: mentorRoadmapWeeks,
      description: mentorRoadmapDesc,
      category: mentorRoadmapCategory,
    };

    const updatedList = localRoadmaps.map((r: any) => r.id === selectedMentorRoadmap.id ? updatedMap : r);
    localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(updatedList));
    setLocalRoadmaps(updatedList);
    setSelectedMentorRoadmap(updatedMap);
    setIsEditingMentorRoadmap(false);
  };

  // Delete Roadmap
  const handleDeleteMentorRoadmap = () => {
    if (!selectedMentorRoadmap) return;
    if (!window.confirm(`Are you sure you want to delete the "${selectedMentorRoadmap.title}" roadmap?`)) return;

    const updatedList = localRoadmaps.filter((r: any) => r.id !== selectedMentorRoadmap.id);
    localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(updatedList));
    localStorage.removeItem(`crp_roadmap_nodes_${selectedMentorRoadmap.slug}`);
    
    setLocalRoadmaps(updatedList);
    setSelectedMentorRoadmap(null);
    setMentorNodes([]);
  };

  // Start Editing Roadmap Details
  const startEditRoadmap = () => {
    if (!selectedMentorRoadmap) return;
    setMentorRoadmapCategory(selectedMentorRoadmap.category || 'Engineering');
    setMentorRoadmapDifficulty(selectedMentorRoadmap.difficulty || 'beginner');
    setMentorRoadmapWeeks(selectedMentorRoadmap.estimated_weeks || 24);
    setMentorRoadmapDesc(selectedMentorRoadmap.description || '');
    setIsEditingMentorRoadmap(true);
  };

  // Start Add Node
  const startAddMentorNode = () => {
    setEditingMentorNodeId(null);
    setMentorNodeTitle('');
    setMentorNodeDesc('');
    setMentorNodeResources([]);
    setIsAddingMentorNode(true);
  };

  // Start Edit Node
  const startEditMentorNode = (node: any) => {
    setEditingMentorNodeId(node.id);
    setMentorNodeTitle(node.title);
    setMentorNodeDesc(node.description);
    setMentorNodeResources(node.resources || []);
    setIsAddingMentorNode(true);
  };

  // Save Node (Create or Update)
  const handleSaveMentorNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorNodeTitle.trim() || !selectedMentorRoadmap) return;

    let updatedNodes = [...mentorNodes];
    if (editingMentorNodeId) {
      updatedNodes = updatedNodes.map((n: any) => {
        if (n.id === editingMentorNodeId) {
          return {
            ...n,
            title: mentorNodeTitle,
            description: mentorNodeDesc,
            resources: mentorNodeResources,
          };
        }
        return n;
      });
    } else {
      const seqNumber = mentorNodes.length + 1;
      const titlePrefix = mentorNodeTitle.match(/^\d+\./) ? '' : `${seqNumber}. `;
      const newNode = {
        id: 'node_' + Date.now(),
        title: `${titlePrefix}${mentorNodeTitle}`,
        description: mentorNodeDesc || 'Curriculum milestone description.',
        resources: mentorNodeResources,
      };
      updatedNodes.push(newNode);
    }

    const nodeKey = `crp_roadmap_nodes_${selectedMentorRoadmap.slug}`;
    localStorage.setItem(nodeKey, JSON.stringify(updatedNodes));
    setMentorNodes(updatedNodes);
    setIsAddingMentorNode(false);
  };

  // Delete Node
  const handleDeleteMentorNode = (nodeId: string) => {
    if (!selectedMentorRoadmap) return;
    if (!window.confirm('Are you sure you want to delete this syllabus node?')) return;

    const updatedNodes = mentorNodes.filter((n: any) => n.id !== nodeId);
    const nodeKey = `crp_roadmap_nodes_${selectedMentorRoadmap.slug}`;
    localStorage.setItem(nodeKey, JSON.stringify(updatedNodes));
    setMentorNodes(updatedNodes);
  };

  // Add Resource
  const handleAddResource = () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    const newRes = {
      title: newResourceTitle,
      url: newResourceUrl.match(/^https?:\/\//) ? newResourceUrl : `https://${newResourceUrl}`,
      type: newResourceType,
    };
    setMentorNodeResources([...mentorNodeResources, newRes]);
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  // Remove Resource
  const handleRemoveResource = (idx: number) => {
    setMentorNodeResources(mentorNodeResources.filter((_, i) => i !== idx));
  };

  // --- RENDERING FOR PENDING MENTOR ---
  if (isPendingMentor) {
    return (
      <div className="py-12 md:py-20 bg-zinc-950 min-h-screen text-zinc-100 flex items-center justify-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            
            <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-3xl">
              ⏳
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                KYC STATUS: UNDER REVIEW
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                KYC Verification in Progress
              </h1>
              <p className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Thank you for applying to be an industry mentor! Our administration team is currently verifying your profile details, LinkedIn credentials, and resume/CV.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-left max-w-md mx-auto space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                Your Submitted Credentials
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Full Name:</span>
                  <span className="text-zinc-300 font-medium">{session.name || session.email?.split('@')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Registered Email:</span>
                  <span className="text-zinc-300 font-medium">{session.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Specialization:</span>
                  <span className="text-green-400 font-semibold">{specialization}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/roadmaps"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition-all"
              >
                Browse Syllabus Catalog
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('crp_user_session');
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900 hover:text-white text-sm font-semibold transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING FOR APPROVED MENTOR ---
  if (isMentor) {
    return (
      <div className="py-8 md:py-12 bg-zinc-950 min-h-screen text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MentorPortalDashboard onEditKyc={() => navigate("/apply-mentor")} />
        </div>
      </div>
    );
  }

  // --- EXISTING LEARNER STATES & RENDERING LOGIC ---
  useEffect(() => {
    async function loadOrSync() {
      let loadedProfile = getLearnerProfile();
      let loadedRoadmap = getCustomizedRoadmap();
      
      if (!loadedProfile || !loadedRoadmap) {
        const session = getAuthSession();
        if (session.userId || session.isLoggedIn) {
          loadedProfile = await syncLearnerProfileAfterLogin(session.userId || 'user_' + Date.now(), session.email, session.name);
          loadedRoadmap = getCustomizedRoadmap();
        }
      }
      setProfile(loadedProfile);
      setRoadmap(loadedRoadmap);
    }
    loadOrSync();
  }, []);

  if (!profile || !roadmap) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-6 shadow-2xl">
          <div className="h-16 w-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center text-green-400 mx-auto">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Default Roadmap Found</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              You haven't completed the 1-page onboarding form yet. Register your target role and study hours to generate your personalized learning track.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/onboarding"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all"
            >
              Start Onboarding Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={async () => {
                const session = getAuthSession();
                const p = await syncLearnerProfileAfterLogin(session.userId || 'user_' + Date.now(), session.email, session.name);
                setProfile(p);
                setRoadmap(getCustomizedRoadmap());
              }}
              className="w-full px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition-all"
            >
              Instant Default Track
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = roadmap.nodes.filter(n => n.completed).length;
  const totalCount = roadmap.nodes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate matching approved mentors for the active learner roadmap
  const getApprovedMentorCount = () => {
    if (!roadmap) return 0;
    const currentSlug = roadmap.slug || 'frontend-developer';
    const currentTitle = roadmap.roleTitle || 'Frontend Developer';
    try {
      const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
      const apps = JSON.parse(localAppsStr);
      const approvedMentors = apps.filter((app: any) => app.kycStatus === 'approved');
      
      const matching = approvedMentors.filter((m: any) =>
        isMentorRelatedToRoadmap(m, currentSlug, currentTitle)
      );

      if (matching.length > 0) {
        return matching.length;
      }
      return TRACK_MOCK_MENTORS[currentSlug]?.length || 1;
    } catch (e) {
      return TRACK_MOCK_MENTORS[currentSlug]?.length || 1;
    }
  };

  const approvedMentorCount = getApprovedMentorCount();

  const handleToggleComplete = (id: string) => {
    const updatedNodes = roadmap.nodes.map(node => {
      if (node.id === id) {
        return { ...node, completed: !node.completed };
      }
      return node;
    });
    const updatedRoadmap = { ...roadmap, nodes: updatedNodes };
    setRoadmap(updatedRoadmap);
    updateCustomizedRoadmap(updatedRoadmap);
  };

  const handleAddCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNode: RoadmapNodeProgress = {
      id: `custom_${Date.now()}`,
      title: `${roadmap.nodes.length + 1}. [Custom] ${newTitle.trim()}`,
      description: newDesc.trim() || 'Custom learning milestone added by learner.',
      completed: false,
      custom: true,
    };

    const updatedRoadmap = {
      ...roadmap,
      nodes: [...roadmap.nodes, newNode],
    };
    setRoadmap(updatedRoadmap);
    updateCustomizedRoadmap(updatedRoadmap);
    setNewTitle('');
    setNewDesc('');
    setIsAddingNode(false);
  };

  const handleDeleteNode = (id: string) => {
    const updatedNodes = roadmap.nodes.filter(n => n.id !== id);
    const updatedRoadmap = { ...roadmap, nodes: updatedNodes };
    setRoadmap(updatedRoadmap);
    updateCustomizedRoadmap(updatedRoadmap);
  };

  const handleSaveNote = (id: string) => {
    const updatedNodes = roadmap.nodes.map(node => {
      if (node.id === id) {
        return { ...node, notes: noteText };
      }
      return node;
    });
    const updatedRoadmap = { ...roadmap, nodes: updatedNodes };
    setRoadmap(updatedRoadmap);
    updateCustomizedRoadmap(updatedRoadmap);
    setEditingNoteId(null);
  };

  const formatStudyHoursLabel = (val: string) => {
    switch (val) {
      case '5_10': return '5–10 hours/week (Part-time)';
      case '10_20': return '10–20 hours/week (Standard)';
      case '20_plus': return '20+ hours/week (Intensive)';
      default: return val;
    }
  };

  const formatEduLabel = (val: string) => {
    switch (val) {
      case 'graduate': return 'Graduate Degree';
      case 'undergraduate': return 'Undergraduate Degree';
      case 'diploma': return 'Diploma / Associate';
      case 'high_school': return 'Self-Taught / High School';
      case 'career_changer': return 'Career Changer';
      default: return val;
    }
  };

  const recommendedMentors = availableMentors.filter(m => 
    isMentorRelatedToRoadmap(m, profile.targetRoleSlug || '', profile.targetRole || '')
  );

  return (
    <div className="py-10 md:py-16 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Top Profile Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Active Default Roadmap
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono">
                {formatEduLabel(profile.educationBackground)}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono">
                Pace: {formatStudyHoursLabel(profile.weeklyStudyHours)}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {roadmap.roleTitle} Track
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Your default curriculum was customized based on your target role and study capacity. You can check off modules below as you learn or add custom topics to expand your track.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/cv-generator"
              className="px-5 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-sm font-semibold text-green-400 hover:text-green-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Generate ATS CV
            </Link>
            <button
              onClick={() => navigate('/onboarding')}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-semibold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Change Role
            </button>
            <Link
              to={`/roadmaps/${roadmap.slug}`}
              className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View Syllabus
            </Link>
          </div>
        </div>

        {/* Progress & Timeline Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Track Completion</span>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white">{progressPercent}%</span>
              <span className="text-sm font-mono text-zinc-400">{completedCount} of {totalCount} Modules</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Estimated Duration
              <Clock className="h-4 w-4 text-green-500" />
            </span>
            <div className="my-3">
              <span className="text-4xl font-extrabold text-white">{roadmap.adjustedWeeks}</span>
              <span className="text-lg font-bold text-zinc-400 ml-1.5">Weeks</span>
            </div>
            <p className="text-xs text-zinc-500">
              Adjusted for your <span className="text-green-400 font-medium">{formatStudyHoursLabel(profile.weeklyStudyHours)}</span> schedule.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Verified Mentors
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </span>
            <div className="my-3 flex items-center justify-between">
              <div>
                <span className="text-4xl font-extrabold text-white">{availableMentors.length}</span>
                <span className="text-xs text-zinc-400 ml-1.5 font-medium">Available</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-amber-400">4.9 ★</span>
                <span className="text-xs text-zinc-400 ml-1">Avg Rating</span>
              </div>
            </div>
            <Link
              to="/mentors"
              className="text-xs text-green-400 hover:text-green-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Browse &amp; Rate Mentors &rarr;
            </Link>
          </div>
        </div>

        {/* My Mentorship Requests */}
        {myApplications.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Send className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">My Mentorship Requests</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myApplications.map((app) => (
                <div key={app.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {app.mentorAvatar ? (
                          <img src={app.mentorAvatar} alt={app.mentorName} className="h-10 w-10 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                            {app.mentorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{app.mentorName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {app.status === 'accepted' ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 font-semibold border border-green-500/30 capitalize flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Accepted &amp; Active
                      </span>
                    ) : app.status === 'rejected' ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700 capitalize flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Declined
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 capitalize flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending Review
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 line-clamp-2">
                    <span className="font-semibold text-zinc-300">Goals: </span>{app.goals}
                  </div>
                  <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                    {app.status === 'accepted' ? (
                      <span className="text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accepted! Mentor will reach out to {app.learnerEmail} shortly.
                      </span>
                    ) : (
                      <span className="text-zinc-500">Mentors usually review and reply via email in 1-2 days.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated Mentors & Learner Reviews */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Mentors &amp; Learner Reviews</h2>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Explore transparent reviews from other learners, check verified KYC badges, and submit ratings for senior mentors.
              </p>
            </div>

            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold border border-zinc-700 transition-all cursor-pointer"
            >
              <span>Explore All Mentors Directory</span>
              <ArrowRight className="h-4 w-4 text-green-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedMentors.length > 0 ? (
              recommendedMentors.slice(0, 3).map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-green-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={mentor.avatar || (mentor as any).avatarUrl}
                      alt={mentor.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full object-cover border-2 border-zinc-850 group-hover:border-green-500/40 transition-colors"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm group-hover:text-green-400 transition-colors">
                          {mentor.name}
                        </h4>
                        {(mentor.verified || (mentor as any).isVerified) && (
                          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-1.5 py-0.2 rounded-full font-mono">
                            KYC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {mentor.title || (mentor as any).role} @ <span className="text-zinc-300">{mentor.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                      <span className="font-bold ml-1 text-white">{mentor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 text-xs">
                      {mentor.totalReviews || (mentor as any).reviewCount || 0} reviews
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {mentor.specialties.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenApplyForMentor(mentor)}
                      className="flex-1 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Apply Mentorship</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProfileForMentor(mentor)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>Profile</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewWriteForMentor(mentor)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>Write Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewListForMentor(mentor)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Reviews ({mentor.totalReviews || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="col-span-full p-8 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-3 rounded-full bg-zinc-800/50 text-zinc-500">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white">No specific mentors matched yet</h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  We don't have mentors strictly matched to your current role target. Check out the general directory for other professionals!
                </p>
                <Link to="/mentors" className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-semibold text-white transition-colors">
                  Browse Directory
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap Modules List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Learning Modules &amp; Milestones</h2>
              <p className="text-sm text-zinc-400 mt-0.5">Click the checkbox to mark items complete. Add notes or custom milestones to adapt this track.</p>
            </div>
            <button
              onClick={() => setIsAddingNode(!isAddingNode)}
              className="px-4 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Custom Module
            </button>
          </div>

          {/* Add custom module form inline */}
          {isAddingNode && (
            <form onSubmit={handleAddCustomNode} className="p-6 rounded-2xl bg-zinc-900 border border-green-500/40 space-y-4 animate-in fade-in duration-200 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-500" />
                Add Custom Learning Milestone
              </h3>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master GraphQL & Apollo Client"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Description / Resources</label>
                <textarea
                  rows={2}
                  placeholder="Notes on documentation links or projects to build..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNode(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-semibold text-white shadow-md shadow-green-600/20"
                >
                  Save Module to Roadmap
                </button>
              </div>
            </form>
          )}

          {/* Nodes grid/list */}
          <div className="space-y-4">
            {roadmap.nodes.map((node) => {
              const isEditingThisNote = editingNoteId === node.id;
              return (
                <div
                  key={node.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    node.completed
                      ? 'bg-zinc-900/40 border-green-500/30 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(node.id)}
                        className={`mt-0.5 h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          node.completed
                            ? 'bg-green-500 border-green-500 text-zinc-950 ring-4 ring-green-500/20'
                            : 'bg-zinc-950 border-zinc-700 hover:border-green-500 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className={`text-base sm:text-lg font-bold ${node.completed ? 'text-zinc-400 line-through' : 'text-white'}`}>
                            {node.title}
                          </h3>
                          {node.custom && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Custom Module
                            </span>
                          )}
                          {node.completed && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
                          {node.description}
                        </p>

                        {/* Notes display */}
                        {node.notes && !isEditingThisNote && (
                          <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300">
                            <span className="text-zinc-500 font-mono block mb-1">Learner Notes &amp; Reflection:</span>
                            {node.notes}
                          </div>
                        )}

                        {/* Editing note form */}
                        {isEditingThisNote && (
                          <div className="mt-3 space-y-2 max-w-xl">
                            <textarea
                              rows={2}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Write your study progress notes, github repo links, or questions for mentor..."
                              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-green-500"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveNote(node.id)}
                                className="px-3 py-1 rounded bg-green-600 text-[11px] font-semibold text-white hover:bg-green-500"
                              >
                                Save Note
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-3 py-1 rounded bg-zinc-800 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on right */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isEditingThisNote && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(node.id);
                            setNoteText(node.notes || '');
                          }}
                          title="Add or edit notes"
                          className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-zinc-700 transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteNode(node.id)}
                        title="Delete module"
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mentor Reviews & Rating Detail Modal */}
        

      </div>
    </div>
  );
};
