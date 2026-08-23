with open('src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

import re
old1 = """        if (signupRole === 'learner') {
          await syncLearnerProfileAfterLogin(fallbackId, email, userName);
                //
            user_id: newUserId,
            fullName: fullName || email.split('@')[0] || 'Learner',
            targetRole: 'Full Stack Developer',
            targetRoleSlug: 'full-stack-developer',
            educationBackground: 'undergraduate',
            weeklyStudyHours: '10_20',
            createdAt: new Date().toISOString(),
          });
        }"""
new1 = """        if (signupRole === 'learner') {
          saveLearnerProfile({
            user_id: newUserId,
            fullName: fullName || email.split('@')[0] || 'Learner',
            targetRole: 'Full Stack Developer',
            targetRoleSlug: 'full-stack-developer',
            educationBackground: 'undergraduate',
            weeklyStudyHours: '10_20',
            createdAt: new Date().toISOString(),
          });
        }"""
content = content.replace(old1, new1)

with open('src/pages/AuthPage.tsx', 'w') as f:
    f.write(content)
