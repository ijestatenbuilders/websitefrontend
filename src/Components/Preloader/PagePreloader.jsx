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
      // Smooth, near-linear travel start→end with a tiny speed-up through the
      // middle (mostly linear blended with a subtle smoothstep).
      const smooth = t * t * (3 - 2 * t); // smoothstep: slightly faster mid, softer ends
      return 0.7 * t + 0.3 * smooth;
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
      }, 1050);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`page-preloader page-preloader--${activeTheme} ${isFading ? 'page-preloader--fade' : ''}`}
      aria-hidden="true"
    >
      {/* Ambient background — soft drifting orbs + faint grid */}
      <div className="pl-ambient">
        <span className="pl-orb pl-orb--1" />
        <span className="pl-orb pl-orb--2" />
        <span className="pl-orb pl-orb--3" />
      </div>

      {/* Thin top progress beam */}
      <div className="pl-beam">
        <span className="pl-beam__fill" style={{ width: `${progress}%` }}>
          <i className="pl-beam__spark" />
        </span>
      </div>

      {/* 3D animated centerpiece — gyroscope rings + glass cube + orbiters */}
      <div className="pl-scene">
        <div className="pl-gyro">
          <span className="pl-ring pl-ring--a" />
          <span className="pl-ring pl-ring--b" />
          <span className="pl-ring pl-ring--c" />

          <div className="pl-cube">
            <span className="pl-cube__f pl-cube__f--front" />
            <span className="pl-cube__f pl-cube__f--back" />
            <span className="pl-cube__f pl-cube__f--right" />
            <span className="pl-cube__f pl-cube__f--left" />
            <span className="pl-cube__f pl-cube__f--top" />
            <span className="pl-cube__f pl-cube__f--bottom" />
          </div>

          <span className="pl-core" />
        </div>

        <span className="pl-orbit pl-orbit--1"><i /></span>
        <span className="pl-orbit pl-orbit--2"><i /></span>
      </div>

      {/* Minimal brand + progress */}
      <div className="pl-content">
        <div className="pl-brand">
          IJ&nbsp;ESTATE<span className="pl-brand__amp">&amp;</span>BUILDERS
        </div>
        <div className="pl-sub">PREMIER LUXURY REAL ESTATE · LAHORE</div>

        <div className="pl-bar">
          <span className="pl-bar__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="pl-percent">{progress}<span>%</span></div>
      </div>
    </div>
  );
}
