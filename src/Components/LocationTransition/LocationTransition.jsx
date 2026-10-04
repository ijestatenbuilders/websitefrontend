import { useEffect, useRef, useState } from 'react';
import './LocationTransition.css';
import logo from '../../Assets/images/logo.jpg';

const EXPAND_MS = 800;
const CENTER_MS = 2500;
const SHRINK_MS = 800;

function LocationTransition({ isActive, onCovered, onComplete }) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState('start'); // start, expanded, shrinking, done
  const onCompleteRef = useRef(onComplete);
  const onCoveredRef = useRef(onCovered);

  onCompleteRef.current = onComplete;
  onCoveredRef.current = onCovered;

  useEffect(() => {
    if (!isActive) return;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    setShow(true);
    setPhase('start');

    // Phase 1: Expand (logo moves to center)
    const t1 = setTimeout(() => {
      setPhase('expanded');
    }, 100);

    // Phase 2: Content change happens
    const t2 = setTimeout(() => {
      if (onCoveredRef.current) onCoveredRef.current();
    }, EXPAND_MS + 100);

    // Phase 3: Start shrinking (logo moves back)
    const t3 = setTimeout(() => {
      setPhase('shrinking');
    }, EXPAND_MS + CENTER_MS);

    // Phase 4: Complete
    const t4 = setTimeout(() => {
      setShow(false);
      setPhase('done');
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
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

  // Calculate logo position based on navbar
  const getLogoTransform = () => {
    if (phase === 'expanded') {
      return 'translate(-50%, -50%) scale(1)';
    }

    const navLogo = document.querySelector('.xnav__brand-logo');
    if (navLogo) {
      const rect = navLogo.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const logoX = rect.left + rect.width / 2;
      const logoY = rect.top + rect.height / 2;
      const offsetX = logoX - centerX;
      const offsetY = logoY - centerY;
      const scale = rect.width / 200;
      return `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;
    }

    return 'translate(-50%, -50%) scale(0.3)';
  };

  const isExpanded = phase === 'expanded';
  const isZooming = phase === 'expanded';

  return (
    <>
      {/* Background Overlay */}
      <div className={`transition-overlay ${isExpanded ? 'expanded' : ''}`} />

      {/* Logo Animation */}
      <div
        className="transition-logo"
        style={{ transform: getLogoTransform() }}
      >
        <div className={`logo-box ${isZooming ? 'zooming' : ''}`}>
          <img src={logo} alt="IJ Estates" />
        </div>
      </div>
    </>
  );
}

export default LocationTransition;
