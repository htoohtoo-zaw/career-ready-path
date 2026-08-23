/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * All verified industry roadmap positions that mentors can apply for and specialize in.
 * Synchronized with all official catalog roadmaps.
 */
export const ROADMAP_POSITIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Data Analyst',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile Developer (React Native)',
  'UI/UX Designer',
  'Cybersecurity Analyst',
  'QA / Test Engineer',
  'Product Manager (Technical)',
  'AI / Machine Learning Engineer',
  'Blockchain / Web3 Developer',
];

/**
 * Slug-to-Position and Position-to-Slug normalization maps
 */
export const POSITION_TO_SLUG_MAP: Record<string, string> = {
  'Frontend Developer': 'frontend-developer',
  'Backend Developer': 'backend-developer',
  'Full Stack Developer': 'full-stack-developer',
  'Data Scientist': 'data-scientist',
  'Data Analyst': 'data-analyst',
  'DevOps Engineer': 'devops-engineer',
  'Cloud Engineer': 'cloud-engineer',
  'Mobile Developer (React Native)': 'mobile-developer-react-native',
  'UI/UX Designer': 'ui-ux-designer',
  'Cybersecurity Analyst': 'cybersecurity-analyst',
  'QA / Test Engineer': 'qa-test-engineer',
  'Product Manager (Technical)': 'product-manager-technical',
  'AI / Machine Learning Engineer': 'ai-ml-engineer',
  'Blockchain / Web3 Developer': 'blockchain-developer',
};

export const SLUG_TO_POSITION_MAP: Record<string, string> = Object.entries(POSITION_TO_SLUG_MAP).reduce((acc, [pos, slug]) => {
  acc[slug] = pos;
  return acc;
}, {} as Record<string, string>);

/**
 * Check if a mentor is associated with a given roadmap track, either through their
 * professional career roadmap specialization or custom roadmaps they authored.
 */
export function isMentorRelatedToRoadmap(
  mentor: {
    id?: string;
    userId?: string;
    email?: string;
    name?: string;
    specialization?: string;
    targetRole?: string;
    targetRoleSlug?: string;
    roadmapSlug?: string;
    trackSlug?: string;
    careerRoadmapSlug?: string;
    selectedTags?: string[];
    createdRoadmaps?: any[];
  },
  currentRoadmapSlug: string,
  currentRoadmapTitle?: string
): boolean {
  if (!currentRoadmapSlug) return false;

  const targetSlug = currentRoadmapSlug.toLowerCase().trim();

  // 1. Direct trackSlug, careerRoadmapSlug, roadmapSlug or targetRoleSlug match
  if (mentor.trackSlug && mentor.trackSlug.toLowerCase() === targetSlug) {
    return true;
  }
  if (mentor.careerRoadmapSlug && mentor.careerRoadmapSlug.toLowerCase() === targetSlug) {
    return true;
  }
  if (mentor.roadmapSlug && mentor.roadmapSlug.toLowerCase() === targetSlug) {
    return true;
  }
  if (mentor.targetRoleSlug && mentor.targetRoleSlug.toLowerCase() === targetSlug) {
    return true;
  }

  // 2. Check if mentor object has attached createdRoadmaps matching this slug
  if (mentor.createdRoadmaps && Array.isArray(mentor.createdRoadmaps)) {
    const hasCreated = mentor.createdRoadmaps.some((r: any) => 
      (r.slug && r.slug.toLowerCase() === targetSlug) ||
      (r.id && r.id === targetSlug)
    );
    if (hasCreated) return true;
  }

  // 3. Check if mentor created a custom roadmap in localStorage with this slug
  try {
    const localCreatedStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    const localCreated = JSON.parse(localCreatedStr);
    const matchedCustom = localCreated.find((r: any) => {
      const matchSlug = r.slug && r.slug.toLowerCase() === targetSlug;
      if (!matchSlug) return false;

      const matchId = (mentor.userId && r.mentorId === mentor.userId) || (mentor.id && r.mentorId === mentor.id);
      const matchEmail = mentor.email && r.mentorEmail && r.mentorEmail.toLowerCase() === mentor.email.toLowerCase();
      const matchName = mentor.name && r.mentorName && r.mentorName.toLowerCase() === mentor.name.toLowerCase();

      return matchId || matchEmail || matchName;
    });
    if (matchedCustom) return true;
  } catch (e) {
    // ignore
  }

  // 4. Match by specialization name
  const spec = (mentor.specialization || mentor.targetRole || '').trim();
  if (spec) {
    // Normalized key
    const mappedSlug = POSITION_TO_SLUG_MAP[spec];
    if (mappedSlug && mappedSlug.toLowerCase() === targetSlug) {
      return true;
    }

    // Normalize string for fuzzy match comparison
    const cleanSpec = spec.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSlug = targetSlug.replace(/[^a-z0-9]/g, '');
    const cleanTitle = (currentRoadmapTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanSpec && (cleanSlug.includes(cleanSpec) || cleanSpec.includes(cleanSlug) || cleanTitle.includes(cleanSpec))) {
      return true;
    }
  }

  return false;
}

