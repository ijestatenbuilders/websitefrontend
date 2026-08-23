import React, { useEffect, useRef } from 'react';
import './Hero3DSimple.css';

export default function Hero3DSimple() {
  const containerRef = useRef(null);
  const buildingsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      buildingsRef.current.forEach((building, index) => {
        if (building) {
          const speed = 0.5 + index * 0.3;
          building.style.transform = `
            rotateY(${xPercent * 10 * speed}deg) 
            rotateX(${-yPercent * 10 * speed}deg)
          `;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="hero3d-simple" ref={containerRef}>
      {/* Background particles */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 3D Buildings Container */}
      <div className="buildings-scene">
        {/* Building 1 */}
        <div 
          className="building building-1"
          ref={el => buildingsRef.current[0] = el}
        >
          <div className="building-face building-front">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="window" />
            ))}
          </div>
          <div className="building-face building-back" />
          <div className="building-face building-left" />
          <div className="building-face building-right" />
          <div className="building-face building-top" />
        </div>

        {/* Building 2 */}
        <div 
          className="building building-2"
          ref={el => buildingsRef.current[1] = el}
        >
          <div className="building-face building-front">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="window" />
            ))}
          </div>
          <div className="building-face building-back" />
          <div className="building-face building-left" />
          <div className="building-face building-right" />
          <div className="building-face building-top" />
        </div>

        {/* Building 3 */}
        <div 
          className="building building-3"
          ref={el => buildingsRef.current[2] = el}
        >
          <div className="building-face building-front">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="window" />
            ))}
          </div>
          <div className="building-face building-back" />
          <div className="building-face building-left" />
          <div className="building-face building-right" />
          <div className="building-face building-top" />
        </div>

        {/* Building 4 */}
        <div 
          className="building building-4"
          ref={el => buildingsRef.current[3] = el}
        >
          <div className="building-face building-front">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="window" />
            ))}
          </div>
          <div className="building-face building-back" />
          <div className="building-face building-left" />
          <div className="building-face building-right" />
          <div className="building-face building-top" />
        </div>
      </div>

      {/* Overlay Text */}
      <div className="hero-content">
        <h1>Explore Properties in 3D</h1>
        <p>Experience the future of real estate</p>
      </div>
    </div>
  );
}
