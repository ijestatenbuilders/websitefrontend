import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import TowerMegastructure from './TowerMegastructure';
import Hotspots from './Hotspots';
import { ParticleAtmosphere, HologramGrid, LightingRig } from './Atmosphere';

// Smooth Camera Controller with Buttery Smooth Lerp (Zero React State Lag)
function CameraRig({
  scrollProgressRef,
  activeHotspot,
  freeOrbit,
  mousePosRef,
  explosion
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 4, 18));
  const targetLookAt = useRef(new THREE.Vector3(0, 2, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 2, 0));

  useFrame((state, delta) => {
    if (freeOrbit) return;

    if (activeHotspot) {
      targetCamPos.current.set(...activeHotspot.cameraTarget);
      targetLookAt.current.set(...activeHotspot.lookAt);
    } else {
      const p = Math.max(0, Math.min(1, scrollProgressRef.current || 0));

      if (p < 0.2) {
        // Hero Arrival
        const subP = p / 0.2;
        targetCamPos.current.set(
          Math.sin(subP * 0.8) * 5,
          9 - subP * 5,
          18 - subP * 3
        );
        targetLookAt.current.set(0, 3 - subP * 1.5, 0);
      } else if (p < 0.45) {
        // Deconstruction
        const subP = (p - 0.2) / 0.25;
        const angle = 0.8 + subP * 1.2;
        const radius = 15 + explosion * 2.0;
        targetCamPos.current.set(
          Math.sin(angle) * radius,
          3 + subP * 3 + explosion * 1.2,
          Math.cos(angle) * radius
        );
        targetLookAt.current.set(0, 2 + subP * 2, 0);
      } else if (p < 0.7) {
        // Material & Hotspot Studio
        const subP = (p - 0.45) / 0.25;
        const angle = 2.0 + subP * 2.0;
        targetCamPos.current.set(
          Math.sin(angle) * 13,
          4 + Math.sin(subP * Math.PI) * 1.5,
          Math.cos(angle) * 13
        );
        targetLookAt.current.set(0, 3.5, 0);
      } else if (p < 0.88) {
        // Floor Scanner Climbing
        const subP = (p - 0.7) / 0.18;
        targetCamPos.current.set(
          Math.sin(subP * 2) * 11,
          -1 + subP * 9,
          Math.cos(subP * 2) * 11
        );
        targetLookAt.current.set(0, -1 + subP * 9, 0);
      } else {
        // Penthouse Crown
        const subP = (p - 0.88) / 0.12;
        targetCamPos.current.set(
          Math.sin(1.2 + subP * 0.8) * 10,
          9.5 + subP * 1.5,
          Math.cos(1.2 + subP * 0.8) * 10
        );
        targetLookAt.current.set(0, 8.5, 0);
      }
    }

    // Mouse Parallax Offset
    const mouseX = mousePosRef.current ? mousePosRef.current.x : 0.5;
    const mouseY = mousePosRef.current ? mousePosRef.current.y : 0.5;
    const mouseShiftX = (mouseX - 0.5) * 1.2;
    const mouseShiftY = (mouseY - 0.5) * -0.8;

    const finalCamTarget = new THREE.Vector3(
      targetCamPos.current.x + mouseShiftX,
      targetCamPos.current.y + mouseShiftY,
      targetCamPos.current.z
    );

    // Exponential smoothing for buttery 60-120fps motion
    const lerpFactor = Math.min(delta * 4.5, 0.15);
    camera.position.lerp(finalCamTarget, lerpFactor);

    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export default function AetheriumCanvas({
  scrollProgressRef,
  explosion = 0,
  materialType = 'obsidianGold',
  lightingMode = 'cyberMidnight',
  wireframe = false,
  freeOrbit = false,
  selectedFloor = 0,
  activeHotspot = null,
  onSelectHotspot,
  mousePosRef
}) {
  return (
    <div className="aetherium-canvas-wrap">
      <Canvas
        shadows={false} // Disabled expensive shadow maps for ultra-smooth 60fps rendering
        dpr={[1, 1.5]}
        camera={{ position: [0, 4, 18], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <LightingRig lightingMode={lightingMode} />
        <ParticleAtmosphere lightingMode={lightingMode} />
        <HologramGrid />

        <TowerMegastructure
          explosion={explosion}
          materialType={materialType}
          wireframe={wireframe}
          selectedFloor={selectedFloor}
        />

        <Hotspots
          activeHotspot={activeHotspot}
          onSelectHotspot={onSelectHotspot}
          visible={!wireframe}
        />

        <CameraRig
          scrollProgressRef={scrollProgressRef}
          activeHotspot={activeHotspot}
          freeOrbit={freeOrbit}
          mousePosRef={mousePosRef}
          explosion={explosion}
        />

        {freeOrbit && (
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={4}
            maxDistance={35}
            maxPolarAngle={Math.PI / 2 + 0.05}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  );
}
