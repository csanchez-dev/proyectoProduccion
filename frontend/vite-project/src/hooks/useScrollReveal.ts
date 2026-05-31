import { useEffect } from 'react';

/**
 * useScrollReveal — activates [data-reveal] elements when they enter the viewport.
 * Call once at the app root and every page will animate automatically.
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once visible, stop observing for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,      // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px', // small bottom offset for natural feel
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
