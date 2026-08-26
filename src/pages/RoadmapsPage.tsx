/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Clock, GitCommit, ArrowRight, Search, Filter, Plus, X, Sparkles, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import type { RoadmapDifficulty } from '../lib/supabase/types';
import { getAuthSession, hasPermission } from '../lib/learnerStore';
import { addNotification } from '../lib/notificationsStore';
import { pushCreatedRoadmapToSupabase } from '../lib/supabase/dataSync';

interface RoadmapItem {
  id: string;
  title: string;
  slug: string;
  difficulty: RoadmapDifficulty;
  estimated_weeks: number;
  description: string;
  category?: string;
}

const ALL_ROADMAPS: RoadmapItem[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    difficulty: 'beginner',
    estimated_weeks: 24,
    description: 'Build user-facing web interfaces with HTML, CSS, JavaScript, and modern frameworks like React.',
    category: 'Engineering',
  },
  {
    id: '2',
    title: 'Backend Developer',
    slug: 'backend-developer',
    difficulty: 'intermediate',
    estimated_weeks: 20,
    description: 'Design robust server-side APIs, manage databases, and ensure system scalability and security.',
    category: 'Engineering',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    difficulty: 'advanced',
    estimated_weeks: 32,
    description: 'Master both client-side and server-side engineering to deliver complete web applications.',
    category: 'Engineering',
  },
  {
    id: '4',
    title: 'Data Scientist',
    slug: 'data-scientist',
    difficulty: 'advanced',
    estimated_weeks: 28,
    description: 'Analyze complex data sets, build predictive machine learning models, and derive strategic insights.',
    category: 'Data & AI',
  },
  {
    id: '5',
    title: 'Data Analyst',
    slug: 'data-analyst',
    difficulty: 'beginner',
    estimated_weeks: 16,
    description: 'Transform raw data into meaningful visualizations, SQL reports, and business intelligence dashboards.',
    category: 'Data & AI',
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    difficulty: 'intermediate',
    estimated_weeks: 26,
    description: 'Automate CI/CD pipelines, containerize applications with Docker/Kubernetes, and manage infrastructure.',
    category: 'Cloud & Infrastructure',
  },
  {
    id: '7',
    title: 'Cloud Engineer',
    slug: 'cloud-engineer',
    difficulty: 'intermediate',
    estimated_weeks: 24,
    description: 'Architect and deploy highly available cloud infrastructures on AWS, Google Cloud, or Azure.',
    category: 'Cloud & Infrastructure',
  },
  {
    id: '8',
    title: 'Mobile Developer (React Native)',
    slug: 'mobile-developer-react-native',
    difficulty: 'intermediate',
    estimated_weeks: 22,
    description: 'Create cross-platform native iOS and Android applications using React Native and TypeScript.',
    category: 'Engineering',
  },
  {
    id: '9',
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    difficulty: 'beginner',
    estimated_weeks: 18,
    description: 'Craft intuitive user journeys, interactive wireframes, and accessible design systems in Figma.',
    category: 'Design & Product',
  },
  {
    id: '10',
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    difficulty: 'intermediate',
    estimated_weeks: 24,
    description: 'Monitor networks, assess security vulnerabilities, and defend infrastructure against cyber threats.',
    category: 'Security & QA',
  },
  {
    id: '11',
    title: 'QA / Test Engineer',
    slug: 'qa-test-engineer',
    difficulty: 'beginner',
    estimated_weeks: 16,
    description: 'Ensure software excellence through automated end-to-end testing, performance benchmarks, and bug hunting.',
    category: 'Security & QA',
  },
  {
    id: '12',
    title: 'Product Manager (Technical)',
    slug: 'product-manager-technical',
    difficulty: 'intermediate',
    estimated_weeks: 20,
    description: 'Bridge engineering teams and business strategy to define product roadmaps and deliver user value.',
    category: 'Design & Product',
  },
];

