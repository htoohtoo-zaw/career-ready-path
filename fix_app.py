with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

old_imports = "import { AdminPanelPage } from './pages/AdminPanelPage';\nimport { CVGeneratorPage } from './pages/CVGeneratorPage';\nimport { MentorsPage } from './pages/MentorsPage';\nimport { MentorProfilePage } from './pages/MentorProfilePage';\nimport { supabase, isSupabaseConfigured } from './lib/supabase/client';"

new_imports = "import { AdminPanelPage } from './pages/AdminPanelPage';\nimport { CVGeneratorPage } from './pages/CVGeneratorPage';\nimport { MentorsPage } from './pages/MentorsPage';\nimport { MentorProfilePage } from './pages/MentorProfilePage';\nimport { ProtectedRoute } from './components/layout/ProtectedRoute';\nimport { supabase, isSupabaseConfigured } from './lib/supabase/client';"

content = content.replace(old_imports, new_imports)

old_routes = """                  <Route path="/roadmaps" element={<RoadmapsPage />} />
                  <Route path="/roadmaps/:slug" element={<RoadmapDetailPage />} />
                  <Route path="/mentors" element={<MentorsPage />} />
                  <Route path="/mentors/:id" element={<MentorProfilePage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/cv-generator" element={<CVGeneratorPage />} />
                  <Route path="/admin-panel" element={<AdminPanelPage />} />
                  <Route path="/auth/login" element={<AuthPage mode="login" />} />
                  <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
                  <Route path="/apply-mentor" element={<ApplyMentorPage />} />"""

new_routes = """                  <Route path="/roadmaps" element={<ProtectedRoute><RoadmapsPage /></ProtectedRoute>} />
                  <Route path="/roadmaps/:slug" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
                  <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
                  <Route path="/mentors/:id" element={<ProtectedRoute><MentorProfilePage /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/cv-generator" element={<ProtectedRoute><CVGeneratorPage /></ProtectedRoute>} />
                  <Route path="/admin-panel" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
                  <Route path="/auth/login" element={<AuthPage mode="login" />} />
                  <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
                  <Route path="/apply-mentor" element={<ProtectedRoute><ApplyMentorPage /></ProtectedRoute>} />"""

content = content.replace(old_routes, new_routes)

with open('src/App.tsx', 'w') as f:
    f.write(content)
