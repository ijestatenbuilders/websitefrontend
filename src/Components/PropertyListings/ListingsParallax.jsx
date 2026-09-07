import React, { useEffect, useRef } from 'react';
import { getDeviceTier } from '../../utils/perf';
import '../Parallax/ParallaxFloatingObjects.css';

/**
 * ListingsParallax — cinematic floating 3D ambient objects for the property
 * listings hero. Reuses the shared spatial-token visuals. All transforms are
 * written straight to DOM refs inside one RAF loop (zero React re-renders),
 * lerped for buttery motion, and gated to high-tier devices only.
 */
function ListingsParallax() {
    const el = useRef({});
    // Show on every capable device (desktops + decent phones); only skip on
    // low-end hardware / reduced-motion. CSS hides the fussier tokens on small
    // screens, leaving just the soft ambient orbs there.
    const enabled = getDeviceTier() !== 'low';

    useEffect(() => {
        if (!enabled) return;
        let animId;
        let paused = document.hidden;
        const onVisibility = () => { paused = document.hidden; };
        document.addEventListener('visibilitychange', onVisibility);

        let sSmooth = window.scrollY, sTarget = window.scrollY;
        let mxSmooth = 0.5, mxTarget = 0.5;
        let mySmooth = 0.5, myTarget = 0.5;
        const LERP = 0.08;

        const onScroll = () => { sTarget = window.scrollY; };
        const onMouse = (e) => {
            mxTarget = e.clientX / window.innerWidth;
            myTarget = e.clientY / window.innerHeight;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });

        const set = (node, tx, ty, extra = '') => {
            if (!node) return;
            node.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)${extra ? ' ' + extra : ''}`;
        };

        const loop = () => {
            animId = requestAnimationFrame(loop);
            if (paused) return;

            sSmooth += (sTarget - sSmooth) * LERP;
            mxSmooth += (mxTarget - mxSmooth) * LERP;
            mySmooth += (myTarget - mySmooth) * LERP;

            const sy = sSmooth;
            const mx = mxSmooth - 0.5;
            const my = mySmooth - 0.5;
            const r = el.current;

            // Big ambient orbs — slow, deep
            set(r.orbCyan, mx * 30, sy * -0.10);
            set(r.orbGold, mx * -26, sy * -0.16);

            // Foreground 3D tokens — faster, with mouse depth + scroll drift
            set(r.cube1, mx * 34, sy * -0.30 + my * 18,
                `rotateX(${(sy * 0.05 + 15).toFixed(1)}deg) rotateY(${(sy * 0.08 + 25).toFixed(1)}deg)`);
            set(r.ring1, mx * -30, sy * -0.24 + my * -14, `rotate(${(sy * 0.10).toFixed(1)}deg)`);
            set(r.gyro, mx * 24, sy * -0.34 + my * 16);
            set(r.diamond1, mx * 20, sy * -0.40 + my * 12, `rotate(${(sy * 0.08 + 45).toFixed(1)}deg)`);
            set(r.gps, mx * 18, sy * -0.20 + my * 10, `rotate(-3deg)`);
            set(r.keycard, mx * -20, sy * -0.28 + my * -12, `rotate(3deg)`);
        };

        animId = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('mousemove', onMouse);
            document.removeEventListener('visibilitychange', onVisibility);
            cancelAnimationFrame(animId);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div className="parallax-ambient-layer listings-parallax" aria-hidden="true">
            <div className="parallax-token lp-token--orb-cyan" ref={(n) => (el.current.orbCyan = n)} />
            <div className="parallax-token lp-token--orb-gold" ref={(n) => (el.current.orbGold = n)} />

            <div className="parallax-token lp-token--cube" ref={(n) => (el.current.cube1 = n)}>
                <div className="iso-cube">
                    <div className="cube-face cube-face--front" />
                    <div className="cube-face cube-face--back" />
                    <div className="cube-face cube-face--right" />
                    <div className="cube-face cube-face--left" />
                    <div className="cube-face cube-face--top" />
                    <div className="cube-face cube-face--bottom" />
                </div>
            </div>

            <div className="parallax-token lp-token--ring" ref={(n) => (el.current.ring1 = n)}>
                <div className="glow-compass-ring" />
            </div>

            <div className="parallax-token lp-token--gyro" ref={(n) => (el.current.gyro = n)}>
                <div className="blueprint-gyroscope">
                    <div className="gyro-ring gyro-ring--outer" />
                    <div className="gyro-ring gyro-ring--inner" />
                </div>
            </div>

            <div className="parallax-token lp-token--diamond" ref={(n) => (el.current.diamond1 = n)}>
                <div className="wireframe-diamond wireframe-diamond--cyan" />
            </div>

            <div className="parallax-token lp-token--gps" ref={(n) => (el.current.gps = n)}>
                <div className="spatial-gps-chip">
                    <span className="gps-icon">⌖</span>
                    <span>LAHORE PRIME CORRIDOR</span>
                </div>
            </div>

            <div className="parallax-token lp-token--keycard" ref={(n) => (el.current.keycard = n)}>
                <div className="glass-keycard">
                    <span className="keycard-sparkle">✦</span>
                    <span>TITLE-VERIFIED LISTINGS</span>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ListingsParallax);
