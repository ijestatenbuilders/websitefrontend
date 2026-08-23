import { useEffect, useRef } from 'react';

/**
 * useReveal — IntersectionObserver-based bidirectional scroll reveal.
 * Adds 'is-revealed' class when element enters viewport, and smoothly removes it
 * when scrolled out so animations trigger both on appearing and disappearing!
 * @param {object} options - IntersectionObserver options
 * @returns ref to attach to the container element
 */
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll('[data-reveal]');
    if (targets.length === 0) {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
        } else {
          el.classList.remove('is-revealed');
        }
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options });
      obs.observe(el);
      return () => obs.disconnect();
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        } else {
          // When scrolled out of viewport, remove class for smooth disappear & re-trigger
          entry.target.classList.remove('is-revealed');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options });

    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return ref;
}
