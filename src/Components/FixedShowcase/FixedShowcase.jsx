import React, { useState, useEffect } from 'react';
import Hero3DEnhanced from '../Hero3DEnhanced/Hero3DEnhanced';
import PropertyCardSimple from '../PropertyCardSimple/PropertyCardSimple';
import { API_URL } from '../../services/api';
import './FixedShowcase.css';

export default function FixedShowcase() {
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
    <div className="fixed-showcase">
      {/* Header */}
      <header className="showcase-header">
        <div className="container">
          <h1>🎨 IJ Estates 3D Experience</h1>
          <p>Enhanced Buildings • Scroll Parallax • Mouse Tracking</p>
        </div>
      </header>

      {/* Hero Section - Three.js */}
      <section className="showcase-section hero-section">
        <Hero3DEnhanced />
        <div className="container">
          <div className="tech-info">
            <div className="tech-badge">
              <span className="badge-icon">⚡</span>
              <div className="badge-content">
                <strong>Enhanced Buildings</strong>
                <p>Detailed models with antennas, helipad, balconies</p>
              </div>
            </div>
            <div className="tech-badge">
              <span className="badge-icon">🎨</span>
              <div className="badge-content">
                <strong>Scroll Parallax</strong>
                <p>Scene responds to page scrolling</p>
              </div>
            </div>
            <div className="tech-badge">
              <span className="badge-icon">🖱️</span>
              <div className="badge-content">
                <strong>Mouse Tracking</strong>
                <p>Text follows cursor movement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Cards Section - CSS 3D */}
      <section className="showcase-section cards-section">
        <div className="container">
          <div className="section-title">
            <h2>🏠 3D Property Cards</h2>
            <p>Hover for 3D effect • Pure CSS transforms</p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Loading properties...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
            </div>
          ) : (
            <div className="property-grid">
              {properties.slice(0, 6).map((property) => (
                <PropertyCardSimple key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="showcase-section features-section">
        <div className="container">
          <div className="section-title">
            <h2>⚡ Why This Works</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Detailed Buildings</h3>
              <p>Antennas, helipad, balconies & more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Scroll Parallax</h3>
              <p>Scene moves as you scroll</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🖱️</div>
              <h3>Mouse Tracking</h3>
              <p>Interactive cursor effects</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>200 Particles</h3>
              <p>Blue & gold floating lights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Window Lights</h3>
              <p>Random lit windows</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Ground Grid</h3>
              <p>Professional backdrop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="showcase-footer">
        <div className="container">
          <p>Built with ❤️ using Three.js + React Three Fiber</p>
          <p>Enhanced buildings • Scroll parallax • Mouse tracking</p>
        </div>
      </footer>
    </div>
  );
}
