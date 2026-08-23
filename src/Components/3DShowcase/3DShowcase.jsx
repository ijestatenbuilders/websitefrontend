import React, { useState, useEffect } from 'react';
import Hero3D from '../Hero3D/Hero3D';
import PropertyCard3D from '../PropertyCard3D/PropertyCard3D';
import { API_URL } from '../../services/api';
import './3DShowcase.css';

export default function ThreeDShowcase() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/api/properties/?location=bahriatown&limit=6`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data.results || data);
        } else {
          setError('Failed to load properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Error loading properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="showcase-3d">
      {/* Header */}
      <header className="showcase-header">
        <div className="showcase-container">
          <h1>🎨 IJ Estates 3D Experience</h1>
          <p>Phase 1: Floating Buildings & 3D Property Cards</p>
        </div>
      </header>

      {/* Section 1: Hero 3D */}
      <section className="showcase-section showcase-hero">
        <div className="showcase-container">
          <div className="section-header">
            <h2>1. Hero Section - Floating 3D Buildings</h2>
            <p>Move your mouse to interact with the 3D scene</p>
          </div>
          <Hero3D />
          <div className="section-info">
            <div className="info-card">
              <h3>Features:</h3>
              <ul>
                <li>✨ 4 floating building models</li>
                <li>🖱️ Mouse parallax effect</li>
                <li>🔄 Auto-rotation</li>
                <li>💫 Glowing windows</li>
                <li>⚡ Particle background</li>
                <li>🎨 Premium lighting</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Technologies:</h3>
              <ul>
                <li>React Three Fiber</li>
                <li>Three.js</li>
                <li>@react-three/drei</li>
                <li>WebGL</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Property Cards 3D */}
      <section className="showcase-section showcase-cards">
        <div className="showcase-container">
          <div className="section-header">
            <h2>2. 3D Property Cards</h2>
            <p>Hover over cards to see the 3D tilt effect</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <div className="property-grid-3d">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard3D key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="section-info">
            <div className="info-card">
              <h3>Card Features:</h3>
              <ul>
                <li>🎪 3D tilt on hover</li>
                <li>✨ Parallax layers</li>
                <li>🌟 Glow effect</li>
                <li>💎 Shine animation</li>
                <li>🎨 Gradient backgrounds</li>
                <li>📱 Mobile responsive</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Interactions:</h3>
              <ul>
                <li>Mouse position tracking</li>
                <li>3D perspective transform</li>
                <li>Smooth transitions</li>
                <li>Click to navigate</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="showcase-section showcase-stats">
        <div className="showcase-container">
          <div className="section-header">
            <h2>📊 Performance & Compatibility</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <h3>60 FPS</h3>
              <p>Smooth animations on desktop</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Optimized for touch devices</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌐</div>
              <h3>Cross-Browser</h3>
              <p>Works on Chrome, Safari, Firefox</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <h3>+200KB</h3>
              <p>Lightweight bundle size</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="showcase-footer">
        <div className="showcase-container">
          <p>Built with ❤️ using React Three Fiber & Three.js</p>
          <p>Phase 1 Complete | Ready for Integration</p>
        </div>
      </footer>
    </div>
  );
}
