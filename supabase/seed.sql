-- ==============================================================================
-- CAREER READY PATH PLATFORM — SUPABASE SEED DATA
-- Description: Seed script from Appendix A of the specification. Populates
-- initial IT job roles, expertise tags, and the complete Frontend Developer
-- career roadmap with sequential nodes and curated resources.
-- ==============================================================================

-- 1. SEED JOB ROLES (from Appendix A)
INSERT INTO public.job_roles (id, name, slug, description)
VALUES
  ('11111111-1111-4111-a111-111111111111', 'Frontend Developer', 'frontend-developer', 'Build user-facing web interfaces with HTML, CSS, JavaScript, and modern frameworks like React.'),
  ('22222222-2222-4222-a222-222222222222', 'Backend Developer', 'backend-developer', 'Design robust server-side APIs, manage databases, and ensure system scalability and security.'),
  ('33333333-3333-4333-a333-333333333333', 'Full Stack Developer', 'full-stack-developer', 'Master both client-side and server-side engineering to deliver complete web applications.'),
  ('44444444-4444-4444-a444-444444444444', 'Data Scientist', 'data-scientist', 'Analyze complex data sets, build predictive machine learning models, and derive strategic insights.'),
  ('55555555-5555-4555-a555-555555555555', 'Data Analyst', 'data-analyst', 'Transform raw data into meaningful visualizations, SQL reports, and business intelligence dashboards.'),
  ('66666666-6666-4666-a666-666666666666', 'DevOps Engineer', 'devops-engineer', 'Automate CI/CD pipelines, containerize applications with Docker/Kubernetes, and manage infrastructure.'),
  ('77777777-7777-4777-a777-777777777777', 'Cloud Engineer', 'cloud-engineer', 'Architect and deploy highly available cloud infrastructures on AWS, Google Cloud, or Azure.'),
  ('88888888-8888-4888-a888-888888888888', 'Mobile Developer (React Native)', 'mobile-developer-react-native', 'Create cross-platform native iOS and Android applications using React Native and TypeScript.'),
  ('99999999-9999-4999-a999-999999999999', 'UI/UX Designer', 'ui-ux-designer', 'Craft intuitive user journeys, interactive wireframes, and accessible design systems in Figma.'),
  ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Cybersecurity Analyst', 'cybersecurity-analyst', 'Monitor networks, assess security vulnerabilities, and defend infrastructure against cyber threats.'),
  ('bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb', 'QA / Test Engineer', 'qa-test-engineer', 'Ensure software excellence through automated end-to-end testing, performance benchmarks, and bug hunting.'),
  ('cccccccc-cccc-4ccc-accc-cccccccccccc', 'Product Manager (Technical)', 'product-manager-technical', 'Bridge engineering teams and business strategy to define product roadmaps and deliver user value.')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. SEED EXPERTISE TAGS
