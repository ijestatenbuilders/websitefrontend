// Shared device-capability helpers so every animation system tunes itself to
// the hardware instead of running full-fat effects on low-end phones.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' &&
  ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
    'ontouchstart' in window);

/**
 * Coarse performance tier. 'low' phones get the lightest everything,
 * 'high' desktops get the full experience.
 * @returns {'low'|'mid'|'high'}
 */
export function getDeviceTier() {
  if (typeof window === 'undefined') return 'high';
  if (prefersReducedMotion()) return 'low';

  const w = window.innerWidth;
  const mem = navigator.deviceMemory || 4;        // GB (undefined on iOS → assume 4)
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = w < 768 || isTouch();

  if (mobile) {
    // Weak phone: little RAM / few cores → strip it right down.
    if (mem <= 3 || cores <= 4) return 'low';
    return 'mid';
  }
  // Desktop / laptop.
  if (mem <= 4 || cores <= 4) return 'mid';
  return 'high';
}
