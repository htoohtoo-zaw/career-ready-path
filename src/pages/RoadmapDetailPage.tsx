/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Compass, Clock, GitCommit, ArrowLeft, BookOpen, ExternalLink, Users, CheckCircle2, ShieldCheck, X, Briefcase, GraduationCap, Award, Linkedin, Github, Twitter, Globe, HeartHandshake, Sparkles, Star, MessageSquare } from 'lucide-react';
import { DEFAULT_NODES_BY_CATEGORY, getAuthSession } from '../lib/learnerStore';
import { PREDEFINED_ROADMAP_NODES, CATEGORY_PRESET_NODES } from '../lib/roadmapPresets';
import { isMentorRelatedToRoadmap, TRACK_MOCK_MENTORS } from '../lib/mentorRoadmapSync';
import { getMentors, MentorProfile } from '../lib/mentorReviewStore';

interface NodeItem {
  id: string;
  title: string;
  description: string;
  resources: { title: string; url: string; type: string }[];
}

export const RoadmapDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const { slug } = useParams<{ slug: string }>();
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [approvedMentors, setApprovedMentors] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);

  // Review modal state
      
  const handleOpenReviewWrite = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=write`);
  };

  const handleOpenReviewList = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=reviews`);
  };

  useEffect(() => {
    const loadMentors = () => {
      const localAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
      try {
        const apps = JSON.parse(localAppsStr);
        const approved = apps.filter((app: any) => app.kycStatus === 'approved');
        setApprovedMentors(approved);
      } catch (e) {
        console.warn('Error loading approved mentors:', e);
      }
    };
    loadMentors();
  }, []);

  const roadmapTitle = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Frontend Developer';

  useEffect(() => {
    if (!slug) return;

    // 1. Try loading customized/curated nodes by a mentor
    const customKey = `crp_roadmap_nodes_${slug}`;
    const customStr = localStorage.getItem(customKey);
    if (customStr) {
      try {
        const parsed = JSON.parse(customStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNodes(parsed);
          setActiveNodeId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.warn('Failed parsing custom nodes for slug', slug, e);
      }
    }

    // 2. Load from predefined highly specific realistic roadmap nodes if available
    if (PREDEFINED_ROADMAP_NODES[slug]) {
      const predefined = PREDEFINED_ROADMAP_NODES[slug];
      setNodes(predefined);
      if (predefined.length > 0) {
        setActiveNodeId(predefined[0].id);
      }
      return;
    }

    // 3. Fallback to category defaults based on existing roadmap configs
    let matchedCategory = 'Engineering';
    try {
      const localCreatedStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
      const localCreated = JSON.parse(localCreatedStr);
      const matched = localCreated.find((r: any) => r.slug === slug);
      if (matched && matched.category) {
        matchedCategory = matched.category;
      }
    } catch (e) {
      console.warn('Could not load local created roadmaps:', e);
    }

    const fallbackNodes = CATEGORY_PRESET_NODES[matchedCategory] || CATEGORY_PRESET_NODES['Engineering'];
    setNodes(fallbackNodes);
    if (fallbackNodes.length > 0) {
      setActiveNodeId(fallbackNodes[0].id);
    }
  }, [slug]);

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0] || null;

  return (
    <div className="py-12 md:py-20 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/roadmaps" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-green-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Path Slug: /roadmaps/{slug || 'frontend-developer'}
          </span>
        </div>

        {/* Roadmap Header */}
        <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800/90 mb-10 shadow-2xl overflow-hidden group">
          {/* Decorative Ambient Background Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              {/* Badges & Meta Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Verified Learning Path
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-800 text-xs font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Beginner to Industry
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-400 border border-zinc-800 text-xs font-mono">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  24 Weeks Estimated
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-400 border border-zinc-800 text-xs font-mono">
                  <GitCommit className="h-3.5 w-3.5 text-emerald-400" />
                  {nodes.length} Key Milestones
                </span>
              </div>

              {/* Main Title */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  Professional Roadmap
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    {roadmapTitle}
                  </span>{' '}
                  <span className="text-emerald-400 font-light">Career Track</span>
                </h1>
              </div>

              {/* Detailed Description */}
              <p className="text-base sm:text-lg text-zinc-300/90 max-w-3xl leading-relaxed font-normal">
                Master the sequential skill progression required for industry roles. Explore structured learning modules on the left to reveal curated documentation, practical projects, and verified mentor support.
              </p>

              {/* Quick Highlights Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% Free Open Curriculum</span>
                </div>
                <span className="text-zinc-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  <span>Handpicked MDN & Official Docs</span>
                </div>
                <span className="text-zinc-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>Linked Senior Mentors</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/onboarding"
                className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group/btn"
              >
                <span>Track My Progress</span>
                <Sparkles className="h-4 w-4 text-emerald-200 group-hover/btn:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Node Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left: Node Tree List (Col 5) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-green-500" />
              Sequential Curriculum ({nodes.length} Nodes)
            </h3>
            <div className="space-y-2.5">
              {nodes.map((node) => {
                const isActive = node.id === activeNodeId;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'bg-zinc-900 border-green-500 text-white shadow-lg shadow-green-500/5'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full shrink-0 ${isActive ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-zinc-700'}`} />
                      <span className="font-semibold text-sm sm:text-base">{node.title}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">
                      {node.resources.length} Links
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Node Detail Panel (Col 7) */}
          <div className="lg:col-span-7">
            {activeNode ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 sticky top-24">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-6">
                  <div>
                    <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Active Learning Node</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{activeNode.title}</h2>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>

                <p className="text-base text-zinc-300 leading-relaxed mb-8">
                  {activeNode.description}
                </p>

                {/* Resources list */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                    Curated Node Resources
                  </h4>
                  <div className="space-y-3">
                    {activeNode.resources && activeNode.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-green-400 uppercase">
                            {res.type}
                          </span>
                          <span className="font-medium text-sm text-zinc-200 group-hover:text-green-400 transition-colors">
                            {res.title}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-green-400 transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span>Free Open Access</span>
                  <span className="text-green-500">Mentors available for this track &darr;</span>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center py-20 text-zinc-500">
                <p>Loading curriculum node details...</p>
              </div>
            )}
          </div>

        </div>

        {/* Mentors Section (v1.0.4 Spec requirement: horizontal card carousel of approved mentors) */}
        <div className="pt-8 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-green-500 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Verified Industry Guidance
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Mentors Specializing in {roadmapTitle}
              </h3>
            </div>
            <Link
              to="/auth/signup?intent=mentor"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-green-400 hover:underline"
            >
              Apply to mentor this track &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              const currentSlug = slug || 'frontend-developer';
              const allStoreMentors = getMentors();
              
              // Find mentors matching this roadmap (by career track or authored creation roadmaps)
              const matchingMentors = allStoreMentors.filter((m) =>
                isMentorRelatedToRoadmap(m, currentSlug, roadmapTitle)
              );

              const displayMentors = matchingMentors;

              return displayMentors.map((mentor) => {
                const isAuthor = mentor.createdRoadmaps?.some(
                  (r) => r.slug === currentSlug || r.title.toLowerCase() === roadmapTitle.toLowerCase()
                );

                return (
                  <div
                    key={mentor.id}
                    id={`mentor-card-${mentor.id}`}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-green-500/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-full object-cover border-2 border-zinc-850 group-hover:border-green-500/40 transition-colors shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white flex items-center gap-1 group-hover:text-green-400 transition-colors text-sm truncate">
                            <span>{mentor.name}</span>
                            {mentor.verified && (
                              <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                            )}
                          </h4>
                          <p className="text-xs text-zinc-400 font-mono truncate">
                            {mentor.title} @ <span className="text-zinc-300">{mentor.company}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                          <span className="font-bold ml-1 text-white">{mentor.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 text-xs">
                          {mentor.totalReviews} {mentor.totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                        {isAuthor && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono font-medium">
                            Roadmap Author
                          </span>
                        )}
                        {!isAuthor && mentor.careerRoadmapTitle && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-mono font-medium">
                            Career Mentor
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-350 leading-relaxed line-clamp-2">
                        "{mentor.bio}"
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {mentor.specialties.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-850 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewWrite(mentor)}
                          className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-green-500/10 cursor-pointer"
                        >
                          <Star className="h-3.5 w-3.5 fill-zinc-950" />
                          <span>Write Review</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReviewList(mentor)}
                          className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-zinc-750 cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Reviews ({mentor.totalReviews})</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/mentors/${mentor.id}?tab=profile`)}
                          className="text-[11px] font-semibold text-green-400 hover:underline cursor-pointer"
                        >
                          View Full Profile &amp; Roadmaps &rarr;
                        </button>
                        <Link
                          to="/mentors"
                          className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                          Directory
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Community Mentors</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Discover verified senior engineers, view peer ratings, or rate your mentor session.
                </p>
              </div>
              <Link
                to="/mentors"
                className="px-5 py-2 rounded-full bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600 hover:text-white text-xs font-semibold transition-all"
              >
                Browse All Mentors
              </Link>
            </div>
          </div>
        </div>

        {/* Selected Mentor Full Profile Dialog Modal */}
        {selectedMentor && (
          <div 
            id="learner-mentor-profile-modal" 
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedMentor(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
          >
            <div id="learner-mentor-profile-card" className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 cursor-default">
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  <h3 className="text-base font-bold text-white">Verified Mentor Profile</h3>
                </div>
                <button
                  type="button"
                  id="close-profile-modal-btn"
                  onClick={() => setSelectedMentor(null)}
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
                    {selectedMentor.profilePicUrl ? (
                      <img src={selectedMentor.profilePicUrl} alt={selectedMentor.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (selectedMentor.fullName || 'M')[0].toUpperCase()
                    )}
                  </div>
                  <div className="space-y-2.5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                      <h4 className="text-xl font-extrabold text-white">{selectedMentor.fullName}</h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 self-center">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Industry Mentor
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400">
                      Specializes in: <span className="text-green-400 font-semibold">{selectedMentor.specialization || 'Not specified'}</span>
                    </p>
                    
                    {/* Social Handles Icons Bar */}
                    <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-1.5">
                      {selectedMentor.linkedinUrl && (
                        <a href={selectedMentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="LinkedIn Profile">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {selectedMentor.githubUrl && (
                        <a href={selectedMentor.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="GitHub Profile">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {selectedMentor.twitterUrl && (
                        <a href={selectedMentor.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Twitter / X">
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {selectedMentor.websiteUrl && (
                        <a href={selectedMentor.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Personal Website">
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
                    "{selectedMentor.bio || 'This mentor is ready to coach you on your career path.'}"
                  </p>
                </div>

                {/* Tags List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Core Expertise Tags</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedMentor.selectedTags) ? selectedMentor.selectedTags : ['Tech']).map((tag: string) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium">
                        {tag}
                      </span>
                    ))}
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
                      {selectedMentor.workExperience || 'Extensive professional history in high-trust engineering systems.'}
                    </p>
                  </div>

                  {/* Education Card */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <GraduationCap className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Education</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {selectedMentor.educationBackground || 'Verified high-caliber educational or industry-equivalent credentials.'}
                    </p>
                  </div>

                  {/* Certifications Card */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <Award className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Certificates</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {selectedMentor.certification || 'Verified certifications and specialized technical credentials.'}
                    </p>
                  </div>
                </div>

                {/* Mentorship Program Offerings Section (if published) */}
                {selectedMentor.isProgramPublished !== false && (selectedMentor.programTitle || selectedMentor.programDescription || selectedMentor.googleFormUrl) && (
                  <div className="border-t border-zinc-850 pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5 text-green-400" />
                      <h5 className="text-sm font-bold text-white">Mentorship Program Offerings</h5>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 space-y-4">
                      <div>
                        <h6 className="text-sm font-bold text-white">{selectedMentor.programTitle || 'Standard Mentorship Offering'}</h6>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          {selectedMentor.programDescription || 'Submit an application form to request active 1-on-1 code reviews, weekly milestone alignments, and tailored career preparation support.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between flex-wrap gap-4">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Application: {selectedMentor.googleFormUrl ? 'External Form Available' : 'No form link provided yet.'}
                        </span>
                        {selectedMentor.googleFormUrl ? (
                          <a
                            href={selectedMentor.googleFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-xs font-semibold text-white transition-all flex items-center gap-1"
                          >
                            Request Mentorship
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 rounded-full bg-zinc-850 text-zinc-500 text-xs font-semibold cursor-not-allowed"
                          >
                            Closed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
                <button
                  type="button"
                  id="close-profile-modal-footer-btn"
                  onClick={() => setSelectedMentor(null)}
                  className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Review & Rating Modal */}
        

      </div>
    </div>
  );
};
