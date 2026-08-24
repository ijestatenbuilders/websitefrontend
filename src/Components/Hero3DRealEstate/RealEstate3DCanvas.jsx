import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getDeviceTier, prefersReducedMotion } from '../../utils/perf';
import './RealEstate3DCanvas.css';

/**
 * Dual-Theme 3D Bioluminescent Bluish Jelly Cosmos.
 *
 * Performance model — the scene now scales itself to the device:
 *  - QUALITY presets (low/mid/high) control DPR, antialias, geometry detail,
 *    blob count, spore count and overall scale.
 *  - Rendering PAUSES when the hero scrolls out of view (IntersectionObserver)
 *    and when the tab is hidden — no more burning GPU while you read the rest
 *    of the page.
 *  - Low-end phones get a small, calm accent instead of an overwhelming cosmos.
 */

const QUALITY = {
  high: {
    dpr: 1.75, aa: true, precision: 'highp',
    knot: [140, 30], ring: [30, 80], showRing: true,
    blobs: 6, blobDetail: 8, spores: 240,
    groupScale: 1, fpsCap: 0, mouse: true,
  },
  mid: {
    dpr: 1.5, aa: true, precision: 'highp',
    knot: [112, 22], ring: [22, 60], showRing: true,
    blobs: 4, blobDetail: 6, spores: 120,
    groupScale: 0.85, fpsCap: 0, mouse: true,
  },
  low: {
    dpr: 1, aa: false, precision: 'mediump',
    knot: [84, 16], ring: null, showRing: false,
    blobs: 2, blobDetail: 5, spores: 0,
    groupScale: 0.62, fpsCap: 30, mouse: false,
  },
};

