// Tiny global store so the Aira assistant can be mounted once (at the App level)
// and opened from anywhere (e.g. the Navbar button) — and so a live voice session
// survives page navigation instead of unmounting with the page.
import { useSyncExternalStore } from 'react';

let open = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export const airaStore = {
  isOpen: () => open,
  open: () => { if (!open) { open = true; emit(); } },
  close: () => { if (open) { open = false; emit(); } },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
};

// React hook: returns the current open state and re-renders on change.
export const useAiraOpen = () =>
  useSyncExternalStore(airaStore.subscribe, airaStore.isOpen, airaStore.isOpen);
