import React from 'react';
import { HOTSPOT_DATA } from '../Scene/Hotspots';
import DeconstructPanel from './DeconstructPanel';
import MaterialStudio from './MaterialStudio';
import FloorScanner from './FloorScanner';
import PenthouseCards3D from './PenthouseCards3D';
import { sound } from './AudioEngine';

// Rolling kinetic letters inspired by asaram.dev
function KineticWord({ text, className = '' }) {
  return (
    <div className={`kinetic-word ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="kinetic-char-wrap">
          <span className="char-primary">{char === ' ' ? '\u00A0' : char}</span>
          <span className="char-secondary">{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ))}
    </div>
  );
}

export default function StorytellingOverlay({
  explosion,
  onChangeExplosion,
  onResetExplosion,
  materialType,
  onChangeMaterial,
  lightingMode,
  onChangeLighting,
  selectedFloor,
  onSelectFloor,
  activeHotspot,
  onSelectHotspot
}) {
  return (
    <div className="storytelling-overlay">
      {/* ========================================================
          CHAPTER 1: THE MONOLITH / ARRIVAL (0% - 20%)
      ======================================================== */}
      <section className="story-chapter chapter-hero" id="chapter-hero">
        <div className="telemetry-hud-top">
          <div className="hud-cell">
            <span className="hud-k">LOCATION</span>
            <span className="hud-v font-mono">BAHRIA TOWN // LAHORE</span>
          </div>
          <div className="hud-cell">
            <span className="hud-k">PROJECT CODE</span>
            <span className="hud-v font-mono">IJ-FLAGSHIP-88</span>
          </div>
          <div className="hud-cell">
            <span className="hud-k">HEIGHT // STORIES</span>
            <span className="hud-v font-mono">430M // 88 LEVELS</span>
          </div>
        </div>

        <div className="hero-center-content">
          <div className="hero-pill-badge">
            <span className="badge-pulse-dot" />
            <span>INTERACTIVE SPATIAL SHOWCASE</span>
          </div>

          <h1 className="hero-giant-title">
            <KineticWord text="IJ ESTATE" />
            <KineticWord text="& BUILDERS" className="gold-gradient-text" />
          </h1>

          <p className="hero-statement">
            A radical synthesis of aerodynamic architecture, bio-climatic sky gardens, and pure engineering ambition. Crafted by Pakistan's premier luxury developers.
          </p>

          <div className="hero-hud-stats">
            <div className="stat-pill">
              <span className="stat-num">88</span>
              <span className="stat-lbl">Stories</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">430m</span>
              <span className="stat-lbl">Elevation</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">360°</span>
              <span className="stat-lbl">Skyline Vista</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator-pill">
          <div className="mouse-icon">
            <div className="mouse-wheel" />
          </div>
          <span className="scroll-hint">SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* ========================================================
          CHAPTER 2: STRUCTURAL ANATOMY / DECONSTRUCTION (20% - 45%)
      ======================================================== */}
      <section className="story-chapter chapter-deconstruct" id="chapter-deconstruct">
        <div className="chapter-side-content">
          <div className="chapter-meta-tag">02 // STRUCTURAL ANATOMY</div>
          <h2 className="chapter-heading">
            Deconstruct. <br />
            <span className="italic-serif text-gold">Reimagine.</span>
          </h2>
          <p className="chapter-body">
            Every millimeter of the IJ Skycrest Megastructure has been procedurally engineered for aerodynamic vortex shedding, structural integrity, and zero thermal loss.
          </p>

          <DeconstructPanel
            explosion={explosion}
            onChangeExplosion={onChangeExplosion}
            onResetExplosion={onResetExplosion}
          />
        </div>
      </section>

      {/* ========================================================
          CHAPTER 3: MATERIAL & LIGHTING STUDIO (45% - 65%)
      ======================================================== */}
      <section className="story-chapter chapter-materials" id="chapter-materials">
        <div className="chapter-side-content right-aligned">
          <div className="chapter-meta-tag">03 // SHADER & LIGHTING LAB</div>
          <h2 className="chapter-heading">
            Tactile <br />
            <span className="italic-serif text-gold">Materiality.</span>
          </h2>
          <p className="chapter-body">
            Interact with dynamic PBR shaders and global illumination rigs in real-time WebGL. Test the exterior under varying solar angles and atmospheric conditions.
          </p>

          <MaterialStudio
            currentMaterial={materialType}
            onChangeMaterial={onChangeMaterial}
            currentLighting={lightingMode}
            onChangeLighting={onChangeLighting}
          />
        </div>
      </section>

      {/* ========================================================
          CHAPTER 4: 3D HOTSPOT SPATIAL TOUR (65% - 75%)
      ======================================================== */}
      <section className="story-chapter chapter-hotspots" id="chapter-hotspots">
        <div className="chapter-side-content">
          <div className="chapter-meta-tag">04 // SPATIAL BEACONS</div>
          <h2 className="chapter-heading">
            Architectural <br />
            <span className="italic-serif text-gold">Highlights.</span>
          </h2>
          <p className="chapter-body">
            Click any beacon on the 3D model or select below to command the camera to smoothly focus on key architectural engineering points.
          </p>

          <div className="hotspots-selector-list">
            {HOTSPOT_DATA.map((spot) => {
              const isSelected = activeHotspot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  className={`hotspot-select-item interactive ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    sound.playClick();
                    onSelectHotspot(spot);
                  }}
                >
                  <div className="spot-top">
                    <span className="spot-name">{spot.title}</span>
                    <span className="spot-elev">{spot.elevation}</span>
                  </div>
                  <p className="spot-desc">{spot.desc}</p>
                  <div className="spot-specs-row">
                    {spot.specs.map((sp, idx) => (
                      <span key={idx} className="spec-badge-micro">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          CHAPTER 5: 88-FLOOR ELEVATOR SCANNER (75% - 88%)
      ======================================================== */}
      <section className="story-chapter chapter-scanner" id="chapter-scanner">
        <div className="chapter-side-content right-aligned">
          <div className="chapter-meta-tag">05 // VERTICAL SCANNER</div>
          <h2 className="chapter-heading">
            Floor-by-Floor <br />
            <span className="italic-serif text-gold">Elevation.</span>
          </h2>
          <p className="chapter-body">
            Ascend from ground lobby to the cloud crown. Drag the slider to inspect structural cutaway planes, unit availability, and pricing metrics.
          </p>

          <FloorScanner
            selectedFloor={selectedFloor}
            onSelectFloor={onSelectFloor}
          />
        </div>
      </section>

      {/* ========================================================
          INFINITE MARQUEE TICKER (Inspired by asaram.dev)
      ======================================================== */}
      <div className="showcase-marquee-strip">
        <div className="marquee-track">
          <div className="marquee-content">
            <span>✦ IJ ESTATE & BUILDERS</span>
            <span>✦ ARCHITECTURAL MASTERPIECES</span>
            <span>✦ 88 STORIES OF ELEVATED LIVING</span>
            <span>✦ PROCEDURAL 3D SPATIAL GEOMETRY</span>
            <span>✦ PRIVATE SKY HELIPAD & POOL</span>
            <span>✦ ZERO COMPROMISE LUXURY</span>
            <span>✦ IJ ESTATE & BUILDERS</span>
            <span>✦ ARCHITECTURAL MASTERPIECES</span>
            <span>✦ 88 STORIES OF ELEVATED LIVING</span>
            <span>✦ PROCEDURAL 3D SPATIAL GEOMETRY</span>
            <span>✦ PRIVATE SKY HELIPAD & POOL</span>
            <span>✦ ZERO COMPROMISE LUXURY</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          CHAPTER 6: PENTHOUSE COLLECTION (88% - 100%)
      ======================================================== */}
      <section className="story-chapter chapter-collection" id="chapter-collection">
        <PenthouseCards3D />
      </section>

      {/* ========================================================
          FOOTER & SPATIAL LAB CREDITS
      ======================================================== */}
      <footer className="showcase-footer-grand">
        <div className="footer-inner-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="gem-inner">✦</span>
              <span>IJ ESTATE & BUILDERS</span>
            </div>
            <p className="footer-desc">
              Pioneering the intersection of next-generation spatial computing, real-time 3D web experiences, and ultra-luxury real estate development across Pakistan.
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">NAVIGATION</span>
            <button
              type="button"
              className="footer-link-btn interactive"
              onClick={() => {
                sound.playClick();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to Top ↑
            </button>
            <a href="/" className="footer-link-btn interactive">
              Main Real Estate Portal
            </a>
            <a href="/listings" className="footer-link-btn interactive">
              All Properties
            </a>
          </div>

          <div className="footer-tech-col">
            <span className="footer-col-title">ENGINE STACK</span>
            <div className="tech-badge-list">
              <span className="tech-chip">Three.js r185</span>
              <span className="tech-chip">React Three Fiber</span>
              <span className="tech-chip">Web Audio API</span>
              <span className="tech-chip">PBR Materials</span>
              <span className="tech-chip">60 FPS WebGL</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© 2026 IJ ESTATE & BUILDERS. ALL RIGHTS RESERVED.</span>
          <span className="font-mono text-gold">DESIGNED FOR PERFECTION</span>
        </div>
      </footer>
    </div>
  );
}
