/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { LandingPage } from './pages/LandingPage';
import { RoadmapsPage } from './pages/RoadmapsPage';
import { RoadmapDetailPage } from './pages/RoadmapDetailPage';
import { AuthPage } from './pages/AuthPage';
import { ApplyMentorPage } from './pages/ApplyMentorPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { CVGeneratorPage } from './pages/CVGeneratorPage';
import { MentorsPage } from './pages/MentorsPage';
import { MentorProfilePage } from './pages/MentorProfilePage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { setAuthSession, clearAuthSession, getAuthSession } from './lib/learnerStore';

export default function App() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const syncSession = async (session: any) => {
      if (session?.user) {
        const user = session.user;
        let role = user.user_metadata?.role || 'learner';
        let fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner';

        try {
          const { data: profile, error } = await (supabase as any)
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

          if (!error && profile) {
            if (profile.role) role = profile.role;
            if (profile.full_name) fullName = profile.full_name;
          }

          // Check if approved in mentor_profiles
          const { data: mentorProf } = await (supabase as any)
            .from('mentor_profiles')
            .select('kyc_status')
            .eq('user_id', user.id)
            .maybeSingle();

          if (mentorProf?.kyc_status === 'approved') {
            role = 'approved_mentor';
          } else if (mentorProf?.kyc_status === 'pending' && role !== 'approved_mentor' && role !== 'admin') {
            role = 'pending_mentor';
          }
        } catch (err) {
          console.warn('Error fetching profile from db:', err);
        }

        setAuthSession(role, user.email, fullName, user.id);
      } else {
        const currentSession = getAuthSession();
        // Only clear the session if the user was logged in with a real Supabase UUID (not a local fallback user ID starting with "user_")
        if (currentSession.userId && !currentSession.userId.startsWith('user_')) {
          clearAuthSession();
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    // Re-check on focus
    const handleFocus = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) syncSession(session);
      });
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-green-500 selection:text-zinc-950 transition-colors duration-200">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/roadmaps" element={<ProtectedRoute><RoadmapsPage /></ProtectedRoute>} />
                  <Route path="/roadmaps/:slug" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
                  <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
                  <Route path="/mentors/:id" element={<ProtectedRoute><MentorProfilePage /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/cv-generator" element={<ProtectedRoute><CVGeneratorPage /></ProtectedRoute>} />
                  <Route path="/admin-panel" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
                  <Route path="/auth/login" element={<AuthPage mode="login" />} />
                  <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
                  <Route path="/apply-mentor" element={<ProtectedRoute><ApplyMentorPage /></ProtectedRoute>} />
                  {/* Fallback to landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
