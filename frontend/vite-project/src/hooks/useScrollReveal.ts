import { useEffect } from 'react';

/**
 * useScrollReveal — activates [data-reveal] elements when they enter the viewport.
 * Uses IntersectionObserver and MutationObserver to automatically support dynamically loaded content.
 */
export function useScrollReveal() {
  useEffect(() => {
    // 1. Setup IntersectionObserver for scroll-based animation trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Stop observing once visible
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,                 // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px', // small offset for a more natural scroll feel
      }
    );

    // Helper to search and observe any elements matching [data-reveal]
    const observeElements = (root: ParentNode = document) => {
      const elements = root.querySelectorAll('[data-reveal]');
      elements.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    };

    // Initial scan and observe
    observeElements();

    // 2. Setup MutationObserver to watch for dynamic DOM updates (like AJAX / fetch loads)
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldScan = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.hasAttribute?.('data-reveal') || el.querySelectorAll?.('[data-reveal]').length > 0) {
              shouldScan = true;
            }
          }
        });
      });

      if (shouldScan) {
        observeElements();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup observers on unmount
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
