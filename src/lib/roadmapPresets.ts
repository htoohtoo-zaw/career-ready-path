/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoadmapPresetNode {
  id: string;
  title: string;
  description: string;
  resources: { title: string; url: string; type: string }[];
}

export const PREDEFINED_ROADMAP_NODES: Record<string, RoadmapPresetNode[]> = {
  'frontend-developer': [
    {
      id: 'fe1',
      title: '1. Internet & Web Foundations',
      description: 'Understand core internet architecture: how browsers work, DNS lookup cycles, IP addressing, HTTP request-response structures, and development environment setup.',
      resources: [
        { title: 'MDN Web Docs: How the Web works', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works', type: 'documentation' },
        { title: 'HTTP/2 & HTTP/3 Protocols Explained', url: 'https://http3-explained.haxx.se/', type: 'article' },
        { title: 'Learn command line commands (Bash/Zsh)', url: 'https://www.codecademy.com/learn/learn-the-command-line', type: 'project' }
      ]
    },
    {
      id: 'fe2',
      title: '2. Semantic HTML5 & Responsive CSS3',
      description: 'Master structured document layout, accessibility patterns (WCAG, WAI-ARIA), CSS Grid, Flexbox, media queries, CSS variables, and modern responsive design layouts.',
      resources: [
        { title: 'MDN: HTML Structuring & CSS Layouts', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', type: 'documentation' },
        { title: 'CSS Grid Garden — Play & Learn Grid', url: 'https://cssgridgarden.com/', type: 'project' },
        { title: 'A Complete Guide to Flexbox (CSS-Tricks)', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article' }
      ]
    },
    {
      id: 'fe3',
      title: '3. JavaScript ES6+ & DOM Operations',
      description: 'Learn variables, closure scoping, functional array transformations, DOM node manipulation, event delegation, Promises, Async/Await syntax, and Fetch APIs.',
      resources: [
        { title: 'JavaScript.info — The Modern JS Tutorial', url: 'https://javascript.info/', type: 'article' },
        { title: 'Eloquent JavaScript (Interactive Free Book)', url: 'https://eloquentjavascript.net/', type: 'documentation' },
        { title: 'MDN Guide: Working with the Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', type: 'documentation' }
      ]
    },
    {
      id: 'fe4',
      title: '4. Git & Collaborative Workflows',
      description: 'Manage codebase version history via Git. Practice repository branching strategies, raising GitHub Pull Requests, and resolving merge conflicts.',
      resources: [
        { title: 'Pro Git Book (Free Chapters & Reference)', url: 'https://git-scm.com/book/en/v2', type: 'documentation' },
        { title: 'Oh My Git! Interactive Gamified Version Control', url: 'https://ohmygit.org/', type: 'project' }
      ]
    },
    {
      id: 'fe5',
      title: '5. Modern UI Frameworks: React & State Management',
      description: 'Gain competence in declarative UI design: Virtual DOM algorithms, JSX components, modular component design, state hooks (useState, useEffect), and global managers (Zustand/Context).',
      resources: [
        { title: 'Official React Documentation (react.dev)', url: 'https://react.dev/learn', type: 'documentation' },
        { title: 'Zustand State Manager Starter Guide', url: 'https://zustand.docs.pmnd.rs/getting-started/introduction', type: 'documentation' },
        { title: 'Scrimba: Learn React Interactively for Free', url: 'https://scrimba.com/learn/learnreact', type: 'video' }
      ]
    },
    {
      id: 'fe6',
      title: '6. Production Tooling & Static Typing (TypeScript)',
      description: 'Implement secure typed contracts using TypeScript. Optimize bundlers (Vite, Webpack), manage package files, and configure CSS utility tools like Tailwind CSS.',
      resources: [
        { title: 'TypeScript Handbook for React Developers', url: 'https://www.typescriptlang.org/docs/handbook/react.html', type: 'documentation' },
        { title: 'Tailwind CSS Utility Class Reference Guide', url: 'https://tailwindcss.com/docs', type: 'documentation' },
        { title: 'Vite Guide & Dynamic Configuration Options', url: 'https://vite.dev/guide/', type: 'documentation' }
      ]
    },
    {
      id: 'fe7',
      title: '7. Testing, Portfolio & Career Kickoff',
      description: 'Test react interfaces using Vitest and Playwright. Build a highly portfolio-worthy GitHub profile, compose modern resume outlines, and practice live mock sessions.',
      resources: [
        { title: 'Frontend Interview Handbook — Master Questions', url: 'https://frontendinterviewhandbook.com/', type: 'article' },
        { title: 'Playwright Browser Automation Core Docs', url: 'https://playwright.dev/docs/intro', type: 'documentation' }
      ]
    }
  ],
  'backend-developer': [
    {
      id: 'be1',
      title: '1. Web Servers, Protocols & Node.js Runtime',
      description: 'Analyze HTTP protocols, DNS routing cycles, request/response cycle pipelines, headers, status codes, and non-blocking asynchronous event-loops in Node.js.',
      resources: [
        { title: 'MDN Web Docs: An Overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'documentation' },
        { title: 'The Node.js Event Loop, Timers, and Process NextTick', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', type: 'documentation' }
      ]
    },
    {
      id: 'be2',
      title: '2. RESTful API Architecture & Express.js',
      description: 'Establish high-fidelity API endpoints using Express.js. Configure routing middleware, handle static payloads, process file uploads, and sanitize parameter strings.',
      resources: [
        { title: 'Express.js Routing Guide & Examples', url: 'https://expressjs.com/en/guide/routing.html', type: 'documentation' },
        { title: 'RESTful API Design Best Practices (Industry standards)', url: 'https://restfulapi.net/', type: 'article' }
      ]
    },
    {
      id: 'be3',
      title: '3. Databases: Schema Modeling & SQL vs NoSQL',
      description: 'Coordinate database storage systems. Practice table joining operations, indices optimization, foreign keys, and MongoDB document relationships.',
      resources: [
        { title: 'PostgreSQL Tutorial — From Basics to Advanced', url: 'https://www.postgresqltutorial.com/', type: 'documentation' },
        { title: 'Drizzle ORM Getting Started Guide', url: 'https://orm.drizzle.team/docs/get-started-postgresql', type: 'documentation' },
        { title: 'MongoDB Schema Design & Document Modeling', url: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/', type: 'documentation' }
      ]
    },
    {
      id: 'be4',
      title: '4. Authentication, Cookies, Sessions & JWT',
      description: 'Enforce security protocols: JSON Web Tokens (JWT) for stateless validation, secure httpOnly session cookies, hashing password strings via bcrypt, and setting CORS origins.',
      resources: [
        { title: 'Introduction to JSON Web Tokens (JWT.io)', url: 'https://jwt.io/introduction', type: 'documentation' },
        { title: 'OWASP Authentication & Authorization Cheatsheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'article' }
      ]
    },
    {
      id: 'be5',
      title: '5. In-Memory Caching & Background Queues',
      description: 'Speed up API queries using Redis in-memory storage buffers and delegate intensive tasks to asynchronous workers via BullMQ and Redis queues.',
      resources: [
        { title: 'Redis Getting Started & Core Data Types', url: 'https://redis.io/docs/latest/develop/get-started/', type: 'documentation' },
        { title: 'BullMQ Robust Message & Job Queue Engine', url: 'https://docs.bullmq.io/', type: 'documentation' }
      ]
    },
    {
      id: 'be6',
      title: '6. Server Testing, Dockerization & Scaling',
      description: 'Validate APIs using Vitest and Supertest. Containerize backend environments using Docker, learn database horizontal sharding strategies, and load balance incoming requests.',
      resources: [
        { title: 'Dockerizing a Node.js Web Application Guide', url: 'https://nodejs.org/en/learn/guides/dockerizing-a-node-web-app', type: 'article' },
        { title: 'ByteByteGo System Design Foundations', url: 'https://bytebytego.com/', type: 'video' }
      ]
    }
  ],
  'full-stack-developer': [
    {
      id: 'fs1',
      title: '1. High-Fidelity UI Foundations & State Management',
      description: 'Create responsive web apps using modern React, custom Tailwind design tokens, context sharing, and modular state engines like Zustand.',
      resources: [
        { title: 'Official React Documentation (react.dev)', url: 'https://react.dev/learn', type: 'documentation' },
        { title: 'Zustand Lightweight State Manager', url: 'https://zustand.docs.pmnd.rs/getting-started/introduction', type: 'documentation' }
      ]
    },
    {
      id: 'fs2',
      title: '2. Polyglot API Design: REST & GraphQL',
      description: 'Develop structured backends using Express or Next.js API routes. Model REST endpoints and declarative schemas using GraphQL & Apollo Server.',
      resources: [
        { title: 'GraphQL Official Learning Platform', url: 'https://graphql.org/learn/', type: 'documentation' },
        { title: 'Apollo Server Setup & Query Resolution', url: 'https://www.apollographql.com/docs/', type: 'documentation' }
      ]
    },
    {
      id: 'fs3',
      title: '3. Fully-Typed Database Engineering & ORMs',
      description: 'Model real databases utilizing Prisma or Drizzle ORMs. Synchronize schemas securely, manage seed tasks, and model transactions.',
      resources: [
        { title: 'Prisma Schema Modeling & Quickstart Guide', url: 'https://www.prisma.io/docs/getting-started', type: 'documentation' },
        { title: 'CrunchyData Interactive PostgreSQL Playground', url: 'https://www.crunchydata.com/developers/playground', type: 'project' }
      ]
    },
    {
      id: 'fs4',
      title: '4. Next.js App Router, SSR & Auth.js',
      description: 'Architect full-stack hybrid web applications using the Next.js App Router. Secure server actions, render pages on servers, and authenticate users via Auth.js (NextAuth).',
      resources: [
        { title: 'Next.js App Router Concepts & Server Actions', url: 'https://nextjs.org/docs/app', type: 'documentation' },
        { title: 'Auth.js (NextAuth) Full Setup Guide', url: 'https://authjs.dev/getting-started', type: 'documentation' }
      ]
    },
    {
      id: 'fs5',
      title: '5. Real-Time Sockets & Event Architectures',
      description: 'Establish bidirectional client-server channels via Socket.io. Orchestrate persistent rooms, broadcast states, and configure fallback protocols.',
      resources: [
        { title: 'Socket.io Chat Application Step-by-Step Tutorial', url: 'https://socket.io/get-started/chat', type: 'project' }
      ]
    },
    {
      id: 'fs6',
      title: '6. Docker deployment, CI/CD pipelines & Telemetry',
      description: 'Build robust Docker environments, write deployment recipes in GitHub Actions, and track production health with Sentry.',
      resources: [
        { title: 'Docker Multi-stage Builds Best Practices', url: 'https://docs.docker.com/build/building/multi-stage/', type: 'article' },
        { title: 'GitHub Actions workflow integration handbook', url: 'https://docs.github.com/en/actions', type: 'documentation' }
      ]
    }
  ],
  'data-scientist': [
    {
      id: 'ds1',
      title: '1. Python Scripting, pandas & Jupyter Tools',
      description: 'Establish automated workflows with Python. Execute high-speed numerical tasks with NumPy and manipulate dirty table data with pandas dataframes.',
      resources: [
        { title: 'NumPy Quickstart Guide & Reference', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'documentation' },
        { title: '10 Minutes to pandas Tutorial Cookbook', url: 'https://pandas.pydata.org/pandas-docs/stable/user_guide/10min.html', type: 'article' }
      ]
    },
    {
      id: 'ds2',
      title: '2. Exploratory Analytics & Statistical Modeling',
      description: 'Model statistical tests, execute Exploratory Data Analysis (EDA), apply probability distributions, ANOVA, and hypothesis testing.',
      resources: [
        { title: 'Kaggle Data Cleaning & Synthesis Course', url: 'https://www.kaggle.com/learn/data-cleaning', type: 'project' },
        { title: 'SciPy Statistical Functions Guide', url: 'https://scipy.github.io/devdocs/tutorial/stats.html', type: 'documentation' }
      ]
    },
    {
      id: 'ds3',
      title: '3. Supervised Machine Learning with Scikit-Learn',
      description: 'Train regression, Decision Trees, Random Forests, and Support Vector Machines. Tune parameters via GridSearch pipelines.',
      resources: [
        { title: 'Scikit-Learn Supervised Algorithms Manual', url: 'https://scikit-learn.org/stable/supervised_learning.html', type: 'documentation' },
        { title: 'Hyperparameter Tuning & GridSearch Reference', url: 'https://scikit-learn.org/stable/modules/grid_search.html', type: 'article' }
      ]
    },
    {
      id: 'ds4',
      title: '4. Unsupervised Clustering & PCA Reductions',
      description: 'Uncover patterns in unlabelled datasets: group records using K-Means or DBSCAN, and decompose coordinates using Principal Component Analysis (PCA).',
      resources: [
        { title: 'Scikit-Learn Clustering Overview', url: 'https://scikit-learn.org/stable/modules/clustering.html', type: 'documentation' },
        { title: 'Interactive Visual Guide to Principal Component Analysis', url: 'https://towardsdatascience.com/a-one-stop-shop-for-principal-component-analysis-5582fb7e0a9c', type: 'article' }
      ]
    },
    {
      id: 'ds5',
      title: '5. Deep Learning with PyTorch',
      description: 'Construct Multi-Layer Perceptrons, CNNs, and recurrent pipelines. Tune forward-backward gradient loops in PyTorch.',
      resources: [
        { title: 'PyTorch Deep Learning in 60 Minutes Blitz', url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html', type: 'documentation' },
        { title: 'TensorFlow Core Quickstart Guides', url: 'https://www.tensorflow.org/tutorials', type: 'documentation' }
      ]
    },
    {
      id: 'ds6',
      title: '6. LLMs, Fine-tuning, & FastAPI serving',
      description: 'Leverage transformer models from HuggingFace, fine-tune open-weight LLMs, utilize Gemini API, and serve models with FastAPI and MLflow.',
      resources: [
        { title: 'HuggingFace Transformers Library Tutorial', url: 'https://huggingface.co/docs/transformers/index', type: 'documentation' },
        { title: 'MLflow Tracking API & Registry Guides', url: 'https://mlflow.org/docs/latest/index.html', type: 'documentation' }
      ]
    }
  ],
  'data-analyst': [
    {
      id: 'da1',
      title: '1. Spreadsheet Foundations & Advanced Formulas',
      description: 'Leverage advanced analytical features: nested lookups (XLOOKUP), dynamic arrays, filter formulas, pivot reports, and financial macros.',
      resources: [
        { title: 'Microsoft Excel Official Learning Center', url: 'https://support.microsoft.com/en-us/excel', type: 'documentation' },
        { title: 'Chandoo Interactive Excel Basics & Tips', url: 'https://chandoo.org/wp/excel-basics/', type: 'article' }
      ]
    },
    {
      id: 'da2',
      title: '2. SQL & Relational Databases',
      description: 'Extract custom corporate metrics: multi-table JOINs, nested subqueries, Common Table Expressions (CTEs), and complex window analytic queries.',
      resources: [
        { title: 'SQLZoo Interactive Training Platform', url: 'https://sqlzoo.net/', type: 'project' },
        { title: 'Mode Analytics: Advanced SQL Reference Guide', url: 'https://mode.com/sql-tutorial/', type: 'documentation' }
      ]
    },
    {
      id: 'da3',
      title: '3. Data Wrangling & EDA in Python',
      description: 'Load flat files, filter database frames via pandas, clean null fields, and chart trends with Matplotlib and Seaborn.',
      resources: [
        { title: 'Kaggle Python Data Visualizations Path', url: 'https://www.kaggle.com/learn/data-visualization', type: 'project' },
        { title: 'Seaborn Chart Gallery & Aesthetic Designs', url: 'https://seaborn.pydata.org/examples/index.html', type: 'documentation' }
      ]
    },
    {
      id: 'da4',
      title: '4. Dashboard Engineering: Power BI & Tableau',
      description: 'Develop executive dashboards. Link live SQL sources, model dimension tables, and formulate custom metrics in DAX or Tableau.',
      resources: [
        { title: 'Microsoft Power BI Business Learning Path', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', type: 'documentation' },
        { title: 'Tableau Public Training Videos Catalog', url: 'https://public.tableau.com/en-us/s/resources', type: 'video' }
      ]
    },
    {
      id: 'da5',
      title: '5. Metrics, A/B Testing & Storytelling',
      description: 'Formulate core KPI targets, design statistical hypothesis tests (t-tests, conversion analysis), and write summaries for managers.',
      resources: [
        { title: 'Optimizely Guide to A/B Hypothesis Testing', url: 'https://www.optimizely.com/optimization-glossary/ab-testing/', type: 'article' },
        { title: 'Storytelling with Data Blog Insights', url: 'https://www.storytellingwithdata.com/blog', type: 'article' }
      ]
    }
  ],
  'devops-engineer': [
    {
      id: 'do1',
      title: '1. Linux Administration & Shell Scripting',
      description: 'Master bash scripting pipelines, Linux folder permission structures, process signaling, Cron tasks, and secure SSH tunnels.',
      resources: [
        { title: 'The Linux Command Line (Comprehensive Free Book)', url: 'https://linuxcommand.org/tlcl.php', type: 'documentation' },
        { title: 'DevHints Bash Syntax Cheat Sheet', url: 'https://devhints.io/bash', type: 'article' }
      ]
    },
    {
      id: 'do2',
      title: '2. Container virtualizations (Docker)',
      description: 'Establish modular containers: write multi-stage Dockerfiles, inspect layer storage sizes, and configure local networks with Docker Compose.',
      resources: [
        { title: 'Docker Official Getting Started Guides', url: 'https://docs.docker.com/get-started/', type: 'documentation' },
        { title: 'Optimizing Docker Images & Dockerfiles Best Practices', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', type: 'article' }
      ]
    },
    {
      id: 'do3',
      title: '3. CI/CD Orchestration: GitHub Actions',
      description: 'Build fully automated delivery workflows: trigger testing stages on commit hooks, cache dependencies, and deploy packages to registries.',
      resources: [
        { title: 'GitHub Actions YAML Configuration Reference', url: 'https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions', type: 'documentation' },
        { title: 'GitLab CI/CD Setup Handbook', url: 'https://docs.gitlab.com/ee/ci/quick_start/', type: 'documentation' }
      ]
    },
    {
      id: 'do4',
      title: '4. Infrastructure as Code (Terraform)',
      description: 'Provision mutable and immutable resource blocks: declare variables, coordinate state logs, register provider credentials, and inspect changes.',
      resources: [
        { title: 'Terraform Global Module & Provider Registry', url: 'https://registry.terraform.io/', type: 'documentation' },
        { title: 'HashiCorp Terraform Tutorials Hub', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'project' }
      ]
    },
    {
      id: 'do5',
      title: '5. Kubernetes Cluster Orchestration',
      description: 'Manage production-ready applications inside Kubernetes: write specifications for pods, ingress policies, volumes, and Helm package charts.',
      resources: [
        { title: 'Kubernetes Official Interactive Learning Tutorials', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', type: 'project' },
        { title: 'Helm Quickstart Guide & Chart Formatting', url: 'https://helm.sh/docs/intro/quickstart/', type: 'documentation' }
      ]
    },
    {
      id: 'do6',
      title: '6. Observability: Prometheus & Grafana',
      description: 'Synthesize health logs: instrument scrapers with Prometheus, formulate custom metrics, and plot dashboard maps in Grafana.',
      resources: [
        { title: 'Prometheus Instrumentation Architecture Overview', url: 'https://prometheus.io/docs/introduction/overview/', type: 'documentation' },
        { title: 'Grafana Public Dashboard Marketplace', url: 'https://grafana.com/grafana/dashboards/', type: 'documentation' }
      ]
    }
  ],
  'cloud-engineer': [
    {
      id: 'cl1',
      title: '1. Cloud Infrastructure & Virtual Networks',
      description: 'Construct secure networks in clouds: VPC structures, public/private subnets, routes, load balancers, firewalls, and route tables.',
      resources: [
        { title: 'AWS Cloud Practitioner Study Portal', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', type: 'documentation' },
        { title: 'Google Cloud Virtual Private Cloud Basics', url: 'https://cloud.google.com/training/badges/networking-in-google-cloud-fundamentals', type: 'documentation' }
      ]
    },
    {
      id: 'cl2',
      title: '2. Managed Compute, S3 Storage & Serverless',
      description: 'Host static and dynamic workloads: provision VMs (EC2/GCE), configure secure object stores (S3/GCS), and serve APIs via Lambdas.',
      resources: [
        { title: 'AWS S3 Access Control Policies Guide', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html', type: 'documentation' },
        { title: 'Serverless Framework Quickstart Tutorials', url: 'https://www.serverless.com/framework/docs/getting-started', type: 'project' }
      ]
    },
    {
      id: 'cl3',
      title: '3. Identity and Access Management (IAM) & Audits',
      description: 'Coordinate least-privilege paradigms: write IAM JSON recipes, configure Single Sign-On (SSO), and track api trail queries.',
      resources: [
        { title: 'AWS IAM Policies & Security Best Practices', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html', type: 'documentation' },
        { title: 'GCP Identity & Access Management Reference', url: 'https://cloud.google.com/security/iam', type: 'documentation' }
      ]
    },
    {
      id: 'cl4',
      title: '4. Managed SQL & NoSQL Systems',
      description: 'Provision highly available database clusters: coordinate global AWS DynamoDB collections, Cloud SQL, and redis clusters.',
      resources: [
        { title: 'AWS DynamoDB Architectural Developers Guide', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html', type: 'documentation' },
        { title: 'Google Cloud SQL Postgres Fast Provisioning', url: 'https://cloud.google.com/sql/docs/postgres/quickstart', type: 'documentation' }
      ]
    },
    {
      id: 'cl5',
      title: '5. Cloud Automation with CDK & Terraform',
      description: 'Declare multi-tier architectures: write custom AWS CDK recipes in TypeScript, compile resources, and manage Terraform state files.',
      resources: [
        { title: 'AWS CDK TypeScript Developer Guide', url: 'https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html', type: 'documentation' },
        { title: 'Terraform Cloud Remote State Management', url: 'https://developer.hashicorp.com/terraform/tutorials/cloud-get-started', type: 'project' }
      ]
    },
    {
      id: 'cl6',
      title: '6. Optimization, Scaling & Recovery (DR)',
      description: 'Optimize budgets: configure auto-scaling group thresholds, set up billing budgets, and model active-passive Disaster Recovery paths.',
      resources: [
        { title: 'AWS Well-Architected Framework Pillars', url: 'https://aws.amazon.com/architecture/well-architected/', type: 'documentation' },
        { title: 'Google Cloud Platform Cost Optimization Checklist', url: 'https://cloud.google.com/cost-management/docs/cost-optimization-checklist', type: 'article' }
      ]
    }
  ],
  'mobile-developer-react-native': [
    {
      id: 'mb1',
      title: '1. TypeScript & React Native Component Basics',
      description: 'Establish mobile workspace environments: bootstrap using Expo CLI, learn View, Text, ScrollView primitive layouts, and CSS StyleSheet definitions.',
      resources: [
        { title: 'React Native Official Framework Documentation', url: 'https://reactnative.dev/docs/getting-started', type: 'documentation' },
        { title: 'Expo CLI Interactive Tutorial & Setup', url: 'https://docs.expo.dev/tutorial/introduction/', type: 'project' }
      ]
    },
    {
      id: 'mb2',
      title: '2. Navigation: Stacks & Dynamic Tab Layouts',
      description: 'Structure complex mobile user flows: incorporate stack navigations, bottom tabs, side drawers, and coordinate navigation route parameters.',
      resources: [
        { title: 'React Navigation Documentation & Best Practices', url: 'https://reactnavigation.org/docs/getting-started', type: 'documentation' }
      ]
    },
    {
      id: 'mb3',
      title: '3. State Engine, Input Validation & Cache Storage',
      description: 'Store mobile data: manage global states via Zustand, construct secure input pages with Formik, and persist records via AsyncStorage.',
      resources: [
        { title: 'React Native AsyncStorage API Reference', url: 'https://react-native-async-storage.github.io/async-storage/docs/api', type: 'documentation' },
        { title: 'Formik Forms & Yup Validation Handlers', url: 'https://formik.org/docs/overview', type: 'documentation' }
      ]
    },
    {
      id: 'mb4',
      title: '4. Hardware Device Integration & Notifications',
      description: 'Access device systems: trigger camera feeds, capture location pins, process files, and send local or push notifications.',
      resources: [
        { title: 'Expo Camera Hardware SDK Reference', url: 'https://docs.expo.dev/versions/latest/sdk/camera/', type: 'documentation' },
        { title: 'Expo Location & Geofencing APIs Guide', url: 'https://docs.expo.dev/versions/latest/sdk/location/', type: 'documentation' }
      ]
    },
    {
      id: 'mb5',
      title: '5. Offline-First Storage Engine (SQLite)',
      description: 'Ensure functional offline capabilities: store complex data using Realm or SQLite adapters with transactional queries.',
      resources: [
        { title: 'WatermelonDB High-Performance Mobile Database Guide', url: 'https://watermelondb.dev/docs/Overview', type: 'documentation' },
        { title: 'SQLite Quick-Plugin for React Native Native Modules', url: 'https://github.com/margelo/react-native-quick-sqlite', type: 'project' }
      ]
    },
    {
      id: 'mb6',
      title: '6. EAS Builds, App Store Portals & Updates',
      description: 'Submit apps to production: bundle APK/AAB and IPA structures using EAS, manage portals, and apply OTA instant updates.',
      resources: [
        { title: 'Expo Application Services (EAS) Build Guide', url: 'https://docs.expo.dev/build/introduction/', type: 'documentation' },
        { title: 'App Store Connect Submission Guidelines', url: 'https://developer.apple.com/app-store/review/guidelines/', type: 'article' }
      ]
    }
  ],
  'ui-ux-designer': [
    {
      id: 'ux1',
      title: '1. UI Principles, Grids & Typography Theories',
      description: 'Study design elements: implement visual layouts, coordinate functional font pairing rules, and construct high-contrast color schemes.',
      resources: [
        { title: 'Interaction Design Foundation Resources', url: 'https://www.interaction-design.org/literature', type: 'documentation' },
        { title: 'Refactoring UI UI/UX Cheat Book', url: 'https://www.refactoringui.com/', type: 'article' }
      ]
    },
    {
      id: 'ux2',
      title: '2. User Interviews, Card Sorting & Journeys',
      description: 'Formulate core layouts: interview target cohorts, execute card sorting workshops, and model journey sitemaps.',
      resources: [
        { title: 'Nielsen Norman Group UX Research Guides', url: 'https://www.nngroup.com/articles/which-ux-research-methods/', type: 'documentation' },
        { title: 'Miro Interactive Journey & Flow Maps', url: 'https://miro.com/templates/user-flow/', type: 'project' }
      ]
    },
    {
      id: 'ux3',
      title: '3. Wireframes & Figma Auto-Layout Masterclass',
      description: 'Create components in Figma: master nested component variations, auto-layout matrices, fluid constraints, and interactive states.',
      resources: [
        { title: 'Figma Official Video Tutorials & Guides', url: 'https://help.figma.com/hc/en-us/categories/360002046114-Tutorials-and-videos', type: 'video' },
        { title: 'Figma Auto-Layout Master Sandbox', url: 'https://www.figma.com/community/file/783489473464718112', type: 'project' }
      ]
    },
    {
      id: 'ux4',
      title: '4. Cohesive Design Systems & Token Tokens',
      description: 'Scale interface blueprints: specify margin heights, button categories, nested form components, and coordinate dark mode variations.',
      resources: [
        { title: 'Google Material Design 3 Styling Spec', url: 'https://m3.material.io/', type: 'documentation' },
        { title: 'Apple Human Interface Guidelines Platform', url: 'https://developer.apple.com/design/human-interface-guidelines/', type: 'documentation' }
      ]
    },
    {
      id: 'ux5',
      title: '5. Dynamic Usability Sessions & Handoff Specifications',
      description: 'Validate flows: execute interactive Maze surveys, synthesize hotspot graphs, and document dev specifications.',
      resources: [
        { title: 'Maze Collaborative Usability Testing Manual', url: 'https://maze.co/guides/usability-testing/', type: 'documentation' },
        { title: 'Figma Developer Mode & Specs Guide', url: 'https://www.figma.com/dev-mode/', type: 'article' }
      ]
    }
  ],
  'cybersecurity-analyst': [
    {
      id: 'cy1',
      title: '1. Net Protocols & Packet Inspections (Wireshark)',
      description: 'Deconstruct ethernet headers: track IP pin sequences, inspect TLS exchanges, and analyze packet files in Wireshark.',
      resources: [
        { title: 'Wireshark User Guide & Deep Analysis Examples', url: 'https://www.wireshark.org/docs/wsug_html_chunked/', type: 'documentation' },
        { title: 'OverTheWire Security Linux Wargames', url: 'https://overthewire.org/wargames/', type: 'project' }
      ]
    },
    {
      id: 'cy2',
      title: '2. Threat Modeling, OWASP & Vulnerability Audits',
      description: 'Assess security models: implement STRIDE profiles, audit servers against OWASP Top 10 vulnerabilities, and scan with Nmap.',
      resources: [
        { title: 'OWASP Top 10 Core Security Threats Handbook', url: 'https://owasp.org/www-project-top-ten/', type: 'documentation' },
        { title: 'Nmap Port Scanner Command Reference Guide', url: 'https://nmap.org/book/nse.html', type: 'documentation' }
      ]
    },
    {
      id: 'cy3',
      title: '3. SIEM Monitoring, Logs & Threat Hunting',
      description: 'Audit network access tracks: query central Splunk engines, map firewall telemetry graphs, and build warning filters.',
      resources: [
        { title: 'Splunk Free SIEM Training Paths', url: 'https://www.splunk.com/en_us/training.html', type: 'documentation' },
        { title: 'Elastic Security Threat Hunting Reference Guide', url: 'https://www.elastic.co/security/threat-hunting', type: 'project' }
      ]
    },
    {
      id: 'cy4',
      title: '4. Incident Response & Incident Response Manuals',
      description: 'Restore systems: isolate corrupted nodes, track virus binaries via checksum hashes, and draft incident report logs.',
      resources: [
        { title: 'NIST Computer Security Incident Handling Guide', url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf', type: 'documentation' },
        { title: 'SANS Institute Security Incident Response Checklist', url: 'https://www.sans.org/white-papers/685/', type: 'article' }
      ]
    }
  ],
  'qa-test-engineer': [
    {
      id: 'qa1',
      title: '1. STLC, Manual Scripts & Defect Tracking',
      description: 'Understand core QA: structure test cases, coordinate manual runs, track regressions, and log tickets in bug trackers.',
      resources: [
        { title: 'Software Testing Help — Comprehensive Tutorials', url: 'https://www.softwaretestinghelp.com/', type: 'documentation' },
        { title: 'Bugzilla Bug Logging Framework Manual', url: 'https://www.bugzilla.org/docs/', type: 'documentation' }
      ]
    },
    {
      id: 'qa2',
      title: '2. Backend API Validation & Postman Suites',
      description: 'Execute deep api validation checks: compile dynamic assertion files in Postman and trigger collections with Newman CLI.',
      resources: [
        { title: 'Postman Learning Platform & Collection Asserts', url: 'https://learning.postman.com/docs/getting-started/introduction/', type: 'documentation' },
        { title: 'Newman CLI Runner Configuration Handbook', url: 'https://learning.postman.com/docs/collections/using-newman-cli/', type: 'project' }
      ]
    },
    {
      id: 'qa3',
      title: '3. Browser E2E Automation (Playwright)',
      description: 'Develop fully automated browser paths: parse DOM components, handle persistent authentications, and capture state images.',
      resources: [
        { title: 'Playwright Browser Testing Core Docs', url: 'https://playwright.dev/docs/intro', type: 'documentation' },
        { title: 'Playwright Automation Best Practices Handbook', url: 'https://playwright.dev/docs/best-practices', type: 'article' }
      ]
    },
    {
      id: 'qa4',
      title: '4. Load Simulations & GitHub Actions Integration',
      description: 'Execute server capacity stress tests: configure virtual clients using k6 and schedule testing pipelines on push requests.',
      resources: [
        { title: 'k6 High-Performance Load Testing Quickstart', url: 'https://grafana.com/docs/k6/latest/', type: 'documentation' },
        { title: 'GitHub Actions Continuous Integration Testing Recipes', url: 'https://docs.github.com/en/actions', type: 'project' }
      ]
    }
  ],
  'product-manager-technical': [
    {
      id: 'pm1',
      title: '1. Product Vision, Strategy & Roadmaps',
      description: 'Specify product scope: map competitive features, weight priorities via RICE formulations, and compile visual timelines.',
      resources: [
        { title: 'Product School Executive Templates & Frameworks', url: 'https://productschool.com/resources', type: 'documentation' },
        { title: 'Productboard RICE Prioritization Method Guide', url: 'https://www.productboard.com/glossary/rice-prioritization-framework/', type: 'article' }
      ]
    },
    {
      id: 'pm2',
      title: '2. System Design Architectures for Technical PMs',
      description: 'Coordinate with engineers: study API structures, latency rates, cache storage layers, and system trade-offs.',
      resources: [
        { title: 'System Design Primer for Non-Engineers', url: 'https://github.com/donnemartin/system-design-primer', type: 'article' },
        { title: 'Software Architecture Diagrams via Lucidchart', url: 'https://www.lucidchart.com/pages/use-case/system-architecture-diagram-software', type: 'project' }
      ]
    },
    {
      id: 'pm3',
      title: '3. KPI Formulations & User Retention Telemetries',
      description: 'Monitor business progress: draft dashboard views, hook Amplitude sensors, map user conversion funnels, and design A/B test experiments.',
      resources: [
        { title: 'Amplitude Analytics Academy Guides', url: 'https://academy.amplitude.com/', type: 'documentation' },
        { title: 'Lean Product Analytics Handbook Overview', url: 'https://www.leananalyticsbook.com/', type: 'article' }
      ]
    },
    {
      id: 'pm4',
      title: '4. PRDs, Agile Cycles & Jira Management',
      description: 'Write perfect documentation: compose complete PRD pages, partition user stories, write test cases, and lead Scrum ceremonies.',
      resources: [
        { title: 'Atlassian Agile Coach & Scrum Methodology Guide', url: 'https://www.atlassian.com/agile', type: 'documentation' },
        { title: 'Product Requirements Document (PRD) Notion Templates', url: 'https://www.notion.so/templates/prd-product-requirements-document', type: 'project' }
      ]
    }
  ],
  'blockchain-developer': [
    {
      id: 'bc1',
      title: '1. Cryptography & Blockchain Architecture Foundations',
      description: 'Grasp hash functions, public-private key pairs, proof of work vs stake, and decentralized ledger architectures.',
      resources: [
        { title: 'The Bitcoin Whitepaper by Satoshi Nakamoto', url: 'https://bitcoin.org/bitcoin.pdf', type: 'documentation' },
        { title: 'Mastering Bitcoin Free Chapters', url: 'https://github.com/bitcoinbook/bitcoinbook', type: 'documentation' }
      ]
    },
    {
      id: 'bc2',
      title: '2. Smart Contract Development with Solidity',
      description: 'Write smart contracts using Solidity. Learn structural logic, persistent state variables, event alerts, inheritance, and payable functions.',
      resources: [
        { title: 'Solidity Official Language Reference Spec', url: 'https://docs.soliditylang.org/', type: 'documentation' },
        { title: 'CryptoZombies Interactive Solidity Tutorial Path', url: 'https://cryptozombies.io/', type: 'project' }
      ]
    },
    {
      id: 'bc3',
      title: '3. Smart Contract Frameworks (Foundry & Hardhat)',
      description: 'Test decentralized smart contracts. Run automated unit suites, compile gas cost reports, and coordinate deployment scripts.',
      resources: [
        { title: 'The Foundry Book (Anvil, Cast & Forge CLI Guides)', url: 'https://book.getfoundry.sh/', type: 'documentation' },
        { title: 'Hardhat Ethereum Development Environment Guides', url: 'https://hardhat.org/tutorial', type: 'project' }
      ]
    },
    {
      id: 'bc4',
      title: '4. Web3 Client Integrations (Wagmi & Ethers)',
      description: 'Connect client applications to smart contracts. Setup wallet connection layouts, read state arrays, and handle transactions.',
      resources: [
        { title: 'Wagmi React Hooks & viem Quickstart Docs', url: 'https://wagmi.sh/', type: 'documentation' },
        { title: 'Ethers.js v6 JavaScript API Reference Manual', url: 'https://docs.ethers.org/v6/', type: 'documentation' }
      ]
    },
    {
      id: 'bc5',
      title: '5. Contract Exploit Mitigations & Security Auditing',
      description: 'Mitigate common smart contract attack vectors: eliminate reentrancy exploits, integer overflows, manipulate flash loans, and scan via Slither.',
      resources: [
        { title: 'ConsenSys Smart Contract Security Best Practices', url: 'https://consensys.github.io/smart-contract-best-practices/', type: 'documentation' },
        { title: 'Slither Static Vulnerability Scanning Core Tool', url: 'https://github.com/crytic/slither', type: 'project' }
      ]
    }
  ]
};

export const CATEGORY_PRESET_NODES: Record<string, RoadmapPresetNode[]> = {
  'Engineering': PREDEFINED_ROADMAP_NODES['frontend-developer'],
  'Data & AI': PREDEFINED_ROADMAP_NODES['data-scientist'],
  'Cloud & Infrastructure': PREDEFINED_ROADMAP_NODES['devops-engineer'],
  'Design & Product': PREDEFINED_ROADMAP_NODES['ui-ux-designer'],
  'Security & QA': PREDEFINED_ROADMAP_NODES['cybersecurity-analyst']
};
