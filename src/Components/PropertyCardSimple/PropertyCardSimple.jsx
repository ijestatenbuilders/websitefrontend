import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyCardSimple.css';

export default function PropertyCardSimple({ property }) {
  const cardRef = useRef(null);
  const rafRef = useRef(0);
  const navigate = useNavigate();

  // Write the tilt straight to the DOM (rAF-throttled) instead of through React
  // state — avoids a re-render on every mousemove event.
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
    const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
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
      className="property-card-simple"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="card-inner">
        {/* Image */}
        <div className="card-image">
          <img src={imageUrl} alt={property.name || 'Property'} loading="lazy" decoding="async" />
          {property.badge && (
            <div className="card-badge">{property.badge}</div>
          )}
          <div className="card-overlay" />
        </div>

        {/* Content */}
        <div className="card-content">
          <h3>{property.name || 'Unnamed Property'}</h3>
          
          <div className="card-tags">
            <span className="tag tag-type">{property.type || 'Property'}</span>
            <span className="tag tag-marla">{property.marla || 'Size N/A'}</span>
          </div>

          <div className="card-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            <span>{getLocationDisplay()}</span>
          </div>

          <div className="card-price">
            {property.price || 'Price on Request'}
          </div>

          <button className="card-button">
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

        {/* 3D Shine Effect */}
        <div className="card-shine" />
      </div>
    </div>
  );
}