export const RoadmapsPage: React.FC = () => {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>(ALL_ROADMAPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  
  const [canCurate, setCanCurate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Creation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Engineering');
  const [newDifficulty, setNewDifficulty] = useState<RoadmapDifficulty>('beginner');
  const [newWeeks, setNewWeeks] = useState(12);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    setCanCurate(hasPermission('manage:roadmaps'));
  }, []);

  useEffect(() => {
    async function fetchRoadmapsFromDB() {
      setLoading(true);
      try {
        let dbRoadmaps: any[] = [];
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('roadmaps')
            .select('id, title, slug, difficulty, estimated_weeks, description, category, is_published');
          if (!error && data) {
            dbRoadmaps = data;
          }
        }

        const mapped = dbRoadmaps.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
          difficulty: item.difficulty as RoadmapDifficulty,
          estimated_weeks: item.estimated_weeks || 20,
          description: item.description || 'Structured step-by-step career track with curated resources.',
          category: item.category || 'Engineering',
        }));

        const seenSlugs = new Set();
        const deduplicated = [];

        // First add database ones (DB takes precedence)
        for (const item of mapped) {
          const slug = (item.slug || '').toLowerCase();
          if (slug && !seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            deduplicated.push(item);
          }
        }

        // Add locally custom-created ones if they exist
        const localCreatedStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
        try {
          const localCreated = JSON.parse(localCreatedStr);
          for (const item of localCreated) {
            const slug = (item.slug || '').toLowerCase();
            if (slug && !seenSlugs.has(slug)) {
              seenSlugs.add(slug);
              deduplicated.push(item);
            }
          }
        } catch { /* ignore */ }

        // Then add static ones if not already present
        for (const item of ALL_ROADMAPS) {
          const slug = (item.slug || '').toLowerCase();
          if (slug && !seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            deduplicated.push(item);
          }
        }

        setRoadmaps(deduplicated);
      } catch (err) {
        console.warn('Using static roadmap catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmapsFromDB();
  }, []);

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newRoadmap: RoadmapItem = {
      id: 'roadmap_' + Date.now(),
      title: newTitle,
      slug,
      difficulty: newDifficulty,
      estimated_weeks: newWeeks,
      description: newDescription,
      category: newCategory
    };

    // Save locally
    const existingLocalCreatedStr = localStorage.getItem('crp_local_created_roadmaps') || '[]';
    let localCreated = [];
    try {
      localCreated = JSON.parse(existingLocalCreatedStr);
    } catch {
      localCreated = [];
    }
    localCreated.push(newRoadmap);
    localStorage.setItem('crp_local_created_roadmaps', JSON.stringify(localCreated));

    // Save to live DB directly via pushCreatedRoadmapToSupabase
    if (isSupabaseConfigured()) {
      await pushCreatedRoadmapToSupabase(newRoadmap, [
        { title: 'Foundational Concepts', description: 'Core principles, architecture, and toolchain setup.' },
        { title: 'Intermediate Implementation', description: 'Building production-grade modules and design patterns.' },
        { title: 'Advanced Scalability & Capstone', description: 'Performance optimization, deployment, and final capstone review.' }
      ]);
    }

    // Trigger Notification of roadmap creation
    const currentSession = getAuthSession();
    const creatorName = currentSession.name || currentSession.email?.split('@')[0] || 'Mentor';
    await addNotification(
      'New Roadmap Published! 🗺️',
      `Mentor ${creatorName} has published a new "${newTitle}" learning track. Check it out now!`,
      'system',
      null
    );

    setSuccessMsg(`Successfully published the "${newTitle}" Roadmap!`);
    setIsCreateModalOpen(false);
    
    // Clear form fields
    setNewTitle('');
    setNewDescription('');
    setNewWeeks(12);
    setNewDifficulty('beginner');
    
    // Reload lists
    const updatedList = [newRoadmap, ...roadmaps];
    const seen = new Set();
    const dedupe: RoadmapItem[] = [];
    for (const r of updatedList) {
      const s = (r.slug || '').toLowerCase();
      if (s && !seen.has(s)) {
        seen.add(s);
        dedupe.push(r);
      }
    }
    setRoadmaps(dedupe);
    
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const categories = ['all', 'Engineering', 'Data & AI', 'Cloud & Infrastructure', 'Security & QA', 'Design & Product'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredRoadmaps = roadmaps.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyBadgeColor = (diff: RoadmapDifficulty) => {
    switch (diff) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="py-12 md:py-20 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5" />
              <span>Open Curriculum Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              IT Career Roadmaps
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Visual, step-by-step career tracks tailored for modern IT roles. Click any roadmap to view nodes, curated learning resources, and connect with verified mentors.
            </p>
          </div>
          {canCurate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-green-600/20 shrink-0 self-start md:self-center"
            >
              <Plus className="h-4 w-4" />
              Create Custom Roadmap
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 text-green-400 text-sm mb-6 animate-in fade-in duration-200">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter & Search Controls */}
        <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search roadmaps by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300 focus:outline-none focus:border-green-500 capitalize"
            >
              <option value="all">All Difficulties</option>
              {difficulties.filter((d) => d !== 'all').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Roadmaps Grid */}
        {filteredRoadmaps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 text-base">No roadmaps match your search or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDifficulty('all'); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 rounded-full bg-green-600 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoadmaps.map((map) => (
              <Link
                key={map.id}
                to={`/roadmaps/${map.slug}`}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-green-500/50 hover:bg-zinc-900 transition-all duration-300 shadow-lg hover:shadow-green-500/5 transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getDifficultyBadgeColor(map.difficulty)}`}>
                      {map.difficulty}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {map.estimated_weeks} Weeks
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-green-400 transition-colors mb-2 flex items-center justify-between">
                    <span>{map.title}</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                    {map.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1 text-zinc-400 font-mono">
                    <GitCommit className="h-3.5 w-3.5 text-green-500" />
                    Interactive Track
                  </span>
                  <span className="text-green-500 font-medium group-hover:underline inline-flex items-center gap-1">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Roadmap Popup Modal */}
        {isCreateModalOpen && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsCreateModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          >
            <form 
              onSubmit={handleCreateRoadmap}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Publish New Roadmap</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Roadmap Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI / Machine Learning Engineer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-green-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Data &amp; AI">Data &amp; AI</option>
                      <option value="Cloud &amp; Infrastructure">Cloud &amp; Infrastructure</option>
                      <option value="Design &amp; Product">Design &amp; Product</option>
                      <option value="Security &amp; QA">Security &amp; QA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as RoadmapDifficulty)}
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-green-500 capitalize"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Estimated Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={104}
                    required
                    value={newWeeks}
                    onChange={(e) => setNewWeeks(parseInt(e.target.value) || 12)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-green-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide a comprehensive synopsis of what skills are mastered on this learning path..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-semibold text-white transition-all cursor-pointer shadow-lg shadow-green-600/15"
                >
                  Publish Roadmap
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
