import React, { useEffect, useRef } from 'react';
import { getDeviceTier } from '../../utils/perf';
import './ParallaxFloatingObjects.css';

/**
 * ParallaxFloatingObjects — Buttery-smooth 120fps GPU parallax ambient layer.
 * All transforms are written directly to DOM refs inside a single shared RAF loop.
 * Zero React re-renders. Dead-zone guards prevent micro-jitter.
 */
function ParallaxFloatingObjects() {
  const elementsRef = useRef({});
  // These ambient tokens are a desktop-only flourish. On phones they clutter
  // the screen and cost a whole extra RAF loop, so we drop them entirely.
  const enabled = getDeviceTier() === 'high';

  useEffect(() => {
    if (!enabled) return;
    let animId;
    let paused = document.hidden;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    // Smoothed values (lerped each frame)
    let scrollSmooth = window.scrollY;
    let mouseXSmooth = 0.5;
    let mouseYSmooth = 0.5;

    // Raw targets updated by event listeners
    let scrollTarget = window.scrollY;
    let mouseXTarget = 0.5;
    let mouseYTarget = 0.5;

    // Lerp factor — lower = smoother motion, higher = snappier
    const LERP = 0.08;

    const onScroll = () => { scrollTarget = window.scrollY; };
    const onMouse = (e) => {
      mouseXTarget = e.clientX / window.innerWidth;
      mouseYTarget = e.clientY / window.innerHeight;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });

    const set = (el, tx, ty, extra = '') => {
      if (!el) return;
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)${extra ? ' ' + extra : ''}`;
    };

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      if (paused) return;                        // tab hidden → skip work

      // Smooth lerp toward targets
      scrollSmooth += (scrollTarget - scrollSmooth) * LERP;
      mouseXSmooth += (mouseXTarget - mouseXSmooth) * LERP;
      mouseYSmooth += (mouseYTarget - mouseYSmooth) * LERP;

      const sy = scrollSmooth;
      const mx = mouseXSmooth - 0.5; // -0.5 → +0.5
      const my = mouseYSmooth - 0.5;
      const el = elementsRef.current;

      // ── HERO & MARQUEE ──
      set(el.cube1,  mx * 32,  sy * -0.20 + my * 20,
          `rotateX(${(sy * 0.04 + 15).toFixed(1)}deg) rotateY(${(sy * 0.07 + 25).toFixed(1)}deg)`);
      set(el.ring1,  mx * -24, sy * -0.28 + my * -14, `rotate(${(sy * 0.10).toFixed(1)}deg)`);
      set(el.orbCyan, mx * 36, sy * -0.12);
      set(el.orbGold, mx * -28, sy * -0.20);
      set(el.gps1,   mx * 20,  sy * -0.16 + my * 12, `rotate(-4deg)`);

      // ── BROWSE PROPERTIES ──
      const s2 = sy - 650;
      set(el.propBadgeLeft,  mx * -18, s2 * -0.14, `rotate(-3.5deg)`);
      set(el.propBadgeRight, mx * 22,  (sy - 800) * -0.20, `rotate(4deg)`);
      set(el.diamond1, mx * 16, (sy - 950) * -0.25, `rotate(${(sy * 0.07 + 45).toFixed(1)}deg)`);
      set(el.hexNode1, mx * -26, (sy - 1100) * -0.18, `rotate(${(sy * -0.05).toFixed(1)}deg)`);

      // ── UPCOMING & PROMO ──
      set(el.promoRing,    mx * -24, (sy - 1600) * -0.16, `rotate(${(sy * -0.07).toFixed(1)}deg)`);
      set(el.cube2,        mx * 22,  (sy - 1800) * -0.22,
          `rotateX(${(sy * 0.04 + 28).toFixed(1)}deg) rotateY(${(sy * -0.05 + 40).toFixed(1)}deg)`);
      set(el.keycardPromo, mx * -18, (sy - 2050) * -0.18, `rotate(2deg)`);

      // ── POPULAR AREAS & FOOTER ──
      set(el.popBadge,   mx * 20,  (sy - 2400) * -0.16, `rotate(-2.5deg)`);
      set(el.popCompass, mx * -22, (sy - 2600) * -0.22, `rotate(${(sy * 0.08).toFixed(1)}deg)`);
      set(el.diamond2,   mx * -18, (sy - 2850) * -0.22, `rotate(${(sy * 0.07 - 25).toFixed(1)}deg)`);
      set(el.popGps,     mx * 24,  (sy - 3050) * -0.16);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="parallax-ambient-layer" aria-hidden="true">
      {/* ── SECTION 1: HERO & MARQUEE AMBIENT TOKENS ── */}
      <div
        className="parallax-token parallax-token--cube-1"
        ref={(r) => (elementsRef.current.cube1 = r)}
      >
        <div className="iso-cube">
          <div className="cube-face cube-face--front" />
          <div className="cube-face cube-face--back" />
          <div className="cube-face cube-face--right" />
          <div className="cube-face cube-face--left" />
          <div className="cube-face cube-face--top" />
          <div className="cube-face cube-face--bottom" />
        </div>
      </div>

      <div
        className="parallax-token parallax-token--ring-1"
        ref={(r) => (elementsRef.current.ring1 = r)}
      >
        <div className="glow-compass-ring" />
      </div>

      <div
        className="parallax-token parallax-token--gps-hero"
        ref={(r) => (elementsRef.current.gps1 = r)}
      >
        <div className="spatial-gps-chip">
          <span className="gps-icon">⌖</span>
          <span>LAHORE PRIME CORRIDOR</span>
        </div>
      </div>

      <div
        className="parallax-token parallax-token--orb-cyan"
        ref={(r) => (elementsRef.current.orbCyan = r)}
      />

      <div
        className="parallax-token parallax-token--orb-gold"
        ref={(r) => (elementsRef.current.orbGold = r)}
      />

      {/* ── SECTION 2: BROWSE PROPERTIES AMBIENT OBJECTS ── */}
      <div
        className="parallax-token parallax-token--prop-badge-left"
        ref={(r) => (elementsRef.current.propBadgeLeft = r)}
      >
        <div className="spatial-chip">
          <span className="chip-dot chip-dot--gold" />
          <span className="chip-text">PRIME ASSETS // DHA RAYA</span>
        </div>
      </div>

      <div
        className="parallax-token parallax-token--prop-badge-right"
        ref={(r) => (elementsRef.current.propBadgeRight = r)}
      >
        <div className="spatial-chip spatial-chip--blue">
          <span className="chip-dot chip-dot--blue" />
          <span className="chip-text">✦ 100% TITLE VERIFIED</span>
        </div>
      </div>

      <div
        className="parallax-token parallax-token--diamond-1"
        ref={(r) => (elementsRef.current.diamond1 = r)}
      >
        <div className="wireframe-diamond" />
      </div>

      <div
        className="parallax-token parallax-token--hex-node"
        ref={(r) => (elementsRef.current.hexNode1 = r)}
      >
        <div className="hex-spatial-node">
          <div className="hex-inner">
            <span>ROI 18%+</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: UPCOMING & PROMO AMBIENT OBJECTS ── */}
      <div
        className="parallax-token parallax-token--promo-ring"
        ref={(r) => (elementsRef.current.promoRing = r)}
      >
        <div className="blueprint-gyroscope">
          <div className="gyro-ring gyro-ring--outer" />
          <div className="gyro-ring gyro-ring--inner" />
        </div>
      </div>

      <div
        className="parallax-token parallax-token--cube-2"
        ref={(r) => (elementsRef.current.cube2 = r)}
      >
        <div className="iso-cube iso-cube--gold">
          <div className="cube-face cube-face--front" />
          <div className="cube-face cube-face--back" />
          <div className="cube-face cube-face--right" />
          <div className="cube-face cube-face--left" />
          <div className="cube-face cube-face--top" />
          <div className="cube-face cube-face--bottom" />
        </div>
      </div>

      <div
        className="parallax-token parallax-token--keycard"
        ref={(r) => (elementsRef.current.keycardPromo = r)}
      >
        <div className="glass-keycard">
          <span className="keycard-sparkle">✦</span>
          <span>HIGH-YIELD ASSET ALLOCATION</span>
        </div>
      </div>

      {/* ── SECTION 4: POPULAR AREAS & FOOTER AMBIENT OBJECTS ── */}
      <div
        className="parallax-token parallax-token--pop-badge"
        ref={(r) => (elementsRef.current.popBadge = r)}
      >
        <div className="spatial-chip spatial-chip--emerald">
          <span className="chip-dot chip-dot--emerald" />
          <span className="chip-text">TOP HIGH-YIELD LOCATIONS</span>
        </div>
      </div>

      <div
        className="parallax-token parallax-token--pop-compass"
        ref={(r) => (elementsRef.current.popCompass = r)}
      >
        <div className="holographic-compass">
          <div className="compass-dial" />
          <div className="compass-pointer" />
        </div>
      </div>

      <div
        className="parallax-token parallax-token--diamond-2"
        ref={(r) => (elementsRef.current.diamond2 = r)}
      >
        <div className="wireframe-diamond wireframe-diamond--cyan" />
      </div>

      <div
        className="parallax-token parallax-token--pop-gps"
        ref={(r) => (elementsRef.current.popGps = r)}
      >
        <div className="spatial-gps-chip spatial-gps-chip--gold">
          <span className="gps-icon">📍</span>
          <span>BAHRIA // DHA RAYA // UNION</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ParallaxFloatingObjects);
