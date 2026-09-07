import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getDeviceTier, prefersReducedMotion } from '../../utils/perf';
import { isPrerender } from '../../utils/isPrerender';
import './HeroBlob3D.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * HeroBlob3D — the EXACT home-page bioluminescent jelly (same vertex/fragment
 * shaders, same light-theme aqua colours, same composition: ribbon + ring +
 * floating blobs + drifting spores) BUT rebuilt on the Experience page's
 * optimised, buttery-smooth foundation:
 *
 *  · Leaner per-tier geometry / spore / DPR budgets than the home page (which
 *    renders a 140×30 knot + 6 detail-8 blobs + 240 spores @ DPR 1.75 — the
 *    reason it stutters on scroll).
 *  · Scroll does ZERO heavy work — a GSAP ScrollTrigger only writes a progress
 *    number; the rAF loop lerps toward it, so scroll never touches the GPU or
 *    forces layout. Biggest anti-jank win.
 *  · Render loop pauses when the hero is offscreen / tab hidden; reduced-motion
 *    renders a single static frame; everything disposed on unmount.
 *
 * On scroll the whole cosmos gently spins + drifts upward (parallax).
 */

// Light per-location jelly palettes (core / edge / glow).
const PALETTES = {
  bahriatown: { core: 0x93c5fd, edge: 0x67e8f9, glow: 0xbae6fd }, // aqua/blue
  dharaya:    { core: 0xa7f3d0, edge: 0x6ee7b7, glow: 0xd1fae5 }, // light green
  etihadtown: { core: 0xc4b5fd, edge: 0xa78bfa, glow: 0xede9fe }, // light violet
  uniontown:  { core: 0xfda4af, edge: 0xfb7185, glow: 0xffe4e6 }, // light rose
};

// Optimised quality presets (leaner than the home page's).
const Q = {
  high: { dpr: 1.6, aa: true, knot: [118, 22], ring: [24, 64], showRing: true, blobs: 4, blobDetail: 6, spores: 90 },
  mid: { dpr: 1.35, aa: true, knot: [96, 18], ring: [18, 48], showRing: true, blobs: 3, blobDetail: 5, spores: 40 },
  low: { dpr: 1, aa: false, knot: [72, 14], ring: null, showRing: false, blobs: 2, blobDetail: 4, spores: 0 },
};

