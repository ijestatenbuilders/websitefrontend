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
let _tier = null;
export function getDeviceTier() {
  if (_tier) return _tier;
  if (typeof window === 'undefined') return 'high';
  if (prefersReducedMotion()) return (_tier = 'low');

  const w = window.innerWidth;
  const mem = navigator.deviceMemory || 4;        // GB (undefined on iOS → assume 4)
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = w < 768 || isTouch();

  if (mobile) {
    // Weak phone: little RAM / few cores → strip it right down.
    if (mem <= 3 || cores <= 4) return (_tier = 'low');
    return (_tier = 'mid');
  }
  // Desktop / laptop.
  if (mem <= 4 || cores <= 4) return (_tier = 'mid');
  return (_tier = 'high');
}

/**
 * Stamp the device tier + input type onto <html> so CSS can strip the most
 * expensive effects (backdrop-filter, big blurs, perpetual ambient animations)
 * on low-end / touch hardware WITHOUT any per-frame JS. Call once, as early as
 * possible (before first paint) from the app entrypoint.
 */
export function applyPerfFlags() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-perf', getDeviceTier());
  if (isTouch()) root.setAttribute('data-touch', 'true');
  if (prefersReducedMotion()) root.setAttribute('data-reduce-motion', 'true');
}
