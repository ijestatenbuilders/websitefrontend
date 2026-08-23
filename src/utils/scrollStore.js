/**
 * scrollStore.js — Singleton shared scroll/mouse state.
 * Components read from this in their own RAF loops without any React state.
 * Zero re-renders. Updated by a single global listener in LandingPage.
 */
const scrollStore = {
  scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  scrollSmooth: typeof window !== 'undefined' ? window.scrollY : 0,
  mouseX: 0.5,
  mouseY: 0.5,
  mouseXSmooth: 0.5,
  mouseYSmooth: 0.5,
  velocity: 0,
};

export default scrollStore;
