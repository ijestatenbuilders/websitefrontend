import { useEffect, useState } from 'react';
import './LocationTransition.css';
import logo from '../../Assets/images/logo.jpg';

function LocationTransition({ isActive, isShaking, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle, glideIn, rotate, glideOut, complete
  const [logoPosition, setLogoPosition] = useState({ top: 20, left: 20 });
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Get the actual navbar logo position
    const getNavbarLogoPosition = () => {
      const logoElement = document.querySelector('.navbar__brand-logo');
      if (logoElement) {
        const rect = logoElement.getBoundingClientRect();
        return {
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2
        };
      }
      return { top: 45, left: 50 }; // fallback
    };

    if (!isActive) {
      if (!isShaking) {
        setPhase('idle');
        setIsFadingOut(false);
      }
      return;
    }

    // Only capture position and run animation once when isActive becomes true
    // Capture navbar logo position at start
    const position = getNavbarLogoPosition();
    setLogoPosition(position);

    // Phase 1: Fade in overlay and glide logo to center (0.8s)
    setPhase('glideIn');
    setIsFadingOut(false);

    const timer1 = setTimeout(() => {
      // Phase 2: Rotate/Pulse (4s)
      setPhase('rotate');
    }, 800);

    const timer2 = setTimeout(() => {
      // Phase 3: Glide logo back (but keep overlay visible)
      setPhase('glideOut');
    }, 4800); // 0.8s glide in + 4s rotate = 4.8s

    const timer3 = setTimeout(() => {
      // Phase 4: Start fading out overlay AFTER logo returns
      setIsFadingOut(true);
    }, 5700); // 4.8s + 0.9s logo return = 5.7s

    const timer4 = setTimeout(() => {
      // Phase 5: Complete (overlay finished fading)
      setPhase('complete');
      onComplete();
    }, 8200); // 5.7s + 2.5s overlay fade = 8.2s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); // Only depend on isActive, not isShaking or onComplete

  if (phase === 'idle' || phase === 'complete') {
    // Still render a blocking layer during the shake phase
    if (isShaking) {
      return <div className="location-transition__shake-blocker" aria-hidden="true" />;
    }
    return null;
  }

  return (
    <div className={`location-transition ${phase !== 'idle' ? 'location-transition--active' : ''}`}>
      <div className={`location-transition__overlay ${isFadingOut ? 'location-transition__overlay--fadeout' : ''}`}>
        {/* Navy blue fluid particles */}
        <div className="location-transition__particles">
          <div className="location-transition__particle"></div>
          <div className="location-transition__particle"></div>
          <div className="location-transition__particle"></div>
          <div className="location-transition__particle"></div>
          <div className="location-transition__particle"></div>
          <div className="location-transition__particle"></div>
        </div>
      </div>

      <div
        className={`location-transition__logo-container location-transition__logo-container--${phase}`}
        style={{
          '--logo-top': `${logoPosition.top}px`,
          '--logo-left': `${logoPosition.left}px`
        }}
      >
        <div className="location-transition__logo-wrapper">
          <div className="location-transition__logo-inner">
            <img
              src={logo}
              alt="IJ Estates"
              className="location-transition__logo"
            />
            <div className="location-transition__logo-depth" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationTransition;
