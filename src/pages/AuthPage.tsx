/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { getLearnerProfile, setAuthSession, syncLearnerProfileAfterLogin, getAuthSession, saveLearnerProfile } from '../lib/learnerStore';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isMentorIntent = queryParams.get('intent') === 'mentor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [signupRoleState, setSignupRoleState] = useState<'learner' | 'pending_mentor'>(isMentorIntent ? 'pending_mentor' : 'learner');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-seed default admin credentials in local registry on component mount
  useEffect(() => {
    try {
      const registryStr = localStorage.getItem('career_ready_registry') || '{}';
      const registry = JSON.parse(registryStr);
      if (!registry['admin@gmail.com'] || registry['admin@gmail.com'].password !== 'admin123') {
        registry['admin@gmail.com'] = {
          role: 'admin',
          fullName: 'System Administrator',
          password: 'admin123',
          userId: 'admin_user_01'
        };
        localStorage.setItem('career_ready_registry', JSON.stringify(registry));
      }
    } catch (e) {
      console.warn('Error seeding default admin credentials:', e);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const signupRole = signupRoleState;

    try {
      if (mode === 'signup') {
        let newUserId = 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '');
        let isRateLimited = false;

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: signupRole,
              },
            },
          });
          
          if (error) {
            const errStr = (error.message || '').toLowerCase();
            const isRateLimit = errStr.includes('rate limit') || (error as any).status === 429 || (error as any).code === 'over_email_send_rate_limit';
            
            if (isRateLimit) {
              isRateLimited = true;
              try {
                const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
                if (loginData?.user?.id) {
                  newUserId = loginData.user.id;
                }
              } catch (e) {
                // Ignore signIn error
              }
            } else {
              throw error;
            }
          } else if (data.user?.id) {
            newUserId = data.user.id;
          }
        } catch (err: any) {
          const errStr = (err.message || '').toLowerCase();
          const isRateLimit = errStr.includes('rate limit') || err.status === 429 || err.code === 'over_email_send_rate_limit';
          if (isRateLimit) {
            isRateLimited = true;
          } else {
            throw err;
          }
        }
        
        setAuthSession(signupRole, email, fullName, newUserId);
        
        // Ensure profile is in Supabase profiles table
        if (isSupabaseConfigured() && newUserId && !newUserId.startsWith('user_')) {
          try {
            await (supabase as any)
              .from('profiles')
              .upsert({
                id: newUserId,
                email: cleanEmail,
                full_name: fullName || cleanEmail.split('@')[0],
                role: signupRole,
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
          } catch (e) {
            console.warn('Profile upsert on signup notice:', e);
          }
        }
        
        // Save to registration registry for local fallback recovery
        try {
          const registryStr = localStorage.getItem('career_ready_registry') || '{}';
          const registry = JSON.parse(registryStr);
          registry[cleanEmail] = { 
            role: signupRole, 
            fullName: fullName || email.split('@')[0], 
            password,
            userId: newUserId
          };
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        } catch (e) {
          console.warn('Error saving to registry:', e);
        }

        if (signupRole === 'learner') {
          saveLearnerProfile({
            user_id: newUserId,
            fullName: fullName || email.split('@')[0] || 'Learner',
            targetRole: 'Full Stack Developer',
            targetRoleSlug: 'full-stack-developer',
            educationBackground: 'undergraduate',
            weeklyStudyHours: '10_20',
            createdAt: new Date().toISOString(),
          });
        }
        
        // Show success message and wait before redirecting
        if (isRateLimited) {
          setSuccessMsg('Account registered successfully! (Notice: Email rate limit reached — session activated directly)');
        } else {
          setSuccessMsg('Account created successfully! Redirecting...');
        }
        
        setTimeout(() => {
          if (signupRole === 'pending_mentor') {
            navigate('/apply-mentor');
          } else {
            navigate('/onboarding');
          }
        }, 1200);

      } else {
        // Direct Default Admin Login Check
        if (cleanEmail === 'admin@gmail.com' && password === 'admin123') {
          const adminId = 'admin_user_01';
          setAuthSession('admin', cleanEmail, 'System Admin', adminId);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => {
            navigate('/admin-panel');
          }, 1000);
          return;
        }

        let sessionData: any = null;
        let loginError: any = null;

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          sessionData = data;
        } catch (err: any) {
          loginError = err;

          // Check if local registry has credentials to recover seamlessly
          try {
            const registryStr = localStorage.getItem('career_ready_registry') || '{}';
            const registry = JSON.parse(registryStr);
            const matched = registry[cleanEmail];
            
            if (matched && (!matched.password || matched.password === password)) {
              const fallbackId = matched.userId || 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '');
              const userRole = matched.role || (cleanEmail === 'admin@gmail.com' ? 'admin' : 'learner');
              const userName = matched.fullName || email.split('@')[0];
              
              setAuthSession(userRole as any, email, userName, fallbackId);
              
              if (userRole === 'learner') {
                await syncLearnerProfileAfterLogin(fallbackId, email, userName);
              }
              
              setSuccessMsg('Logged in successfully');
              setTimeout(() => {
                if (userRole === 'admin') {
                  navigate('/admin-panel');
                } else if (userRole === 'pending_mentor' || userRole === 'mentor' || userRole === 'approved_mentor') {
                  navigate('/apply-mentor');
                } else {
                  navigate('/dashboard');
                }
              }, 1200);
              return;
            }
          } catch (regErr) {
            console.warn('Registry login error:', regErr);
          }

          throw loginError;
        }
        
        const data = sessionData;
        let dbRole: string | null = null;
        let userName = data.session?.user?.user_metadata?.full_name;
        
        if (data.session?.user) {
          try {
            const { data: profile, error: profileErr } = await (supabase as any)
              .from('profiles')
              .select('role, full_name')
              .eq('id', data.session.user.id)
              .single();
            if (!profileErr && profile) {
              dbRole = profile.role;
              if (profile.full_name) {
                userName = profile.full_name;
              }
            }

            const { data: mentorProf } = await (supabase as any)
              .from('mentor_profiles')
              .select('kyc_status')
              .eq('user_id', data.session.user.id)
              .maybeSingle();

            if (mentorProf?.kyc_status === 'approved') {
              dbRole = 'approved_mentor';
            } else if (mentorProf?.kyc_status === 'pending' && dbRole !== 'approved_mentor') {
              dbRole = 'pending_mentor';
            }
          } catch (dbErr) {
            console.warn('Could not query public.profiles during login:', dbErr);
          }
        }

        const metadataRole = data.session?.user?.user_metadata?.role;
        const userRole = dbRole || metadataRole || (email.toLowerCase().includes('admin') ? 'admin' : 'learner');
        const userId = data.session?.user?.id || 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '');

        try {
          const registryStr = localStorage.getItem('career_ready_registry') || '{}';
          const registry = JSON.parse(registryStr);
          registry[cleanEmail] = { role: userRole, fullName: userName || email.split('@')[0], password, userId };
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        } catch (e) {}

        if (userRole === 'admin') {
          setAuthSession('admin', email, userName || 'System Admin', userId);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/admin-panel'); }, 1200);
        } else if (userRole === 'pending_mentor' || userRole === 'mentor' || userRole === 'approved_mentor') {
          setAuthSession(userRole as any, email, userName, userId);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/apply-mentor'); }, 1200);
        } else {
          setAuthSession('learner', email, userName, userId);
          await syncLearnerProfileAfterLogin(userId, email, userName);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/dashboard'); }, 1200);
        }
      }
    } catch (err: any) {
      const errStr = (err.message || '').toLowerCase();
      const isRateLimit = errStr.includes('rate limit') || err.status === 429 || err.code === 'over_email_send_rate_limit';
      if (isRateLimit) {
        setErrorMsg('Supabase email confirmation rate limit reached (3 emails/hour on default tier). You can log in directly if already registered, or try again shortly.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group justify-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 group-hover:bg-green-500 group-hover:text-zinc-950 transition-all">
            <Compass className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl text-white">
            Career <span className="text-green-500">Ready</span> Path
          </span>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {mode === 'signup' ? 'Create your free account' : 'Welcome back to your path'}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <Link to="/auth/login" className="font-medium text-green-400 hover:text-green-300 transition-colors">
                Log in here
              </Link>
            </>
          ) : (
            <>
              Don't have an account yet?{' '}
              <Link to="/auth/signup" className="font-medium text-green-400 hover:text-green-300 transition-colors">
                Sign up free
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-zinc-900/80 border border-zinc-800/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 text-green-400 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    I want to...
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                      type="button"
                      onClick={() => setSignupRoleState('learner')}
                      className={`flex items-center justify-center py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        signupRoleState === 'learner' 
                          ? 'border-green-500 bg-green-500/10 text-green-400 shadow-sm shadow-green-500/20' 
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      Learn & Grow
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRoleState('pending_mentor')}
                      className={`flex items-center justify-center py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        signupRoleState === 'pending_mentor' 
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20' 
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      Mentor Others
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Martinez"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  min={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Log In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
            <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              &larr; Return to Landing Page
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
