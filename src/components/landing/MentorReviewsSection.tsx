/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  Building,
  Briefcase,
  CheckCircle2,
  Users,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import { getMentors, getReviewsByMentorId, MentorProfile } from '../../lib/mentorReviewStore';

export const MentorReviewsSection: React.FC = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorProfile[]>(() => getMentors().slice(0, 3));
      
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

  const refreshMentors = () => {
    setMentors(getMentors().slice(0, 3));
  };

  return (
    <section id="mentors-reviews-section" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800/80 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 -left-20 w-96 h-96 bg-green-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              <span>Learner Ratings &amp; Mentorship Reviews</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Learn from <span className="text-green-500">Verified Industry Mentors</span>
            </h2>

            <p className="text-base text-zinc-400 leading-relaxed">
              Read transparent evaluations from fellow learners. Discover top-rated engineers, inspect their career backgrounds, apply for 1-on-1 coaching, and submit your own ratings.
            </p>
          </div>

          <Link
            to="/mentors"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 group px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-all shrink-0"
          >
            <span>View All Mentors &amp; Reviews</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mentors Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor, idx) => {
            const reviews = getReviewsByMentorId(mentor.id);
            const latestReview = reviews[0];

            return (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-green-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl"
              >
                <div
                  onClick={() => handleOpenProfile(mentor)}
                  className="p-6 sm:p-7 space-y-4 cursor-pointer"
                  title="Click to view mentor's full profile"
                >
                  {/* Top Avatar & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
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
                        <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
                          {mentor.name}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-zinc-500" />
                          {mentor.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{mentor.rating}</span>
                    </div>
                  </div>

                  {/* Title & Specialization */}
                  <div>
                    <span className="text-xs font-semibold text-zinc-300">
                      {mentor.title}
                    </span>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {mentor.bio}
                    </p>
                  </div>

                  {/* Learner Review Quote */}
                  {latestReview && (
                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-zinc-300">Learner Feedback:</span>
                        <span className="text-amber-400 font-mono">★ {latestReview.overallRating}.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 italic line-clamp-2 leading-relaxed">
                        "{latestReview.reviewText}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                        <span>{latestReview.learnerName}</span>
                        <span className="text-green-400">Verified Review</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-4 sm:p-5 bg-zinc-950/60 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenApply(mentor)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-green-500/10 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Apply Mentorship</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProfile(mentor)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5 text-green-400" />
                      <span>Profile</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewWrite(mentor)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>Write Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewList(mentor)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Reviews ({mentor.totalReviews})</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Bottom Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 hidden sm:flex">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Have you completed roadmap milestones or received mentor code review?
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400">
                Share your feedback to help the community discover the best engineering mentors.
              </p>
            </div>
          </div>

          <Link
            to="/mentors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-green-500/20 transition-all shrink-0 cursor-pointer"
          >
            <span>Explore All Mentors</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

      {/* Review Modal */}
      
    </section>
  );
};
