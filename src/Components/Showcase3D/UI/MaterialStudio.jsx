import React from 'react';
import { sound } from './AudioEngine';

const MATERIALS = [
  {
    id: 'obsidianGold',
    name: 'Obsidian Gold',
    tag: 'SIGNATURE 24K',
    swatch: 'linear-gradient(135deg, #090d16 40%, #fbbf24 100%)',
    desc: 'Jet obsidian titanium alloy framed with micro-polished 24K gold accents and high-specular reflections.'
  },
  {
    id: 'cryoGlass',
    name: 'Cryo Crystal',
    tag: 'ULTRA REFRACTIVE',
    swatch: 'linear-gradient(135deg, #0284c7 20%, #e0f2fe 100%)',
    desc: 'Low-iron optical glass with electrochromic privacy shading and crystal refractive indices.'
  },
  {
    id: 'mattePlatinum',
    name: 'Matte Platinum',
    tag: 'AEROSPACE GRADE',
    swatch: 'linear-gradient(135deg, #334155 30%, #e2e8f0 100%)',
    desc: 'Brushed monolithic aerospace aluminum with velvet anti-glare nano coating.'
  },
  {
    id: 'cyberNeon',
    name: 'Cyber Horizon',
    tag: 'DUAL EMISSIVE',
    swatch: 'linear-gradient(135deg, #030712 30%, #06b6d4 70%, #f43f5e 100%)',
    desc: 'Deep carbon matrix illuminated with high-density cyan and magenta luminescent optical runs.'
  },
  {
    id: 'bronzeLuxury',
    name: 'Architectural Bronze',
    tag: 'HERITAGE ALLOY',
    swatch: 'linear-gradient(135deg, #1c1917 30%, #d97706 100%)',
    desc: 'Warm oxidized sculptural bronze paired with brushed champagne structural pilings.'
  }
];

const LIGHTING_PRESETS = [
  { id: 'cyberMidnight', name: 'Cyber Midnight', icon: '🌌' },
  { id: 'goldenHour', name: 'Golden Hour', icon: '🌅' },
  { id: 'daylight', name: 'Pure Daylight', icon: '☀️' },
  { id: 'studioNoir', name: 'Studio Noir', icon: '💡' }
];

export default function MaterialStudio({
  currentMaterial,
  onChangeMaterial,
  currentLighting,
  onChangeLighting
}) {
  return (
    <div className="material-studio-card">
      <div className="studio-section">
        <div className="section-meta">
          <span className="meta-badge">03 // TEXTURE LAB</span>
          <h3 className="section-title">Architectural Finishes</h3>
          <p className="section-desc">
            Select a procedural material shader to re-skin the entire megastructure in real-time.
          </p>
        </div>

        <div className="material-options-grid">
          {MATERIALS.map((mat) => {
            const isSelected = currentMaterial === mat.id;
            return (
              <button
                key={mat.id}
                type="button"
                className={`material-btn interactive ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  onChangeMaterial(mat.id);
                }}
              >
                <div
                  className="material-swatch"
                  style={{ background: mat.swatch }}
                />
                <div className="material-info">
                  <div className="info-top">
                    <span className="mat-name">{mat.name}</span>
                    <span className="mat-tag">{mat.tag}</span>
                  </div>
                  <p className="mat-desc">{mat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="studio-section lighting-sub">
        <div className="section-meta">
          <span className="meta-badge">LIGHTING ENVIRONMENT</span>
        </div>
        <div className="lighting-preset-row">
          {LIGHTING_PRESETS.map((preset) => {
            const isSelected = currentLighting === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`lighting-preset-btn interactive ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  onChangeLighting(preset.id);
                }}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-name">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
