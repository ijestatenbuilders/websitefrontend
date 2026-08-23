import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './Hero3D.css';

// Simple Building Component (no Float - using manual animation)
function Building3D({ position, scale, color, rotationSpeed, floatOffset }) {
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
    if (groupRef.current) {
      // Manual floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + floatOffset) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group ref={meshRef}>
        {/* Main building body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Building windows */}
        {[...Array(8)].map((_, i) => (
          <group key={i}>
            {[...Array(4)].map((_, j) => (
              <mesh
                key={`${i}-${j}`}
                position={[
                  (j - 1.5) * 0.2,
                  1 - (i * 0.25),
                  0.51
                ]}
              >
                <boxGeometry args={[0.08, 0.08, 0.02]} />
                <meshBasicMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={Math.random() > 0.3 ? 1 : 0}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Roof */}
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.1, 0.1, 1.1]} />
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Wireframe outline */}
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 2, 1)]} />
          <lineBasicMaterial attach="material" color="#60a5fa" linewidth={2} />
        </lineSegments>
      </group>
    </group>
  );
}

// Animated Particles
function ParticlesBackground() {
  const particlesRef = useRef();
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
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

// Buildings Scene
function BuildingsScene() {
  return (
    <group>
      <Building3D
        position={[-3, 0, 0]}
        scale={0.8}
        color="#1e3a8a"
        rotationSpeed={0.002}
        floatOffset={0}
      />
      <Building3D
        position={[0, -0.5, -2]}
        scale={1.2}
        color="#1e40af"
        rotationSpeed={0.0015}
        floatOffset={1}
      />
      <Building3D
        position={[3, 0.3, 0]}
        scale={0.9}
        color="#2563eb"
        rotationSpeed={0.0025}
        floatOffset={2}
      />
      <Building3D
        position={[1, 0.8, 1]}
        scale={0.6}
        color="#3b82f6"
        rotationSpeed={0.003}
        floatOffset={3}
      />
    </group>
  );
}

// Lights
function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color="#fbbf24"
      />
    </>
  );
}

// Main Hero3D Component
export default function Hero3D() {
  return (
    <div className="hero3d-container">
      <Canvas
        shadows
        className="hero3d-canvas"
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Lights />
        <ParticlesBackground />
        <BuildingsScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
