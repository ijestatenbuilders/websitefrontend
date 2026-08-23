import React, { useMemo } from 'react';
import { sound } from './AudioEngine';

export default function FloorScanner({
  selectedFloor,
  onSelectFloor
}) {
  // Calculate floor specs based on selected floor
  const floorData = useMemo(() => {
    const f = selectedFloor || 1;
    let category = 'Executive Residential';
    let elevation = Math.round(12 + (f / 88) * 418);
    let area = '3,450 sq.ft';
    let units = '4 Penthouses / Floor';
    let priceAed = '18,500,000 AED';
    let priceUsd = '$5,037,000 USD';
    let highlights = ['Smart Glass Balcony', '12ft Ceilings', 'Private Keyed Elevator'];

    if (f <= 6) {
      category = 'Commercial & Grand Atrium';
      area = '12,800 sq.ft';
      units = 'Boutique Retail & Michelin Dining';
      priceAed = '45,000,000 AED';
      priceUsd = '$12,250,000 USD';
      highlights = ['Double Height Atrium', 'Direct Valet Portals', 'Biophilic Terraces'];
    } else if (f <= 30) {
      category = 'Mid-Rise Executive Residences';
      area = '2,800 - 4,200 sq.ft';
      units = '6 Luxury Suites / Floor';
      priceAed = '12,800,000 AED';
      priceUsd = '$3,485,000 USD';
      highlights = ['Panoramic City Views', 'Smart Home Automation', 'Custom Italian Marble'];
    } else if (f <= 55) {
      category = 'Skybridge & Observation Level';
      area = '6,200 sq.ft';
      units = 'Exclusive Sky Suites';
      priceAed = '24,000,000 AED';
      priceUsd = '$6,535,000 USD';
      highlights = ['Direct Skybridge Access', 'Infinity Edge Balconies', 'Sub-Zero Appliances'];
    } else if (f <= 80) {
      category = 'High-Rise Sky Residences';
      area = '5,600 sq.ft';
      units = '2 Full-Floor Penthouses';
      priceAed = '38,000,000 AED';
      priceUsd = '$10,345,000 USD';
      highlights = ['360° Arabian Gulf Views', 'Private Lap Pool', 'Butler Quarters'];
    } else {
      category = 'Royal Triplex Penthouse Crown';
      area = '14,500 sq.ft';
      units = '1 Monolithic Sovereign Residence';
      priceAed = '125,000,000 AED';
      priceUsd = '$34,000,000 USD';
      highlights = ['Private Helipad Landing', 'Cantilever Sky Pool', '360° Glass Crown Observatory'];
    }

    return { f, category, elevation, area, units, priceAed, priceUsd, highlights };
  }, [selectedFloor]);

  const presetFloors = [
    { f: 1, label: 'Lobby (F01)' },
    { f: 20, label: 'Suites (F20)' },
    { f: 45, label: 'Skybridge (F45)' },
    { f: 72, label: 'Sky Res (F72)' },
    { f: 88, label: 'Penthouse (F88)' }
  ];

  return (
    <div className="floor-scanner-card">
      <div className="scanner-header">
        <div className="scanner-badge">
          <span className="badge-icon">⚡</span>
          <span>ELEVATION SCANNER & MATRIX</span>
        </div>
        <div className="live-elevation-pill">
          <span className="elev-label">ELEVATION</span>
          <span className="elev-value">+{floorData.elevation} METERS</span>
        </div>
      </div>

      <div className="floor-scrubber-box">
        <div className="scrubber-top">
          <div className="current-floor-display">
            <span className="floor-prefix">LEVEL</span>
            <span className="floor-big-num">
              {floorData.f < 10 ? `0${floorData.f}` : floorData.f}
            </span>
            <span className="floor-total">/ 88</span>
          </div>
          <div className="floor-category-display">
            <span className="cat-title">{floorData.category}</span>
            <span className="cat-status">AVAILABLE // 3 UNITS</span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="88"
          value={selectedFloor || 1}
          onChange={(e) => {
            sound.playHover();
            onSelectFloor(parseInt(e.target.value, 10));
          }}
          className="floor-slider interactive"
        />

        <div className="preset-floors-row">
          {presetFloors.map((pf) => (
            <button
              key={pf.f}
              type="button"
              className={`preset-floor-btn interactive ${(selectedFloor || 1) === pf.f ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                onSelectFloor(pf.f);
              }}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="floor-details-grid">
        <div className="detail-box">
          <span className="detail-label">FLOORPLATE AREA</span>
          <span className="detail-value">{floorData.area}</span>
        </div>
        <div className="detail-box">
          <span className="detail-label">CONFIGURATION</span>
          <span className="detail-value">{floorData.units}</span>
        </div>
        <div className="detail-box">
          <span className="detail-label">PRICING (AED)</span>
          <span className="detail-value gold-text">{floorData.priceAed}</span>
        </div>
        <div className="detail-box">
          <span className="detail-label">PRICING (USD)</span>
          <span className="detail-value">{floorData.priceUsd}</span>
        </div>
      </div>

      <div className="amenities-row">
        {floorData.highlights.map((h, idx) => (
          <span key={idx} className="amenity-tag">
            ✦ {h}
          </span>
        ))}
      </div>
    </div>
  );
}
