/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { RoadmapPreviewSection } from '../components/landing/RoadmapPreviewSection';
import { MentorReviewsSection } from '../components/landing/MentorReviewsSection';
import { MentorCtaSection } from '../components/landing/MentorCtaSection';

export const LandingPage: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        // Small timeout to allow sections to fully render first
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <HeroSection />
      <HowItWorksSection />
      <RoadmapPreviewSection />
      <MentorReviewsSection />
      <MentorCtaSection />
    </div>
  );
};
