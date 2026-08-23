import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star, ShieldCheck, Briefcase, Building, GraduationCap,
  MessageSquarePlus, Filter, CheckCircle2, Award, ChevronRight,
  Send, User, FileCheck, Globe, Github, Linkedin, Twitter,
  BookOpen, ArrowLeft, Check, Mail, Compass, Map as MapIcon,
  Layers, ThumbsUp, Download, ExternalLink, Calendar, Sparkles,
  CheckCircle, FileText, BadgeCheck, Clock, Share2
} from 'lucide-react';
import {
  MentorProfile, LearnerReview, ReviewMetrics,
  submitLearnerReview, toggleHelpfulVote, getReviewsByMentorId,
  getMentorById, submitMentorshipApplication
} from '../lib/mentorReviewStore';
import { getAuthSession } from '../lib/learnerStore';
import { useToast } from '../context/ToastContext';
import { downloadMentorCV } from '../lib/cvDownload';
import { resetScrollPosition } from '../components/layout/ScrollToTop';

export type MentorModalTab = 'profile' | 'apply' | 'reviews' | 'write';

const AVAILABLE_TAGS = [
  '⚡ Fast Feedback', '🎯 Pinpoint Code Review', '💡 Inspiring Advice',
  '🛠️ Pragmatic Solutions', '📝 Great Career Tips', '✨ Patient & Clear',
  '🚀 Interview Prep', '🏗️ Deep System Design', '📈 Production Best Practices',
  '🔐 Security Mindset', '🎨 Clean Architecture'
];

interface ParsedTimelineItem {
  title: string;
  subtitle?: string;
  period?: string;
  description?: string;
}

function parseWorkExperience(text?: string): ParsedTimelineItem[] {
  if (!text || !text.trim()) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // Check "Role @ Company (Period)" or "Role at Company (Period)"
    const matchWithPeriod = line.match(/^(.*?)\s*[@|at]\s*(.*?)(?:\s*\((.*?)\)|\s*-\s*([0-9]{4}.*))?$/i);
    if (matchWithPeriod) {
      return {
        title: matchWithPeriod[1].trim(),
        subtitle: matchWithPeriod[2].trim(),
        period: matchWithPeriod[3]?.trim() || matchWithPeriod[4]?.trim() || 'Verified Experience',
      };
    }
    // Check "Role (Period)"
    const matchSimple = line.match(/^(.*?)\s*\((.*?)\)$/);
    if (matchSimple) {
      return {
        title: matchSimple[1].trim(),
        period: matchSimple[2].trim(),
      };
    }
    return { title: line };
  });
}

function parseEducation(text?: string): ParsedTimelineItem[] {
  if (!text || !text.trim()) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line) => {
    if (line.includes(',')) {
      const parts = line.split(',');
      return {
        title: parts[0].trim(),
        subtitle: parts.slice(1).join(',').trim(),
      };
    }
    return { title: line };
  });
}

