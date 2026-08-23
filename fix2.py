with open('src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

old2 = """              if (userRole === 'learner') {
                await syncLearnerProfileAfterLogin(fallbackId, email, userName);
                //
                  user_id: fallbackId,
                  fullName: userName,
                  targetRole: 'Full Stack Developer',
                  targetRoleSlug: 'full-stack-developer',
                  educationBackground: 'undergraduate',
                  weeklyStudyHours: '10_20',
                  createdAt: new Date().toISOString(),
                });
              }"""
new2 = """              if (userRole === 'learner') {
                await syncLearnerProfileAfterLogin(fallbackId, email, userName);
              }"""
content = content.replace(old2, new2)

with open('src/pages/AuthPage.tsx', 'w') as f:
    f.write(content)
