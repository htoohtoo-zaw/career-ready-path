/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Award,
  Building,
  Briefcase,
  ChevronRight,
  MessageSquare,
  MessageSquarePlus,
  ThumbsUp,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Users,
  PenLine,
  Send,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  getMentors,
  getReviewsByMentorId,
  MentorProfile,
  LearnerReview,
  getLearnerMentorshipApplications,
  MentorshipApplication,
} from '../lib/mentorReviewStore';
import { getAuthSession } from '../lib/learnerStore';

export const MentorsPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'highest_rated' | 'most_reviews' | 'experience'>('highest_rated');
  const [myApplications, setMyApplications] = useState<MentorshipApplication[]>([]);

  // Modal State
      
  const loadData = () => {
    const list = getMentors();
    setMentors(list);
    const apps = getLearnerMentorshipApplications(session.userId || session.email || '');
    setMyApplications(apps);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('crp_reviews_updated', handleUpdate);
    window.addEventListener('crp_mentorship_applications_updated', handleUpdate);
    return () => {
      window.removeEventListener('crp_reviews_updated', handleUpdate);
      window.removeEventListener('crp_mentorship_applications_updated', handleUpdate);
    };
  }, [session.userId, session.email]);

  const handleOpenProfile = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=profile`);
  };

  const handleOpenApply = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=apply`);
  };

  const handleOpenReviewWrite = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=write`);
  };

  const handleOpenReviewList = (mentor: MentorProfile) => {
    navigate(`/mentors/${mentor.id}?tab=reviews`);
  };

  // Filter & Search Logic
  const filteredMentors = mentors
    .filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCompany = m.company.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSpec = m.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCompany && !matchesTitle && !matchesSpec) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'frontend' && m.trackSlug !== 'frontend-developer') return false;
        if (selectedCategory === 'backend' && m.trackSlug !== 'backend-developer') return false;
        if (selectedCategory === 'fullstack' && m.trackSlug !== 'full-stack-developer') return false;
        if (selectedCategory === 'devops' && m.trackSlug !== 'devops-engineer') return false;
        if (selectedCategory === 'ai' && m.trackSlug !== 'data-scientist') return false;
      }

      // Min Rating
      if (minRating > 0 && m.rating < minRating) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest_rated') return b.rating - a.rating;
      if (sortBy === 'most_reviews') return b.totalReviews - a.totalReviews;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  const totalReviewsCount = mentors.reduce((acc, m) => acc + m.totalReviews, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 md:py-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-green-500/5 blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="h-4 w-4 text-green-400" />
            <span>Community Verified Industry Mentors</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Mentors &amp; <span className="text-green-500">Learner Reviews</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Explore verified engineers from Stripe, Netflix, Google, and Meta. Click any mentor card to inspect their background, apply for 1-on-1 coaching, read verified community reviews, or write your own rating.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>100% KYC Verified Mentors</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0 Average Rating</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>{totalReviewsCount}+ Learner Reviews</span>
            </div>
          </div>
        </div>

        {/* Learner's Submitted Mentorship Applications Notice (if any) */}
        {myApplications.length > 0 && (
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-green-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-green-400" />
                <span>Your Active Mentorship Applications ({myApplications.length})</span>
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                Responses expected within 24-48 hrs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={app.mentorAvatar}
                      alt={app.mentorName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                    />
                    <div>
                      <h4 className="font-bold text-white">{app.mentorName}</h4>
                      <p className="text-zinc-400 text-[11px]">{app.roadmapTrack}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {app.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 text-[10px] font-mono font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Accepted
                      </span>
                    ) : app.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono">
                        <Clock className="h-3 w-3" />
                        Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company, skill (e.g. Next.js, Kubernetes, PyTorch)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Sort & Rating Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs">
                <span className="text-zinc-500">Rating:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-transparent text-zinc-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4.8}>4.8+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.0}>4.0+ Stars</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs">
                <span className="text-zinc-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-zinc-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="highest_rated">Highest Rated ★</option>
                  <option value="most_reviews">Most Reviews</option>
                  <option value="experience">Years Experience</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Track Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
              Tracks:
            </span>
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'frontend', label: 'Frontend UI' },
              { id: 'backend', label: 'Backend & Systems' },
              { id: 'fullstack', label: 'Full Stack' },
              { id: 'devops', label: 'Cloud & DevOps' },
              { id: 'ai', label: 'AI & Data Science' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-green-500 text-zinc-950 font-bold shadow-md shadow-green-500/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Mentors Match Your Search</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Try clearing filters or searching for different keywords like "React", "Cloud", or "Architecture".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setMinRating(0);
              }}
              className="px-4 py-2 rounded-xl bg-green-500 text-zinc-950 text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, idx) => {
              const reviews = getReviewsByMentorId(mentor.id);
              const latestReview = reviews[0];

              return (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Header Card Info - Clicking opens Profile Card */}
                  <div
                    onClick={() => handleOpenProfile(mentor)}
                    className="p-6 sm:p-7 space-y-5 cursor-pointer"
                    title="Click to view mentor's full profile & background"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-zinc-700 shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-green-500 text-zinc-950 border-2 border-zinc-900">
                            <ShieldCheck className="h-3 w-3" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors flex items-center gap-1.5">
                            <span>{mentor.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono font-normal">
                              {mentor.experienceYears}+ yrs
                            </span>
                          </h3>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Building className="h-3 w-3 text-zinc-500" />
                            {mentor.company}
                          </p>
                        </div>
                      </div>

                      {/* Rating Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs font-bold shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{mentor.rating}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">({mentor.totalReviews})</span>
                      </div>
                    </div>

                    {/* Role & Track Badges */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-300">
                          {mentor.title}
                        </span>
                        {mentor.careerRoadmapTitle && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-mono font-medium">
                            {mentor.careerRoadmapTitle}
                          </span>
                        )}
                        {mentor.createdRoadmaps && mentor.createdRoadmaps.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
                            {mentor.createdRoadmaps.length} Created Track{mentor.createdRoadmaps.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {mentor.bio}
                      </p>
                    </div>

                    {/* Specialties Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.specialties.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400"
                        >
                          {spec}
                        </span>
                      ))}
                      {mentor.specialties.length > 3 && (
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                          +{mentor.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Latest Learner Review Quote Excerpt */}
                    {latestReview && (
                      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="font-semibold text-zinc-300">Latest Review:</span>
                          <span className="text-amber-400 font-mono">★ {latestReview.overallRating}.0</span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 italic leading-relaxed">
                          "{latestReview.reviewText}"
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono text-right">
                          — {latestReview.learnerName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="p-4 sm:p-5 bg-zinc-950/60 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenApply(mentor)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs transition-all duration-200 cursor-pointer shadow-md shadow-green-500/10"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Apply Mentorship</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenProfile(mentor)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-green-400" />
                        <span>View Profile</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewWrite(mentor)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>Write Review</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReviewList(mentor)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Reviews ({mentor.totalReviews})</span>
                      </button>

                      <Link
                        to={`/roadmaps/${mentor.trackSlug}`}
                        title={`View ${mentor.category} Roadmap`}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Compass className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-green-950/30 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">
              Looking for structured career curriculum?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl">
              Explore step-by-step roadmap trees curated with project milestones, documentation, and recommended industry tools.
            </p>
          </div>

          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm shadow-lg shadow-green-500/20 transition-all shrink-0 cursor-pointer"
          >
            <span>Browse All Roadmaps</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

      {/* Detail, Application & Review Modal */}
      
    </div>
  );
};
