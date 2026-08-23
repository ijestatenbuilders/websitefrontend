import React, { useState, useEffect, useRef } from 'react';
import './PagePreloader.css';



export default function PagePreloader({ onComplete, theme }) {
  const [progress, setProgress] = useState(0);

  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const progressRef = useRef(0);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const activeTheme = theme || (typeof window !== 'undefined' ? localStorage.getItem('heroTheme') || 'light' : 'light');

  // Slow, organic progress that lingers at checkpoints — total ~2.8s
  useEffect(() => {
    const TOTAL_DURATION = 2800; // ms — the full 0→100 journey

    const easeProgress = (t) => {
      // Custom ease: fast start, long mid-plateau, quick finish
      if (t < 0.15) return t * 3.5;            // 0–15% time → 0–52% progress (fast start)
      if (t < 0.75) return 0.52 + (t - 0.15) * 0.55; // 15–75% time → 52–85% (slow plateau)
      return 0.85 + (t - 0.75) * 0.6;          // 75–100% time → 85–100% (fast finish)
    };

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / TOTAL_DURATION, 1);
      const easedVal = Math.min(Math.floor(easeProgress(t) * 100), 100);

      if (easedVal !== progressRef.current) {
        progressRef.current = easedVal;
        setProgress(easedVal);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);



  // Trigger fade-out once at 100%
  useEffect(() => {
    if (progress === 100) {
      const t1 = setTimeout(() => setIsFading(true), 200);
      const t2 = setTimeout(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      }, 750);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`page-preloader page-preloader--${activeTheme} ${isFading ? 'page-preloader--fade' : ''}`}
      aria-hidden="true"
    >
      {/* Ambient floating orbs */}
      <div className="preloader-orb preloader-orb--1" />
      <div className="preloader-orb preloader-orb--2" />
      <div className="preloader-orb preloader-orb--3" />

      {/* Top laser progress beam */}
      <div className="preloader-laser-bar">
        <div className="preloader-laser-progress" style={{ width: `${progress}%` }}>
          <span className="preloader-laser-spark" />
        </div>
      </div>

      {/* Center content */}
      <div className="preloader-center-content">
        {/* Animated brand mark */}
        <div className="preloader-brand-logo">
          <div className="preloader-logo-ring preloader-logo-ring--outer" />
          <div className="preloader-logo-ring preloader-logo-ring--inner" />
          <span className="preloader-logo-text">✦ IJ</span>
        </div>

        <div className="preloader-brand-title">
          <span>IJ ESTATE</span>
          <span className="preloader-brand-amp"> & </span>
          <span>BUILDERS</span>
        </div>

        <div className="preloader-subtext">
          PREMIER LUXURY REAL ESTATE · LAHORE, PAKISTAN
        </div>

        {/* Divider line */}
        <div className="preloader-divider" />

        {/* Capsule progress bar */}
        <div className="preloader-capsule-track">
          <div
            className="preloader-capsule-bar"
            style={{ width: `${progress}%` }}
          />
          <div className="preloader-capsule-glow" style={{ left: `${progress}%` }} />
        </div>

        {/* Percentage only */}
        <div className="preloader-status-row">
          <span className="preloader-percent">{progress}<span className="preloader-percent-sign">%</span></span>
        </div>
      </div>
    </div>
  );
}
