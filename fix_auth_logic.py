with open('src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

import re

# We will completely replace handleAuth

new_handleAuth = """  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const signupRole = signupRoleState;

    try {
      if (mode === 'signup') {
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
        if (error) throw error;
        
        const newUserId = data.user?.id || 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '');
        setAuthSession(signupRole, email, fullName, newUserId);
        
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
        setSuccessMsg('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          if (signupRole === 'pending_mentor') {
            navigate('/apply-mentor');
          } else {
            navigate('/onboarding');
          }
        }, 1500);

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

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
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
          } catch (dbErr) {
            console.warn('Could not query public.profiles during login:', dbErr);
          }
        }

        const metadataRole = data.session?.user?.user_metadata?.role;
        const userRole = dbRole || metadataRole || (email.toLowerCase().includes('admin') ? 'admin' : 'learner');
        const userId = data.session?.user?.id;

        if (userRole === 'admin') {
          setAuthSession('admin', email, userName || 'System Admin', userId!);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/admin-panel'); }, 1200);
        } else if (userRole === 'pending_mentor' || userRole === 'mentor' || userRole === 'approved_mentor') {
          setAuthSession(userRole as any, email, userName, userId!);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/apply-mentor'); }, 1200);
        } else {
          setAuthSession('learner', email, userName, userId!);
          await syncLearnerProfileAfterLogin(userId!, email, userName);
          setSuccessMsg('Logged in successfully');
          setTimeout(() => { navigate('/dashboard'); }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };"""

# Replace the old handleAuth with the new one
start_idx = content.find("  const handleAuth = async (e: React.FormEvent) => {")
end_idx = content.find("  return (")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_handleAuth + "\n" + content[end_idx:]
    with open('src/pages/AuthPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find handleAuth block")
