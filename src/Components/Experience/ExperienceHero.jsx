import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import HeroBlob3D from './HeroBlob3D';
import HeroSearch from './HeroSearch';
import { prefersReducedMotion } from '../../utils/perf';
import './Experience.css';

import eiffelImg from '../../Assets/images/eiffletower.png';
import mosqueImg from '../../Assets/images/background.jpeg';
import res1 from '../../Assets/images/upcoming-project-1.jpg';

gsap.registerPlugin(ScrollTrigger);

const LOC_NAMES = {
  bahriatown: 'Bahria Town Lahore',
  dharaya: 'DHA Raya Lahore',
  etihadtown: 'Etihad Town Lahore',
  uniontown: 'Union Town Lahore',
};

/* Each character = two stacked copies (primary + secondary) that slide
   vertically on hover, with a small per-character delay from the first letter
   for an "alive" cascade (asaram.dev style). Transform-only = buttery smooth. */
function SplitHeadline({ text, className = '' }) {
  return (
    <span className={`xp-split ${className}`} aria-label={text}>
      {text.split('').map((ch, i) => {
        const isSpace = ch === ' ';
        return (
          <span className="xp-split__char" key={i} style={{ '--i': i }}>
            <span className="xp-split__prim">{isSpace ? ' ' : ch}</span>
            <span className="xp-split__sec" aria-hidden="true">{isSpace ? ' ' : ch}</span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * ExperienceHero — the cinematic light-themed hero, self-contained so it can be
 * reused on both the /experience page and the main home page. Owns its own
 * smooth-scroll (Lenis), magnetic badge/cube repulsion, scroll-linked backdrop
 * depth, and headline reveal.
 */
export default function ExperienceHero({ onLocationSwitch, location = 'bahriatown' }) {
  const heroRef = useRef(null);
  const floatRefs = useRef({});
  const lenisRef = useRef(null);
  const reduce = prefersReducedMotion();

  // Scroll-linked backdrop depth
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroTitleY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // Scroll cue fades out as soon as the page starts scrolling (well before it
  // could ever reach the quick-search row).
  const [cueHidden, setCueHidden] = useState(false);
  useEffect(() => {
    const onScroll = () => setCueHidden(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Smooth, slightly-slow parallax scrolling (Lenis) — synced to GSAP's ticker
     + ScrollTrigger so every pinned/scrubbed section stays in step. */
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  const handleScrollCue = () => {
    const dist = Math.round(window.innerHeight * 0.88);
    if (lenisRef.current) lenisRef.current.scrollTo(dist, { duration: 1.3 });
    else window.scrollTo({ top: dist, behavior: 'smooth' });
  };

  /* Magnetic repulsion — cursor pushes nearby badges + cubes away (only when the
     pointer enters each element's radius). Uses the CSS `translate` property so
     it composes with each element's own rotate/spin transform. */
  useEffect(() => {
    if (reduce) return;
    const hero = heroRef.current;
    if (!hero) return;

    const mags = Array.from(hero.querySelectorAll('.xp-magnetic')).map((el) => ({
      el, cx: 0, cy: 0, x: 0, y: 0, tx: 0, ty: 0,
    }));
    const orbs = [floatRefs.current.orbA, floatRefs.current.orbB].filter(Boolean);

    let mouseX = -9999, mouseY = -9999;
    const RADIUS = 170;
    const MAXPUSH = 78;

    const measure = () => {
      mags.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        s.cx = r.left + r.width / 2 - s.x;
        s.cy = r.top + r.height / 2 - s.y;
      });
    };
    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(measure));
    const t = setTimeout(measure, 900);

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      mags.forEach((s) => {
        const dx = s.cx - mouseX;
        const dy = s.cy - mouseY;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < RADIUS) {
          const force = 1 - dist / RADIUS;
          s.tx = (dx / dist) * force * MAXPUSH;
          s.ty = (dy / dist) * force * MAXPUSH;
        } else {
          s.tx = 0; s.ty = 0;
        }
        s.x += (s.tx - s.x) * 0.16;
        s.y += (s.ty - s.y) * 0.16;
        s.el.style.translate = `${s.x.toFixed(1)}px ${s.y.toFixed(1)}px`;
      });

      const ox = mouseX >= 0 ? mouseX / window.innerWidth - 0.5 : 0;
      const oy = mouseY >= 0 ? mouseY / window.innerHeight - 0.5 : 0;
      if (orbs[0]) orbs[0].style.translate = `${(ox * 30).toFixed(1)}px ${(oy * 24).toFixed(1)}px`;
      if (orbs[1]) orbs[1].style.translate = `${(ox * -26).toFixed(1)}px ${(oy * -20).toFixed(1)}px`;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  /* Headline + floats reveal, scoped to the hero. */
  useLayoutEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.from('.xp-hero__title .xp-split', {
        yPercent: 60, opacity: 0,
        stagger: 0.12, duration: 1, ease: 'power4.out', delay: 0.35,
      });
      gsap.from('.xp-hero__meta', {
        y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.9,
      });
      gsap.from('.xp-float', {
        opacity: 0, scale: 0.6, stagger: 0.1, duration: 1.1, ease: 'power3.out', delay: 0.5,
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section className="xp-hero" id="hero" ref={heroRef}>
      <motion.div className="xp-hero__bg" style={{ scale: heroScale, opacity: heroFade }} aria-hidden="true">
        <span className="xp-hero__aurora xp-hero__aurora--1" />
        <span className="xp-hero__aurora xp-hero__aurora--2" />
        <span className="xp-hero__aurora xp-hero__aurora--3" />
      </motion.div>

      <HeroBlob3D location={location} />

      <div className="xp-hero__floats" aria-hidden="true">
        <div className="xp-float xp-float--cube xp-magnetic" ref={(n) => (floatRefs.current.cube = n)}>
          <div className="xp-cube">
            <span className="xp-cube__f xp-cube__f--front" />
            <span className="xp-cube__f xp-cube__f--back" />
            <span className="xp-cube__f xp-cube__f--right" />
            <span className="xp-cube__f xp-cube__f--left" />
            <span className="xp-cube__f xp-cube__f--top" />
            <span className="xp-cube__f xp-cube__f--bottom" />
          </div>
        </div>
        <div className="xp-float xp-float--pin xp-magnetic" ref={(n) => (floatRefs.current.pin = n)}>
          <span className="xp-pin">◈</span>
        </div>

        <div className="xp-float xp-float--cube2 xp-magnetic" ref={(n) => (floatRefs.current.cube2 = n)}>
          <div className="xp-cube">
            <span className="xp-cube__f xp-cube__f--front" />
            <span className="xp-cube__f xp-cube__f--back" />
            <span className="xp-cube__f xp-cube__f--right" />
            <span className="xp-cube__f xp-cube__f--left" />
            <span className="xp-cube__f xp-cube__f--top" />
            <span className="xp-cube__f xp-cube__f--bottom" />
          </div>
        </div>
        <div className="xp-float xp-float--pin2 xp-magnetic" ref={(n) => (floatRefs.current.pin2 = n)}>
          <span className="xp-pin">◈</span>
        </div>

        <div className="xp-float xp-float--orbA" ref={(n) => (floatRefs.current.orbA = n)} />
        <div className="xp-float xp-float--orbB" ref={(n) => (floatRefs.current.orbB = n)} />
      </div>

      <div className="hero-landmark-badge hero-landmark-badge--eiffel xp-magnetic">
        <div className="landmark-badge-thumb"><img src={eiffelImg} alt="Eiffel Tower Bahria Town" width={42} height={42} /></div>
        <div className="landmark-badge-text">
          <span className="landmark-badge-name">Eiffel Tower</span>
          <span className="landmark-badge-loc">Bahria Town Lahore</span>
        </div>
      </div>
      <div className="hero-landmark-badge hero-landmark-badge--building xp-magnetic">
        <div className="landmark-badge-thumb"><img src={res1} alt="Luxury Towers" width={42} height={42} /></div>
        <div className="landmark-badge-text">
          <span className="landmark-badge-name">Luxury High-Rises</span>
          <span className="landmark-badge-loc">DHA Raya • Commercial</span>
        </div>
      </div>
      <div className="hero-floating-pill hero-floating-pill--left xp-magnetic">
        <div className="floating-pill-icon">✨</div>
        <div className="floating-pill-info">
          <span className="floating-pill-title">500+ Verified</span>
          <span className="floating-pill-sub">Prime Luxury Properties</span>
        </div>
      </div>
      <div className="hero-floating-pill hero-floating-pill--right xp-magnetic">
        <div className="floating-pill-icon">💎</div>
        <div className="floating-pill-info">
          <span className="floating-pill-title">Top Rated Agency</span>
          <span className="floating-pill-sub">Bahria & DHA Raya Lahore</span>
        </div>
      </div>
      <div className="hero-landmark-badge hero-landmark-badge--mosque xp-magnetic">
        <div className="landmark-badge-thumb"><img src={mosqueImg} alt="Grand Jamia Mosque Bahria Town" width={42} height={42} /></div>
        <div className="landmark-badge-text">
          <span className="landmark-badge-name">Grand Jamia Mosque</span>
          <span className="landmark-badge-loc">Islamic Landmark • Bahria</span>
        </div>
      </div>

      <motion.div className="xp-hero__content" style={{ y: heroTitleY }}>
        <div className="xp-hero__loc xp-hero__meta">
          <span className="xp-hero__loc-dot" />
          Exploring <strong>{LOC_NAMES[location] || LOC_NAMES.bahriatown}</strong>
        </div>
        <h1 className="xp-hero__title">
          <SplitHeadline text="IJ ESTATE" className="xp-hero__line1" />
          <SplitHeadline text="& BUILDERS" className="xp-hero__line2" />
        </h1>
        <HeroSearch onLocationSwitch={onLocationSwitch} />
      </motion.div>

      <button
        type="button"
        className={`xp-hero__scroll ${cueHidden ? 'xp-hero__scroll--hidden' : ''}`}
        onClick={handleScrollCue}
        aria-label="Scroll down"
      >
        <span className="xp-hero__scroll-mouse">
          <span className="xp-hero__scroll-wheel" />
        </span>
        <span className="xp-hero__scroll-chevrons">
          <svg viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2l10 8 10-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2l10 8 10-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </section>
  );
}
