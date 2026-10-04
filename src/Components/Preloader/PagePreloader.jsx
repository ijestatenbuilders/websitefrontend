import React, { useState, useEffect, useRef } from 'react';
import './PagePreloader.css';
import logo from '../../Assets/images/logo.jpg';



// The full 0→100 journey. Shared by the JS % counter and the CSS bar animation
// (passed to CSS as a custom property) so the two can never drift apart.
const TOTAL_DURATION = 1000; // ms
let hasShownPreloader = false;

export default function PagePreloader({ onComplete, theme }) {
  const [progress, setProgress] = useState(0);

  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const progressRef = useRef(0);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const activeTheme = theme || (typeof window !== 'undefined' ? localStorage.getItem('heroTheme') || 'light' : 'light');

  // Module state resets on a full page load but survives client-side routing.
  const [shouldSkip] = useState(() => hasShownPreloader);

  useEffect(() => {
    hasShownPreloader = true;
  }, []);

  // If we should skip, immediately mark as done
  useEffect(() => {
    if (shouldSkip) {
      setIsDone(true);
      if (onComplete) onComplete();
    }
  }, [shouldSkip, onComplete]);

  // The BAR itself is animated purely in CSS (transform: scaleX on the compositor
  // thread) so it glides at a perfectly constant speed and can NEVER stall — even
  // while the main thread is busy booting the app behind this screen. This rAF
  // loop only drives the % number, using a strictly LINEAR, wall-clock-based
  // value so the digits climb at the same constant rate as the bar.
  useEffect(() => {
    if (shouldSkip) return; // Skip animation if navigating between pages

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / TOTAL_DURATION, 1);
      const val = Math.min(Math.round(t * 100), 100);

      if (val !== progressRef.current) {
        progressRef.current = val;
        setProgress(val);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [shouldSkip]);



  // Trigger fade-out once at 100%
  useEffect(() => {
    if (shouldSkip) return; // Skip if navigating
    if (progress === 100) {
      const t1 = setTimeout(() => setIsFading(true), 100);
      const t2 = setTimeout(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      }, 700);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onComplete, shouldSkip]);

  if (isDone) return null;

  return (
    <div
      className={`page-preloader page-preloader--${activeTheme} ${isFading ? 'page-preloader--fade' : ''}`}
      aria-hidden="true"
      style={{ '--pl-duration': `${TOTAL_DURATION}ms` }}
    >
      {/* Ambient background — soft drifting orbs + faint grid */}
      <div className="pl-ambient">
        <span className="pl-orb pl-orb--1" />
        <span className="pl-orb pl-orb--2" />
        <span className="pl-orb pl-orb--3" />
      </div>

      {/* Thin top progress beam — fill + edge spark both CSS-animated (compositor
          thread), so they advance at a constant speed and never stall. */}
      <div className="pl-beam">
        <span className="pl-beam__fill" />
        <i className="pl-beam__spark" />
      </div>

      {/* Brand logo centerpiece — softly glowing + gently breathing (zoom) */}
      <div className="pl-logo">
        <span className="pl-logo__halo" aria-hidden="true" />
        <img className="pl-logo__img" src={logo} alt="IJ Estate & Builders" draggable="false" />
      </div>

      {/* Minimal brand + progress */}
      <div className="pl-content">
        <div className="pl-brand">
          IJ&nbsp;ESTATE<span className="pl-brand__amp">&amp;</span>BUILDERS
        </div>
        <div className="pl-sub">PREMIER LUXURY REAL ESTATE · LAHORE</div>

        <div className="pl-bar">
          <span className="pl-bar__fill" />
        </div>
        <div className="pl-percent">{progress}<span>%</span></div>
      </div>
    </div>
  );
}
