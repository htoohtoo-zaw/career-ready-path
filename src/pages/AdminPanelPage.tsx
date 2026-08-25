/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Lock, 
  Search, 
  Check, 
  X, 
  Users, 
  ShieldAlert, 
  UserCheck, 
  Sliders, 
  Copy, 
  Database, 
  RefreshCw, 
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronDown,
  Trash2,
  Edit3,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Globe,
  HeartHandshake,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { getAuthSession, setAuthSession } from '../lib/learnerStore';
import { getMentors } from '../lib/mentorReviewStore';
import { addNotification } from '../lib/notificationsStore';
import { downloadMentorCV } from '../lib/cvDownload';
import { resetScrollPosition } from '../components/layout/ScrollToTop';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'learner' | 'pending_mentor' | 'approved_mentor' | 'admin';
  created_at: string;
}

interface Permission {
  code: string;
  name: string;
  description: string;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { code: 'manage:users', name: 'Manage Users & Roles', description: 'Ability to edit roles, elevate users, and override system settings.' },
  { code: 'manage:roadmaps', name: 'Curate Roadmaps & Nodes', description: 'Modify learning paths, update nodes, and attach reference links.' },
  { code: 'review:mentors', name: 'Review Mentor Applications', description: 'Approve or reject pending industry mentors and complete KYC.' },
];

