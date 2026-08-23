/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-zinc-100">
                Career <span className="text-green-500">Ready</span> Path
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t('footer.bio')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Roadmaps */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
              {t('footer.careerRoadmaps')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/roadmaps/frontend-developer" className="hover:text-green-400 transition-colors">Frontend Developer</Link></li>
              <li><Link to="/roadmaps/backend-developer" className="hover:text-green-400 transition-colors">Backend Developer</Link></li>
              <li><Link to="/roadmaps/full-stack-developer" className="hover:text-green-400 transition-colors">Full Stack Developer</Link></li>
              <li><Link to="/roadmaps/devops-engineer" className="hover:text-green-400 transition-colors">DevOps Engineer</Link></li>
              <li><Link to="/roadmaps/data-scientist" className="hover:text-green-400 transition-colors">Data Scientist</Link></li>
              <li><Link to="/roadmaps" className="text-green-500 font-medium hover:underline inline-flex items-center gap-1 pt-1">{t('roadmapPreview.viewAllTracks')} &rarr;</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform & Mentors */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
              {t('footer.platform')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#how-it-works" className="hover:text-green-400 transition-colors">{t('footer.howItWorks')}</a></li>
              <li><Link to="/mentors" className="hover:text-green-400 transition-colors">{t('footer.applyMentor')}</Link></li>
              <li><Link to="/auth/login" className="hover:text-green-400 transition-colors">{t('footer.learnerLogin')}</Link></li>
              <li><Link to="/auth/signup" className="hover:text-green-400 transition-colors">{t('footer.signUpFree')}</Link></li>
              <li><a href="#about" className="hover:text-green-400 transition-colors">{t('footer.aboutMission')}</a></li>
            </ul>
          </div>

          {/* Col 4: Trust & Specs */}
          <div id="about" className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
              {t('footer.openStandards')}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('footer.openStandardsDesc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {t('common.version')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Career Ready Path. {t('common.allRightsReserved')}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">{t('footer.terms')}</Link>
            <Link to="/security" className="hover:text-zinc-400 transition-colors">{t('footer.security')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
