import React from 'react';
import { sound } from './AudioEngine';

export default function DeconstructPanel({
  explosion,
  onChangeExplosion,
  onResetExplosion
}) {
  const percent = Math.round(explosion * 100);

  const tiers = [
    { name: 'Tier 06: Royal Penthouse Crown & Helipad', elev: '+430m', state: 'Active Isolation' },
    { name: 'Tier 05: High-Rise Sky Suites & Aerofoil Fins', elev: '+310m', state: 'Hover State' },
    { name: 'Tier 04: Observation Oculus & Skybridge', elev: '+210m', state: 'Cantilever Ring' },
    { name: 'Tier 03: Mid-Rise Residences & Biophilic Terraces', elev: '+90m', state: 'Structural Core' },
    { name: 'Tier 02: Double-Height Grand Crystal Atrium', elev: '+12m', state: 'Faceted Glass' },
    { name: 'Tier 01: Subterranean Vault & Robotic Parking', elev: '-25m', state: 'Deep Foundation' }
  ];

  return (
    <div className="deconstruct-panel-card">
      <div className="card-header">
        <div className="header-badge">
          <span className="badge-icon">✦</span>
          <span>ANATOMICAL DECONSTRUCTION</span>
        </div>
        <button
          type="button"
          className="reset-btn interactive"
          onClick={() => {
            sound.playClick();
            onResetExplosion();
          }}
        >
          Reset Model
        </button>
      </div>

      <div className="explosion-control-row">
        <div className="slider-meta">
          <span className="slider-title">EXPLOSION SEPARATION</span>
          <span className="slider-val">{percent}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explosion}
          onChange={(e) => {
            onChangeExplosion(parseFloat(e.target.value));
          }}
          className="explosion-slider interactive"
        />

        <div className="preset-buttons">
          <button
            type="button"
            className={`preset-btn interactive ${percent === 0 ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              onChangeExplosion(0);
            }}
          >
            0% Assembled
          </button>
          <button
            type="button"
            className={`preset-btn interactive ${percent === 50 ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              onChangeExplosion(0.5);
            }}
          >
            50% Structural
          </button>
          <button
            type="button"
            className={`preset-btn interactive ${percent === 100 ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              onChangeExplosion(1);
            }}
          >
            100% Full Explosion
          </button>
        </div>
      </div>

      <div className="tiers-list">
        <span className="list-heading">STRUCTURAL SUB-ASSEMBLIES</span>
        {tiers.map((t, idx) => (
          <div key={idx} className="tier-row interactive">
            <div className="tier-col-left">
              <span className="tier-num">0{6 - idx}</span>
              <span className="tier-name">{t.name}</span>
            </div>
            <div className="tier-col-right">
              <span className="tier-elev">{t.elev}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