export const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getAuthSession();

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!session.isLoggedIn || session.role !== 'admin') {
      navigate('/auth/login');
    }
  }, [session, navigate]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Active Tab State for the Admin Dashboard layout
  const [activeTab, setActiveTab] = useState<'users' | 'mentor_requests' | 'schema'>('users');

  useEffect(() => {
    resetScrollPosition();
  }, [activeTab]);
  // Filter for mentor requests
  const [mentorStatusFilter, setMentorStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // KYC Applications Audit States
  const [mentorProfiles, setMentorProfiles] = useState<any[]>([]);
  const [localMentorApps, setLocalMentorApps] = useState<any[]>([]);
  const [reviewingApp, setReviewingApp] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Data State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // User-permission maps (userId -> set of permission codes)
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  
  // Permission Modal State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // User CRUD Modals State
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editUserModalUser, setEditUserModalUser] = useState<Profile | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<Profile | null>(null);

  // Form Inputs State
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formPassword, setFormPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<Profile['role']>('learner');

  // Load user profiles and their permissions (hybrid backend)
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    // Check local storage fallback first or use it to populate initial data
    const localProfilesStr = localStorage.getItem('crp_admin_profiles');
    const localPermsStr = localStorage.getItem('crp_admin_permissions');
    
    let initialProfiles: Profile[] = [];
    let initialPerms: Record<string, string[]> = {};

    if (localProfilesStr) {
      try { initialProfiles = JSON.parse(localProfilesStr); } catch { /* ignore */ }
    }
    if (localPermsStr) {
      try { 
        const parsed = JSON.parse(localPermsStr);
        // Scrub any legacy unassigned or removed permission codes (e.g. send:emails)
        const validCodes = new Set(DEFAULT_PERMISSIONS.map(p => p.code));
        Object.keys(parsed).forEach(uid => {
          if (Array.isArray(parsed[uid])) {
            initialPerms[uid] = parsed[uid].filter((c: string) => validCodes.has(c));
          }
        });
      } catch { /* ignore */ }
    }

    // Default mock profiles for seamless offline fallback
    if (initialProfiles.length === 0) {
      initialProfiles = [
        { id: session.userId || 'admin_user_01', email: session.email || 'admin@gmail.com', full_name: session.name || 'System Administrator', role: 'admin', created_at: new Date().toISOString() },
        { id: 'mentor_sarah_jenkins', email: 'sarah.jenkins@stripe.com', full_name: 'Sarah Jenkins', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
        { id: 'mentor_alex_martinez', email: 'alex.martinez@cloudscale.io', full_name: 'Alex Martinez', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
        { id: 'mentor_marcus_vance', email: 'marcus.vance@netflix.com', full_name: 'Marcus Vance', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
        { id: 'mentor_elena_rostova', email: 'elena.rostova@deepmind.com', full_name: 'Dr. Elena Rostova', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
        { id: 'mentor_david_kim', email: 'david.kim@airbnb.com', full_name: 'David Kim', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
        { id: 'mentor_priya_sharma', email: 'priya.sharma@datadog.com', full_name: 'Priya Sharma', role: 'approved_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
        { id: 'user_david_cloud', email: 'david.cloud@amazon.com', full_name: 'David K.', role: 'pending_mentor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { id: 'user_emily_watson', email: 'emily.watson@gmail.com', full_name: 'Emily Watson', role: 'learner', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: 'user_alex_chen', email: 'alex.chen@outlook.com', full_name: 'Alex Chen', role: 'learner', created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
      ];
      localStorage.setItem('crp_admin_profiles', JSON.stringify(initialProfiles));
    }

    // Default mock applications if not present to match pending mentors
    let localApps: any[] = [];
    const localAppsStr = localStorage.getItem('crp_local_mentor_applications');
    if (localAppsStr) {
      try { localApps = JSON.parse(localAppsStr); } catch { localApps = []; }
    } else {
      localApps = [
        {
          id: 'app_david_cloud',
          userId: 'user_david_cloud',
          fullName: 'David K.',
          email: 'david.cloud@amazon.com',
          specialization: 'Cloud Infrastructure & AWS Solutions',
          selectedTags: ['AWS', 'Terraform', 'Kubernetes', 'Cloud Architecture'],
          bio: '10+ years designing resilient enterprise cloud infrastructure. Applying to mentor junior cloud engineers.',
          linkedinUrl: 'https://linkedin.com/in/david-cloud-aws',
          resumePath: 'kyc-fallbacks/david_k_cloud_architect_cv.pdf',
          kycStatus: 'pending',
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          rejectionReason: null
        }
      ];
      localStorage.setItem('crp_local_mentor_applications', JSON.stringify(localApps));
    }
    setLocalMentorApps(localApps);

    // Merge all local registered accounts, applications & mentors catalog dynamically to keep real stats 100% in sync
    try {
      const registryStr = localStorage.getItem('career_ready_registry') || '{}';
      const registry = JSON.parse(registryStr);

      const profileMap = new Map<string, Profile>();
      initialProfiles.forEach(p => profileMap.set(p.email.toLowerCase(), p));

      // 1. Merge registry users
      Object.keys(registry).forEach(email => {
        const regUser = registry[email];
        const emailLower = email.toLowerCase();
        if (profileMap.has(emailLower)) {
          const existing = profileMap.get(emailLower)!;
          if (regUser.role) existing.role = regUser.role;
          if (regUser.fullName && !existing.full_name) {
            existing.full_name = regUser.fullName;
          }
        } else {
          const stableId = regUser.userId || 'user_' + emailLower.replace(/[^a-z0-9]/g, '');
          profileMap.set(emailLower, {
            id: stableId,
            email: emailLower,
            full_name: regUser.fullName || email.split('@')[0],
            role: regUser.role || 'learner',
            created_at: new Date().toISOString()
          });
        }
      });

      // 2. Merge local applications users
      localApps.forEach((app: any) => {
        const emailLower = (app.email || '').toLowerCase();
        if (!emailLower) return;
        
        let appRole: Profile['role'] = 'learner';
        if (app.kycStatus === 'pending') {
          appRole = 'pending_mentor';
        } else if (app.kycStatus === 'approved') {
          appRole = 'approved_mentor';
        } else if (app.kycStatus === 'rejected') {
          appRole = 'learner';
        }

        if (profileMap.has(emailLower)) {
          const existing = profileMap.get(emailLower)!;
          if (existing.role !== 'admin') {
            existing.role = appRole;
          }
          if (app.fullName && !existing.full_name) {
            existing.full_name = app.fullName;
          }
        } else {
          profileMap.set(emailLower, {
            id: app.userId || 'user_' + Math.random().toString(36).substr(2, 9),
            email: emailLower,
            full_name: app.fullName || app.email.split('@')[0],
            role: appRole,
            created_at: app.submittedAt || new Date().toISOString()
          });
        }
      });

      // 3. Merge mentors from mentorReviewStore if not already present
      try {
        const mentorsList = getMentors();
        mentorsList.forEach(m => {
          const emailLower = (m.email || `${m.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`).toLowerCase();
          if (!profileMap.has(emailLower)) {
            profileMap.set(emailLower, {
              id: m.id || 'mentor_' + emailLower.replace(/[^a-z0-9]/g, ''),
              email: emailLower,
              full_name: m.name,
              role: (m.kycStatus === 'pending' ? 'pending_mentor' : (m.kycStatus === 'rejected' ? 'learner' : 'approved_mentor')),
              created_at: new Date().toISOString()
            });
          }
        });
      } catch (e) {
        // ignore
      }

      initialProfiles = Array.from(profileMap.values());
      localStorage.setItem('crp_admin_profiles', JSON.stringify(initialProfiles));
    } catch (e) {
      console.warn('Error syncing registry users to admin profiles list:', e);
    }

    if (Object.keys(initialPerms).length === 0) {
      // Seed default permissions with verified valid claims
      initialPerms = {
        [session.userId || 'admin_user_01']: ['manage:users', 'manage:roadmaps', 'review:mentors'],
        'mentor_sarah_jenkins': ['manage:roadmaps', 'review:mentors'],
        'mentor_alex_martinez': ['manage:roadmaps'],
        'mentor_marcus_vance': ['manage:roadmaps']
      };
      localStorage.setItem('crp_admin_permissions', JSON.stringify(initialPerms));
    }

    if (isSupabaseConfigured()) {
      try {
        // Fetch profiles from Supabase
        const { data: dbProfiles, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at')
          .order('created_at', { ascending: false });

        if (profilesErr) throw profilesErr;

        if (dbProfiles && dbProfiles.length > 0) {
          const profileMap = new Map<string, Profile>();
          initialProfiles.forEach(p => profileMap.set(p.email.toLowerCase(), p));

          dbProfiles.forEach((p: any) => {
            const emailLower = (p.email || '').toLowerCase();
            const normalizedRole = (p.role === 'mentor' ? 'approved_mentor' : p.role) as Profile['role'];
            if (emailLower) {
              if (profileMap.has(emailLower)) {
                const existing = profileMap.get(emailLower)!;
                existing.role = normalizedRole;
                if (p.full_name) existing.full_name = p.full_name;
              } else {
                profileMap.set(emailLower, {
                  id: p.id,
                  email: p.email,
                  full_name: p.full_name,
                  role: normalizedRole,
                  created_at: p.created_at
                });
              }
            }
          });

          const mergedProfiles = Array.from(profileMap.values());
          setProfiles(mergedProfiles);
          localStorage.setItem('crp_admin_profiles', JSON.stringify(mergedProfiles));
        } else {
          setProfiles(initialProfiles);
        }

        // Fetch user permissions from junction table if exists
        const { data: dbUserPerms, error: permsErr } = await supabase
          .from('user_permissions' as any)
          .select('user_id, permission_code' as any);

        if (!permsErr && dbUserPerms) {
          const mappedPerms: Record<string, string[]> = {};
          dbUserPerms.forEach((row: any) => {
            if (!mappedPerms[row.user_id]) mappedPerms[row.user_id] = [];
            mappedPerms[row.user_id].push(row.permission_code || row.permission_id);
          });
          setUserPermissions(mappedPerms);
          localStorage.setItem('crp_admin_permissions', JSON.stringify(mappedPerms));
        } else {
          setUserPermissions(initialPerms);
        }

        // Fetch mentor profiles
        const { data: dbMentors, error: mentorErr } = await (supabase as any)
          .from('mentor_profiles')
          .select('*, profiles(id, email, full_name)');

        if (!mentorErr && dbMentors) {
          // Check local registry / profiles for any approved status overrides
          const storedLocalApps: any[] = JSON.parse(localStorage.getItem('crp_local_mentor_applications') || '[]');
          const storedProfiles: Profile[] = JSON.parse(localStorage.getItem('crp_admin_profiles') || '[]');
          const registry: Record<string, any> = JSON.parse(localStorage.getItem('career_ready_registry') || '{}');

          const mergedMentors = dbMentors.map((mp: any) => {
            const email = (mp.profiles?.email || mp.email || '').toLowerCase();
            const userId = mp.user_id;

            const isLocalApproved = 
              storedLocalApps.some(la => ((la.email && la.email.toLowerCase() === email) || la.userId === userId) && la.kycStatus === 'approved') ||
              storedProfiles.some(p => ((p.email && p.email.toLowerCase() === email) || p.id === userId) && p.role === 'approved_mentor') ||
              (email && registry[email]?.role === 'approved_mentor');

            const isLocalRejected = 
              storedLocalApps.some(la => ((la.email && la.email.toLowerCase() === email) || la.userId === userId) && la.kycStatus === 'rejected');

            if (isLocalApproved) {
              return {
                ...mp,
                kyc_status: 'approved',
                kyc_rejection_reason: null,
                profiles: mp.profiles ? { ...mp.profiles, role: 'approved_mentor' } : undefined
              };
            } else if (isLocalRejected && mp.kyc_status === 'pending') {
              return {
                ...mp,
                kyc_status: 'rejected'
              };
            }
            return mp;
          });

          setMentorProfiles(mergedMentors);
          localStorage.setItem('crp_db_mentor_profiles', JSON.stringify(mergedMentors));
        }
      } catch (err: any) {
        console.warn('Supabase fetch failed, utilizing full LocalStorage session:', err.message);
        setProfiles(initialProfiles);
        setUserPermissions(initialPerms);
        
        const cachedMentors = localStorage.getItem('crp_db_mentor_profiles');
        if (cachedMentors) {
          try { setMentorProfiles(JSON.parse(cachedMentors)); } catch { /* ignore */ }
        }
      }
    } else {
      setProfiles(initialProfiles);
      setUserPermissions(initialPerms);
    }

    // Load local applications
    const storedLocalAppsStr = localStorage.getItem('crp_local_mentor_applications') || '[]';
    try {
      setLocalMentorApps(JSON.parse(storedLocalAppsStr));
    } catch (e) {
      setLocalMentorApps([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('crp_admin_profiles_updated', handleDataUpdate);
    window.addEventListener('crp_local_mentor_applications_updated', handleDataUpdate);
    window.addEventListener('crp_reviews_updated', handleDataUpdate);

    return () => {
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('crp_admin_profiles_updated', handleDataUpdate);
      window.removeEventListener('crp_local_mentor_applications_updated', handleDataUpdate);
      window.removeEventListener('crp_reviews_updated', handleDataUpdate);
    };
  }, []);

  // Handle Changing User Role
  const handleUpdateRole = async (userId: string, newRole: Profile['role']) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // 1. Update in local storage state
    const updatedProfiles = profiles.map(p => p.id === userId ? { ...p, role: newRole } : p);
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // Also update local mentor application status
    const targetProfile = profiles.find(p => p.id === userId);
    const targetEmail = targetProfile?.email?.toLowerCase();

    const updatedLocalApps = localMentorApps.map(la => {
      if (la.userId === userId || (targetEmail && (la.email || '').toLowerCase() === targetEmail)) {
        if (newRole === 'approved_mentor') return { ...la, kycStatus: 'approved' };
        if (newRole === 'pending_mentor') return { ...la, kycStatus: 'pending' };
        if (newRole === 'learner') return { ...la, kycStatus: 'rejected' };
      }
      return la;
    });
    setLocalMentorApps(updatedLocalApps);
    localStorage.setItem('crp_local_mentor_applications', JSON.stringify(updatedLocalApps));

    // Update role in main registry
    if (targetProfile && targetProfile.email) {
      const emailLower = targetProfile.email.toLowerCase();
      try {
        const registryStr = localStorage.getItem('career_ready_registry') || '{}';
        const registry = JSON.parse(registryStr);
        if (registry[emailLower]) {
          registry[emailLower].role = newRole;
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        } else {
          registry[emailLower] = {
            role: newRole,
            fullName: targetProfile.full_name || emailLower.split('@')[0],
            userId: userId
          };
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        }
      } catch (e) {
        console.warn('Failed to update user role in registry:', e);
      }
    }

    // Also update current active session role if it's the admin itself
    if (userId === session.userId) {
      localStorage.setItem('crp_user_role', newRole);
    }

    // 2. Update in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);

        if (error) throw error;
        setSuccessMsg(`Successfully updated user's role to ${newRole.replace('_', ' ')} in database!`);
      } catch (err: any) {
        console.warn('Supabase update role error:', err.message);
        setSuccessMsg(`Updated user role to ${newRole.replace('_', ' ')} locally (Note: DB synching requires SQL setup).`);
      }
    } else {
      setSuccessMsg(`Successfully updated role locally!`);
    }
    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Handle Approving a Mentor KYC Application
  const handleApproveKYC = async (app: any) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const email = (app.email || app.profiles?.email || '').toLowerCase();
    const userId = app.user_id || app.userId || app.profiles?.id;
    const name = app.full_name || app.profiles?.full_name || app.fullName || email.split('@')[0];

    // 1. Update user role in active profiles state
    const updatedProfiles = profiles.map(p => {
      if ((userId && p.id === userId) || (email && p.email.toLowerCase() === email)) {
        return { ...p, role: 'approved_mentor' as const };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // Also update our local mentor application list
    const updatedLocalApps = localMentorApps.map(la => {
      if ((la.email && la.email.toLowerCase() === email) || la.userId === userId || la.id === app.id) {
        return { ...la, kycStatus: 'approved', kycRejectionReason: null };
      }
      return la;
    });
    setLocalMentorApps(updatedLocalApps);
    localStorage.setItem('crp_local_mentor_applications', JSON.stringify(updatedLocalApps));

    // Also update database mentor profiles state directly
    setMentorProfiles(prev => {
      const updated = prev.map(mp => {
        if (
          mp.id === app.id || 
          mp.user_id === userId || 
          (mp.profiles?.email && mp.profiles.email.toLowerCase() === email) ||
          (mp.email && mp.email.toLowerCase() === email)
        ) {
          return {
            ...mp,
            kyc_status: 'approved',
            kyc_rejection_reason: null,
            profiles: mp.profiles ? { ...mp.profiles, role: 'approved_mentor' } : undefined
          };
        }
        return mp;
      });
      localStorage.setItem('crp_db_mentor_profiles', JSON.stringify(updated));
      return updated;
    });

    // Update main registry
    const registryStr = localStorage.getItem('career_ready_registry') || '{}';
    const registry: Record<string, any> = JSON.parse(registryStr);
    registry[email] = {
      ...registry[email],
      role: 'approved_mentor',
      fullName: name,
      userId: userId || registry[email]?.userId
    };
    localStorage.setItem('career_ready_registry', JSON.stringify(registry));

    // 2. If Supabase is configured, update in tables
    if (isSupabaseConfigured() && userId && !userId.startsWith('user_')) {
      try {
        const { error: pErr } = await (supabase as any)
          .from('profiles')
          .update({ role: 'approved_mentor' })
          .eq('id', userId);

        if (pErr) console.warn('Supabase profiles update role notice:', pErr.message);

        const { error: mErr } = await (supabase as any)
          .from('mentor_profiles')
          .update({ 
            kyc_status: 'approved', 
            kyc_rejection_reason: null,
            kyc_reviewed_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (mErr) {
          console.warn('Supabase mentor_profiles update notice (trying fallback by ID):', mErr.message);
          if (app.id && app.id !== userId) {
            await (supabase as any)
              .from('mentor_profiles')
              .update({ kyc_status: 'approved', kyc_rejection_reason: null })
              .eq('id', app.id);
          }
        }
      } catch (err: any) {
        console.warn('Supabase KYC approval failed, local state maintained:', err.message);
      }
    }

    // 3. Create personal in-app notification for the mentor
    await addNotification(
      'Mentor KYC Approved! 🎉',
      `Congratulations, ${name}! Your mentor credentials and CV have been verified by the administrator. You now have access to the Mentor Portal to manage roadmaps.`,
      'kyc',
      userId || null
    );

    // 4. Create system-wide announcement notification for all users
    await addNotification(
      'New Industry Mentor Verified! 🌟',
      `Please welcome ${name}, our newest industry mentor specializing in ${app.specialization || 'IT Development'}! Check out their customized roadmaps.`,
      'mentor_announcement',
      null
    );

    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));

    setSuccessMsg(`Approved mentor ${name} successfully! Permissions & notifications updated.`);
    setReviewingApp(null);
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle Rejecting a Mentor KYC Application
  const handleRejectKYC = async (app: any, reason: string) => {
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for rejecting this application.');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const email = (app.email || app.profiles?.email || '').toLowerCase();
    const userId = app.user_id || app.userId || app.profiles?.id;
    const name = app.full_name || app.profiles?.full_name || app.fullName || email.split('@')[0];

    // 1. Reset user role in profiles (reverts to learner)
    const updatedProfiles = profiles.map(p => {
      if ((userId && p.id === userId) || (email && p.email.toLowerCase() === email)) {
        return { ...p, role: 'learner' as const };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // Update in local mentor application list
    const updatedLocalApps = localMentorApps.map(la => {
      if ((la.email && la.email.toLowerCase() === email) || la.userId === userId || la.id === app.id) {
        return { ...la, kycStatus: 'rejected', kycRejectionReason: reason };
      }
      return la;
    });
    setLocalMentorApps(updatedLocalApps);
    localStorage.setItem('crp_local_mentor_applications', JSON.stringify(updatedLocalApps));

    // Also update database mentor profiles state directly
    setMentorProfiles(prev => {
      const updated = prev.map(mp => {
        if (
          mp.id === app.id || 
          mp.user_id === userId || 
          (mp.profiles?.email && mp.profiles.email.toLowerCase() === email) ||
          (mp.email && mp.email.toLowerCase() === email)
        ) {
          return {
            ...mp,
            kyc_status: 'rejected',
            kyc_rejection_reason: reason,
            profiles: mp.profiles ? { ...mp.profiles, role: 'learner' } : undefined
          };
        }
        return mp;
      });
      localStorage.setItem('crp_db_mentor_profiles', JSON.stringify(updated));
      return updated;
    });

    // Update main registry to learner
    const registryStr = localStorage.getItem('career_ready_registry') || '{}';
    const registry: Record<string, any> = JSON.parse(registryStr);
    registry[email] = {
      ...registry[email],
      role: 'learner',
      fullName: name,
      userId: userId || registry[email]?.userId
    };
    localStorage.setItem('career_ready_registry', JSON.stringify(registry));

    // 2. If Supabase is configured
    if (isSupabaseConfigured() && userId && !userId.startsWith('user_')) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({ role: 'learner' })
          .eq('id', userId);

        await (supabase as any)
          .from('mentor_profiles')
          .update({ kyc_status: 'rejected', kyc_rejection_reason: reason })
          .eq('user_id', userId);
      } catch (err: any) {
        console.warn('Supabase KYC rejection notice:', err.message);
      }
    }

    // 3. Create personal in-app notification for the mentor detailing the rejection reason
    await addNotification(
      'Mentor Application Update ⚠️',
      `Hello ${name}, your mentor application has been reviewed but was not approved at this time. Reason: "${reason}". Please review your credentials and feel free to apply again.`,
      'kyc',
      userId || null
    );

    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));

    setSuccessMsg(`Declined application for ${name} with reason.`);
    setReviewingApp(null);
    setRejectionReason('');
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle Creating a New User (with password & optional live Supabase backup)
  const handleCreateUser = async (email: string, fullName: string, role: Profile['role'], password: string) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanPassword = password.trim() || 'Password123!';

    if (profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
      setErrorMsg(`A user with email ${email} already exists.`);
      setLoading(false);
      return;
    }

    const tempId = 'user_' + Date.now();
    const newProfile: Profile = {
      id: tempId,
      email: cleanEmail,
      full_name: cleanFullName,
      role,
      created_at: new Date().toISOString()
    };

    const updatedProfiles = [newProfile, ...profiles];
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // Save to career_ready_registry so user can sign in with their password
    try {
      const registryStr = localStorage.getItem('career_ready_registry') || '{}';
      const registry = JSON.parse(registryStr);
      registry[cleanEmail] = {
        role,
        fullName: cleanFullName,
        password: cleanPassword,
        userId: tempId
      };
      localStorage.setItem('career_ready_registry', JSON.stringify(registry));
    } catch (e) {
      console.warn('Error saving user password to local registry:', e);
    }

    // Set default permissions for admin or mentor
    if (role === 'admin') {
      const updatedPerms = { ...userPermissions, [tempId]: ['manage:users', 'manage:roadmaps', 'review:mentors'] };
      setUserPermissions(updatedPerms);
      localStorage.setItem('crp_admin_permissions', JSON.stringify(updatedPerms));
    }

    if (isSupabaseConfigured()) {
      try {
        const adminSession = getAuthSession();
        
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanFullName,
              role: role
            }
          }
        });
        
        if (signUpErr) throw signUpErr;

        // Restore Admin Session immediately to avoid being logged out
        if (adminSession.role === 'admin' && adminSession.email && adminSession.userId) {
          setAuthSession('admin', adminSession.email, adminSession.name, adminSession.userId);
        }

        if (data.user) {
          const finalProfiles = updatedProfiles.map(p => 
            p.id === tempId ? { ...p, id: data.user!.id } : p
          );
          setProfiles(finalProfiles);
          localStorage.setItem('crp_admin_profiles', JSON.stringify(finalProfiles));

          try {
            const registryStr = localStorage.getItem('career_ready_registry') || '{}';
            const registry = JSON.parse(registryStr);
            if (registry[cleanEmail]) {
              registry[cleanEmail].userId = data.user.id;
              localStorage.setItem('career_ready_registry', JSON.stringify(registry));
            }
          } catch (e) {}
        }

        setSuccessMsg(`User "${cleanFullName}" created successfully with role "${role.replace('_', ' ')}" and password set!`);
      } catch (err: any) {
        console.warn('Supabase auth sign up error:', err.message);
        setSuccessMsg(`User "${cleanFullName}" created successfully in directory with credentials configured.`);
      }
    } else {
      setSuccessMsg(`User "${cleanFullName}" created successfully with password and role "${role.replace('_', ' ')}".`);
    }

    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Handle Editing User Information (Email, Full Name, Role)
  const handleEditUser = async (userId: string, email: string, fullName: string, role: Profile['role']) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const updatedProfiles = profiles.map(p => 
      p.id === userId ? { ...p, email, full_name: fullName, role } : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // If edited account is the logged-in admin, update local active session details as well
    if (userId === session.userId) {
      localStorage.setItem('crp_user_role', role);
      localStorage.setItem('crp_user_email', email);
      localStorage.setItem('crp_user_name', fullName);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('profiles')
          .update({ email, full_name: fullName, role })
          .eq('id', userId);

        if (error) throw error;
        setSuccessMsg(`Successfully updated details for "${fullName}" in database!`);
      } catch (err: any) {
        console.warn('Supabase profile update details error:', err.message);
        setSuccessMsg(`Successfully updated details for "${fullName}" locally.`);
      }
    } else {
      setSuccessMsg(`Successfully updated details for "${fullName}" locally.`);
    }

    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Handle Deleting a User Account
  const handleDeleteUser = async (userId: string) => {
    if (userId === session.userId) {
      setErrorMsg("You cannot delete your own logged-in administrator account!");
      return;
    }

    const targetUser = profiles.find(p => p.id === userId);
    const targetEmail = targetUser?.email?.toLowerCase();
    const targetName = targetUser?.full_name || targetUser?.email || 'User';

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const updatedProfiles = profiles.filter(p => p.id !== userId);
    setProfiles(updatedProfiles);
    localStorage.setItem('crp_admin_profiles', JSON.stringify(updatedProfiles));

    // Remove from career_ready_registry
    if (targetEmail) {
      try {
        const registryStr = localStorage.getItem('career_ready_registry') || '{}';
        const registry = JSON.parse(registryStr);
        if (registry[targetEmail]) {
          delete registry[targetEmail];
          localStorage.setItem('career_ready_registry', JSON.stringify(registry));
        }
      } catch (e) {
        console.warn('Error removing user from registry:', e);
      }
    }

    // Also remove from local mentor applications
    const updatedLocalApps = localMentorApps.filter(la => 
      la.userId !== userId && (!targetEmail || (la.email || '').toLowerCase() !== targetEmail)
    );
    setLocalMentorApps(updatedLocalApps);
    localStorage.setItem('crp_local_mentor_applications', JSON.stringify(updatedLocalApps));

    // Revoke special permissions override map
    const updatedPermsMap = { ...userPermissions };
    delete updatedPermsMap[userId];
    setUserPermissions(updatedPermsMap);
    localStorage.setItem('crp_admin_permissions', JSON.stringify(updatedPermsMap));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        setSuccessMsg(`Successfully deleted account "${targetName}" from database!`);
      } catch (err: any) {
        console.warn('Supabase delete profile error:', err.message);
        setSuccessMsg(`Successfully removed user "${targetName}" from directory.`);
      }
    } else {
      setSuccessMsg(`Successfully removed user "${targetName}" from directory.`);
    }

    setDeleteConfirmUser(null);
    window.dispatchEvent(new Event('crp_admin_profiles_updated'));
    window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));
    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Toggle single permission for selected user
  const handleTogglePermission = async (userId: string, permissionCode: string) => {
    const currentCodes = userPermissions[userId] || [];
    let updatedCodes: string[];

    if (currentCodes.includes(permissionCode)) {
      updatedCodes = currentCodes.filter(code => code !== permissionCode);
    } else {
      updatedCodes = [...currentCodes, permissionCode];
    }

    // Update state & local storage
    const updatedPermsMap = { ...userPermissions, [userId]: updatedCodes };
    setUserPermissions(updatedPermsMap);
    localStorage.setItem('crp_admin_permissions', JSON.stringify(updatedPermsMap));

    // Update in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        // Since custom tables 'user_permissions' require the schema SQL to be run,
        // we execute single checks and warn cleanly if columns or tables don't exist yet.
        const { error: deleteErr } = await (supabase as any)
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission_code', permissionCode);

        if (currentCodes.includes(permissionCode)) {
          // Deleted
          if (deleteErr) throw deleteErr;
        } else {
          // Inserted
          const { error: insertErr } = await (supabase as any)
            .from('user_permissions')
            .insert({ user_id: userId, permission_code: permissionCode });
          if (insertErr) throw insertErr;
        }
      } catch (err: any) {
        console.warn('Junction database permission syncing note (requires Supabase SQL run):', err.message);
      }
    }
  };

  // Search & Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Consolidated and deduplicated mentor requests
  const allMentorApps = useMemo(() => {
    const apps: any[] = [];
    
    // 1. From local applications
    localMentorApps.forEach(la => {
      apps.push({
        id: la.id || la.userId || 'local_' + Math.random().toString(36).substr(2, 9),
        userId: la.userId,
        email: la.email || 'N/A',
        fullName: la.fullName || la.email?.split('@')[0] || 'Vetting Candidate',
        bio: la.bio || '',
        linkedinUrl: la.linkedinUrl || '',
        resumePath: la.resumePath || '',
        specialization: la.specialization || 'IT Specialist',
        selectedTags: la.selectedTags || [],
        kycStatus: la.kycStatus || 'pending',
        submittedAt: la.submittedAt || new Date().toISOString(),
        rejectionReason: la.kycRejectionReason || la.rejectionReason || null,
        source: 'local'
      });
    });

    // 2. From database mentor profiles
    mentorProfiles.forEach(mp => {
      apps.push({
        id: mp.id,
        userId: mp.user_id,
        email: mp.profiles?.email || mp.email || 'N/A',
        fullName: mp.profiles?.full_name || mp.fullName || mp.profiles?.email?.split('@')[0] || 'Vetting Candidate',
        bio: mp.bio || '',
        linkedinUrl: mp.linkedin_url || '',
        resumePath: mp.resume_path || '',
        specialization: mp.specialization || 'IT Specialist',
        selectedTags: mp.tags || [],
        kycStatus: mp.kyc_status || 'pending',
        submittedAt: mp.kyc_submitted_at || new Date().toISOString(),
        rejectionReason: mp.kyc_rejection_reason || null,
        source: 'database'
      });
    });

    // 3. Synchronize profiles with pending_mentor or approved_mentor roles
    profiles.forEach(p => {
      if (p.role === 'pending_mentor' || p.role === 'approved_mentor') {
        const em = (p.email || '').toLowerCase();
        if (em) {
          apps.push({
            id: p.id,
            userId: p.id,
            email: p.email,
            fullName: p.full_name || p.email.split('@')[0],
            bio: p.role === 'pending_mentor' 
              ? 'Applying for community industry mentorship and engineering roadmaps guidance.' 
              : 'Verified community industry mentor.',
            linkedinUrl: 'https://linkedin.com',
            resumePath: 'kyc-fallbacks/david_k_cloud_architect_cv.pdf',
            specialization: 'Cloud Infrastructure & Engineering',
            selectedTags: ['Cloud Architecture', 'DevOps', 'Mentorship'],
            kycStatus: p.role === 'pending_mentor' ? 'pending' : 'approved',
            submittedAt: p.created_at || new Date().toISOString(),
            rejectionReason: null,
            source: 'profile'
          });
        }
      }
    });

    // Profile role map for absolute role enforcement
    const profileRoleMap = new Map<string, string>();
    profiles.forEach(p => {
      if (p.email) profileRoleMap.set(p.email.toLowerCase(), p.role);
    });

    // Deduplicate and consolidate by email and userId
    const appMap = new Map<string, any>();

    apps.forEach(app => {
      const emailKey = (app.email || '').toLowerCase();
      const userKey = app.userId || emailKey;
      const primaryKey = emailKey || userKey;
      if (!primaryKey) return;

      const profileRole = profileRoleMap.get(emailKey);
      let effectiveStatus = app.kycStatus || 'pending';
      if (profileRole === 'approved_mentor') {
        effectiveStatus = 'approved';
      }

      if (!appMap.has(primaryKey)) {
        appMap.set(primaryKey, {
          ...app,
          kycStatus: effectiveStatus
        });
      } else {
        const existing = appMap.get(primaryKey)!;
        
        // Priority rule for status: 'approved' always wins over 'pending', 'rejected' wins over 'pending'
        const mergedStatus = 
          profileRole === 'approved_mentor' || effectiveStatus === 'approved' || existing.kycStatus === 'approved'
            ? 'approved'
            : effectiveStatus === 'rejected' || existing.kycStatus === 'rejected'
            ? 'rejected'
            : 'pending';

        appMap.set(primaryKey, {
          ...existing,
          ...app,
          bio: (app.bio && app.bio.length > 5) ? app.bio : existing.bio,
          resumePath: app.resumePath || existing.resumePath,
          linkedinUrl: app.linkedinUrl || existing.linkedinUrl,
          specialization: (app.specialization && app.specialization !== 'IT Specialist') ? app.specialization : (existing.specialization || app.specialization),
          selectedTags: (app.selectedTags && app.selectedTags.length > 0) ? app.selectedTags : existing.selectedTags,
          kycStatus: mergedStatus,
          rejectionReason: app.rejectionReason || existing.rejectionReason,
          submittedAt: existing.submittedAt || app.submittedAt
        });
      }
    });

    return Array.from(appMap.values());
  }, [localMentorApps, mentorProfiles, profiles]);

  // Derived Statistics synced 100% with live data
  const totalProfilesCount = profiles.length;
  const activeAdminsCount = profiles.filter(p => p.role === 'admin').length;
  const pendingMentorsCount = allMentorApps.filter(a => a.kycStatus === 'pending').length;
  const activePermissionsCount = (() => {
    const validProfileIds = new Set(profiles.map(p => p.id));
    const validPermCodes = new Set(DEFAULT_PERMISSIONS.map(p => p.code));
    let count = 0;
    Object.entries(userPermissions).forEach(([userId, perms]) => {
      if (validProfileIds.has(userId) && Array.isArray(perms)) {
        count += perms.filter(code => validPermCodes.has(code)).length;
      }
    });
    return count;
  })();

  // SQL Script to run in Supabase SQL editor
  const sqlScript = `-- ==============================================================================
-- CAREER READY PATH PLATFORM — SUPABASE SCHEMA & RLS SYNCHRONIZER
-- Run this in the Supabase SQL Editor to enable full cross-device storage & RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  role                TEXT NOT NULL DEFAULT 'learner',
  raw_user_meta_data  JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LEARNER PROFILES (MULTI-DEVICE ROADMAP & CV PROGRESS)
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_role             TEXT,
  education_background    TEXT,
  weekly_study_hours      TEXT,
  onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
  customized_roadmap      JSONB DEFAULT NULL,
  customized_cv           JSONB DEFAULT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MENTOR PROFILES & KYC
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio                     TEXT,
  linkedin_url            TEXT,
  github_url              TEXT,
  twitter_url             TEXT,
  website_url             TEXT,
  resume_path             TEXT,
  booking_url             TEXT,
  specialization          TEXT,
  experience_years        NUMERIC DEFAULT 5,
  tags                    TEXT[] DEFAULT ARRAY[]::TEXT[],
  program_title           TEXT,
  program_description     TEXT,
  google_form_url         TEXT,
  is_program_published    BOOLEAN DEFAULT true,
  education_background    TEXT,
  certification           TEXT,
  work_experience         TEXT,
  kyc_status              TEXT NOT NULL DEFAULT 'pending',
  kyc_rejection_reason    TEXT,
  kyc_submitted_at        TIMESTAMPTZ,
  kyc_reviewed_at         TIMESTAMPTZ,
  kyc_reviewed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. MENTORSHIP REQUESTS (1-ON-1 SESSIONS)
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id                  TEXT PRIMARY KEY,
  learner_id          TEXT NOT NULL,
  learner_name        TEXT,
  learner_email       TEXT,
  mentor_id           TEXT NOT NULL,
  mentor_name         TEXT,
  mentor_avatar       TEXT,
  roadmap_track       TEXT,
  skill_level         TEXT,
  github_or_portfolio TEXT,
  goals               TEXT,
  preferred_pace      TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  mentor_notes        TEXT,
  accepted_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. REVIEW REQUESTS & MENTOR FEEDBACK
CREATE TABLE IF NOT EXISTS public.review_requests (
  id                        TEXT PRIMARY KEY,
  learner_id                TEXT NOT NULL,
  learner_name              TEXT,
  learner_email             TEXT,
  learner_experience_years  TEXT,
  mentor_id                 TEXT,
  mentor_name               TEXT,
  mentor_email              TEXT,
  track_slug                TEXT,
  track_title               TEXT,
  milestone_id              TEXT,
  milestone_title           TEXT,
  type                      TEXT NOT NULL DEFAULT 'code_review',
  submission_title          TEXT NOT NULL,
  repo_url                  TEXT,
  live_demo_url             TEXT,
  preferred_date            TEXT,
  preferred_time_slot       TEXT,
  notes                     TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentor_feedback (
  id                      TEXT PRIMARY KEY,
  request_id              TEXT NOT NULL REFERENCES public.review_requests(id) ON DELETE CASCADE,
  mentor_id               TEXT NOT NULL,
  mentor_name             TEXT,
  mentor_specialization   TEXT,
  outcome                 TEXT NOT NULL,
  overall_score           NUMERIC DEFAULT 4.5,
  executive_summary       TEXT,
  rubrics                 JSONB DEFAULT '{}'::jsonb,
  key_strengths           TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_for_improvement   TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_resources   JSONB DEFAULT '[]'::jsonb,
  actionable_next_steps   TEXT,
  is_read_by_learner      BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
  id                  TEXT PRIMARY KEY,
  mentor_id           TEXT NOT NULL,
  learner_id          TEXT NOT NULL,
  learner_name        TEXT,
  learner_role        TEXT,
  overall_rating      NUMERIC NOT NULL DEFAULT 5,
  metrics             JSONB DEFAULT '{"codeFeedback": 5, "clarity": 5, "responsiveness": 5, "careerAdvice": 5}'::jsonb,
  review_title        TEXT,
  review_text         TEXT,
  track_name          TEXT,
  tags                TEXT[] DEFAULT ARRAY['🌟 Helpful Review']::TEXT[],
  helpful_count       INT DEFAULT 0,
  liked_by            TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. NOTIFICATIONS & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'system',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_code)
);

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 10. SETUP CROSS-DEVICE RLS POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "learner_profiles_all" ON public.learner_profiles;
CREATE POLICY "learner_profiles_all" ON public.learner_profiles FOR ALL USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mentor_profiles_select" ON public.mentor_profiles;
CREATE POLICY "mentor_profiles_select" ON public.mentor_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "mentor_profiles_modify" ON public.mentor_profiles;
CREATE POLICY "mentor_profiles_modify" ON public.mentor_profiles FOR ALL USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mentorship_requests_all" ON public.mentorship_requests;
CREATE POLICY "mentorship_requests_all" ON public.mentorship_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "review_requests_all" ON public.review_requests;
CREATE POLICY "review_requests_all" ON public.review_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "mentor_feedback_all" ON public.mentor_feedback;
CREATE POLICY "mentor_feedback_all" ON public.mentor_feedback FOR ALL USING (true);

DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
CREATE POLICY "reviews_all" ON public.reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "notifications_all" ON public.notifications;
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "permissions_select" ON public.permissions;
CREATE POLICY "permissions_select" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_permissions_all" ON public.user_permissions;
CREATE POLICY "user_permissions_all" ON public.user_permissions FOR ALL USING (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setSuccessMsg('SQL script successfully copied to clipboard!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Container Wrapper */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Upper Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">System Admin Panel</h1>
            </div>
            <p className="text-sm text-zinc-400">
              Control granular user role elevations, manage customized user permission boundaries, and review logs.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => {
                setFormEmail('');
                setFormFullName('');
                setFormPassword('Password123!');
                setShowPassword(false);
                setFormRole('learner');
                setCreateUserModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-green-600/20"
            >
              <Users className="h-3.5 w-3.5" />
              Create New User
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-green-500' : ''}`} />
              Refresh Directory
            </button>
            <span className="text-xs px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-mono">
              Role: Master Admin
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 text-green-400 text-sm animate-in fade-in duration-200">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Analytics Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-zinc-400">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Profiles</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalProfilesCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Active in directory logs</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-zinc-400">
              <ShieldAlert className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Active Admins</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{activeAdminsCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Full platform system access</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-zinc-400">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Pending Mentors</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{pendingMentorsCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Require identity vetting</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-zinc-400">
              <Sliders className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Permissions Active</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{activePermissionsCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Granular security exemptions</p>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex border-b border-zinc-800 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-green-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>User Directory ({profiles.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('mentor_requests')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'mentor_requests'
                ? 'border-green-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Mentor Requests</span>
              {pendingMentorsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full">
                  {pendingMentorsCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'border-green-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Database Setup</span>
            </div>
          </button>
        </div>

        {/* Tab 1: User Directory */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Quick Pending Applications Indicator Alert */}
            {pendingMentorsCount > 0 && (
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Pending Mentor Applications</p>
                    <p className="text-xs text-zinc-400 mt-0.5">There are {pendingMentorsCount} candidate requests awaiting credentials audit and activation.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('mentor_requests');
                    setMentorStatusFilter('pending');
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-zinc-950 font-bold text-xs transition-all cursor-pointer self-start sm:self-center"
                >
                  Go to Review Queue &rarr;
                </button>
              </div>
            )}

            {/* Directory Controls and Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">Filter Role:</span>
                  <div className="relative w-full sm:w-56">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-green-500"
                    >
                      <option value="all">All Accounts ({profiles.length})</option>
                      <option value="learner">Learner Profiles ({profiles.filter(p => p.role === 'learner').length})</option>
                      <option value="pending_mentor">Pending Mentors ({profiles.filter(p => p.role === 'pending_mentor').length})</option>
                      <option value="approved_mentor">Approved Mentors ({profiles.filter(p => p.role === 'approved_mentor').length})</option>
                      <option value="admin">Administrators ({profiles.filter(p => p.role === 'admin').length})</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table Directory Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-xs text-zinc-500 uppercase font-mono tracking-wider border-b border-zinc-800/60">
                    <tr>
                      <th scope="col" className="px-6 py-4">User Details</th>
                      <th scope="col" className="px-6 py-4">Role Placement</th>
                      <th scope="col" className="px-6 py-4">Dynamic Permissions Override</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                          No user profiles match your specified filter options or search queries.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((user) => {
                        const currentPerms = userPermissions[user.id] || [];
                        return (
                          <tr key={user.id} className="hover:bg-zinc-950/40 transition-colors">
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold font-mono">
                                  {(user.full_name || user.email)[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                                    {user.full_name || 'Anonymous User'}
                                    {user.id === session.userId && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-green-400">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-zinc-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4.5">
                              <div className="relative inline-block">
                                <select
                                  value={user.role}
                                  disabled={loading}
                                  onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                                  className={`appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${
                                    user.role === 'admin' 
                                      ? 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20' 
                                      : user.role === 'approved_mentor'
                                      ? 'bg-green-500/10 text-green-400 border-green-500/25 hover:bg-green-500/20'
                                      : user.role === 'pending_mentor'
                                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/20'
                                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                                  }`}
                                >
                                  <option value="learner" className="bg-zinc-900 text-zinc-350">Learner</option>
                                  <option value="pending_mentor" className="bg-zinc-900 text-yellow-400">Pending Mentor</option>
                                  <option value="approved_mentor" className="bg-zinc-900 text-green-400">Approved Mentor</option>
                                  <option value="admin" className="bg-zinc-900 text-red-400">Admin</option>
                                </select>
                                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${
                                  user.role === 'admin' 
                                    ? 'text-red-400' 
                                    : user.role === 'approved_mentor'
                                    ? 'text-green-400'
                                    : user.role === 'pending_mentor'
                                    ? 'text-yellow-400'
                                    : 'text-zinc-400'
                                }`} />
                              </div>
                            </td>

                            <td className="px-6 py-4.5">
                              {currentPerms.length === 0 ? (
                                <span className="text-xs text-zinc-500 italic">No special permissions</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {currentPerms.map(code => (
                                    <span key={code} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      {code}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setFormEmail(user.email);
                                    setFormFullName(user.full_name || '');
                                    setFormRole(user.role);
                                    setEditUserModalUser(user);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                  title="Edit User Details"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                  title="Manage Permissions"
                                >
                                  <Sliders className="h-3.5 w-3.5 text-green-500" />
                                  Permissions
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmUser(user)}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-800 text-xs font-semibold text-zinc-400 hover:text-red-400 transition-all inline-flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={user.id === session.userId ? "Cannot delete your own logged-in administrator account" : "Delete Account"}
                                  disabled={user.id === session.userId}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mentor Requests (Consolidated & Custom Vetting History) */}
        {activeTab === 'mentor_requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Status Vetting Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-500 font-mono mr-2">Filter KYC Status:</span>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(status => {
                  const count = status === 'all' 
                    ? allMentorApps.length 
                    : allMentorApps.filter(a => a.kycStatus === status).length;

                  return (
                    <button
                      key={status}
                      onClick={() => setMentorStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                        mentorStatusFilter === status
                          ? 'bg-green-600/15 border-green-500/40 text-green-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* List and Details */}
            {(() => {
              const filteredMentorApps = allMentorApps.filter(app => {
                const matchesSearch = app.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      app.specialization.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = mentorStatusFilter === 'all' || app.kycStatus === mentorStatusFilter;
                return matchesSearch && matchesStatus;
              });

              if (filteredMentorApps.length === 0) {
                return (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 space-y-3">
                    <ShieldAlert className="h-10 w-10 text-zinc-500 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-300">No requests found</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      No mentor requests match your search criteria or the "{mentorStatusFilter}" status filter.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-6">
                  {filteredMentorApps.map((app, idx) => (
                    <div 
                      key={app.id || idx} 
                      className={`bg-zinc-900 border rounded-3xl p-6 relative overflow-hidden transition-all hover:border-zinc-700/80 ${
                        app.kycStatus === 'pending' ? 'border-yellow-500/20 shadow-lg shadow-yellow-500/5' : 'border-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          {/* Profile Header */}
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lg text-green-400">
                              {app.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-white">{app.fullName}</h3>
                                <span className="text-xs text-zinc-500 font-mono">({app.email})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                                  {app.specialization}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">
                                  {app.source === 'database' ? 'Live DB' : 'Sandbox (Local)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* BIO */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Candidate Statement / Professional Bio</div>
                            <p className="text-xs text-zinc-300 italic bg-zinc-950 p-4 rounded-2xl border border-zinc-800 leading-relaxed">
                              "{app.bio || 'No bio submitted.'}"
                            </p>
                          </div>

                          {/* Tags */}
                          {app.selectedTags && app.selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {app.selectedTags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Rejection Details Callout */}
                          {app.kycStatus === 'rejected' && app.rejectionReason && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 text-red-400 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">ADMIN REJECTION REASON:</span>
                              <p className="text-xs italic leading-relaxed">"{app.rejectionReason}"</p>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono flex-wrap">
                            <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                            {app.linkedinUrl && (
                              <a 
                                href={app.linkedinUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-400 hover:underline flex items-center gap-1"
                              >
                                LinkedIn Profile &nearr;
                              </a>
                            )}
                            {app.resumePath && (
                              <button
                                onClick={() => downloadMentorCV(app)}
                                className="text-green-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                              >
                                Download CV / Resume &nearr;
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Placement + Admin Controls */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 w-full lg:w-auto lg:self-stretch">
                          <div className="lg:mb-auto">
                            {app.kycStatus === 'approved' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                                <Check className="h-3 w-3 text-green-400" />
                                Approved
                              </span>
                            )}
                            {app.kycStatus === 'rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                <X className="h-3 w-3 text-red-400" />
                                Rejected
                              </span>
                            )}
                            {app.kycStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                                <Clock className="h-3 w-3 text-yellow-400" />
                                Pending Vetting
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                // Prepare detailed reviewing model app format
                                setReviewingApp(app);
                              }}
                              className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                            >
                              Audit Credentials &amp; KYC
                            </button>
                            {app.kycStatus === 'pending' && (
                              <button
                                onClick={() => handleApproveKYC(app)}
                                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-green-600/15"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 3: Database Setup schema */}
        {activeTab === 'schema' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-bold text-white">Supabase Schema Synchronizer</h3>
                </div>
                <p className="text-xs text-zinc-400">
                  To link roles and permission overrides to your live Supabase database, run this script in the Supabase SQL editor.
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-green-600/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 text-xs font-bold transition-all flex items-center gap-2 self-start cursor-pointer shadow-lg shadow-green-600/5 hover:shadow-green-600/15"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy SQL Script
              </button>
            </div>

            <div className="relative">
              <pre className="text-xs text-zinc-400 font-mono bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 overflow-x-auto max-h-60 leading-relaxed select-all">
                {sqlScript}
              </pre>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950/90 to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </div>
        )}

        {/* Vetting Detail Overlay Dialog Modal */}
        {reviewingApp && (() => {
          const storedDetails = (() => {
            const stored = localStorage.getItem(`crp_mentor_profile_details_${reviewingApp.userId}`);
            if (stored) {
              try { return JSON.parse(stored); } catch (e) {}
            }
            return reviewingApp;
          })();

          return (
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setReviewingApp(null);
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
            >
              <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8 cursor-default">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-xl font-bold text-white">Mentor Credentials &amp; Profile Audit</h3>
                  </div>
                  <button 
                    onClick={() => { setReviewingApp(null); setRejectionReason(''); }}
                    className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                  {/* Left Column: KYC & Verification */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold mb-3">Verification Target</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lg text-green-400">
                          {storedDetails.fullName ? storedDetails.fullName[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{storedDetails.fullName}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Specialization: <span className="text-green-400 font-semibold">{storedDetails.specialization}</span></p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{storedDetails.email}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold mb-2">Professional Candidate Statement</p>
                      <p className="text-xs text-zinc-300 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 leading-relaxed italic">
                        "{storedDetails.bio || 'No statement/bio submitted.'}"
                      </p>
                    </div>

                    {/* Vetting Status and rejection reasons */}
                    <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Vetting status</span>
                        {storedDetails.kycStatus === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold font-mono">
                            Approved
                          </span>
                        )}
                        {storedDetails.kycStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold font-mono">
                            Rejected
                          </span>
                        )}
                        {storedDetails.kycStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold font-mono animate-pulse">
                            Pending
                          </span>
                        )}
                      </div>
                      {storedDetails.kycStatus === 'rejected' && storedDetails.rejectionReason && (
                        <div className="mt-2 text-xs text-red-400 border-t border-zinc-800/60 pt-2 font-sans">
                          <span className="font-semibold uppercase tracking-wider text-[9px] font-mono block text-zinc-500 mb-1">Rejection Reason:</span>
                          "{storedDetails.rejectionReason}"
                        </div>
                      )}
                    </div>

                    {/* Attachments & external profiles */}
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">Verification Links</p>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {storedDetails.linkedinUrl && (
                          <a 
                            href={storedDetails.linkedinUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                          >
                            Verify LinkedIn Profile &nearr;
                          </a>
                        )}
                        {storedDetails.resumePath && (
                          <button
                            onClick={() => downloadMentorCV(storedDetails)}
                            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-green-400 hover:text-green-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            Download Resume CV PDF &nearr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Trustworthy Profile Details & Offerings */}
                  <div className="p-6 sm:p-8 space-y-6 bg-zinc-950/20">
                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">Self-Reported Trustworthy Credentials</h4>
                    
                    <div className="space-y-4">
                      {/* Education Background */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          <GraduationCap className="h-4 w-4 text-zinc-500" />
                          Education Background
                        </div>
                        <p className="text-xs text-zinc-300 bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl min-h-[3.5rem]">
                          {storedDetails.educationBackground || <span className="text-zinc-500 italic">No education details configured.</span>}
                        </p>
                      </div>

                      {/* Work Experience */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          <Briefcase className="h-4 w-4 text-zinc-500" />
                          Work Experience
                        </div>
                        <p className="text-xs text-zinc-300 bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl min-h-[3.5rem]">
                          {storedDetails.workExperience || <span className="text-zinc-500 italic">No professional history configured.</span>}
                        </p>
                      </div>

                      {/* Certifications & Awards */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          <Award className="h-4 w-4 text-zinc-500" />
                          Certifications &amp; Accreditations
                        </div>
                        <p className="text-xs text-zinc-300 bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl min-h-[3.5rem]">
                          {storedDetails.certification || <span className="text-zinc-500 italic">No certifications configured.</span>}
                        </p>
                      </div>

                      {/* Mentorship Program Offerings */}
                      <div className="border-t border-zinc-800/85 pt-4 mt-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400 mb-2">
                          <HeartHandshake className="h-4 w-4" />
                          Configured Mentorship Program
                        </div>
                        {storedDetails.programTitle ? (
                          <div className="bg-green-950/10 border border-green-500/10 p-4 rounded-2xl space-y-2">
                            <h5 className="text-xs font-bold text-white">{storedDetails.programTitle}</h5>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{storedDetails.programDescription}</p>
                            {storedDetails.googleFormUrl && (
                              <a 
                                href={storedDetails.googleFormUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex text-[10px] font-mono text-green-400 hover:underline mt-1"
                              >
                                Application Google Form URL &nearr;
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No mentorship program configured yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer inputs and controls */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/40 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Audit Feedback &amp; Rejection Reason <span className="text-zinc-500 font-mono text-[10px]">(Strictly required for declining)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. 'Please provide a more extensive professional bio and double check your LinkedIn profile link before resubmitting.'"
                      className="w-full p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRejectKYC(reviewingApp, rejectionReason)}
                      disabled={loading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Decline Application
                    </button>
                    <button
                      onClick={() => handleApproveKYC(reviewingApp)}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-green-600/15"
                    >
                      Approve &amp; Activate Mentor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Permissions Overrides Slider Modal */}
      {selectedUser && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default">
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/40">
              <div className="space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">RBAC Security Boundaries</div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-green-500" />
                  Permissions Override: {selectedUser.full_name || selectedUser.email}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Logged Identity:</span>
                  <span className="text-zinc-200 font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Current Group Placement:</span>
                  <span className="text-green-400 font-semibold capitalize">{selectedUser.role.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Enable/Disable System Claims</h4>
                
                <div className="divide-y divide-zinc-800/40 bg-zinc-950/45 border border-zinc-800 rounded-2xl">
                  {DEFAULT_PERMISSIONS.map((perm) => {
                    const hasPerm = (userPermissions[selectedUser.id] || []).includes(perm.code);
                    return (
                      <div key={perm.code} className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                            {perm.name}
                            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {perm.code}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                            {perm.description}
                          </div>
                        </div>

                        {/* Styled Slide Switch */}
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(selectedUser.id, perm.code)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            hasPerm ? 'bg-green-600' : 'bg-zinc-850'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              hasPerm ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/30 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl bg-green-600 text-xs font-bold text-white hover:bg-green-500 cursor-pointer shadow-md shadow-green-600/20"
              >
                Close &amp; Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New User Modal */}
      {createUserModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateUserModalOpen(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateUser(formEmail, formFullName, formRole, formPassword);
              setCreateUserModalOpen(false);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/40">
              <div className="space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">User Catalog Directory</div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Create New Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateUserModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. johndoe@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter password (e.g. Pass123!)"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">The user can log into their account using this password.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Default Group Placement (Role)</label>
                <div className="relative">
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Profile['role'])}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-green-500"
                  >
                    <option value="learner">Learner</option>
                    <option value="pending_mentor">Pending Mentor</option>
                    <option value="approved_mentor">Approved Mentor</option>
                    <option value="admin">System Administrator</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-850 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-green-600 text-xs font-bold text-white hover:bg-green-500 cursor-pointer shadow-md shadow-green-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                <Users className="h-3.5 w-3.5" />
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete User Confirmation Modal Box */}
      {deleteConfirmUser && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmUser(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default">
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/40">
              <div className="space-y-1">
                <div className="text-xs font-mono text-red-400 uppercase tracking-widest">Permanent Deletion</div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Delete User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2">
                <div className="text-xs font-mono text-zinc-500">Selected User Account:</div>
                <div className="text-sm font-bold text-zinc-100">{deleteConfirmUser.full_name || 'Anonymous User'}</div>
                <div className="text-xs font-mono text-zinc-400">{deleteConfirmUser.email}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-green-400">
                    Role: {deleteConfirmUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {deleteConfirmUser.id}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-xs leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  Are you sure you want to permanently delete this user? This action will remove all user credentials, granted security permissions, and directory records. This action cannot be undone.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-850 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? 'Deleting...' : 'Delete User Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Details Modal */}
      {editUserModalUser && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditUserModalUser(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleEditUser(editUserModalUser.id, formEmail, formFullName, formRole);
              setEditUserModalUser(null);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/40">
              <div className="space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Modify Registered Details</div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-green-500" />
                  Edit User Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModalUser(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. johndoe@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Group Placement (Role)</label>
                <div className="relative">
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Profile['role'])}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-green-500"
                  >
                    <option value="learner">Learner</option>
                    <option value="pending_mentor">Pending Mentor</option>
                    <option value="approved_mentor">Approved Mentor</option>
                    <option value="admin">System Administrator</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditUserModalUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-850 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-green-600 text-xs font-bold text-white hover:bg-green-500 cursor-pointer shadow-md shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
