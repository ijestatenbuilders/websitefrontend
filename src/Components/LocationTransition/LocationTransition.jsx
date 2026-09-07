import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './LocationTransition.css';
import logo from '../../Assets/images/logo.jpg';

const BIG = 190;          // on-screen size of the logo at centre (px)
const IN_MS = 1400;       // fluid wipe-in + logo travel to centre (slower)
const CENTER_MS = 2400;   // logo zoom-in (bigger) then zoom-out (smaller)
const OUT_MS = 1400;      // fluid recede + logo travel back (slower)

/**
 * LocationTransition — a fluid, scroll-locked page transition:
 *  1. A fluid overlay wipes in from the top-right corner.
 *  2. The navbar logo flies to the centre of the screen…
 *  3. …and becomes a real 3D model (extruded slab, visible edges) that spins.
 *  4. After ~2.2s the fluid recedes back to the top-right and the logo flies
 *     back to the navbar. Scroll is blocked throughout; the new page starts at
 *     the very top.
 */
function LocationTransition({ isActive, isShaking, onCovered, onComplete }) {
  const mountRef = useRef(null);
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState('idle');   // idle | in | spin | out
  const [open, setOpen] = useState(false);       // fluid expanded + logo centred
  const [nav, setNav] = useState({ dx: 0, dy: 0, scale: 0.22 });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onCoveredRef = useRef(onCovered);
  onCoveredRef.current = onCovered;
  const fadeRef = useRef(1);   // target opacity for the orbiting objects

  // ── Orchestration ──
  useEffect(() => {
    if (!isActive) return;

    // where is the navbar logo right now?
    const el = document.querySelector('.xnav__brand-logo');
    const r = el && el.getBoundingClientRect();
    if (r && r.width) {
      setNav({
        dx: r.left + r.width / 2 - window.innerWidth / 2,
        dy: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / BIG,
      });
    } else {
      setNav({ dx: -window.innerWidth / 2 + 70, dy: -window.innerHeight / 2 + 46, scale: 44 / BIG });
    }

    document.body.style.overflow = 'hidden';   // lock scroll
    const block = (e) => e.preventDefault();    // also stop wheel/touch (Lenis)
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    fadeRef.current = 1;         // objects fade IN
    setShow(true);
    setPhase('in');
    setOpen(false);

    // next frame → animate fluid open + logo to centre
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    const t1 = setTimeout(() => {
      setPhase('center');
      // The fluid now fully covers the screen — safe to swap the location's
      // colour/content behind it so there's no flash when it recedes.
      if (onCoveredRef.current) onCoveredRef.current();
    }, IN_MS);
    const t2 = setTimeout(() => { setPhase('out'); setOpen(false); fadeRef.current = 0; /* fade OUT */ }, IN_MS + CENTER_MS);
    const t3 = setTimeout(() => {
      setShow(false);
      setPhase('idle');
      document.body.style.overflow = '';
      window.scrollTo(0, 0);                    // new page starts at the top
      if (onCompleteRef.current) onCompleteRef.current();
    }, IN_MS + CENTER_MS + OUT_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      document.body.style.overflow = '';
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // ── 3D scene: a spinning ball with the logo on its front + orbiting objects ──
  useEffect(() => {
    if (!show) return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 300;
    const height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0x38bdf8, 1.3); rim.position.set(-5, -1, 2); scene.add(rim);
    const warm = new THREE.PointLight(0x93c5fd, 1.1, 30); warm.position.set(0, 2, 4); scene.add(warm);

    const disposables = [];

    // Wide-spread orbiting 3D objects that fill the whole screen (no centre ball —
    // the logo pulses at centre as a DOM element).
    const floaters = [];
    const fgeos = [
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.42, 0.15, 14, 30),
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.TetrahedronGeometry(0.58),
      new THREE.IcosahedronGeometry(0.4, 0),
      new THREE.OctahedronGeometry(0.46, 0),
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.36, 0.13, 12, 26),
      new THREE.BoxGeometry(0.44, 0.44, 0.44),
    ];
    const pal = [0x1e6fff, 0x38bdf8, 0x0d4dbb, 0x7dd3fc, 0x93c5fd, 0x2a7bff, 0x60a5fa];
    fgeos.forEach((gg, i) => {
      const mm = new THREE.MeshStandardMaterial({
        color: pal[i % pal.length], metalness: 0.5, roughness: 0.25,
        emissive: new THREE.Color(pal[i % pal.length]), emissiveIntensity: 0.2,
        transparent: true, opacity: 0,   // fade in via the loop
      });
      const me = new THREE.Mesh(gg, mm);
      me.userData = {
        angle: (i / fgeos.length) * Math.PI * 2,
        radiusX: 5.5 + (i % 4) * 1.5,           // wide horizontal spread
        radiusY: 3.2 + (i % 3) * 0.9,           // fill vertically too
        speed: 0.35 + (i % 3) * 0.18,
        phase: Math.random() * 6.28,
        sx: 0.01 + Math.random() * 0.03, sy: 0.01 + Math.random() * 0.03,
      };
      scene.add(me); floaters.push(me); disposables.push(gg, mm);
    });

    // Sparkles
    const sc = 90;
    const sg = new THREE.BufferGeometry();
    const sp = new Float32Array(sc * 3);
    for (let i = 0; i < sc; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 11;
      sp[i * 3 + 1] = (Math.random() - 0.5) * 9;
      sp[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 64;
    const cx = cvs.getContext('2d');
    const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(125,211,252,0.85)'); gr.addColorStop(1, 'rgba(56,189,248,0)');
    cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
    const stx = new THREE.CanvasTexture(cvs);
    const sm = new THREE.PointsMaterial({ size: 0.17, map: stx, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const sparks = new THREE.Points(sg, sm);
    scene.add(sparks);
    disposables.push(sg, sm, stx);

    let raf;
    let fade = 0;                          // eased opacity, follows fadeRef
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      fade += (fadeRef.current - fade) * 0.07;   // smooth fade in / out

      floaters.forEach((m) => {
        const u = m.userData;
        u.angle += u.speed * 0.01;
        m.position.set(
          Math.cos(u.angle) * u.radiusX,
          Math.sin(u.angle * 1.1 + u.phase) * u.radiusY,
          Math.sin(u.angle) * 2 - 1.5,
        );
        m.rotation.x += u.sx; m.rotation.y += u.sy;
        m.material.opacity = fade;
      });

      sparks.rotation.y += 0.0015;
      sm.opacity = fade * (0.55 + Math.sin(t * 3) * 0.25);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      disposables.forEach((d) => d.dispose && d.dispose());
    };
  }, [show]);

  if (!show) {
    if (isShaking) return <div className="lt-shake-blocker" aria-hidden="true" />;
    return null;
  }

  const wrapStyle = {
    transform: open
      ? 'translate(-50%, -50%)'
      : `translate(-50%, -50%) translate(${nav.dx}px, ${nav.dy}px) scale(${nav.scale})`,
  };
  const centered = phase === 'center';

  return (
    <div className="lt" aria-hidden="true">
      {/* Fluid overlay that wipes in from the top-right corner */}
      <div className={`lt__fluid ${open ? 'lt__fluid--open' : ''}`}>
        <span className="lt__aura lt__aura--1" />
        <span className="lt__aura lt__aura--2" />
      </div>

      {/* Full-screen orbiting 3D objects filling the space */}
      <div className="lt__scene" ref={mountRef} />

      {/* Logo: flies navbar → centre, rounds into a badge, then zooms in/out */}
      <div className="lt__logo" style={wrapStyle}>
        <img
          src={logo}
          alt=""
          className={`lt__logo-img ${open ? 'lt__logo-img--round' : ''} ${centered ? 'lt__logo-img--pulse' : ''}`}
          style={centered ? { animationDuration: `${CENTER_MS}ms` } : undefined}
        />
      </div>
    </div>
  );
}

export default LocationTransition;
