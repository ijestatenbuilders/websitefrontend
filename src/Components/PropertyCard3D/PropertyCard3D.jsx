import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyCard3D.css';

export default function PropertyCard3D({ property }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / rect.height) * -20;
    const rotateYValue = (mouseX / rect.width) * 20;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlowIntensity(1);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowIntensity(0);
  };

  const handleClick = () => {
    if (property.type === 'Commercial') {
      navigate(`/commercial/${property.id}`);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const imageUrl = property.image
    ? `${process.env.REACT_APP_API_BASE_URL}${property.image}`
    : '/placeholder-property.jpg';

  // Safe location display
  const getLocationDisplay = () => {
    if (!property.location) return 'Location N/A';
    
    const locationMap = {
      'bahriatown': 'Bahria Town',
      'dharaya': 'DHA Raya',
      'etihadtown': 'Etihad Town',
      'uniontown': 'Union Town'
    };
    
    return locationMap[property.location] || property.location;
  };

  return (
    <div
      ref={cardRef}
      className="property-card-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${glowIntensity ? 1.05 : 1})`,
      }}
    >
      {/* Glow effect */}
      <div
        className="card-glow"
        style={{
          opacity: glowIntensity * 0.6,
          background: `radial-gradient(circle at ${50 + rotateY}% ${50 + rotateX}%, #fbbf24, transparent 70%)`,
        }}
      />

      {/* Image layer */}
      <div
        className="card-image-layer"
        style={{
          transform: `translateZ(30px)`,
        }}
      >
        <img src={imageUrl} alt={property.name || 'Property'} />
        
        {property.badge && (
          <div className="card-badge" style={{ transform: `translateZ(40px)` }}>
            {property.badge}
          </div>
        )}
      </div>

      {/* Content layer */}
      <div
        className="card-content-layer"
        style={{
          transform: `translateZ(50px)`,
        }}
      >
        <h3>{property.name || 'Unnamed Property'}</h3>
        
        <div className="card-details">
          <span className="card-type">{property.type || 'Property'}</span>
          <span className="card-marla">{property.marla || 'Size N/A'}</span>
        </div>

        <div className="card-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
          </svg>
          {getLocationDisplay()}
        </div>

        <div className="card-price" style={{ transform: `translateZ(60px)` }}>
          {property.price || 'Price on Request'}
        </div>

        <button
          className="card-view-btn"
          style={{ transform: `translateZ(70px)` }}
        >
          View Details
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Shine effect */}
      <div
        className="card-shine"
        style={{
          left: `${50 + rotateY * 2}%`,
          top: `${50 + rotateX * 2}%`,
          opacity: glowIntensity * 0.3,
        }}
      />
    </div>
  );
}
