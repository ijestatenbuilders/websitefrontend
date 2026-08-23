import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { sound } from '../UI/AudioEngine';

export const HOTSPOT_DATA = [
  {
    id: 'helipad',
    title: 'Private Sky Helipad',
    elevation: '+430m',
    desc: 'FAA-certified twin-rotor landing deck with automated LED approach guidance & private elevator access.',
    specs: ['Max Weight: 6,400 kg', 'Approach: 360° Omnidirectional', 'Dedicated VIP Air Concierge'],
    pos: [0, 9.1, 0],
    cameraTarget: [0, 9.0, 5],
    lookAt: [0, 9.0, 0]
  },
  {
    id: 'pool',
    title: 'Cantilever Infinity Pool',
    elevation: '+390m',
    desc: 'Suspended glass-bottom pool cantilevered 8 meters beyond the building perimeter with panoramic horizon views.',
    specs: ['Structural Quartz Glass', 'Heated Magnesium Water', 'Zero-Edge Cascade'],
    pos: [1.2, 8.0, 0.4],
    cameraTarget: [3.5, 8.5, 2.5],
    lookAt: [1.0, 8.0, 0.3]
  },
  {
    id: 'skybridge',
    title: 'Observation Oculus & Skybridge',
    elevation: '+210m',
    desc: 'Interlocking structural ring connecting the twin spires, featuring 360-degree glass floor observatory.',
    specs: ['Diameter: 28m', 'Tension-Tuned Steel Trusses', 'Acoustic Soundstage'],
    pos: [0, 2.7, 2.3],
    cameraTarget: [0, 3.2, 6.5],
    lookAt: [0, 2.7, 0]
  },
  {
    id: 'atrium',
    title: 'Crystal Grand Atrium',
    elevation: '+12m',
    desc: 'Triple-volume biophilic lobby with living vertical gardens, water wall installations, and private concierge desks.',
    specs: ['Height: 18m', 'Smart Climate Façade', 'Direct Valet Portals'],
    pos: [0, -2.4, 2.1],
    cameraTarget: [0, -1.8, 5.8],
    lookAt: [0, -2.4, 0]
  },
  {
    id: 'vault',
    title: 'Automated Robotic Vault',
    elevation: '-25m',
    desc: 'Subterranean multi-level robotic vehicle retrieval system with integrated EV supercharging docks.',
    specs: ['120 Autonomous Bays', 'Retrieval Time: 45s', 'Class-4 Security Vault'],
    pos: [0, -4.2, 2.2],
    cameraTarget: [0, -3.8, 6.2],
    lookAt: [0, -4.2, 0]
  }
];

function PureWebGLHotspot({ spot, active, onSelect }) {
  const pinRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pinRef.current) {
      pinRef.current.position.y = spot.pos[1] + Math.sin(t * 3 + spot.pos[0]) * 0.08;
    }
    if (ringRef.current) {
      const scale = 1.0 + Math.sin(t * 4) * 0.25;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    sound.playClick();
    onSelect(spot);
  };

  return (
    <group ref={pinRef} position={spot.pos}>
      {/* 3D Glowing Core Sphere */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={active ? '#38bdf8' : '#fbbf24'}
          emissive={active ? '#38bdf8' : '#fbbf24'}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Pulsing Concentric Outer Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial
          color={active ? '#38bdf8' : '#fbbf24'}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

export default function Hotspots({ activeHotspot, onSelectHotspot, visible = true }) {
  if (!visible) return null;

  return (
    <group>
      {HOTSPOT_DATA.map((spot) => (
        <PureWebGLHotspot
          key={spot.id}
          spot={spot}
          active={activeHotspot?.id === spot.id}
          onSelect={onSelectHotspot}
        />
      ))}
    </group>
  );
}