function parseCertifications(text?: string): string[] {
  if (!text || !text.trim()) return [];
  if (text.includes('\n')) {
    return text.split('\n').map(s => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
  }
  if (text.includes(',')) {
    return text.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [text.trim()];
}

export const MentorProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const toast = useToast();
  const session = getAuthSession();
  
  const mentor = getMentorById(id || '');
  const initialTab = (new URLSearchParams(location.search).get('tab') as MentorModalTab) || 'profile';

  const [activeTab, setActiveTab] = useState<MentorModalTab>(initialTab);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [reviewsList, setReviewsList] = useState<LearnerReview[]>([]);

  // Review Form State
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [metrics, setMetrics] = useState<ReviewMetrics>({
    codeFeedback: 5, clarity: 5, responsiveness: 5, careerAdvice: 5,
  });
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [learnerName, setLearnerName] = useState(session.name || '');
  const [learnerRole, setLearnerRole] = useState('Junior Software Engineer');
  const [selectedTags, setSelectedTags] = useState<string[]>(['🎯 Pinpoint Code Review', '💡 Inspiring Advice']);
  const [selectedTrack, setSelectedTrack] = useState(mentor?.category || 'Engineering');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Mentorship Application Form State
  const [applicantName, setApplicantName] = useState(session.name || '');
  const [applicantEmail, setApplicantEmail] = useState(session.email || '');
  const [applicantTrack, setApplicantTrack] = useState(mentor?.specialization || mentor?.category || 'Frontend & UI Engineering');
  const [applicantSkillLevel, setApplicantSkillLevel] = useState('Intermediate (1-2 years exp / self-taught)');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');
  const [applicantGoals, setApplicantGoals] = useState('');
  const [applicantPace, setApplicantPace] = useState('Weekly 1-on-1 (45 mins) + Async Code Reviews');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (mentor) {
      setReviewsList(getReviewsByMentorId(mentor.id));
      setSelectedTrack(mentor.category || 'Engineering');
      setApplicantTrack(mentor.specialization || mentor.category || 'Frontend & UI Engineering');
      if (session.name) {
        setLearnerName(session.name);
        setApplicantName(session.name);
      }
      if (session.email) {
        setApplicantEmail(session.email);
      }
      setActiveTab(initialTab);
      setAppSubmittedSuccess(false);
    }
  }, [mentor?.id, initialTab, session.name, session.email]);

  useEffect(() => {
    resetScrollPosition();
  }, [activeTab]);

  if (!mentor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Mentor Not Found</h2>
          <p className="text-sm text-zinc-400">
            The mentor profile you are looking for does not exist or has been updated.
          </p>
          <Link to="/mentors" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Explore All Mentors</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredReviews = reviewsList.filter((r) => ratingFilter === 'all' || Math.round(r.overallRating) === ratingFilter);

  const workItems = parseWorkExperience(mentor.workExperience);
  const educationItems = parseEducation(mentor.educationBackground);
  const certItems = parseCertifications(mentor.certification);

  const handleHelpfulClick = (reviewId: string) => {
    const voterId = session.userId || session.email || 'guest_voter';
    const result = toggleHelpfulVote(reviewId, voterId);
    setReviewsList((prev) => prev.map((r) => r.id === reviewId ? {
      ...r, helpfulCount: result.helpfulCount,
      likedBy: result.isLiked ? [...(r.likedBy || []), voterId] : (r.likedBy || []).filter((id) => id !== voterId),
    } : r));
    toast.showToast({ type: 'success', title: result.isLiked ? 'Helpful vote recorded!' : 'Vote removed' });
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter((t) => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const handleDownloadCV = () => {
    downloadMentorCV({
      fullName: mentor.name,
      email: mentor.email,
      specialization: mentor.specialization || mentor.title,
      bio: mentor.bio,
      linkedinUrl: mentor.linkedinUrl,
      resumePath: mentor.resumePath,
      educationBackground: mentor.educationBackground,
      workExperience: mentor.workExperience,
      certification: mentor.certification,
      selectedTags: mentor.specialties,
      programTitle: mentor.programTitle,
      programDescription: mentor.programDescription,
      submittedAt: new Date().toISOString(),
    });
    toast.showToast({ type: 'success', title: 'Downloading CV', message: `Verified CV document for ${mentor.name} downloaded.` });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || reviewText.trim().length < 20) {
      toast.showToast({ type: 'error', title: 'Invalid Review', message: 'Please provide a title and at least 20 characters.' });
      return;
    }
    setIsSubmittingReview(true);
    try {
      submitLearnerReview({
        mentorId: mentor.id,
        learnerName: learnerName.trim() || session.name || 'Community Learner',
        learnerRole: learnerRole.trim() || 'Learner',
        overallRating, metrics, reviewTitle, reviewText, trackName: selectedTrack, tags: selectedTags,
      }, session.userId);
      setReviewsList(getReviewsByMentorId(mentor.id));
      toast.showToast({ type: 'success', title: 'Review Published!', message: 'Thank you for rating and reviewing this mentor.' });
      setReviewTitle(''); setReviewText(''); setActiveTab('reviews');
    } catch (err) {
      toast.showToast({ type: 'error', title: 'Error', message: 'Could not post review.' });
    }
    setIsSubmittingReview(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || applicantGoals.trim().length < 15) {
      toast.showToast({ type: 'error', title: 'Invalid Application', message: 'Please fill out all required fields with detailed goals.' });
      return;
    }
    setIsSubmittingApp(true);
    try {
      submitMentorshipApplication({
        mentorId: mentor.id, mentorName: mentor.name, mentorAvatar: mentor.avatar,
        learnerId: session.userId || `guest_${Date.now()}`, learnerName: applicantName.trim(),
        learnerEmail: applicantEmail.trim(), roadmapTrack: applicantTrack, skillLevel: applicantSkillLevel,
        githubOrPortfolio: applicantPortfolio.trim(), goals: applicantGoals.trim(), preferredPace: applicantPace,
      });
      setAppSubmittedSuccess(true);
      toast.showToast({ type: 'success', title: 'Application Sent!', message: 'Your mentorship application has been sent to the mentor.' });
    } catch (err) {
      toast.showToast({ type: 'error', title: 'Error', message: 'Could not submit application.' });
    }
    setIsSubmittingApp(false);
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void, onHover?: (r: number) => void, hoverVal = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onMouseEnter={() => interactive && onHover?.(star)}
            onMouseLeave={() => interactive && onHover?.(0)}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
          >
            <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= (hoverVal || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8 md:py-12 px-4 sm:px-6 lg:px-8 text-zinc-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/mentors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-green-400" />
            <span>Back to Mentors Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Download verified CV / Resume documentation"
            >
              <Download className="h-3.5 w-3.5 text-green-400" />
              <span>Download Verified CV</span>
            </button>
          </div>
        </div>

        {/* TOP TRUST HERO CARD */}
        <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative shrink-0">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-green-500/40 shadow-2xl shadow-green-500/10"
                />
                <div
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-green-500 text-zinc-950 border-2 border-zinc-900 shadow-md"
                  title="KYC Verified Industry Mentor"
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {mentor.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-mono font-bold">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    <span>KYC Verified</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 font-medium flex flex-wrap items-center gap-2">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-green-400" />
                    {mentor.title}
                  </span>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-zinc-500" />
                    {mentor.company}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-medium">
                    {mentor.experienceYears}+ Years Industry Exp
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold">
                    {mentor.hourlyRate || 'Free Community Mentor'}
                  </span>
                  {mentor.specialization && (
                    <span className="px-3 py-1 bg-zinc-800/80 text-zinc-300 rounded-xl text-xs font-mono">
                      {mentor.specialization}
                    </span>
                  )}
                </div>

                {/* Social & Verified External Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl.startsWith('http') ? mentor.linkedinUrl : `https://${mentor.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </a>
                  )}

                  {mentor.githubUrl && (
                    <a
                      href={mentor.githubUrl.startsWith('http') ? mentor.githubUrl : `https://${mentor.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      <Github className="h-3.5 w-3.5 text-zinc-300" />
                      <span>GitHub</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </a>
                  )}

                  {mentor.websiteUrl && (
                    <a
                      href={mentor.websiteUrl.startsWith('http') ? mentor.websiteUrl : `https://${mentor.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5 text-green-400" />
                      <span>Portfolio</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </a>
                  )}

                  {mentor.twitterUrl && (
                    <a
                      href={mentor.twitterUrl.startsWith('http') ? mentor.twitterUrl : `https://${mentor.twitterUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      <Twitter className="h-3.5 w-3.5 text-sky-400" />
                      <span>Twitter / X</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Rating & Action Summary Card */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-center shrink-0 lg:min-w-[240px] space-y-4">
              <div>
                <div className="flex justify-center items-center gap-2 text-amber-400 mb-1">
                  <Star className="h-6 w-6 fill-amber-400" />
                  <span className="text-4xl font-extrabold">{mentor.rating}</span>
                </div>
                <p className="text-xs text-zinc-400 font-medium">
                  Based on {reviewsList.length} verified review{reviewsList.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('apply')}
                  className="w-full py-2.5 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-green-500/10 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply for Mentorship</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  <span>Write Review</span>
                </button>
              </div>
            </div>

          </div>

          {/* Trust Guarantee Verification Ribbon */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
              <div className="p-2 rounded-xl bg-green-500/10 text-green-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Identity Verified</p>
                <p className="text-[11px] text-zinc-500 truncate">KYC Background Check</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Work Experience</p>
                <p className="text-[11px] text-zinc-500 truncate">Production Verified</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Academic Degree</p>
                <p className="text-[11px] text-zinc-500 truncate">Credential Confirmed</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Active Guidance</p>
                <p className="text-[11px] text-zinc-500 truncate">Code & Roadmap Reviews</p>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-1">
          {[
            { id: 'profile', icon: User, label: 'Profile & Background' },
            { id: 'apply', icon: Send, label: 'Apply for Mentorship' },
            { id: 'reviews', icon: Star, label: `Learner Reviews (${reviewsList.length})` },
            { id: 'write', icon: MessageSquarePlus, label: 'Rate & Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MentorModalTab)}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-green-400 border-green-500 bg-green-500/5 rounded-t-xl'
                  : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50 rounded-t-xl'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE & BACKGROUND */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Professional Statement / Bio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>About & Mentorship Philosophy</span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Verified Statement</span>
              </div>
              <blockquote className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm sm:text-base leading-relaxed italic border-l-4 border-l-green-500">
                "{mentor.bio || 'Dedicated software engineering mentor committed to helping learners master core architectural concepts, write clean code, and accelerate their transition into industry roles.'}"
              </blockquote>
            </div>

            {/* Mentorship Program Offering (if available and published) */}
            {mentor.isProgramPublished !== false && (mentor.programTitle || mentor.programDescription || mentor.googleFormUrl) && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-green-950/20 border border-green-500/30 space-y-5 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Featured Mentorship Offering</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {mentor.programTitle || `${mentor.specialization || mentor.name}'s Mentorship Cohort`}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {mentor.programDescription || 'Structured mentorship program including 1-on-1 milestone reviews, portfolio auditing, mock technical interviews, and roadmap guidance.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {mentor.googleFormUrl ? (
                    <a
                      href={mentor.googleFormUrl.startsWith('http') ? mentor.googleFormUrl : `https://${mentor.googleFormUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-green-500/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Apply via Cohort Registration Form</span>
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setActiveTab('apply')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all"
                  >
                    <Send className="h-3.5 w-3.5 text-green-400" />
                    <span>Apply via In-App Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* Grid of Work Experience & Education */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* WORK EXPERIENCE */}
              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Work Experience & History</span>
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">KYC Verified</span>
                </div>

                {workItems.length > 0 ? (
                  <div className="space-y-4">
                    {workItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {item.title}
                          </h4>
                          {item.period && (
                            <span className="text-[11px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md shrink-0">
                              {item.period}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                            <Building className="h-3.5 w-3.5 text-zinc-500" />
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    {mentor.workExperience || `${mentor.experienceYears}+ years of verified industry software engineering experience.`}
                  </p>
                )}
              </div>

              {/* EDUCATION & ACADEMIC BACKGROUND */}
              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Education & Background</span>
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">Verified Degree</span>
                </div>

                {educationItems.length > 0 ? (
                  <div className="space-y-4">
                    {educationItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1.5"
                      >
                        <h4 className="font-bold text-white text-sm">
                          {item.title}
                        </h4>
                        {item.subtitle && (
                          <p className="text-xs text-zinc-400 font-medium">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    {mentor.educationBackground || 'Verified academic qualification in Computer Science / Software Engineering.'}
                  </p>
                )}

                {/* Certifications Box */}
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span>Certifications & Accreditations</span>
                  </h4>
                  {certItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {certItems.map((cert, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Standard industry accreditations verified.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Technical Specialties & Offerings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Technical Specialties & Skills</span>
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {mentor.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-green-500/40 transition-colors"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  <span>Mentorship Offerings & Services</span>
                </h3>
                <div className="space-y-2.5 pt-1">
                  {(mentor.offerings && mentor.offerings.length > 0 ? mentor.offerings : [
                    'Architecture & Clean Code Audits',
                    'Portfolio & Resume Polish',
                    'Technical Deep Dives & Best Practices',
                    'Mock Technical Interviews'
                  ]).map((offering, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <div className="p-1 rounded-full bg-green-500/10 text-green-400 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{offering}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Created Roadmaps by this Mentor */}
            {mentor.createdRoadmaps && mentor.createdRoadmaps.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Compass className="h-5 w-5 text-green-400" />
                      <span>Curriculum Tracks Published by {mentor.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Step-by-step milestone roadmaps authored and guided by this mentor.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentor.createdRoadmaps.map((rm) => (
                    <div
                      key={rm.id}
                      className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-green-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">
                            {rm.category || 'Curriculum'}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {rm.estimated_weeks || 12} Weeks
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">
                          {rm.title}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {rm.description || 'Comprehensive step-by-step milestone curriculum for learners.'}
                        </p>
                      </div>

                      <Link
                        to={`/roadmaps/${rm.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-xs font-bold text-green-400 hover:text-white transition-colors"
                      >
                        <span>Explore Curriculum</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance & Quality Metrics Breakdown */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Learner Review Scorecards & Performance Metrics</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400">Code Feedback</p>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono">
                    ★ {mentor.metricAverages?.codeFeedback || 5.0}
                  </p>
                  <p className="text-[10px] text-zinc-500">Thoroughness & rigor</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400">Communication</p>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono">
                    ★ {mentor.metricAverages?.clarity || 5.0}
                  </p>
                  <p className="text-[10px] text-zinc-500">Clarity & patience</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400">Responsiveness</p>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono">
                    ★ {mentor.metricAverages?.responsiveness || 5.0}
                  </p>
                  <p className="text-[10px] text-zinc-500">Turnaround time</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400">Career Advice</p>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono">
                    ★ {mentor.metricAverages?.careerAdvice || 5.0}
                  </p>
                  <p className="text-[10px] text-zinc-500">Interview & portfolio</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: APPLY FOR MENTORSHIP */}
        {activeTab === 'apply' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {appSubmittedSuccess ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-green-500/40 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">Application Submitted!</h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto">
                    Your mentorship application has been dispatched directly to <strong className="text-green-400">{mentor.name}</strong>.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 max-w-md mx-auto">
                  The mentor typically reviews applications within 24-48 hours. You can monitor your application status in your learner dashboard.
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
                  >
                    Back to Profile
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-2xl">
                <div className="border-b border-zinc-800 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-green-400" />
                    <span>Apply for 1-on-1 Mentorship with {mentor.name}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Please provide detailed context about your career targets, current experience, and what you hope to achieve.
                  </p>
                </div>

                {mentor.isProgramPublished !== false && mentor.googleFormUrl && (
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-300">Preferred Cohort Application Available</p>
                      <p className="text-[11px] text-zinc-400">This mentor maintains an external registration form for scheduled cohorts.</p>
                    </div>
                    <a
                      href={mentor.googleFormUrl.startsWith('http') ? mentor.googleFormUrl : `https://${mentor.googleFormUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs shrink-0 inline-flex items-center gap-1.5"
                    >
                      <span>Open Form</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Your Full Name</label>
                    <input
                      required
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors"
                      placeholder="e.g. Alex Taylor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Your Email Address</label>
                    <input
                      required
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Target Career Roadmap</label>
                    <input
                      type="text"
                      value={applicantTrack}
                      onChange={(e) => setApplicantTrack(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Current Skill Level</label>
                    <select
                      value={applicantSkillLevel}
                      onChange={(e) => setApplicantSkillLevel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors cursor-pointer"
                    >
                      <option value="Complete Beginner (0-6 months)">Complete Beginner (0-6 months)</option>
                      <option value="Intermediate (1-2 years exp / self-taught)">Intermediate (1-2 years exp / self-taught)</option>
                      <option value="Advanced / Working Dev wanting Senior Leap">Advanced / Working Dev wanting Senior Leap</option>
                      <option value="Career Switcher from other field">Career Switcher from other field</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">GitHub Profile or Portfolio Link (Optional)</label>
                  <input
                    type="url"
                    value={applicantPortfolio}
                    onChange={(e) => setApplicantPortfolio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors"
                    placeholder="https://github.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">
                    Learning Goals & What You Want to Achieve <span className="text-zinc-500 font-normal">(Min 15 chars)</span>
                  </label>
                  <textarea
                    required
                    minLength={15}
                    rows={4}
                    value={applicantGoals}
                    onChange={(e) => setApplicantGoals(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors"
                    placeholder="Describe your current blocker, target role, and what specific code reviews or guidance you are seeking..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Preferred Mentorship Cadence</label>
                  <select
                    value={applicantPace}
                    onChange={(e) => setApplicantPace(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none transition-colors cursor-pointer"
                  >
                    <option value="Weekly 1-on-1 (45 mins) + Async Code Reviews">Weekly 1-on-1 (45 mins) + Async Code Reviews</option>
                    <option value="Bi-Weekly Milestone Checkins + Milestone PR Reviews">Bi-Weekly Milestone Checkins + Milestone PR Reviews</option>
                    <option value="Async Code Reviews & Portfolio Polish only">Async Code Reviews & Portfolio Polish only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-green-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingApp ? 'Submitting Application...' : 'Send Mentorship Application'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-white">Learner Reviews & Ratings</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified feedback from learners who completed milestones and code audits with {mentor.name}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Filter:</span>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all">All Ratings ({reviewsList.length})</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                </select>
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className="px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs transition-colors shrink-0"
                >
                  Write Review
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredReviews.length === 0 ? (
                <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                  <Star className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-300">No reviews found matching this filter.</p>
                  <p className="text-xs text-zinc-500">Be the first learner to leave a review for {mentor.name}!</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className="mt-2 px-4 py-2 rounded-xl bg-green-500 text-zinc-950 text-xs font-bold"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-green-400">
                          {review.learnerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{review.learnerName}</span>
                            {review.verifiedLearner && (
                              <span className="text-[10px] text-green-400 px-2 py-0.2 bg-green-500/10 rounded-full border border-green-500/20 font-mono">
                                Verified Mentee
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">{review.learnerRole}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {renderStars(review.overallRating)}
                        <span className="font-mono text-zinc-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {review.reviewTitle}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        "{review.reviewText}"
                      </p>
                    </div>

                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {review.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">Track: {review.trackName}</span>
                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(review.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          review.likedBy?.includes(session.userId || session.email || 'guest_voter')
                            ? 'bg-green-500/15 text-green-400 border-green-500/30'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Helpful ({review.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RATE & REVIEW */}
        {activeTab === 'write' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
            <form onSubmit={handleSubmitReview} className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-2xl">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="h-5 w-5 text-green-400" />
                  <span>Rate & Review {mentor.name}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Share your honest experience to help fellow learners discover outstanding mentors.
                </p>
              </div>

              {/* Overall Rating Stars */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase">Overall Star Rating</label>
                <div className="flex justify-center">
                  {renderStars(overallRating, true, setOverallRating, setHoverRating, hoverRating)}
                </div>
                <p className="text-xs font-mono text-amber-400 font-bold">{overallRating} of 5 Stars</p>
              </div>

              {/* Metrics Rating Sliders */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detailed Skill Ratings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300">Code Review Quality</span>
                      <span className="font-mono text-amber-400 font-bold">{metrics.codeFeedback}/5</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={metrics.codeFeedback}
                      onChange={(e) => setMetrics({ ...metrics, codeFeedback: Number(e.target.value) })}
                      className="w-full accent-green-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300">Communication Clarity</span>
                      <span className="font-mono text-amber-400 font-bold">{metrics.clarity}/5</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={metrics.clarity}
                      onChange={(e) => setMetrics({ ...metrics, clarity: Number(e.target.value) })}
                      className="w-full accent-green-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300">Responsiveness</span>
                      <span className="font-mono text-amber-400 font-bold">{metrics.responsiveness}/5</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={metrics.responsiveness}
                      onChange={(e) => setMetrics({ ...metrics, responsiveness: Number(e.target.value) })}
                      className="w-full accent-green-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300">Career Guidance</span>
                      <span className="font-mono text-amber-400 font-bold">{metrics.careerAdvice}/5</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={metrics.careerAdvice}
                      onChange={(e) => setMetrics({ ...metrics, careerAdvice: Number(e.target.value) })}
                      className="w-full accent-green-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Learner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Your Name</label>
                  <input
                    required
                    type="text"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                    placeholder="e.g. Kyaw Zin Oo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Your Current Role / Title</label>
                  <input
                    required
                    type="text"
                    value={learnerRole}
                    onChange={(e) => setLearnerRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                    placeholder="e.g. Junior Frontend Developer"
                  />
                </div>
              </div>

              {/* Review Title & Content */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Review Headline</label>
                <input
                  required
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                  placeholder="Summarize the value you received..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">
                  Detailed Feedback <span className="text-zinc-500 font-normal">(Min 20 characters)</span>
                </label>
                <textarea
                  required
                  minLength={20}
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 outline-none"
                  placeholder="Describe how this mentor helped your project architecture, code reviews, and career acceleration..."
                />
              </div>

              {/* Highlights Chips */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-3">Highlights & Tags</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-green-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? 'Publishing Review...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
