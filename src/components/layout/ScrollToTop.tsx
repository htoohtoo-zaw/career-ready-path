import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility to reliably reset the scroll position to the top of the viewport
 * across window, document body, and root containers.
 */
export function resetScrollPosition(smooth = false) {
  try {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'instant',
      });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      // Also reset any scrollable main container if present
      const mainContainers = document.querySelectorAll('main, [data-scroll-container]');
      mainContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    }
  } catch (err) {
    console.warn('Scroll reset error:', err);
  }
}

/**
 * ScrollToTop Component
 * Listens to location changes (pathname, search, hash) and automatically
 * resets the scroll position to the top.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Immediate reset
    resetScrollPosition();

    // Secondary microtask reset to handle dynamically loaded route contents / layout shifts
    const timer = setTimeout(() => {
      resetScrollPosition();
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname, search, hash]);

  return null;
};
