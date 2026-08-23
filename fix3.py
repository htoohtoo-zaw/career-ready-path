with open('src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

old3 = """        if (fallbackRole === 'learner') {
          await syncLearnerProfileAfterLogin(fallbackId, email, userName);
                //
            user_id: fallbackId,
            fullName: fallbackName,
            targetRole: 'Full Stack Developer',
            targetRoleSlug: 'full-stack-developer',
            educationBackground: 'undergraduate',
            weeklyStudyHours: '10_20',
            createdAt: new Date().toISOString(),
          });
        }"""
new3 = """        if (fallbackRole === 'learner') {
          await syncLearnerProfileAfterLogin(fallbackId, email, fallbackName);
        }"""
content = content.replace(old3, new3)

with open('src/pages/AuthPage.tsx', 'w') as f:
    f.write(content)
