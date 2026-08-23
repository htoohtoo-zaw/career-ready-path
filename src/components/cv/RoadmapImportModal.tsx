/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Compass, CheckCircle2, Plus, Sparkles, Award, 
  Layers, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { getCustomizedRoadmap, getLearnerProfile } from '../../lib/learnerStore';
import { getStoredRequests } from '../../lib/feedbackStore';
import { ProjectItem } from '../../types/cv';
import { useToast } from '../../context/ToastContext';

interface RoadmapImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProjects: (projects: ProjectItem[], skills: string[]) => void;
}

export const RoadmapImportModal: React.FC<RoadmapImportModalProps> = ({
  isOpen,
  onClose,
  onImportProjects,
}) => {
  const { addToast } = useToast();
  const [roadmap, setRoadmap] = useState(getCustomizedRoadmap());
  const [profile, setProfile] = useState(getLearnerProfile());
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [mentorReviews, setMentorReviews] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const r = getCustomizedRoadmap();
      setRoadmap(r);
      setProfile(getLearnerProfile());
      const reviews = getStoredRequests();
      setMentorReviews(reviews);

      // Pre-select completed nodes or capstones
      if (r?.nodes) {
        const completedIds = r.nodes.filter(n => n.completed).map(n => n.id);
        setSelectedNodeIds(completedIds.length > 0 ? completedIds : r.nodes.slice(0, 2).map(n => n.id));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (selectedNodeIds.includes(id)) {
      setSelectedNodeIds(selectedNodeIds.filter(i => i !== id));
    } else {
      setSelectedNodeIds([...selectedNodeIds, id]);
    }
  };

  const handleImport = () => {
    if (!roadmap || selectedNodeIds.length === 0) {
      addToast('Select at least one milestone or capstone project to import', 'warning');
      return;
    }

    const selectedNodes = roadmap.nodes.filter(n => selectedNodeIds.includes(n.id));
    const newProjects: ProjectItem[] = selectedNodes.map((node) => {
      // Find matching mentor review if any
      const matchingFeedback = mentorReviews.find(r => 
        r.milestoneTitle?.toLowerCase() === node.title.toLowerCase() ||
        r.topic?.toLowerCase().includes(node.title.toLowerCase())
      );

      const reviewScoreNote = matchingFeedback 
        ? `Verified Mentor Review: ${matchingFeedback.totalScore}/100 [Passed rubric benchmark]` 
        : null;

      return {
        id: 'proj_roadmap_' + Math.random().toString(36).substr(2, 7),
        title: `${roadmap.roleTitle}: ${node.title.replace(/^\d+\.\s*/, '')}`,
        role: 'Lead Implementation Engineer',
        date: new Date().getFullYear().toString(),
        highlights: [
          `Engineered production-grade milestone implementing ${node.description.toLowerCase()}`,
          `Integrated industry best practices, test coverage, and automated linting pipelines.`,
          ...(reviewScoreNote ? [reviewScoreNote] : [])
        ],
        techStack: [
          roadmap.category === 'Data & AI' ? 'Python, SQL, PyTorch' :
          roadmap.category === 'Cloud & Infrastructure' ? 'Docker, Linux, AWS, Terraform' :
          roadmap.category === 'Design & Product' ? 'Figma, WCAG AA, Design Systems' :
          'TypeScript, React, Node.js, PostgreSQL'
        ],
        githubUrl: 'https://github.com/career-ready-path/capstone-submission'
      };
    });

    const relevantSkills = [
      roadmap.roleTitle,
      roadmap.category,
      'Agile Milestone Delivery',
      'Production Code Quality',
      'Technical Architecture'
    ];

    onImportProjects(newProjects, relevantSkills);
    onClose();
    addToast(`Successfully imported ${newProjects.length} milestone projects into your CV!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Import from Learning Roadmap
              </h3>
              <p className="text-xs text-zinc-400">
                Convert completed milestones & mentor-reviewed capstones into CV projects
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {roadmap ? (
            <>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Current Track</span>
                  <p className="text-sm font-bold text-zinc-200">{roadmap.roleTitle}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-mono font-semibold">
                  {roadmap.nodes.filter(n => n.completed).length} / {roadmap.nodes.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Select Milestones to Add as Technical Projects:
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {roadmap.nodes.map((node) => {
                    const isSelected = selectedNodeIds.includes(node.id);
                    return (
                      <div
                        key={node.id}
                        onClick={() => handleToggle(node.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-green-500/10 border-green-500/40 text-zinc-200'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-green-500 border-green-500 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 flex-grow">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                              {node.title}
                            </p>
                            {node.completed && (
                              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Done
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-3">
              <p>No active personalized roadmap found in your profile.</p>
              <a
                href="/onboarding"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-zinc-950 font-bold text-xs"
              >
                Start Onboarding Track
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {roadmap && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              {selectedNodeIds.length} milestone(s) selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={selectedNodeIds.length === 0}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-green-600/20 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add to Projects & Skills
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
