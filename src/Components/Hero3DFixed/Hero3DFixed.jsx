import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './Hero3DFixed.css';

// Building Component - Manual floating animation (NO Float component)
function Building({ position, size, color, speed }) {
  const meshRef = useRef();
  const groupRef = useRef();

  // Store initial Y position
  const initialY = position[1];

  useFrame((state) => {
    if (groupRef.current) {
      // Manual floating animation using sine wave
      groupRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1 * speed;
    }
  });

  // Create windows grid
  const windows = useMemo(() => {
    const windowArray = [];
    const rows = 8;
    const cols = 4;
    const spacing = 0.15;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        windowArray.push({
          position: [
            (j - cols / 2) * spacing,
            (size[1] / 2) - (i * spacing) - 0.2,
            size[2] / 2 + 0.01
          ],
          id: `${i}-${j}`
        });
      }
    }
    return windowArray;
  }, [size]);

  return (
    <group ref={groupRef} position={position}>
      <group ref={meshRef}>
        {/* Main Building */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Windows */}
        {windows.map((window) => (
          <mesh key={window.id} position={window.position}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        ))}

        {/* Roof */}
        <mesh position={[0, size[1] / 2 + 0.05, 0]}>
          <boxGeometry args={[size[0] * 1.1, 0.1, size[2] * 1.1]} />
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Edge lines */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial color="#60a5fa" linewidth={2} />
        </lineSegments>
      </group>
    </group>
  );
}

// Particles Component
function Particles() {
  const pointsRef = useRef();
  const particleCount = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Scene Component
function Scene() {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      {/* Particles */}
      <Particles />

      {/* Buildings */}
      <Building
        position={[-3, 0, 0]}
        size={[1, 2.5, 1]}
        color="#1e3a8a"
        speed={0.8}
      />
      <Building
        position={[0, -0.5, -2]}
        size={[1.2, 3, 1.2]}
        color="#1e40af"
        speed={0.6}
      />
      <Building
        position={[3, 0.3, 0]}
        size={[0.9, 2.2, 0.9]}
        color="#2563eb"
        speed={1}
      />
      <Building
        position={[1.5, 0.8, 1]}
        size={[0.7, 1.8, 0.7]}
        color="#3b82f6"
        speed={1.2}
      />
    </>
  );
}

// Main Component
export default function Hero3DFixed() {
  return (
    <div className="hero3d-fixed">
      <Canvas
        shadows
        camera={{ position: [0, 2, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      <div className="hero-overlay">
        <h1>Experience Properties in 3D</h1>
        <p>Interactive 3D visualization powered by Three.js</p>
      </div>
    </div>
  );
}