INSERT INTO public.tags (id, name, slug)
VALUES
  ('d1111111-1111-4111-a111-111111111111', 'React', 'react'),
  ('d2222222-2222-4222-a222-222222222222', 'TypeScript', 'typescript'),
  ('d3333333-3333-4333-a333-333333333333', 'Tailwind CSS', 'tailwind-css'),
  ('d4444444-4444-4444-a444-444444444444', 'Node.js', 'nodejs'),
  ('d5555555-5555-4555-a555-555555555555', 'Next.js', 'nextjs'),
  ('d6666666-6666-4666-a666-666666666666', 'PostgreSQL', 'postgresql'),
  ('d7777777-7777-4777-a777-777777777777', 'AWS', 'aws'),
  ('d8888888-8888-4888-a888-888888888888', 'System Design', 'system-design'),
  ('d9999999-9999-4999-a999-999999999999', 'Career Coaching', 'career-coaching'),
  ('daaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Figma', 'figma')
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED FRONTEND DEVELOPER ROADMAP (from Appendix A)
INSERT INTO public.roadmaps (id, job_role_id, title, slug, description, difficulty, estimated_weeks, is_published)
VALUES (
  'e1111111-1111-4111-a111-111111111111',
  '11111111-1111-4111-a111-111111111111',
  'Frontend Developer Career Track',
  'frontend-developer',
  'A complete step-by-step career roadmap to mastering modern web development. Learn HTML, CSS, JavaScript, TypeScript, and React to land your first high-impact frontend role.',
  'beginner',
  24,
  true
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

-- 4. SEED ROADMAP NODES FOR FRONTEND DEVELOPER
-- Root Node: Foundations
INSERT INTO public.roadmap_nodes (id, roadmap_id, parent_id, title, description, sort_order, position_x, position_y)
VALUES
  ('f0000000-0000-4000-a000-000000000000', 'e1111111-1111-4111-a111-111111111111', NULL, 'Foundations', 'Core internet architecture, browsers, DNS, and fundamental development tools required before diving into code.', 1, 400, 0)
ON CONFLICT (id) DO NOTHING;

-- Level 1: Direct children of Foundations
INSERT INTO public.roadmap_nodes (id, roadmap_id, parent_id, title, description, sort_order, position_x, position_y)
VALUES
  ('f1111111-1111-4111-a111-111111111111', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'HTML & CSS', 'Semantic HTML5 markup, accessibility standards (WCAG), CSS grid, flexbox, responsive design, and CSS variables.', 2, 150, 150),
  ('f2222222-2222-4222-a222-222222222222', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'JavaScript Basics', 'Variables, data types, DOM manipulation, ES6+ syntax, asynchronous programming (Promises & async/await), and fetch API.', 3, 400, 150),
  ('f3333333-3333-4333-a333-333333333333', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'Git & Version Control', 'Git commands, branching strategies, GitHub collaboration, pull requests, and resolving merge conflicts.', 4, 650, 150),
  ('f4444444-4444-4444-a444-444444444444', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'React Fundamentals', 'Component architecture, Virtual DOM, JSX syntax, styling React components, and lifecycle essentials.', 5, 400, 300),
  ('f5555555-5555-4555-a555-555555555555', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'Advanced Frontend', 'Production-grade tooling, static typing, performance optimizations, and comprehensive test suites.', 6, 400, 500),
  ('f6666666-6666-4666-a666-666666666666', 'e1111111-1111-4111-a111-111111111111', 'f0000000-0000-4000-a000-000000000000', 'Career Prep', 'Resume structuring, building standout GitHub portfolios, system design interviews, and behavioral coaching.', 7, 400, 700)
ON CONFLICT (id) DO NOTHING;

-- Level 2: Children of React Fundamentals
INSERT INTO public.roadmap_nodes (id, roadmap_id, parent_id, title, description, sort_order, position_x, position_y)
VALUES
  ('f4111111-1111-4111-a111-111111111111', 'e1111111-1111-4111-a111-111111111111', 'f4444444-4444-4444-a444-444444444444', 'Components & Props', 'Building reusable functional components, passing props, default props, and prop types validation.', 1, 150, 400),
  ('f4222222-2222-4222-a222-222222222222', 'e1111111-1111-4111-a111-111111111111', 'f4444444-4444-4444-a444-444444444444', 'State & Hooks', 'Managing component state with useState, side effects with useEffect, custom hooks, and React Context API.', 2, 400, 400),
  ('f4333333-3333-4333-a333-333333333333', 'e1111111-1111-4111-a111-111111111111', 'f4444444-4444-4444-a444-444444444444', 'React Router', 'Client-side routing, nested routes, dynamic parameters, route guards, and lazy loading pages.', 3, 650, 400)
ON CONFLICT (id) DO NOTHING;

-- Level 2: Children of Advanced Frontend
INSERT INTO public.roadmap_nodes (id, roadmap_id, parent_id, title, description, sort_order, position_x, position_y)
VALUES
  ('f5111111-1111-4111-a111-111111111111', 'e1111111-1111-4111-a111-111111111111', 'f5555555-5555-4555-a555-555555555555', 'TypeScript', 'Static type checking, interfaces, generics, utility types, and integrating TypeScript into React codebases.', 1, 150, 600),
  ('f5222222-2222-4222-a222-222222222222', 'e1111111-1111-4111-a111-111111111111', 'f5555555-5555-4555-a555-555555555555', 'Testing (Jest, RTL)', 'Unit testing React components, mocking API calls, accessibility testing, and user event simulations with React Testing Library.', 2, 400, 600),
  ('f5333333-3333-4333-a333-333333333333', 'e1111111-1111-4111-a111-111111111111', 'f5555555-5555-4555-a555-555555555555', 'Performance', 'Code splitting, memoization (useMemo/useCallback), image optimization, Core Web Vitals, and debugging memory leaks.', 3, 650, 600)
ON CONFLICT (id) DO NOTHING;

-- Level 2: Children of Career Prep
INSERT INTO public.roadmap_nodes (id, roadmap_id, parent_id, title, description, sort_order, position_x, position_y)
VALUES
  ('f6111111-1111-4111-a111-111111111111', 'e1111111-1111-4111-a111-111111111111', 'f6666666-6666-4666-a666-666666666666', 'Portfolio Projects', 'Building end-to-end full stack projects with clean architecture, live deployments, and thorough README documentation.', 1, 275, 800),
  ('f6222222-2222-4222-a222-222222222222', 'e1111111-1111-4111-a111-111111111111', 'f6666666-6666-4666-a666-666666666666', 'Interview Preparation', 'Mastering algorithmic whiteboard coding, frontend live coding challenges, behavior frameworks (STAR), and salary negotiation.', 2, 525, 800)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CURATED NODE RESOURCES
INSERT INTO public.roadmap_node_resources (id, node_id, title, url, resource_type, sort_order)
VALUES
  ('r1111111-1111-4111-a111-111111111111', 'f1111111-1111-4111-a111-111111111111', 'MDN Web Docs: HTML & CSS Essentials', 'https://developer.mozilla.org/en-US/docs/Learn', 'documentation', 1),
  ('r2222222-2222-4222-a222-222222222222', 'f1111111-1111-4111-a111-111111111111', 'CSS Grid Garden — Interactive Learning', 'https://cssgridgarden.com/', 'project', 2),
  ('r3333333-3333-4333-a333-333333333333', 'f2222222-2222-4222-a222-222222222222', 'JavaScript.info — Modern JS Tutorial', 'https://javascript.info/', 'article', 1),
  ('r4444444-4444-4444-a444-444444444444', 'f4444444-4444-4444-a444-444444444444', 'Official React Documentation (react.dev)', 'https://react.dev/learn', 'documentation', 1),
  ('r5555555-5555-4555-a555-555555555555', 'f5111111-1111-4111-a111-111111111111', 'TypeScript Handbook for React Developers', 'https://www.typescriptlang.org/docs/handbook/react.html', 'documentation', 1)
ON CONFLICT (id) DO NOTHING;
