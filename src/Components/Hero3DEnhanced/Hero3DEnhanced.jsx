import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './Hero3DEnhanced.css';

// Enhanced Building with more details
function EnhancedBuilding({ position, size, color, speed, buildingStyle = 'modern' }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const initialY = position[1];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      groupRef.current.rotation.y += 0.001 * speed;
    }
  });

  // Create detailed windows
  const windows = useMemo(() => {
    const windowArray = [];
    const rows = Math.floor(size[1] * 5);
    const cols = 4;
    const spacing = 0.15;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const isLit = Math.random() > 0.3;
        windowArray.push({
          position: [
            (j - cols / 2 + 0.5) * spacing,
            (size[1] / 2) - (i * spacing) - 0.3,
            size[2] / 2 + 0.01
          ],
          id: `${i}-${j}`,
          lit: isLit,
          flickerSpeed: 2 + Math.random() * 3
        });
      }
    }
    return windowArray;
  }, [size]);

  // Building accessories
  const renderAccessories = () => {
    if (buildingStyle === 'modern') {
      return (
        <>
          {/* Antenna */}
          <mesh position={[0, size[1] / 2 + 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Satellite dish */}
          <mesh position={[size[0] / 3, size[1] / 2 + 0.15, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.02, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Helipad (on tallest buildings) */}
          {size[1] > 2.5 && (
            <group position={[0, size[1] / 2 + 0.05, 0]}>
              <mesh>
                <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* H marking */}
              <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.15, 32]} />
                <meshBasicMaterial color="#1e293b" />
              </mesh>
            </group>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <group ref={groupRef} position={position}>
      <group ref={meshRef}>
        {/* Main Building Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            metalness={0.4}
            roughness={0.3}
            envMapIntensity={1}
          />
        </mesh>

        {/* Windows with individual lights */}
        {windows.map((window) => (
          <group key={window.id}>
            <mesh position={window.position}>
              <boxGeometry args={[0.09, 0.09, 0.02]} />
              <meshStandardMaterial
                color={window.lit ? '#fbbf24' : '#1e293b'}
                emissive={window.lit ? '#fbbf24' : '#000000'}
                emissiveIntensity={window.lit ? 0.8 : 0}
                metalness={0.5}
                roughness={0.5}
              />
            </mesh>
            {/* Window frame */}
            <mesh position={[window.position[0], window.position[1], window.position[2] - 0.01]}>
              <boxGeometry args={[0.1, 0.1, 0.01]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Building Base (foundation) */}
        <mesh position={[0, -size[1] / 2 - 0.05, 0]}>
          <boxGeometry args={[size[0] * 1.2, 0.1, size[2] * 1.2]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Roof with details */}
        <mesh position={[0, size[1] / 2 + 0.05, 0]}>
          <boxGeometry args={[size[0] * 1.05, 0.1, size[2] * 1.05]} />
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Corner pillars */}
        {[
          [-size[0] / 2, 0, -size[2] / 2],
          [size[0] / 2, 0, -size[2] / 2],
          [-size[0] / 2, 0, size[2] / 2],
          [size[0] / 2, 0, size[2] / 2]
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.08, size[1], 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}

        {/* Edge lighting */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial color="#60a5fa" linewidth={2} />
        </lineSegments>

        {/* Accessories */}
        {renderAccessories()}

        {/* Balconies (on some floors) */}
        {[...Array(Math.floor(size[1] * 2))].map((_, i) => {
          if (i % 3 === 0) {
            return (
              <mesh
                key={`balcony-${i}`}
                position={[size[0] / 2 + 0.05, (size[1] / 2) - (i * 0.5) - 0.5, 0]}
              >
                <boxGeometry args={[0.1, 0.02, size[2] * 0.6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
              </mesh>
            );
          }
          return null;
        })}
      </group>
    </group>
  );
}

// Enhanced Particles with colors
function EnhancedParticles() {
  const pointsRef = useRef();
  const particleCount = 200;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;

      // Mix of blue and gold particles
      if (Math.random() > 0.5) {
        col[i * 3] = 0.376; // Blue
        col[i * 3 + 1] = 0.647;
        col[i * 3 + 2] = 0.980;
      } else {
        col[i * 3] = 0.984; // Gold
        col[i * 3 + 1] = 0.749;
        col[i * 3 + 2] = 0.141;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Ground plane with grid
function Ground() {
  return (
    <group position={[0, -5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.5}
          roughness={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>
      <gridHelper args={[50, 50, '#334155', '#1e293b']} />
    </group>
  );
}

// Scene with all buildings
function Scene({ scrollY }) {
  const sceneRef = useRef();
  const targetRotation = useRef({ y: 0 });
  const targetPosition = useRef({ y: 0 });

  useEffect(() => {
    // Smooth interpolation for scroll
    targetRotation.current.y = scrollY * 0.0003;
    targetPosition.current.y = scrollY * 0.001;
  }, [scrollY]);

  useFrame(() => {
    if (sceneRef.current) {
      // Lerp (linear interpolation) for buttery smooth movement
      sceneRef.current.rotation.y += (targetRotation.current.y - sceneRef.current.rotation.y) * 0.05;
      sceneRef.current.position.y += (targetPosition.current.y - sceneRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#60a5fa" />

      {/* Point lights for ambiance */}
      <pointLight position={[5, 8, 5]} intensity={2} color="#fbbf24" distance={20} />
      <pointLight position={[-5, 8, -5]} intensity={2} color="#60a5fa" distance={20} />

      {/* Spot lights */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.4}
        penumbra={1}
        intensity={1.5}
        castShadow
        color="#ffffff"
      />

      {/* Enhanced Buildings */}
      <EnhancedBuilding
        position={[-4, 0, -1]}
        size={[1.2, 3.5, 1.2]}
        color="#1e3a8a"
        speed={0.7}
        buildingStyle="modern"
      />
      <EnhancedBuilding
        position={[0, -0.5, -3]}
        size={[1.5, 4, 1.5]}
        color="#1e40af"
        speed={0.5}
        buildingStyle="modern"
      />
      <EnhancedBuilding
        position={[4, 0.3, -1]}
        size={[1, 2.8, 1]}
        color="#2563eb"
        speed={0.9}
        buildingStyle="modern"
      />
      <EnhancedBuilding
        position={[2, 0.8, 1.5]}
        size={[0.8, 2.2, 0.8]}
        color="#3b82f6"
        speed={1.1}
        buildingStyle="modern"
      />
      <EnhancedBuilding
        position={[-2.5, 0.5, 2]}
        size={[0.9, 2.5, 0.9]}
        color="#60a5fa"
        speed={0.8}
        buildingStyle="modern"
      />

      {/* Particles */}
      <EnhancedParticles />

      {/* Ground */}
      <Ground />
    </group>
  );
}

// Main Component with STRONG Mouse Parallax
export default function Hero3DEnhanced() {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e) => {
      // Convert to -1 to 1 range
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      setMouseX(x);
      setMouseY(y);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="hero3d-enhanced">
      <Canvas
        shadows
        camera={{ position: [0, 3, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene scrollY={scrollY} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* MOUSE + SCROLL PARALLAX IS ACTIVE HERE */}
      <div className="hero-overlay" style={{
        transform: `translateY(${scrollY * 0.3}px)`
      }}>
        <h1 style={{
          transform: `translateX(${mouseX * 50}px) translateY(${mouseY * 30 + scrollY * 0.2}px)`
        }}>
          Luxury Real Estate in 3D
        </h1>
        <p style={{
          transform: `translateX(${mouseX * -30}px) translateY(${mouseY * -20 + scrollY * 0.15}px)`
        }}>
          Experience properties like never before
        </p>
        <div className="scroll-indicator" style={{
          opacity: scrollY > 100 ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          <span>Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Stats overlay with scroll parallax */}
      <div className="stats-overlay" style={{
        transform: `translateY(${scrollY * 0.5}px)`,
        opacity: scrollY > 200 ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <div className="stat-item">
          <span className="stat-number">5</span>
          <span className="stat-label">Buildings</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">200</span>
          <span className="stat-label">Particles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">60</span>
          <span className="stat-label">FPS</span>
        </div>
      </div>
    </div>
  );
}
