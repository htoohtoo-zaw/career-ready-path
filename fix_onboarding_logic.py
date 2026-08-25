with open('src/pages/OnboardingPage.tsx', 'r') as f:
    content = f.read()

# 1. Add successMsg state
new_state = """  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);"""
content = content.replace("  const [errorMsg, setErrorMsg] = useState<string | null>(null);", new_state)

content = content.replace("  const [errorMsg, setErrorMsg] = useState('');", new_state)

# 2. Add success message UI
error_ui = """        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}"""

success_ui = """        {errorMsg && (
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
        )}"""
content = content.replace(error_ui, success_ui)

new_handleSubmit = """  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      let currentUserId = session.userId;
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
        
        if (error) throw error;

        if (data?.user?.id) {
          currentUserId = data.user.id;
        }

        setAuthSession('learner', currentEmail, currentName, currentUserId!);
      } else if (session.isLoggedIn) {
        currentUserId = session.userId || currentUserId;
        currentName = session.name || currentName;
        currentEmail = session.email || currentEmail;
      } else {
        // Must be authenticated to proceed, user should signup via Supabase.
        throw new Error('You must provide email and password to create an account.');
      }

      saveLearnerProfile({
        user_id: currentUserId || 'local_user',
        fullName: currentName,
        targetRole: selectedRoleObj.title,
        targetRoleSlug: selectedRoleObj.slug,
        educationBackground,
        weeklyStudyHours,
        createdAt: new Date().toISOString(),
      });
      
      setSuccessMsg('Registration successful! Generating your personalized path...');
      
      setTimeout(() => {
        setIsGenerating(false);
        navigate('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.');
      setIsGenerating(false);
    }
  };"""

start_idx = content.find("  const handleSubmit = async (e: React.FormEvent) => {")
end_idx = content.find("  return (")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_handleSubmit + "\n" + content[end_idx:]
    with open('src/pages/OnboardingPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find boundaries")

