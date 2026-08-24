import { useEffect, useRef } from 'react';

/**
 * useReveal — IntersectionObserver-based bidirectional scroll reveal.
 * Adds 'is-revealed' when an element enters the viewport and removes it when it
 * leaves, so animations replay on scroll.
 *
 * IMPORTANT: many sections fetch their content asynchronously (properties,
 * projects…). Those [data-reveal] cards don't exist yet on mount, so a one-shot
 * querySelectorAll would miss them and they'd stay invisible in production
 * (where the API actually returns data). A MutationObserver re-scans for newly
 * added [data-reveal] targets and observes them too.
 *
 * @param {object} options - IntersectionObserver options
 * @returns ref to attach to the container element
 */
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Old browsers without IntersectionObserver: reveal everything so content is
    // never stuck invisible. A MutationObserver keeps late-loaded cards visible.
    if (!('IntersectionObserver' in window)) {
      const revealAll = () => {
        const targets = el.querySelectorAll('[data-reveal]');
        if (targets.length === 0) el.classList.add('is-revealed');
        else targets.forEach((t) => t.classList.add('is-revealed'));
      };
      revealAll();
      const moFallback = new MutationObserver(revealAll);
      moFallback.observe(el, { childList: true, subtree: true });
      return () => moFallback.disconnect();
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-revealed', entry.isIntersecting);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options });

    const observed = new WeakSet();

    // Observe every current [data-reveal] target; if there are none, reveal the
    // container itself (some sections animate at the container level).
    const scan = () => {
      const targets = el.querySelectorAll('[data-reveal]');
      if (targets.length === 0) {
        if (!observed.has(el)) { io.observe(el); observed.add(el); }
        return;
      }
      targets.forEach((t) => {
        if (!observed.has(t)) { io.observe(t); observed.add(t); }
      });
    };

    scan();

    // Re-scan whenever children are added/removed (async data, tab switches…).
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
