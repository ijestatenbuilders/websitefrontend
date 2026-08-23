import React, { useState, useEffect } from 'react';
import Hero3DSimple from '../Hero3DSimple/Hero3DSimple';
import PropertyCardSimple from '../PropertyCardSimple/PropertyCardSimple';
import { API_URL } from '../../services/api';
import './SimpleShowcase.css';

export default function SimpleShowcase() {
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
    <div className="simple-showcase">
      {/* Header */}
      <header className="showcase-header">
        <div className="container">
          <h1>🎨 IJ Estates 3D Experience</h1>
          <p>Pure CSS 3D - No Three.js Required</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="showcase-section">
        <div className="container">
          <div className="section-title">
            <h2>✨ 3D Floating Buildings</h2>
            <p>Move your mouse to interact</p>
          </div>
          <Hero3DSimple />
        </div>
      </section>

      {/* Property Cards Section */}
      <section className="showcase-section">
        <div className="container">
          <div className="section-title">
            <h2>🏠 3D Property Cards</h2>
            <p>Hover to see the 3D tilt effect</p>
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
            <h2>⚡ Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Pure CSS 3D</h3>
              <p>No heavy libraries needed</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Lightweight</h3>
              <p>Fast loading & performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Works on all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful</h3>
              <p>Modern & professional</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="showcase-footer">
        <div className="container">
          <p>Built with ❤️ using Pure CSS 3D Transforms</p>
        </div>
      </footer>
    </div>
  );
}
