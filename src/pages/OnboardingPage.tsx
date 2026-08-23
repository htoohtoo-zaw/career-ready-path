/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, Clock, GraduationCap, Sparkles, Check, ArrowRight, Briefcase, User, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { JOB_ROLES_CATALOG, saveLearnerProfile, getAuthSession, setAuthSession } from '../lib/learnerStore';
import { supabase } from '../lib/supabase/client';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getAuthSession();

  // Searchable dropdown state
  const [roleQuery, setRoleQuery] = useState('');
  const [selectedRoleSlug, setSelectedRoleSlug] = useState('full-stack-developer');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Education background state
  const [educationBackground, setEducationBackground] = useState('undergraduate');

  // Study hours state
  const [weeklyStudyHours, setWeeklyStudyHours] = useState('10_20');

  // Account registration state
  const [fullName, setFullName] = useState(session.name || '');
  const [email, setEmail] = useState(session.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedRoleObj = JOB_ROLES_CATALOG.find(r => r.slug === selectedRoleSlug) || JOB_ROLES_CATALOG[2];

  const filteredRoles = JOB_ROLES_CATALOG.filter(r =>
    r.title.toLowerCase().includes(roleQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(roleQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const educationOptions = [
    { id: 'graduate', label: 'Graduate / Master\'s Degree', desc: 'Advanced computer science or STEM academic foundation.' },
    { id: 'undergraduate', label: 'Undergraduate / Bachelor\'s Degree', desc: 'Currently pursuing or completed university degree.' },
    { id: 'diploma', label: 'Diploma / Associate Degree', desc: 'Technical college or 2-year vocational IT certification.' },
    { id: 'high_school', label: 'High School / Self-Taught', desc: 'Self-directed learning path without formal university computer science.' },
    { id: 'career_changer', label: 'Career Changer / Bootcamp', desc: 'Transitioning from non-IT professional background into tech.' },
  ];

  const studyHourRanges = [
    { id: '5_10', label: '5 – 10 hours / week', pace: 'Part-time Pace', desc: 'Steady incremental progress alongside a full-time job or university load.' },
    { id: '10_20', label: '10 – 20 hours / week', pace: 'Standard Recommended Pace', desc: 'Balanced focus that completes average roadmaps in 3 to 5 months.' },
    { id: '20_plus', label: '20+ hours / week', pace: 'Intensive Immersion', desc: 'Fast-tracked completion reducing total estimated duration by up to 35%.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');

    try {
      let currentUserId = session.userId || 'user_' + Date.now();
      let currentName = fullName || session.name || email?.split('@')[0] || 'Learner';
      let currentEmail = email || session.email;

      if (!session.isLoggedIn && email && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'learner',
              full_name: currentName,
            },
          },
        });
        if (error) {
          console.warn('Supabase onboarding signup note:', error.message);
        }
        if (data?.user?.id) {
          currentUserId = data.user.id;
        }
        setAuthSession('learner', currentEmail, currentName, currentUserId);

        // Save to registration registry for local fallback recovery
        try {
          const registryStr = localStorage.getItem('career_ready_registry') || '{}';
          const registry = JSON.parse(registryStr);
          registry[currentEmail.toLowerCase()] = {
            role: 'learner',
            fullName: currentName,
            password // Store password for local login fallback
          };
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        } catch (e) {
          console.warn('Error saving onboarding registration to local registry:', e);
        }
      } else if (session.isLoggedIn) {
        currentUserId = session.userId || currentUserId;
        currentName = session.name || currentName;
        currentEmail = session.email || currentEmail;
      } else {
        setAuthSession('learner', currentEmail || 'learner@example.com', currentName, currentUserId);
      }

      setTimeout(() => {
        saveLearnerProfile({
          user_id: currentUserId,
          fullName: currentName,
          targetRole: selectedRoleObj.title,
          targetRoleSlug: selectedRoleObj.slug,
          educationBackground,
          weeklyStudyHours,
          createdAt: new Date().toISOString(),
        });
        setIsGenerating(false);
        navigate('/dashboard');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Learner Registration &amp; Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Customize Your IT Career Roadmap
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Fill out this quick 1-page profile so our engine can automatically generate a tailored roadmap and timeline for your exact goals. You can edit or customize modules anytime later.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8">
          
          {/* Step 1: Target Job Role (Search Dropdown) */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-500" />
                1. What is your Target Job Role? <span className="text-green-500">*</span>
              </span>
              <span className="text-zinc-500 font-normal lowercase">Search &amp; select from catalog</span>
            </label>

            <div className="relative">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase">
                    {selectedRoleObj.category}
                  </span>
                  <span className="font-bold text-base text-white">{selectedRoleObj.title}</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  ~{selectedRoleObj.baseWeeks} Base Weeks &darr;
                </span>
              </div>

              {/* Search Dropdown Popover */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-950">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search roles (e.g. Frontend, DevOps, Data Scientist...)"
                        value={roleQuery}
                        onChange={(e) => setRoleQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-green-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800/60 p-1.5">
                    {filteredRoles.length === 0 ? (
                      <div className="p-4 text-center text-sm text-zinc-500">No matching job roles found.</div>
                    ) : (
                      filteredRoles.map((role) => {
                        const isSelected = role.slug === selectedRoleSlug;
                        return (
                          <div
                            key={role.slug}
                            onClick={() => {
                              setSelectedRoleSlug(role.slug);
                              setDropdownOpen(false);
                              setRoleQuery('');
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-green-600/20 text-white border border-green-500/30'
                                : 'hover:bg-zinc-800/80 text-zinc-300'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-sm flex items-center gap-2">
                                {role.title}
                                {isSelected && <Check className="h-4 w-4 text-green-400 inline" />}
                              </div>
                              <div className="text-xs text-zinc-500">{role.category}</div>
                            </div>
                            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                              {role.baseWeeks} wks
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Education Background */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <GraduationCap className="h-4 w-4 text-green-500" />
              2. What is your Education Background? <span className="text-green-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {educationOptions.map((opt) => {
                const isSelected = educationBackground === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setEducationBackground(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-green-500 ring-2 ring-green-500/20 shadow-lg shadow-green-500/5'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-zinc-100">{opt.label}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-green-500 bg-green-500 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Weekly Study Hours (With Ranges) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <Clock className="h-4 w-4 text-green-500" />
              3. Weekly Study Hours &amp; Pace <span className="text-green-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {studyHourRanges.map((range) => {
                const isSelected = weeklyStudyHours === range.id;
                return (
                  <div
                    key={range.id}
                    onClick={() => setWeeklyStudyHours(range.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-green-600/10 border-green-500 text-white shadow-lg shadow-green-500/10'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-green-400">
                          {range.pace}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-green-400" />}
                      </div>
                      <h4 className="font-extrabold text-base text-zinc-100 mb-1">{range.label}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{range.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Learner Account & Registration */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                4. Learner Account Registration <span className="text-green-500">*</span>
              </span>
              <span className="text-zinc-500 font-normal lowercase">Create account to save &amp; sync your roadmap</span>
            </label>

            {session.isLoggedIn ? (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white">Account Active: {session.name || session.email || 'Learner'}</div>
                    <div className="text-xs text-zinc-400">Your initial customized roadmap will be permanently linked to your profile.</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-green-400">
                  Ready &amp; Verified
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Martinez"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors rounded-lg hover:bg-zinc-800/60"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              <span className="text-green-400 font-semibold">Note:</span> Your customized roadmap and milestone dates will be generated instantly upon submission.
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-base font-bold text-white shadow-xl shadow-green-600/20 hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  {session.isLoggedIn ? 'Generate Customized Roadmap' : 'Register & Generate Roadmap'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
