import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function TowerMegastructure({
  explosion = 0, // 0 to 1
  materialType = 'obsidianGold',
  wireframe = false,
  selectedFloor = 0
}) {
  const groupRef = useRef();
  const elevator1Ref = useRef();
  const elevator2Ref = useRef();
  const beaconRef = useRef();
  const waterRef = useRef();
  const ringRef = useRef();

  // Color schemes for materials
  const matConfig = useMemo(() => {
    switch (materialType) {
      case 'cryoGlass':
        return {
          primaryColor: '#0a1526',
          glassColor: '#38bdf8',
          accentColor: '#0ea5e9',
          trimColor: '#e0f2fe',
          metalness: 0.9,
          roughness: 0.1,
          glassOpacity: 0.65,
          emissiveIntensity: 0.8
        };
      case 'mattePlatinum':
        return {
          primaryColor: '#1e293b',
          glassColor: '#94a3b8',
          accentColor: '#cbd5e1',
          trimColor: '#f8fafc',
          metalness: 0.8,
          roughness: 0.35,
          glassOpacity: 0.75,
          emissiveIntensity: 0.5
        };
      case 'cyberNeon':
        return {
          primaryColor: '#030712',
          glassColor: '#06b6d4',
          accentColor: '#f43f5e',
          trimColor: '#22d3ee',
          metalness: 0.6,
          roughness: 0.2,
          glassOpacity: 0.8,
          emissiveIntensity: 1.5
        };
      case 'bronzeLuxury':
        return {
          primaryColor: '#1c1917',
          glassColor: '#d97706',
          accentColor: '#f59e0b',
          trimColor: '#fde68a',
          metalness: 0.85,
          roughness: 0.25,
          glassOpacity: 0.7,
          emissiveIntensity: 0.7
        };
      case 'obsidianGold':
      default:
        return {
          primaryColor: '#070a12',
          glassColor: '#1e3a8a',
          accentColor: '#fbbf24',
          trimColor: '#f59e0b',
          metalness: 0.92,
          roughness: 0.18,
          glassOpacity: 0.7,
          emissiveIntensity: 0.9
        };
    }
  }, [materialType]);

  // Combined window geometry for buttery smooth 120 FPS (Zero lag, single draw call)
  const windowMeshProps = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const rows = 12;
    const cols = 5;
    const positions = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r * 3 + c * 7) % 4 === 0) continue; // skip some for organic look
        const x = (c - cols / 2 + 0.5) * 0.45;
        const y = (r - rows / 2 + 0.5) * 0.26;
        const z = 1.41;
        const w = 0.14;
        const h = 0.08;

        // Quad vertices (2 triangles)
        positions.push(
          x - w, y - h, z,   x + w, y - h, z,   x + w, y + h, z,
          x - w, y - h, z,   x + w, y + h, z,   x - w, y + h, z
        );
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Frame loop for micro-animations
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Elevator 1
    if (elevator1Ref.current) {
      elevator1Ref.current.position.y = ((Math.sin(t * 0.8) + 1) / 2) * 3.0 - 1.5;
    }

    // Elevator 2
    if (elevator2Ref.current) {
      elevator2Ref.current.position.y = ((Math.cos(t * 0.6) + 1) / 2) * 3.0 - 1.5;
    }

    // Beacon pulse
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.2 + Math.sin(t * 6) * 0.8;
    }

    // Pool water ripple
    if (waterRef.current) {
      waterRef.current.position.y = 0.12 + Math.sin(t * 2.5) * 0.02;
    }

    // Orbiting satellite ring
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.2;
    }
  });

  const expFactor = Math.max(0, Math.min(1, explosion));
  const tier1Offset = -expFactor * 2.2;
  const tier2Offset = -expFactor * 1.0;
  const tier3Offset = 0;
  const tier4Offset = expFactor * 1.2;
  const tier5Offset = expFactor * 2.6;
  const tier6Offset = expFactor * 4.2;

  const floorHeightNormalized = (selectedFloor / 88) * 14 - 4;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* ========================================================
          TIER 1: SUBTERRANEAN BASE & CANTILEVER PODIUM
      ======================================================== */}
      <group position={[0, -4.2 + tier1Offset, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 1.6, 4.2]} />
          <meshStandardMaterial
            color={matConfig.primaryColor}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[0, -0.75, 0]} receiveShadow>
          <boxGeometry args={[5.2, 0.3, 5.2]} />
          <meshStandardMaterial
            color="#080c14"
            metalness={0.9}
            roughness={0.3}
            wireframe={wireframe}
          />
        </mesh>

        {/* Grand Entrance Portal */}
        <mesh position={[0, -0.2, 2.12]}>
          <boxGeometry args={[2.0, 0.9, 0.08]} />
          <meshStandardMaterial
            color={matConfig.accentColor}
            emissive={matConfig.accentColor}
            emissiveIntensity={matConfig.emissiveIntensity}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      {/* ========================================================
          TIER 2: GRAND CRYSTAL ATRIUM
      ======================================================== */}
      <group position={[0, -2.4 + tier2Offset, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.9, 1.8, 16]} />
          <meshStandardMaterial
            color="#111827"
            metalness={0.9}
            roughness={0.2}
            wireframe={wireframe}
          />
        </mesh>

        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 1.9, 1.8, 8]} />
          <meshStandardMaterial
            color={matConfig.glassColor}
            transparent
            opacity={matConfig.glassOpacity}
            metalness={0.7}
            roughness={0.1}
            wireframe={wireframe}
          />
        </mesh>

        {/* Halo ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.7, 0.04, 8, 24]} />
          <meshBasicMaterial color={matConfig.accentColor} />
        </mesh>
      </group>

      {/* ========================================================
          TIER 3: MID-RISE RESIDENTIAL SUITES & SKY GARDENS
      ======================================================== */}
      <group position={[0, 0.3 + tier3Offset, 0]}>
        {/* Main Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.8, 3.4, 2.8]} />
          <meshStandardMaterial
            color={matConfig.primaryColor}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            wireframe={wireframe}
          />
        </mesh>

        {/* High-Performance Unified Window Grid (Single Draw Call!) */}
        {!wireframe && (
          <>
            <mesh geometry={windowMeshProps}>
              <meshStandardMaterial
                color={matConfig.accentColor}
                emissive={matConfig.accentColor}
                emissiveIntensity={matConfig.emissiveIntensity}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh geometry={windowMeshProps} rotation={[0, Math.PI, 0]}>
              <meshStandardMaterial
                color={matConfig.accentColor}
                emissive={matConfig.accentColor}
                emissiveIntensity={matConfig.emissiveIntensity}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Cantilever Sky Terraces */}
        {[-0.8, 0.4].map((y, idx) => (
          <group key={`terrace-${idx}`} position={[1.45, y, 0]}>
            <mesh position={[0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.4, 0.08, 1.8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} wireframe={wireframe} />
            </mesh>
            <mesh position={[0.2, 0.08, 0]}>
              <boxGeometry args={[0.25, 0.06, 1.6]} />
              <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}

        {/* High-Speed Gliding Glass Elevator 1 */}
        <group ref={elevator1Ref} position={[0, 0, 1.48]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.32, 0.18]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.85}
              emissive="#38bdf8"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          TIER 4: SKYBRIDGE & OBSERVATION OCULUS
      ======================================================== */}
      <group position={[0, 2.7 + tier4Offset, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[2.2, 0.28, 12, 24]} />
          <meshStandardMaterial
            color={matConfig.primaryColor}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            wireframe={wireframe}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2.2, 24]} />
          <meshStandardMaterial
            color={matConfig.glassColor}
            transparent
            opacity={0.7}
            metalness={0.9}
            roughness={0.05}
            wireframe={wireframe}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.25, 0.03, 8, 32]} />
          <meshBasicMaterial color={matConfig.trimColor} />
        </mesh>
      </group>

      {/* ========================================================
          TIER 5: HIGH-RISE SKY RESIDENCES & FINS
      ======================================================== */}
      <group position={[0, 5.0 + tier5Offset, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.3, 3.8, 8]} />
          <meshStandardMaterial
            color={matConfig.primaryColor}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            wireframe={wireframe}
          />
        </mesh>

        {/* Spiral Glass Balconies */}
        {[-1.2, -0.4, 0.4, 1.2].map((by, idx) => (
          <mesh key={`balc-${idx}`} position={[0, by, 0]} castShadow>
            <cylinderGeometry args={[1.35 - idx * 0.05, 1.35 - idx * 0.05, 0.06, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} wireframe={wireframe} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          TIER 6: ROYAL TRIPLEX PENTHOUSE CROWN & HELIPAD
      ======================================================== */}
      <group position={[0, 7.8 + tier6Offset, 0]}>
        {/* Penthouse Glass Crown */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.95, 1.4, 8]} />
          <meshStandardMaterial
            color={matConfig.glassColor}
            transparent
            opacity={0.8}
            metalness={0.9}
            roughness={0.08}
            wireframe={wireframe}
          />
        </mesh>

        {/* Cantilever Infinity Pool */}
        <group position={[0.9, 0.2, 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.25, 0.6]} />
            <meshStandardMaterial
              color="#0284c7"
              transparent
              opacity={0.7}
              metalness={0.9}
              roughness={0.1}
              wireframe={wireframe}
            />
          </mesh>
          <mesh ref={waterRef} position={[0, 0.12, 0]}>
            <planeGeometry args={[0.82, 0.52]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Rooftop Helipad */}
        <group position={[0, 1.3, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.85, 0.85, 0.08, 24]} />
            <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.78, 24]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.45, 24]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>

        {/* Spire with Pulsing Beacon */}
        <group position={[0, 2.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.06, 1.8, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <pointLight ref={beaconRef} position={[0, 0.95, 0]} color="#ef4444" intensity={2} distance={8} />
        </group>

        {/* Satellite Ring */}
        <group ref={ringRef} position={[0, 1.5, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.8, 0.015, 8, 32]} />
            <meshBasicMaterial color={matConfig.accentColor} transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* Selected Floor Cutaway Plane */}
      {selectedFloor > 0 && (
        <group position={[0, floorHeightNormalized, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.0, 5.0]} />
            <meshBasicMaterial color={matConfig.accentColor} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 2.56, 24]} />
            <meshBasicMaterial color={matConfig.trimColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