export default function RealEstate3DCanvas({ theme = 'light' }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  // Uniform refs for dynamic runtime theme transition
  const ribbonUniformsRef = useRef(null);
  const leftRingUniformsRef = useRef(null);
  const blobUniformsListRef = useRef([]);
  const ambientLightRef = useRef(null);
  const keyLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const sporeMatRef = useRef(null);

  // Parallax / mouse smoothing
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);

  // Rendering is paused when the hero isn't visible.
  const visibleRef = useRef(true);

  useEffect(() => {
    const tier = getDeviceTier();
    const q = QUALITY[tier];
    const mouseEnabled = q.mouse;

    const handleMouse = (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotation.current.x = -my * 0.55;
      targetRotation.current.y = mx * 0.65;
    };
    const handleScroll = () => {
      targetScrollY.current = window.scrollY;
    };

    if (mouseEnabled) window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (mouseEnabled) window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth runtime theme updater
  useEffect(() => {
    const isDark = theme === 'dark';

    if (ribbonUniformsRef.current) {
      ribbonUniformsRef.current.uColorCore.value.set(isDark ? 0x0284c7 : 0x93c5fd);
      ribbonUniformsRef.current.uColorEdge.value.set(isDark ? 0x06b6d4 : 0x67e8f9);
      ribbonUniformsRef.current.uColorGlow.value.set(isDark ? 0x38bdf8 : 0xbae6fd);
      ribbonUniformsRef.current.uBaseAlpha.value = isDark ? 0.35 : 0.14;
      ribbonUniformsRef.current.uGlowIntensity.value = isDark ? 1.8 : 0.4;
    }

    if (leftRingUniformsRef.current) {
      leftRingUniformsRef.current.uColorCore.value.set(isDark ? 0x1e3a8a : 0xa5f3fc);
      leftRingUniformsRef.current.uColorEdge.value.set(isDark ? 0x0284c7 : 0xbae6fd);
      leftRingUniformsRef.current.uColorGlow.value.set(isDark ? 0x67e8f9 : 0x93c5fd);
      leftRingUniformsRef.current.uBaseAlpha.value = isDark ? 0.30 : 0.12;
      leftRingUniformsRef.current.uGlowIntensity.value = isDark ? 1.6 : 0.35;
    }

    if (blobUniformsListRef.current.length > 0) {
      blobUniformsListRef.current.forEach((u, i) => {
        if (!u) return;
        u.uBaseAlpha.value = isDark ? 0.32 : 0.14;
        u.uGlowIntensity.value = isDark ? 1.5 : 0.35;
        if (isDark) {
          u.uColorCore.value.set(i % 2 === 0 ? 0x0284c7 : 0x0369a1);
          u.uColorEdge.value.set(i % 2 === 0 ? 0x38bdf8 : 0x67e8f9);
        } else {
          u.uColorCore.value.set(i % 2 === 0 ? 0x93c5fd : 0xbae6fd);
          u.uColorEdge.value.set(i % 2 === 0 ? 0x7dd3fc : 0xa5f3fc);
        }
      });
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.set(isDark ? 0x0a1930 : 0xffffff);
      ambientLightRef.current.intensity = isDark ? 2.0 : 1.4;
    }
    if (keyLightRef.current) {
      keyLightRef.current.color.set(isDark ? 0x38bdf8 : 0xf0f9ff);
      keyLightRef.current.intensity = isDark ? 3.5 : 1.1;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.set(isDark ? 0x0284c7 : 0xe0f2fe);
      fillLightRef.current.intensity = isDark ? 3.0 : 0.7;
    }
    if (sporeMatRef.current) {
      sporeMatRef.current.opacity = isDark ? 0.85 : 0.35;
      sporeMatRef.current.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    }
  }, [theme]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const tier = getDeviceTier();
    const q = QUALITY[tier];
    const reduced = prefersReducedMotion();
    const isDarkInitial = theme === 'dark';

    // 1. Scene + camera
    const scene = new THREE.Scene();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    // 2. Renderer — DPR + antialias + precision tuned per tier
    const renderer = new THREE.WebGLRenderer({
      antialias: q.aa,
      alpha: true,
      powerPreference: 'high-performance',
      precision: q.precision,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.dpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDarkInitial ? 0x0a1930 : 0xffffff, isDarkInitial ? 2.0 : 1.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.PointLight(isDarkInitial ? 0x38bdf8 : 0xf0f9ff, isDarkInitial ? 3.5 : 1.1, 40, 1.2);
    keyLight.position.set(6, 4, 8);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.PointLight(isDarkInitial ? 0x0284c7 : 0xe0f2fe, isDarkInitial ? 3.0 : 0.7, 35, 1.2);
    fillLight.position.set(-7, -4, 6);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x60a5fa, isDarkInitial ? 2.2 : 0.5);
    rimLight.position.set(0, 10, -8);
    scene.add(rimLight);

    const worldGroup = new THREE.Group();
    worldGroup.scale.setScalar(q.groupScale);
    scene.add(worldGroup);

    // Shaders (unchanged look)
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

    const makeJellyMaterial = (uniforms) => new THREE.ShaderMaterial({
      vertexShader: jellyVertexShader,
      fragmentShader: jellyFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });

    const disposables = [];

    // 1. Jelly Ribbon (always present — the signature object)
    const ribbonUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uDistort: { value: 0.25 },
      uBaseAlpha: { value: isDarkInitial ? 0.35 : 0.14 },
      uGlowIntensity: { value: isDarkInitial ? 1.8 : 0.4 },
      uColorCore: { value: new THREE.Color(isDarkInitial ? 0x0284c7 : 0x93c5fd) },
      uColorEdge: { value: new THREE.Color(isDarkInitial ? 0x06b6d4 : 0x67e8f9) },
      uColorGlow: { value: new THREE.Color(isDarkInitial ? 0x38bdf8 : 0xbae6fd) },
    };
    ribbonUniformsRef.current = ribbonUniforms;
    const ribbonGeo = new THREE.TorusKnotGeometry(4.2, 0.85, q.knot[0], q.knot[1], 2, 3);
    const ribbonMat = makeJellyMaterial(ribbonUniforms);
    const jellyRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    jellyRibbon.position.set(4.5, -0.5, -2.5);
    jellyRibbon.rotation.set(0.6, 0.8, 0.2);
    worldGroup.add(jellyRibbon);
    disposables.push(ribbonGeo, ribbonMat);

    // 2. Secondary Left Jelly Ring (skipped on low tier)
    let leftJellyRing = null;
    let leftRingUniforms = null;
    if (q.showRing && q.ring) {
      leftRingUniforms = {
        uTime: { value: 10 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDistort: { value: 0.28 },
        uBaseAlpha: { value: isDarkInitial ? 0.30 : 0.12 },
        uGlowIntensity: { value: isDarkInitial ? 1.6 : 0.35 },
        uColorCore: { value: new THREE.Color(isDarkInitial ? 0x1e3a8a : 0xa5f3fc) },
        uColorEdge: { value: new THREE.Color(isDarkInitial ? 0x0284c7 : 0xbae6fd) },
        uColorGlow: { value: new THREE.Color(isDarkInitial ? 0x67e8f9 : 0x93c5fd) },
      };
      leftRingUniformsRef.current = leftRingUniforms;
      const leftRingGeo = new THREE.TorusGeometry(3.0, 0.55, q.ring[0], q.ring[1]);
      const leftRingMat = makeJellyMaterial(leftRingUniforms);
      leftJellyRing = new THREE.Mesh(leftRingGeo, leftRingMat);
      leftJellyRing.position.set(-6.5, 1.5, -4.0);
      leftJellyRing.rotation.set(-0.8, 0.5, 0.4);
      worldGroup.add(leftJellyRing);
      disposables.push(leftRingGeo, leftRingMat);
    }

    // 3. Floating Jelly Blobs (count + detail per tier)
    const jellyBlobs = [];
    const blobUniformsList = [];
    const blobConfigs = [
      { size: 1.40, pos: [6.8, 2.2, 0.5], speed: 0.9, phase: 0.0, distort: 0.32 },
      { size: 1.05, pos: [5.2, -3.2, 1.2], speed: 0.75, phase: 1.8, distort: 0.36 },
      { size: 0.90, pos: [-5.8, -2.4, -1.0], speed: 1.1, phase: 3.2, distort: 0.28 },
      { size: 0.70, pos: [-7.2, 3.0, -2.0], speed: 0.85, phase: 4.5, distort: 0.34 },
      { size: 0.60, pos: [8.5, -0.8, -1.5], speed: 1.2, phase: 2.3, distort: 0.38 },
      { size: 0.50, pos: [-3.5, 3.8, -3.0], speed: 0.95, phase: 5.1, distort: 0.30 },
    ].slice(0, q.blobs);

    blobConfigs.forEach((cfg, idx) => {
      const uniforms = {
        uTime: { value: cfg.phase },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDistort: { value: cfg.distort },
        uBaseAlpha: { value: isDarkInitial ? 0.32 : 0.14 },
        uGlowIntensity: { value: isDarkInitial ? 1.5 : 0.35 },
        uColorCore: { value: new THREE.Color(isDarkInitial ? 0x0284c7 : 0x93c5fd) },
        uColorEdge: { value: new THREE.Color(isDarkInitial ? 0x38bdf8 : 0x7dd3fc) },
        uColorGlow: { value: new THREE.Color(isDarkInitial ? 0x67e8f9 : 0xbae6fd) },
      };
      blobUniformsList.push(uniforms);
      const geo = new THREE.IcosahedronGeometry(cfg.size, q.blobDetail);
      const mat = makeJellyMaterial(uniforms);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...cfg.pos);
      worldGroup.add(mesh);
      disposables.push(geo, mat);
      jellyBlobs.push({ mesh, uniforms, basePos: [...cfg.pos], speed: cfg.speed, phase: cfg.phase });
    });
    blobUniformsListRef.current = blobUniformsList;

    // 4. Spores / droplets (skipped on low tier)
    let sporeSystem = null;
    let sporeGeo = null;
    const sporeCount = q.spores;
    const sporeVelocities = [];
    if (sporeCount > 0) {
      sporeGeo = new THREE.BufferGeometry();
      const sporePos = new Float32Array(sporeCount * 3);
      const sporeColors = new Float32Array(sporeCount * 3);
      for (let i = 0; i < sporeCount; i++) {
        sporePos[i * 3] = (Math.random() - 0.5) * 36;
        sporePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
        sporePos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        const c = Math.random();
        if (c > 0.6) { sporeColors[i * 3] = 0.22; sporeColors[i * 3 + 1] = 0.74; sporeColors[i * 3 + 2] = 0.97; }
        else if (c > 0.3) { sporeColors[i * 3] = 0.40; sporeColors[i * 3 + 1] = 0.91; sporeColors[i * 3 + 2] = 0.99; }
        else { sporeColors[i * 3] = 0.58; sporeColors[i * 3 + 1] = 0.77; sporeColors[i * 3 + 2] = 0.99; }
        sporeVelocities.push({
          vx: (Math.random() - 0.5) * 0.006,
          vy: Math.random() * 0.005 + 0.0015,
          vz: (Math.random() - 0.5) * 0.006,
        });
      }
      sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
      sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

      const canvasTex = document.createElement('canvas');
      canvasTex.width = 64; canvasTex.height = 64;
      const ctx = canvasTex.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
      grad.addColorStop(0.7, 'rgba(2, 132, 199, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const particleTexture = new THREE.CanvasTexture(canvasTex);

      const sporeMat = new THREE.PointsMaterial({
        size: 0.17, map: particleTexture, vertexColors: true, transparent: true,
        opacity: isDarkInitial ? 0.85 : 0.35,
        blending: isDarkInitial ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
      });
      sporeMatRef.current = sporeMat;
      sporeSystem = new THREE.Points(sporeGeo, sporeMat);
      worldGroup.add(sporeSystem);
      disposables.push(sporeGeo, sporeMat, particleTexture);
    }

    // ── Animation loop (pauses offscreen, caps FPS on low tier) ──
    let animationFrameId;
    const clock = new THREE.Clock();
    const minDelta = q.fpsCap ? 1000 / q.fpsCap : 0;
    let lastFrame = 0;

    const animate = (now) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!visibleRef.current) return;                 // paused: hero offscreen / tab hidden
      if (minDelta && now - lastFrame < minDelta) return;
      lastFrame = now;

      const time = clock.getElapsedTime();

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.07;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.07;
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * 0.075;

      const rx = currentRotation.current.x;
      const ry = currentRotation.current.y;
      const scrollOffset = currentScrollY.current * 0.0028;

      worldGroup.rotation.x = rx * 0.75;
      worldGroup.rotation.y = ry * 0.75;
      worldGroup.position.y = -scrollOffset * 1.3 - rx * 0.4;
      worldGroup.position.x = ry * 0.8;

      ribbonUniforms.uTime.value = time * 0.7;
      ribbonUniforms.uMouse.value.set(ry * 1.4, rx * 1.4);
      jellyRibbon.rotation.x = 0.6 + Math.sin(time * 0.22) * 0.1 + rx * 0.6;
      jellyRibbon.rotation.y = 0.8 + time * 0.15 + ry * 0.6;
      jellyRibbon.position.x = 4.5 + ry * 0.9;
      jellyRibbon.position.y = -0.5 + Math.sin(time * 0.4) * 0.3 - scrollOffset * 0.7 - rx * 0.6;

      if (leftJellyRing && leftRingUniforms) {
        leftRingUniforms.uTime.value = time * 0.6 + 10.0;
        leftRingUniforms.uMouse.value.set(-ry * 1.2, -rx * 1.2);
        leftJellyRing.rotation.x = -0.8 + Math.cos(time * 0.25) * 0.12 - rx * 0.5;
        leftJellyRing.rotation.y = 0.5 - time * 0.12 - ry * 0.5;
        leftJellyRing.position.x = -5.0 - ry * 0.7;
        leftJellyRing.position.y = 1.5 + Math.cos(time * 0.4) * 0.25 - scrollOffset * 0.45 + rx * 0.5;
      }

      jellyBlobs.forEach((blob, idx) => {
        blob.uniforms.uTime.value = time * blob.speed + blob.phase;
        blob.uniforms.uMouse.value.set(ry * 1.2, rx * 1.2);
        const floatY = Math.sin(time * blob.speed + blob.phase) * 0.4;
        const floatX = Math.cos(time * (blob.speed * 0.7) + blob.phase) * 0.3;
        blob.mesh.position.set(
          blob.basePos[0] + floatX + ry * (0.8 + idx * 0.15),
          blob.basePos[1] + floatY - rx * (0.6 + idx * 0.12) - scrollOffset * (0.35 + idx * 0.09),
          blob.basePos[2] + (ry * rx * 2.0),
        );
      });

      if (sporeSystem && sporeGeo) {
        const positions = sporeGeo.attributes.position.array;
        for (let i = 0; i < sporeCount; i++) {
          const vel = sporeVelocities[i];
          const idx = i * 3;
          positions[idx + 1] += vel.vy;
          positions[idx] += vel.vx;
          positions[idx + 2] += vel.vz;
          if (positions[idx + 1] > 12) positions[idx + 1] = -11;
          if (positions[idx] > 18) positions[idx] = -18;
          if (positions[idx] < -18) positions[idx] = 18;
        }
        sporeGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    // Reduced motion: render a single static frame, no loop.
    if (reduced) {
      renderer.render(scene, camera);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Pause when the hero scrolls out of view — the single biggest battery/perf win.
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !reduced) clock.getDelta(); // avoid a huge time jump on resume
        },
        { threshold: 0.01 },
      );
      observer.observe(mount);
    }
    const onVisibility = () => {
      if (document.hidden) visibleRef.current = false;
      else {
        const rect = mount.getBoundingClientRect();
        visibleRef.current = rect.bottom > 0 && rect.top < window.innerHeight;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      if (w < 480) {
        // Tiny phones: pull the camera way back + shrink the whole group hard so
        // the jelly reads as a super-small, fully-visible ambient accent behind
        // the content (never cut off, never hidden).
        camera.position.set(0, 0, 34);
        worldGroup.scale.setScalar(q.groupScale * 0.32);
        jellyRibbon.scale.set(0.4, 0.4, 0.4);
        jellyRibbon.position.set(0, 0.5, -2);
      } else if (w < 768) {
        camera.position.set(0, 0, 30);
        worldGroup.scale.setScalar(q.groupScale * 0.42);
        jellyRibbon.scale.set(0.45, 0.45, 0.45);
        jellyRibbon.position.set(0, 0.4, -2);
      } else if (w < 1200) {
        camera.position.set(0, 0, 16);
        worldGroup.scale.setScalar(q.groupScale);
        jellyRibbon.scale.set(0.88, 0.88, 0.88);
        jellyRibbon.position.set(3.2, -0.4, -2.5);
      } else {
        camera.position.set(0, 0, 15);
        worldGroup.scale.setScalar(q.groupScale);
        jellyRibbon.scale.set(1.0, 1.0, 1.0);
        jellyRibbon.position.set(4.5, -0.5, -2.5);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reduced) renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (observer) observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      disposables.forEach((d) => d.dispose && d.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="real-estate-3d-canvas" ref={mountRef} />;
}
