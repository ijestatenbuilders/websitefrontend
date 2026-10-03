import { useEffect, useRef, useState } from 'react';
import './LocationTransition.css';
import logo from '../../Assets/images/logo.jpg';

const EXPAND_MS = 800;      // Animation expands from top-right to full screen
const CENTER_MS = 2500;     // Logo zoom in/out at center
const SHRINK_MS = 800;      // Animation shrinks back to top-right

/**
 * LocationTransition — smooth page transition animation:
 *  1. Circular overlay expands from top-right corner to fill screen
 *  2. Logo flies from navbar position to center
 *  3. Logo zooms in then zooms out smoothly
 *  4. Logo flies back to navbar position
 *  5. Overlay shrinks back to top-right corner
 */
function LocationTransition({ isActive, onCovered, onComplete }) {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0, scale: 0.3 });
  const [logoCentered, setLogoCentered] = useState(false);
  const [logoZooming, setLogoZooming] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const onCoveredRef = useRef(onCovered);

  onCompleteRef.current = onComplete;
  onCoveredRef.current = onCovered;

  useEffect(() => {
    if (!isActive) return;

    // Get navbar logo position
    const navLogo = document.querySelector('.xnav__brand-logo');
    const rect = navLogo?.getBoundingClientRect();

    if (rect && rect.width > 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const logoCenterX = rect.left + rect.width / 2;
      const logoCenterY = rect.top + rect.height / 2;

      setLogoPosition({
        x: logoCenterX - centerX,
        y: logoCenterY - centerY,
        scale: rect.width / 200 // 200px is our center logo size
      });
    } else {
      // Fallback: assume logo is in top-left
      setLogoPosition({
        x: -window.innerWidth / 2 + 80,
        y: -window.innerHeight / 2 + 50,
        scale: 0.25
      });
    }

    // Lock scroll during animation
    document.body.style.overflow = 'hidden';
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    // Start animation sequence
    setShow(true);

    // Step 1: Expand overlay from top-right (50ms delay for smooth start)
    const t1 = setTimeout(() => {
      setExpanded(true);
      setLogoCentered(true);
    }, 50);

    // Step 2: Start logo zoom animation when centered
    const t2 = setTimeout(() => {
      setLogoZooming(true);
      // Trigger content change behind the overlay
      if (onCoveredRef.current) onCoveredRef.current();
    }, EXPAND_MS);

    // Step 3: Shrink back to top-right
    const t3 = setTimeout(() => {
      setLogoZooming(false);
      setExpanded(false);
      setLogoCentered(false);
    }, EXPAND_MS + CENTER_MS);

    // Step 4: Complete and cleanup
    const t4 = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
      window.scrollTo(0, 0); // Reset scroll to top
      if (onCompleteRef.current) onCompleteRef.current();
    }, EXPAND_MS + CENTER_MS + SHRINK_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.body.style.overflow = '';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isActive]);

  if (!show) return null;

  const logoStyle = {
    transform: logoCentered
      ? 'translate(-50%, -50%)'
      : `translate(-50%, -50%) translate(${logoPosition.x}px, ${logoPosition.y}px) scale(${logoPosition.scale})`
  };

  return (
    <div className="location-transition">
      {/* Circular overlay that expands from top-right */}
      <div className={`lt-overlay ${expanded ? 'lt-overlay--expanded' : ''}`}>
        <div className="lt-gradient" />
        <div className="lt-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="lt-particle" style={{
              '--delay': `${i * 0.1}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`
            }} />
          ))}
        </div>
      </div>

      {/* Logo that flies from navbar to center */}
      <div className="lt-logo-container" style={logoStyle}>
        <div className={`lt-logo ${logoZooming ? 'lt-logo--zooming' : ''}`}>
          <img src={logo} alt="IJ Estates" />
        </div>
      </div>
    </div>
  );
}

export default LocationTransition;