/**
 * Track-specific verified mock mentors for realistic previews on each roadmap.
 */
export const TRACK_MOCK_MENTORS: Record<string, any[]> = {
  'frontend-developer': [
    {
      userId: 'mock_alex_fe',
      fullName: 'Alex Martinez',
      specialization: 'Frontend Developer',
      bio: '8+ years building React & TypeScript applications. Passionate about helping self-taught developers build standout portfolios and prep for interviews.',
      selectedTags: ['React', 'TypeScript', 'System Design'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Computer Science, UC Berkeley',
      workExperience: 'Senior Frontend Engineer at CloudScale (2020-Present)\nFrontend Developer at TechGroup (2016-2020)',
      certification: 'AWS Certified Cloud Practitioner',
      programTitle: 'Frontend Portfolio Acceleration',
      programDescription: 'Intensive 1-on-1 portfolio review, live mock coding sessions, and interview strategies.',
      googleFormUrl: 'https://docs.google.com/forms'
    },
    {
      userId: 'mock_sarah_fe',
      fullName: 'Sarah K. Chen',
      specialization: 'Frontend Developer',
      bio: 'Specializing in design systems, Tailwind CSS, and performance optimization. Happy to review code and conduct mock technical screens.',
      selectedTags: ['Tailwind CSS', 'Next.js', 'Coaching'],
      profilePicUrl: '',
      educationBackground: 'M.S. in Software Engineering, Stanford',
      workExperience: 'Staff UI Architect at DesignFlow (2021-Present)\nSenior UI Engineer at WebWorks (2017-2021)',
      certification: 'Google Professional Cloud Architect',
      programTitle: 'UI Architecture Masterclass',
      programDescription: 'Deep dive into performance optimizations, responsive design systems, and advanced Tailwind CSS applications.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'backend-developer': [
    {
      userId: 'mock_david_be',
      fullName: 'David Vance',
      specialization: 'Backend Developer',
      bio: 'Principal Backend Engineer with 10+ years architecting microservices, PostgreSQL databases, and high-throughput Redis caching layers.',
      selectedTags: ['Node.js', 'PostgreSQL', 'Microservices', 'Redis'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Computer Science, Georgia Tech',
      workExperience: 'Lead Distributed Systems Engineer at DataPipe (2019-Present)\nSenior Backend Developer at HyperScale (2014-2019)',
      certification: 'Certified Kubernetes Administrator (CKA)',
      programTitle: 'Backend Architecture & System Design',
      programDescription: 'End-to-end backend API design, database indexing deep-dives, and real-world system scalability workshops.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'full-stack-developer': [
    {
      userId: 'mock_liam_fs',
      fullName: 'Liam Gallagher',
      specialization: 'Full Stack Developer',
      bio: 'Full Stack Architect specializing in React, Node.js, and Cloud native integrations. Helping developers ship production-grade products.',
      selectedTags: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
      profilePicUrl: '',
      educationBackground: 'B.Eng. in Software Engineering, Waterloo',
      workExperience: 'Full Stack Tech Lead at NexusCore (2020-Present)\nSoftware Engineer at StartupStudio (2017-2020)',
      certification: 'AWS Certified Solutions Architect Associate',
      programTitle: 'Full-Stack Production Blueprint',
      programDescription: 'Build and deploy a complete production-grade SaaS from scratch with authentication, payments, and CI/CD.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'data-scientist': [
    {
      userId: 'mock_elena_ds',
      fullName: 'Dr. Elena Rostova',
      specialization: 'Data Scientist',
      bio: 'PhD in Applied Machine Learning. Ex-FAANG research scientist with focus on predictive modeling, NLP pipelines, and LLM fine-tuning.',
      selectedTags: ['Python', 'PyTorch', 'Machine Learning', 'Statistics'],
      profilePicUrl: '',
      educationBackground: 'Ph.D. in Machine Learning & Statistics, MIT',
      workExperience: 'Staff AI Research Scientist at DeepMatrix (2018-Present)\nData Scientist at QuantLab (2015-2018)',
      certification: 'TensorFlow Certified Developer',
      programTitle: 'Applied AI & Data Science Mentorship',
      programDescription: 'Hands-on guidance for ML pipelines, statistical modeling, research paper reproduction, and AI portfolios.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'data-analyst': [
    {
      userId: 'mock_priya_da',
      fullName: 'Priya Sharma',
      specialization: 'Data Analyst',
      bio: 'Lead BI & Analytics Consultant helping learners master SQL optimization, PowerBI dashboarding, and actionable business storytelling.',
      selectedTags: ['SQL', 'Tableau', 'PowerBI', 'Business Analytics'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Information Systems & Economics, NYU',
      workExperience: 'Senior Analytics Manager at DataBridge (2020-Present)\nBI Analyst at FinMetrics (2016-2020)',
      certification: 'Microsoft Certified: Power BI Data Analyst Associate',
      programTitle: 'Modern Business Analytics & Dashboarding',
      programDescription: 'Step-by-step SQL mastery, creating executive dashboards, and preparing portfolio case studies.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'devops-engineer': [
    {
      userId: 'mock_marcus_do',
      fullName: 'Marcus Sterling',
      specialization: 'DevOps Engineer',
      bio: 'DevOps & Site Reliability Architect with 9+ years managing multi-region Kubernetes clusters, Terraform IaC, and automated CI/CD pipelines.',
      selectedTags: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Network Engineering, Purdue',
      workExperience: 'Principal SRE at InfraCore (2019-Present)\nDevOps Engineer at CloudStack (2015-2019)',
      certification: 'HashiCorp Certified Terraform Associate & CKA',
      programTitle: 'Production DevOps & SRE Roadmap',
      programDescription: 'Real-world infrastructure as code, zero-downtime deployments, and hands-on Kubernetes troubleshooting.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'cloud-engineer': [
    {
      userId: 'mock_carlos_ce',
      fullName: 'Carlos Rodriguez',
      specialization: 'Cloud Engineer',
      bio: 'Multi-cloud solutions architect (AWS, GCP, Azure). Specializing in cloud migration, cost optimization, and resilient serverless architectures.',
      selectedTags: ['AWS', 'Google Cloud', 'Serverless', 'Terraform'],
      profilePicUrl: '',
      educationBackground: 'M.S. in Cloud Computing, UT Austin',
      workExperience: 'Lead Cloud Solutions Architect at CloudHorizon (2018-Present)\nSystems Engineer at GlobalTech (2014-2018)',
      certification: 'AWS Certified Solutions Architect - Professional',
      programTitle: 'Enterprise Cloud Architecture Certification Track',
      programDescription: 'Prepare for professional cloud certifications with practical labs, architecture diagrams, and mock interviews.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'mobile-developer-react-native': [
    {
      userId: 'mock_lucas_rn',
      fullName: 'Lucas Silva',
      specialization: 'Mobile Developer (React Native)',
      bio: 'Mobile App Lead with 7+ published cross-platform iOS and Android apps on the App Store and Google Play. React Native & Expo specialist.',
      selectedTags: ['React Native', 'Expo', 'iOS', 'Android', 'TypeScript'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Computer Engineering, UIUC',
      workExperience: 'Lead Mobile Engineer at AppVerse (2020-Present)\nMobile App Developer at MobileLabs (2017-2020)',
      certification: 'Apple Developer Certified',
      programTitle: 'React Native Cross-Platform Mastery',
      programDescription: 'Build native mobile UX, push notifications, offline storage, and publish to App Store and Google Play.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'ui-ux-designer': [
    {
      userId: 'mock_maya_ui',
      fullName: 'Maya Lin',
      specialization: 'UI/UX Designer',
      bio: 'Product Designer & Design Systems Lead. Specializing in Figma design systems, WCAG 2.1 accessibility, user testing, and developer handoff.',
      selectedTags: ['Figma', 'Design Systems', 'User Research', 'Wireframing'],
      profilePicUrl: '',
      educationBackground: 'B.F.A. in Interaction Design, RISD',
      workExperience: 'Principal Product Designer at DesignCraft (2019-Present)\nUI Designer at InterfaceStudio (2015-2019)',
      certification: 'Nielsen Norman Group UX Master Certified',
      programTitle: 'UX Case Study & Portfolio Polish',
      programDescription: 'Conduct usability testing, build comprehensive Figma component libraries, and build an interview-ready portfolio.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'cybersecurity-analyst': [
    {
      userId: 'mock_james_sec',
      fullName: 'James Morrison',
      specialization: 'Cybersecurity Analyst',
      bio: 'Information Security Consultant & Ethical Hacker. Focused on SOC operations, OWASP Top 10 web vulnerabilities, and network threat defense.',
      selectedTags: ['Penetration Testing', 'OWASP', 'Network Security', 'SIEM'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Cybersecurity & Forensics, Maryland',
      workExperience: 'Lead Cyber Defense Analyst at SecOps Alliance (2018-Present)\nSecurity Analyst at FortifyGov (2014-2018)',
      certification: 'CompTIA Security+ & CISSP',
      programTitle: 'Defensive Security & Threat Hunting Essentials',
      programDescription: 'Hands-on penetration testing labs, vulnerability assessment report writing, and SOC analyst interview prep.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'qa-test-engineer': [
    {
      userId: 'mock_rachel_qa',
      fullName: 'Rachel Brooks',
      specialization: 'QA / Test Engineer',
      bio: 'SDET & Automation Lead with expertise in Playwright, Cypress, Jest, API performance testing, and continuous test automation in CI/CD.',
      selectedTags: ['Playwright', 'Cypress', 'Automation', 'Jest', 'API Testing'],
      profilePicUrl: '',
      educationBackground: 'B.S. in Software Quality & Testing, Ohio State',
      workExperience: 'Staff QA Automation Lead at QualityFirst (2019-Present)\nSDET at WebTech (2015-2019)',
      certification: 'ISTQB Certified Tester Advanced Level',
      programTitle: 'End-to-End Test Automation Frameworks',
      programDescription: 'Build reliable end-to-end automation test suites, API mock tests, and integrate automated regression runs in CI/CD.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'product-manager-technical': [
    {
      userId: 'mock_nina_pm',
      fullName: 'Nina Patel',
      specialization: 'Product Manager (Technical)',
      bio: 'Technical Product Manager guiding cross-functional engineering teams from zero-to-one product discovery to scale and user retention.',
      selectedTags: ['Product Strategy', 'Agile / Scrum', 'Roadmapping', 'User Research'],
      profilePicUrl: '',
      educationBackground: 'MBA & B.S. in Computer Science, Northwestern',
      workExperience: 'Group Product Manager at TechScale (2019-Present)\nTechnical PM at InnovateLabs (2015-2019)',
      certification: 'Certified Scrum Product Owner (CSPO)',
      programTitle: 'Technical Product Management & Strategy',
      programDescription: 'Master PRD writing, technical backlog prioritization, metrics definition (A/B testing), and executive stakeholder presentations.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'ai-ml-engineer': [
    {
      userId: 'mock_isaac_ai',
      fullName: 'Dr. Isaac Zhang',
      specialization: 'AI / Machine Learning Engineer',
      bio: 'Machine Learning Infrastructure & LLM fine-tuning engineer. Mentoring developers transitioning into generative AI and MLOps production systems.',
      selectedTags: ['PyTorch', 'LLMs', 'FastAPI', 'MLOps', 'Vector DBs'],
      profilePicUrl: '',
      educationBackground: 'Ph.D. in Computer Science (NLP), Carnegie Mellon',
      workExperience: 'Principal ML Engineer at AI Works (2020-Present)\nResearch Engineer at NeuralLabs (2016-2020)',
      certification: 'NVIDIA Certified Deep Learning Specialist',
      programTitle: 'LLM Application Architecture & Production MLOps',
      programDescription: 'Build RAG applications, fine-tune open weights models, and deploy scalable inference servers.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ],
  'blockchain-developer': [
    {
      userId: 'mock_viktor_bc',
      fullName: 'Viktor Koval',
      specialization: 'Blockchain / Web3 Developer',
      bio: 'Senior Smart Contract Engineer specializing in Solidity, Ethereum EVM security audits, and decentralized application architecture.',
      selectedTags: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js'],
      profilePicUrl: '',
      educationBackground: 'M.S. in Cryptography & Computer Security, ETH Zurich',
      workExperience: 'Lead Smart Contract Architect at ChainSecure (2019-Present)\nWeb3 Developer at DAppLabs (2016-2019)',
      certification: 'Certified Ethereum Developer',
      programTitle: 'Smart Contract Development & EVM Security',
      programDescription: 'Write and audit gas-optimized Solidity smart contracts, build frontend dApps with Ethers.js, and deploy to testnets.',
      googleFormUrl: 'https://docs.google.com/forms'
    }
  ]
};
