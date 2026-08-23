import React from 'react';
import { Link } from 'react-router-dom';
import { sound } from './AudioEngine';

export default function ShowcaseNav({
  audioEnabled,
  onToggleAudio,
  wireframe,
  onToggleWireframe,
  freeOrbit,
  onToggleFreeOrbit,
  onJumpSection
}) {
  return (
    <header className="showcase-nav-wrapper">
      <div className="showcase-nav-pill">
        {/* Brand Logo / Home link */}
        <Link
          to="/"
          className="nav-brand-link interactive"
          onClick={() => sound.playClick()}
          title="Return to IJ Estates Home"
        >
          <div className="brand-logo-gem">
            <span className="gem-inner">✦</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">IJ ESTATES</span>
            <span className="brand-sub">SPATIAL LAB</span>
          </div>
        </Link>

        {/* Section Navigation Quick Links */}
        <nav className="nav-section-links">
          <button
            type="button"
            className="nav-link-btn interactive"
            onClick={() => { sound.playClick(); onJumpSection(0); }}
          >
            01 Overview
          </button>
          <button
            type="button"
            className="nav-link-btn interactive"
            onClick={() => { sound.playClick(); onJumpSection(0.3); }}
          >
            02 Deconstruct
          </button>
          <button
            type="button"
            className="nav-link-btn interactive"
            onClick={() => { sound.playClick(); onJumpSection(0.55); }}
          >
            03 Materials
          </button>
          <button
            type="button"
            className="nav-link-btn interactive"
            onClick={() => { sound.playClick(); onJumpSection(0.75); }}
          >
            04 Floors
          </button>
          <button
            type="button"
            className="nav-link-btn interactive"
            onClick={() => { sound.playClick(); onJumpSection(0.95); }}
          >
            05 Penthouse
          </button>
        </nav>

        {/* Action Controls Suite */}
        <div className="nav-actions">
          {/* Wireframe Toggle */}
          <button
            type="button"
            className={`tool-pill-btn interactive ${wireframe ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              onToggleWireframe();
            }}
            title={wireframe ? 'Disable Wireframe' : 'Enable Hologram Wireframe'}
          >
            <span className="tool-icon">⬡</span>
            <span className="tool-label">{wireframe ? 'Solid' : 'Wireframe'}</span>
          </button>

          {/* 360 Free Orbit Toggle */}
          <button
            type="button"
            className={`tool-pill-btn interactive ${freeOrbit ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              onToggleFreeOrbit();
            }}
            title={freeOrbit ? 'Lock to Scroll' : 'Free 360 Orbit'}
          >
            <span className="tool-icon">🔄</span>
            <span className="tool-label">{freeOrbit ? 'Locked' : '360° Orbit'}</span>
          </button>

          {/* Synthesized Audio Toggle */}
          <button
            type="button"
            className={`tool-pill-btn interactive ${audioEnabled ? 'active' : ''}`}
            onClick={() => {
              onToggleAudio();
            }}
            title={audioEnabled ? 'Mute Spatial Audio' : 'Enable Spatial Audio'}
          >
            <span className="tool-icon">{audioEnabled ? '🔊' : '🔇'}</span>
            <span className="tool-label">{audioEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>

          {/* Engine Status Indicator */}
          <div className="engine-status-pill">
            <span className="status-dot animate-pulse" />
            <span className="status-text">60 FPS // LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
