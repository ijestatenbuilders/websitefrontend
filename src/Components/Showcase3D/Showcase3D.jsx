import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AetheriumCanvas from './Scene/AetheriumCanvas';
import ShowcaseNav from './UI/ShowcaseNav';
import StorytellingOverlay from './UI/StorytellingOverlay';
import CustomCursor from './UI/CustomCursor';
import { sound } from './UI/AudioEngine';
import './Showcase3D.css';

export default function Showcase3D() {
  const containerRef = useRef();
  const scrollProgressRef = useRef(0);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const [explosion, setExplosion] = useState(0);
  const [isManualExplosion, setIsManualExplosion] = useState(false);

  // 3D Engine parameters
  const [materialType, setMaterialType] = useState('obsidianGold');
  const [lightingMode, setLightingMode] = useState('cyberMidnight');
  const [wireframe, setWireframe] = useState(false);
  const [freeOrbit, setFreeOrbit] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // High-performance scroll listener updating ref directly (Zero React Lag)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / totalHeight)) : 0;
      scrollProgressRef.current = progress;

      // Handle automatic explosion calculation if not in manual slider mode
      if (!isManualExplosion) {
        if (progress >= 0.18 && progress <= 0.45) {
          const exp = (progress - 0.18) / 0.27;
          setExplosion(Math.min(1, Math.max(0, exp)));
        } else if (progress < 0.18 && explosion !== 0) {
          setExplosion(0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManualExplosion, explosion]);

  // High-performance mouse listener updating ref directly
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Audio Toggle
  const handleToggleAudio = useCallback(() => {
    const enabled = sound.toggle();
    setAudioEnabled(enabled);
  }, []);

  // Wireframe Toggle
  const handleToggleWireframe = useCallback(() => {
    setWireframe((prev) => !prev);
  }, []);

  // Free Orbit Toggle
  const handleToggleFreeOrbit = useCallback(() => {
    setFreeOrbit((prev) => {
      const next = !prev;
      if (next) sound.playWhoosh();
      return next;
    });
  }, []);

  // Manual explosion slider change
  const handleChangeExplosion = useCallback((val) => {
    setIsManualExplosion(true);
    setExplosion(val);
  }, []);

  // Reset explosion
  const handleResetExplosion = useCallback(() => {
    setIsManualExplosion(false);
    setExplosion(0);
  }, []);

  // Jump to specific scroll percentage
  const handleJumpSection = useCallback((pct) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = totalHeight * pct;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  return (
    <div className="showcase-3d-page" ref={containerRef}>
      <Helmet>
        <title>IJ Estate & Builders | Next-Gen 3D Spatial Showcase</title>
        <meta
          name="description"
          content="Explore the flagship megastructure by IJ Estate & Builders in real-time 3D WebGL. Featuring scroll-linked deconstruction, interactive PBR shaders, spatial hotspot telemetry, and an 88-floor elevation scanner."
        />
      </Helmet>

      {/* Agency Film Grain Noise Animation Overlay */}
      <div className="film-grain-overlay" />

      {/* Blueprint Grid */}
      <div className="spatial-bg-grid" />

      {/* Floating Pill HUD Navigation */}
      <ShowcaseNav
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        wireframe={wireframe}
        onToggleWireframe={handleToggleWireframe}
        freeOrbit={freeOrbit}
        onToggleFreeOrbit={handleToggleFreeOrbit}
        onJumpSection={handleJumpSection}
      />

      {/* Sticky 3D WebGL Canvas Layer (Zero Lag 60-120 FPS) */}
      <div className="sticky-canvas-container">
        <AetheriumCanvas
          scrollProgressRef={scrollProgressRef}
          explosion={explosion}
          materialType={materialType}
          lightingMode={lightingMode}
          wireframe={wireframe}
          freeOrbit={freeOrbit}
          selectedFloor={selectedFloor}
          activeHotspot={activeHotspot}
          onSelectHotspot={setActiveHotspot}
          mousePosRef={mousePosRef}
        />
      </div>

      {/* Scroll-Linked Storytelling HTML Layers */}
      <StorytellingOverlay
        explosion={explosion}
        onChangeExplosion={handleChangeExplosion}
        onResetExplosion={handleResetExplosion}
        materialType={materialType}
        onChangeMaterial={setMaterialType}
        lightingMode={lightingMode}
        onChangeLighting={setLightingMode}
        selectedFloor={selectedFloor}
        onSelectFloor={setSelectedFloor}
        activeHotspot={activeHotspot}
        onSelectHotspot={setActiveHotspot}
      />

      {/* Custom Agency Cursor Follower */}
      <CustomCursor />
    </div>
  );
}