export default function HeroBlob3D({ location = 'bahriatown' }) {
  const mountRef = useRef(null);
  const visibleRef = useRef(true);
  const menuOpenRef = useRef(false);
  const colorUniformsRef = useRef([]);

  useEffect(() => {
    // Never spin up WebGL during react-snap prerendering — the jelly is purely
    // decorative (aria-hidden) so its absence doesn't affect the crawled HTML,
    // and running Three.js under headless Chrome only wastes time / risks hangs.
    if (isPrerender()) return;
    const mount = mountRef.current;
    if (!mount) return;
    const pal = PALETTES[location] || PALETTES.bahriatown;

    const tier = getDeviceTier();
    const q = Q[tier];
    const reduced = prefersReducedMotion();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // ── Scene / camera / renderer ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: q.aa, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.dpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // ── EXACT home-page jelly shaders ──
    const jellyVertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uDistort;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vDisplacement;
      vec3 getDisplacement(vec3 pos, float time) {
        float wave1 = sin(pos.x * 1.6 + time * 1.1) * cos(pos.y * 1.6 + time * 1.0);
        float wave2 = sin(pos.z * 1.8 + time * 1.2) * cos(pos.x * 1.7 + time * 0.8);
        float wave3 = sin((pos.x + pos.y + pos.z) * 1.2 + time * 1.5) * 0.4;
        float mouseDist = length(pos.xy - uMouse * 3.8);
        float mouseWave = sin(mouseDist * 2.8 - time * 2.5) * exp(-mouseDist * 0.55) * 0.35;
        float totalDisp = (wave1 + wave2 + wave3 + mouseWave) * uDistort;
        return pos + normalize(pos) * totalDisp;
      }
      void main() {
        vUv = uv;
        vec3 displaced = getDisplacement(position, uTime);
        vDisplacement = length(displaced - position);
        vec3 p1 = getDisplacement(position + vec3(0.02, 0.0, 0.0), uTime);
        vec3 p2 = getDisplacement(position + vec3(0.0, 0.02, 0.0), uTime);
        vec3 normalDist = normalize(cross(p1 - displaced, p2 - displaced));
        vNormal = normalize(normalMatrix * (normalDist + normal * 0.65));
        vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `;
    const jellyFragmentShader = `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorEdge;
      uniform vec3 uColorGlow;
      uniform float uBaseAlpha;
      uniform float uGlowIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vDisplacement;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        vec3 normal = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.4);
        float innerFresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.5);
        float colorCycle = sin(vUv.x * 6.28 + uTime * 0.6) * 0.5 + 0.5;
        vec3 baseJelly = mix(uColorCore, uColorEdge, colorCycle);
        vec3 internalGlow = uColorGlow * (0.25 + vDisplacement * 1.5) * uGlowIntensity;
        vec3 rimColor = vec3(0.4, 0.85, 1.0) * fresnel * uGlowIntensity;
        vec3 specularHighlight = vec3(1.0) * pow(max(dot(reflect(-viewDir, normal), vec3(0.1, 0.9, 0.5)), 0.0), 28.0) * (uGlowIntensity * 0.4);
        vec3 finalColor = baseJelly * 0.7 + internalGlow + rimColor + specularHighlight;
        float alpha = clamp(uBaseAlpha + fresnel * 0.4 + innerFresnel * 0.2, 0.08, 0.95);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
    const makeJelly = (uniforms) => new THREE.ShaderMaterial({
      vertexShader: jellyVertexShader,
      fragmentShader: jellyFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    const disposables = [];

    // 1. Jelly ribbon (torus knot) — the signature object (light-theme aqua)
    const ribbonUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uDistort: { value: 0.25 },
      uBaseAlpha: { value: 0.14 },
      uGlowIntensity: { value: 0.4 },
      uColorCore: { value: new THREE.Color(pal.core) },
      uColorEdge: { value: new THREE.Color(pal.edge) },
      uColorGlow: { value: new THREE.Color(pal.glow) },
    };
    const ribbonGeo = new THREE.TorusKnotGeometry(4.2, 0.85, q.knot[0], q.knot[1], 2, 3);
    const ribbonMat = makeJelly(ribbonUniforms);
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(4.5, -0.5, -2.5);
    ribbon.rotation.set(0.6, 0.8, 0.2);
    worldGroup.add(ribbon);
    disposables.push(ribbonGeo, ribbonMat);

    // 2. Secondary left jelly ring (skipped on low tier)
    let leftRing = null, leftRingUniforms = null;
    if (q.showRing && q.ring) {
      leftRingUniforms = {
        uTime: { value: 10 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDistort: { value: 0.28 },
        uBaseAlpha: { value: 0.12 },
        uGlowIntensity: { value: 0.35 },
        uColorCore: { value: new THREE.Color(pal.glow) },
        uColorEdge: { value: new THREE.Color(pal.core) },
        uColorGlow: { value: new THREE.Color(pal.edge) },
      };
      const g = new THREE.TorusGeometry(3.0, 0.55, q.ring[0], q.ring[1]);
      const m = makeJelly(leftRingUniforms);
      leftRing = new THREE.Mesh(g, m);
      leftRing.position.set(-6.5, 1.5, -4.0);
      leftRing.rotation.set(-0.8, 0.5, 0.4);
      worldGroup.add(leftRing);
      disposables.push(g, m);
    }

    // 3. Floating jelly blobs
    const blobs = [];
    const blobConfigs = [
      { size: 1.40, pos: [6.8, 2.2, 0.5], speed: 0.9, phase: 0.0, distort: 0.32 },
      { size: 1.05, pos: [5.2, -3.2, 1.2], speed: 0.75, phase: 1.8, distort: 0.36 },
      { size: 0.90, pos: [-5.8, -2.4, -1.0], speed: 1.1, phase: 3.2, distort: 0.28 },
      { size: 0.70, pos: [-7.2, 3.0, -2.0], speed: 0.85, phase: 4.5, distort: 0.34 },
    ].slice(0, q.blobs);
    blobConfigs.forEach((cfg) => {
      const u = {
        uTime: { value: cfg.phase },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDistort: { value: cfg.distort },
        uBaseAlpha: { value: 0.14 },
        uGlowIntensity: { value: 0.35 },
        uColorCore: { value: new THREE.Color(pal.core) },
        uColorEdge: { value: new THREE.Color(pal.edge) },
        uColorGlow: { value: new THREE.Color(pal.glow) },
      };
      const g = new THREE.IcosahedronGeometry(cfg.size, q.blobDetail);
      const m = makeJelly(u);
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(...cfg.pos);
      worldGroup.add(mesh);
      disposables.push(g, m);
      blobs.push({ mesh, u, base: [...cfg.pos], speed: cfg.speed, phase: cfg.phase });
    });

    // collect colour-bearing uniforms so location changes can re-tint the jelly
    colorUniformsRef.current = [
      ribbonUniforms,
      ...(leftRingUniforms ? [leftRingUniforms] : []),
      ...blobs.map((b) => b.u),
    ];

    // 4. Spores / droplets (skipped on low tier)
    let sporeSystem = null, sporeGeo = null;
    const sporeCount = q.spores;
    const sporeVel = [];
    if (sporeCount > 0) {
      sporeGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(sporeCount * 3);
      const col = new Float32Array(sporeCount * 3);
      for (let i = 0; i < sporeCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 36;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        const c = Math.random();
        if (c > 0.6) { col[i * 3] = 0.22; col[i * 3 + 1] = 0.74; col[i * 3 + 2] = 0.97; }
        else if (c > 0.3) { col[i * 3] = 0.40; col[i * 3 + 1] = 0.91; col[i * 3 + 2] = 0.99; }
        else { col[i * 3] = 0.58; col[i * 3 + 1] = 0.77; col[i * 3 + 2] = 0.99; }
        sporeVel.push({ vx: (Math.random() - 0.5) * 0.006, vy: Math.random() * 0.005 + 0.0015, vz: (Math.random() - 0.5) * 0.006 });
      }
      sporeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      sporeGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const cvs = document.createElement('canvas');
      cvs.width = 64; cvs.height = 64;
      const ctx = cvs.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(56,189,248,0.8)');
      grad.addColorStop(0.7, 'rgba(2,132,199,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(cvs);
      const sporeMat = new THREE.PointsMaterial({ size: 0.17, map: tex, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.NormalBlending, depthWrite: false });
      sporeSystem = new THREE.Points(sporeGeo, sporeMat);
      worldGroup.add(sporeSystem);
      disposables.push(sporeGeo, sporeMat, tex);
    }

    // ── Decoupled scroll progress (the smoothness secret) ──
    let targetP = 0, currP = 0;
    const st = ScrollTrigger.create({
      trigger: mount.closest('.xp-hero') || mount,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => { targetP = self.progress; },
    });

    // ── Motion ──
    let raf;
    const clock = new THREE.Clock();
    const targetRot = { x: 0, y: 0 }, currRot = { x: 0, y: 0 };
    const onMouse = (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRot.x = -my * 0.55;
      targetRot.y = mx * 0.65;
    };
    if (tier !== 'low') window.addEventListener('mousemove', onMouse, { passive: true });

    const render = () => renderer.render(scene, camera);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visibleRef.current) return;
      const time = clock.getElapsedTime();

      currRot.x += (targetRot.x - currRot.x) * 0.07;
      currRot.y += (targetRot.y - currRot.y) * 0.07;
      currP += (targetP - currP) * 0.08;

      const rx = currRot.x, ry = currRot.y;
      const scrollOffset = currP * 5.0;   // parallax drift range

      worldGroup.rotation.x = rx * 0.75 - currP * 0.25;
      worldGroup.rotation.y = ry * 0.75 + currP * 0.6;
      worldGroup.position.y = scrollOffset * 0.4 - rx * 0.4;   // drift up as you scroll
      worldGroup.position.x = ry * 0.8;

      ribbonUniforms.uTime.value = time * 0.7;
      ribbonUniforms.uMouse.value.set(ry * 1.4, rx * 1.4);
      ribbon.rotation.x = 0.6 + Math.sin(time * 0.22) * 0.1 + rx * 0.6;
      ribbon.rotation.y = 0.8 + time * 0.15 + ry * 0.6;
      ribbon.position.x = 4.5 + ry * 0.9;
      ribbon.position.y = -0.5 + Math.sin(time * 0.4) * 0.3 - rx * 0.6;

      if (leftRing && leftRingUniforms) {
        leftRingUniforms.uTime.value = time * 0.6 + 10.0;
        leftRingUniforms.uMouse.value.set(-ry * 1.2, -rx * 1.2);
        leftRing.rotation.x = -0.8 + Math.cos(time * 0.25) * 0.12 - rx * 0.5;
        leftRing.rotation.y = 0.5 - time * 0.12 - ry * 0.5;
        leftRing.position.x = -5.0 - ry * 0.7;
        leftRing.position.y = 1.5 + Math.cos(time * 0.4) * 0.25 + rx * 0.5;
      }

      blobs.forEach((b, idx) => {
        b.u.uTime.value = time * b.speed + b.phase;
        b.u.uMouse.value.set(ry * 1.2, rx * 1.2);
        const fy = Math.sin(time * b.speed + b.phase) * 0.4;
        const fx = Math.cos(time * (b.speed * 0.7) + b.phase) * 0.3;
        b.mesh.position.set(
          b.base[0] + fx + ry * (0.8 + idx * 0.15),
          b.base[1] + fy - rx * (0.6 + idx * 0.12),
          b.base[2] + ry * rx * 2.0,
        );
      });

      if (sporeSystem && sporeGeo) {
        const p = sporeGeo.attributes.position.array;
        for (let i = 0; i < sporeCount; i++) {
          const v = sporeVel[i], idx = i * 3;
          p[idx + 1] += v.vy; p[idx] += v.vx; p[idx + 2] += v.vz;
          if (p[idx + 1] > 12) p[idx + 1] = -11;
          if (p[idx] > 18) p[idx] = -18;
          if (p[idx] < -18) p[idx] = 18;
        }
        sporeGeo.attributes.position.needsUpdate = true;
      }

      render();
    };

    if (reduced) render();
    else raf = requestAnimationFrame(animate);

    // ── Pause offscreen / hidden ──
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting && !menuOpenRef.current; }, { threshold: 0.01 });
      observer.observe(mount);
    }
    const onVisibility = () => {
      if (menuOpenRef.current || document.hidden) { visibleRef.current = false; return; }
      const r = mount.getBoundingClientRect();
      visibleRef.current = r.bottom > 0 && r.top < window.innerHeight;
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Fully stop the hero's WebGL draw loop while the mobile menu is open so it
    // isn't competing with the menu animation for the GPU. We cancel the rAF
    // (rather than toggling display, which can force a costly WebGL context
    // loss/restore on iOS) and resume it on close.
    const onMenu = (e) => {
      menuOpenRef.current = !!(e.detail && e.detail.open);
      if (menuOpenRef.current) {
        visibleRef.current = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      } else {
        onVisibility();
        if (!raf && !reduced) raf = requestAnimationFrame(animate);
      }
    };
    window.addEventListener('xnav:menu', onMenu);

    // ── Resize (scale down on small screens so nothing clips) ──
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      if (w < 480) { camera.position.z = 32; worldGroup.scale.setScalar(0.5); ribbon.scale.setScalar(0.6); }
      else if (w < 768) { camera.position.z = 28; worldGroup.scale.setScalar(0.63); ribbon.scale.setScalar(0.64); }
      else if (w < 1200) { camera.position.z = 16; worldGroup.scale.setScalar(1); ribbon.scale.setScalar(0.88); }
      else { camera.position.z = 15; worldGroup.scale.setScalar(1); ribbon.scale.setScalar(1); }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reduced) render();
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Re-fit whenever the mount's own box changes size — critical when the hero
    // gets its real 100vh height a tick AFTER mount (async CSS, preloader, font
    // load). Without this the canvas keeps a stale/zero size and the jelly ends
    // up squished or pushed off-screen. `window.resize` alone never catches it.
    let ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => onResize());
      ro.observe(mount);
    }

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('xnav:menu', onMenu);
      document.removeEventListener('visibilitychange', onVisibility);
      if (observer) observer.disconnect();
      if (ro) ro.disconnect();
      st.kill();
      cancelAnimationFrame(raf);
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      disposables.forEach((d) => d.dispose && d.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-tint the jelly when the location changes (scene stays mounted).
  useEffect(() => {
    const pal = PALETTES[location] || PALETTES.bahriatown;
    colorUniformsRef.current.forEach((u) => {
      u.uColorCore.value.set(pal.core);
      u.uColorEdge.value.set(pal.edge);
      u.uColorGlow.value.set(pal.glow);
    });
  }, [location]);

  return <div className="xp-hero3d" ref={mountRef} aria-hidden="true" />;
}
