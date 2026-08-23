import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 600+ Volumetric floating dust & golden embers particles
export function ParticleAtmosphere({ lightingMode = 'cyberMidnight' }) {
  const pointsRef = useRef();
  const particleCount = 500;

  const { positions, colors, scales } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sca = new Float32Array(particleCount);

    const isGold = lightingMode === 'goldenHour';
    const isNoir = lightingMode === 'studioNoir';

    for (let i = 0; i < particleCount; i++) {
      // Cylinder distribution around the megastructure
      const radius = 3 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.3) * 32;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      // Color palette based on theme
      if (isGold) {
        // Gold / Amber
        col[i * 3] = 0.95 + Math.random() * 0.05;
        col[i * 3 + 1] = 0.72 + Math.random() * 0.2;
        col[i * 3 + 2] = 0.2 + Math.random() * 0.3;
      } else if (isNoir) {
        // Platinum / Silver
        const gray = 0.6 + Math.random() * 0.4;
        col[i * 3] = gray;
        col[i * 3 + 1] = gray;
        col[i * 3 + 2] = gray;
      } else {
        // Cyber: Mix of Cyan, Electric Blue and Gold
        const r = Math.random();
        if (r < 0.5) {
          col[i * 3] = 0.22;
          col[i * 3 + 1] = 0.74;
          col[i * 3 + 2] = 0.97; // Cyan
        } else if (r < 0.8) {
          col[i * 3] = 0.85;
          col[i * 3 + 1] = 0.65;
          col[i * 3 + 2] = 0.2; // Gold
        } else {
          col[i * 3] = 0.6;
          col[i * 3 + 1] = 0.3;
          col[i * 3 + 2] = 0.9; // Purple
        }
      }

      sca[i] = 0.05 + Math.random() * 0.12;
    }

    return { positions: pos, colors: col, scales: sca };
  }, [lightingMode]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Holographic Blueprint Floor Grid with concentric radar rings
export function HologramGrid() {
  const radarRef = useRef();

  useFrame((state) => {
    if (radarRef.current) {
      radarRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={[0, -6.5, 0]}>
      {/* Reflective Dark Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#04060b"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Main Square Grid */}
      <gridHelper args={[70, 70, '#1e293b', '#091322']} position={[0, 0.02, 0]} />

      {/* Concentric Radar Rings */}
      <group ref={radarRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        {[4, 8, 14, 20, 28].map((radius, idx) => (
          <mesh key={idx}>
            <ringGeometry args={[radius, radius + 0.04, 64]} />
            <meshBasicMaterial
              color={idx === 2 ? '#38bdf8' : '#1e3a8a'}
              transparent
              opacity={idx === 2 ? 0.35 : 0.15}
            />
          </mesh>
        ))}

        {/* Crosshair lines */}
        <mesh>
          <planeGeometry args={[60, 0.03]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[60, 0.03]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// Dynamic Multi-Rig Lighting Environment
export function LightingRig({ lightingMode = 'cyberMidnight' }) {
  if (lightingMode === 'goldenHour') {
    return (
      <>
        <ambientLight intensity={0.5} color="#fed7aa" />
        <directionalLight position={[12, 14, 8]} intensity={2.2} color="#f59e0b" castShadow />
        <directionalLight position={[-12, 6, -10]} intensity={0.9} color="#ea580c" />
        <pointLight position={[0, 8, 4]} intensity={2.5} color="#fbbf24" distance={25} />
        <pointLight position={[0, -2, -6]} intensity={1.8} color="#d97706" distance={20} />
      </>
    );
  }

  if (lightingMode === 'daylight') {
    return (
      <>
        <ambientLight intensity={0.7} color="#f8fafc" />
        <directionalLight position={[15, 20, 10]} intensity={2.8} color="#ffffff" castShadow />
        <directionalLight position={[-15, 10, -10]} intensity={1.0} color="#94a3b8" />
        <pointLight position={[4, 6, 6]} intensity={1.5} color="#e0f2fe" distance={25} />
      </>
    );
  }

  if (lightingMode === 'studioNoir') {
    return (
      <>
        <ambientLight intensity={0.2} color="#ffffff" />
        <directionalLight position={[10, 12, 10]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, 8, -10]} intensity={2.5} color="#ffffff" />
        <spotLight
          position={[0, 16, 0]}
          intensity={3}
          angle={0.6}
          penumbra={0.8}
          color="#ffffff"
        />
      </>
    );
  }

  // Default: cyberMidnight
  return (
    <>
      <ambientLight intensity={0.35} color="#0f172a" />
      <directionalLight position={[12, 16, 8]} intensity={1.8} color="#e0e7ff" castShadow />
      <directionalLight position={[-12, 8, -8]} intensity={1.2} color="#0284c7" />
      <pointLight position={[6, 10, 5]} intensity={2.8} color="#38bdf8" distance={25} />
      <pointLight position={[-6, 4, -4]} intensity={2.4} color="#a855f7" distance={20} />
      <pointLight position={[0, -4, 6]} intensity={2.0} color="#f59e0b" distance={18} />
      <spotLight
        position={[0, 20, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2.0}
        color="#38bdf8"
      />
    </>
  );
}
