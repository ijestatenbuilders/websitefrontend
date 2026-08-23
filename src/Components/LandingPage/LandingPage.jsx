import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import BrowseProperties from '../Properties/Properties';
import Upcoming from '../Upcoming/Upcoming';
import PopularAreas from '../PopularAreas/PopularAreas';
import Footer from '../Footer/Footer';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import LocationTransition from '../LocationTransition/LocationTransition';
import ProjectPromoSection from '../ProjectPromo/ProjectPromoSection';
import RealEstate3DCanvas from '../Hero3DRealEstate/RealEstate3DCanvas';
import ParallaxFloatingObjects from '../Parallax/ParallaxFloatingObjects';
import PagePreloader from '../Preloader/PagePreloader';
import eiffelImg from '../../Assets/images/eiffletower.png';
import mosqueImg from '../../Assets/images/background.jpeg';
import buildingImg from '../../Assets/images/upcoming-project-1.jpg';
import './LandingPage.css';

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];

const locationOptions = [
  { value: 'bahriatown', label: 'Bahria Town Lahore' },
  { value: 'dharaya', label: 'DHA Raya Lahore' },
  { value: 'etihadtown', label: 'Etihad Town Lahore' },
  { value: 'uniontown', label: 'Union Town Lahore' },
];

const priceOptions = [
  { value: 'anybudget', label: 'Any Budget' },
  { value: '10lakh-1crore', label: '10 LAKH - 1 CRORE' },
  { value: '1crore-10crore', label: '1 CRORE - 10 CRORE' },
  { value: '10crore+', label: '10 CRORE+' },
];

const PRICE_RANGE_MAP = {
  'anybudget': [0, 99999],
  '10lakh-1crore': [10, 100],
  '1crore-10crore': [100, 1000],
  '10crore+': [1000, 99999],
};

// Rolling Kinetic Letters (Inspired by asaram.dev)
function KineticWord({ text, className = '' }) {
  return (
    <div className={`kinetic-word ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="kinetic-char-wrap" style={{ '--i': i }}>
          <span className="char-primary">{char === ' ' ? '\u00A0' : char}</span>
          <span className="char-secondary">{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ))}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchValues, setSearchValues] = useState({
    type: 'all',
    location: 'bahriatown',
    price: 'anybudget',
  });
  const [currentLocation, setCurrentLocation] = useState('bahriatown');
  const [isPreTransition, setIsPreTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPostTransition, setIsPostTransition] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchShake, setSearchShake] = useState(false);

  // Development theme toggle for Hero section ('light' | 'dark')
  const [heroTheme, setHeroTheme] = useState(() => {
    return localStorage.getItem('heroTheme') || 'light';
  });

  const toggleHeroTheme = () => {
    setHeroTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('heroTheme', next);
      return next;
    });
  };

  // ── Scroll & Mouse: pure refs — ZERO state updates on scroll/mouse ──
  const glowAuraRef = useRef(null);
  const marqueeTrackRef = useRef(null);

  // Hero DOM refs for RAF-driven transforms (no re-renders)
  const heroSpatialGridRef = useRef(null);
  const heroAgencyBadgeRef = useRef(null);
  const heroEiffelRef = useRef(null);
  const heroBuildingRef = useRef(null);
  const heroPillLeftRef = useRef(null);
  const heroPillRightRef = useRef(null);
  const heroMosqueRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroSearchRef = useRef(null);
  const heroMainRef = useRef(null);
  // Internal smoothed values
  const _scroll = useRef({ raw: window.scrollY, smooth: window.scrollY, velocity: 0, smoothVelocity: 0 });
  const _mouse = useRef({ rawX: window.innerWidth / 2, rawY: window.innerHeight / 2, x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 });
  const _aura = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const _lastScrollY = useRef(window.scrollY);
  const _lastScrollTime = useRef(Date.now());

  useEffect(() => {
    let animId;
    const LERP = 0.085; // smooth responsive easing

    const onScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - _lastScrollTime.current);
      const dy = window.scrollY - _lastScrollY.current;
      _scroll.current.raw = window.scrollY;
      _scroll.current.velocity = Math.min(Math.max((dy / dt) * 12, -8), 8);
      _lastScrollY.current = window.scrollY;
      _lastScrollTime.current = now;
    };

    const onMouse = (e) => {
      _mouse.current.rawX = e.clientX;
      _mouse.current.rawY = e.clientY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });

    const loop = () => {
      const s = _scroll.current;
      const m = _mouse.current;
      const a = _aura.current;

      // Lerp scroll & mouse
      s.smooth += (s.raw - s.smooth) * LERP;
      m.x += (m.rawX / window.innerWidth - m.x) * LERP;
      m.y += (m.rawY / window.innerHeight - m.y) * LERP;

      const sy = s.smooth;
      const mx = m.x - 0.5;
      const my = m.y - 0.5;

      // Aura glow follower
      a.x += (m.rawX - a.x) * 0.14;
      a.y += (m.rawY - a.y) * 0.14;
      if (glowAuraRef.current) {
        glowAuraRef.current.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }

      // Hero CSS var for --hero-scroll
      if (heroMainRef.current) {
        heroMainRef.current.style.setProperty('--hero-scroll', `${sy.toFixed(1)}px`);
        heroMainRef.current.style.setProperty('--mouse-tilt-x', `${(mx * 20).toFixed(2)}px`);
        heroMainRef.current.style.setProperty('--mouse-tilt-y', `${(my * 20).toFixed(2)}px`);
      }

      // Spatial grid
      if (heroSpatialGridRef.current)
        heroSpatialGridRef.current.style.transform = `translate3d(0, ${(sy * 0.13).toFixed(2)}px, 0)`;

      // Agency badge (Subtle tilt)
      const op1 = Math.max(0, 1 - sy * 0.003);
      if (heroAgencyBadgeRef.current) {
        heroAgencyBadgeRef.current.style.transform = `translate3d(0, ${(-sy * 0.21).toFixed(2)}px, 0) perspective(1000px) rotate(-1.5deg) rotateY(${(mx * 8).toFixed(2)}deg)`;
        heroAgencyBadgeRef.current.style.opacity = op1.toFixed(3);
      }

      const time = performance.now() * 0.001;
      const opLandmark = Math.max(0, 1 - sy * 0.0028);
      const opPill = Math.max(0, 1 - sy * 0.0025);

      // 1. Eiffel Tower badge (Tilted +8.5deg with 3D perspective tilt)
      const driftEiffelX = Math.sin(time * 0.85) * 7;
      const driftEiffelY = Math.cos(time * 0.72) * 9;
      if (heroEiffelRef.current) {
        heroEiffelRef.current.style.transform = `translate3d(${(mx * 36 + driftEiffelX).toFixed(2)}px, ${(-sy * 0.42 + my * 26 + driftEiffelY).toFixed(2)}px, 0) perspective(1000px) rotate(8.5deg) rotateX(${(my * -12 + 4).toFixed(2)}deg) rotateY(${(mx * 14 - 6).toFixed(2)}deg)`;
        heroEiffelRef.current.style.opacity = opLandmark.toFixed(3);
      }

      // 2. Luxury High-Rises badge (Tilted -8.0deg with 3D perspective tilt)
      const driftBuildingX = Math.cos(time * 0.65 + 1.4) * 8;
      const driftBuildingY = Math.sin(time * 0.92 + 0.9) * 10;
      if (heroBuildingRef.current) {
        heroBuildingRef.current.style.transform = `translate3d(${(mx * -30 + driftBuildingX).toFixed(2)}px, ${(-sy * 0.35 + my * 18 + driftBuildingY).toFixed(2)}px, 0) perspective(1000px) rotate(-8.0deg) rotateX(${(my * 12 - 4).toFixed(2)}deg) rotateY(${(mx * -14 + 8).toFixed(2)}deg)`;
        heroBuildingRef.current.style.opacity = opLandmark.toFixed(3);
      }

      // 3. Grand Jamia Mosque badge (Tilted -9.0deg with 3D perspective tilt)
      const driftMosqueX = Math.sin(time * 0.7 + 2.8) * 9;
      const driftMosqueY = Math.cos(time * 0.55 + 2.1) * 11;
      if (heroMosqueRef.current) {
        heroMosqueRef.current.style.transform = `translate3d(${(mx * -34 + driftMosqueX).toFixed(2)}px, ${(-sy * 0.22 + my * -24 + driftMosqueY).toFixed(2)}px, 0) perspective(1000px) rotate(-9.0deg) rotateX(${(my * -10 + 6).toFixed(2)}deg) rotateY(${(mx * 16 + 9).toFixed(2)}deg)`;
        heroMosqueRef.current.style.opacity = opLandmark.toFixed(3);
      }

      // 4. 500+ Verified Pill (Tilted -7.5deg with 3D perspective tilt)
      const driftPillLX = Math.cos(time * 0.95 + 3.2) * 6;
      const driftPillLY = Math.sin(time * 0.78 + 2.4) * 7;
      if (heroPillLeftRef.current) {
        heroPillLeftRef.current.style.transform = `translate3d(${(mx * -22 + driftPillLX).toFixed(2)}px, ${(-sy * 0.28 + my * -16 + driftPillLY).toFixed(2)}px, 0) perspective(1000px) rotate(-7.5deg) rotateX(${(my * 10 + 3).toFixed(2)}deg) rotateY(${(mx * -12 - 5).toFixed(2)}deg)`;
        heroPillLeftRef.current.style.opacity = opPill.toFixed(3);
      }

      // 5. Top Rated Agency Pill (Tilted +8.5deg with 3D perspective tilt)
      const driftPillRX = Math.sin(time * 0.68 + 4.5) * 6;
      const driftPillRY = Math.cos(time * 0.85 + 3.8) * 8;
      if (heroPillRightRef.current) {
        heroPillRightRef.current.style.transform = `translate3d(${(mx * 26 + driftPillRX).toFixed(2)}px, ${(-sy * 0.31 + my * 20 + driftPillRY).toFixed(2)}px, 0) perspective(1000px) rotate(8.5deg) rotateX(${(my * -10 - 3).toFixed(2)}deg) rotateY(${(mx * 12 + 6).toFixed(2)}deg)`;
        heroPillRightRef.current.style.opacity = opPill.toFixed(3);
      }

      // Hero content
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translate3d(${(mx * 8).toFixed(2)}px, ${(-sy * 0.15 + my * 6).toFixed(2)}px, 0)`;
        heroContentRef.current.style.opacity = Math.max(0, 1 - sy * 0.002).toFixed(3);
      }

      // Search bar
      if (heroSearchRef.current) {
        heroSearchRef.current.style.transform = `translate3d(${(mx * 4).toFixed(2)}px, ${(-sy * 0.07).toFixed(2)}px, 0)`;
      }

      // Marquee velocity skew (smooth decay)
      s.velocity *= 0.92;
      s.smoothVelocity += (s.velocity - s.smoothVelocity) * 0.15;
      if (marqueeTrackRef.current) {
        marqueeTrackRef.current.style.transform = `skewX(${(s.smoothVelocity * -0.7).toFixed(2)}deg) translate3d(0, 0, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.landing-page__dropdown')) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((current) => (current === name ? null : name));
  };

  const handleDropdownSelect = (name, value) => {
    setActiveDropdown(null);

    if (name === 'location' && value !== currentLocation) {
      setSearchValues((prev) => ({ ...prev, [name]: value }));
      setIsPreTransition(true);

      setTimeout(() => {
        setIsPreTransition(false);
        setIsTransitioning(true);

        setTimeout(() => {
          setCurrentLocation(value);
        }, 2000);

        setTimeout(() => {
          setIsPostTransition(true);
        }, 4800);
      }, 2000);
    } else {
      setSearchValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Quick search by property type only
  const handleQuickSearch = (propertyType) => {
    const type = propertyType.toLowerCase();
    const location = searchValues.location;

    navigate('/listings', {
      state: {
        mode: 'all',
        selected: locationOptions.find(o => o.value === location)?.label ?? 'All',
        propertyType: type.charAt(0).toUpperCase() + type.slice(1),
        searchLocation: location,
        searchPriceMin: null,
        searchPriceMax: null,
        searchBudgetLabel: '',
      },
    });
  };

  // Navigate to listings with type, location, and price range applied
  const handleSearchClick = () => {
    if (searchValues.type === 'all' || searchValues.price === 'anybudget') {
      const missing = [];
      if (searchValues.type === 'all') missing.push('property type');
      if (searchValues.price === 'anybudget') missing.push('budget range');
      setSearchError(`Please select a ${missing.join(' and ')} before searching.`);
      setSearchShake(true);
      setTimeout(() => setSearchShake(false), 650);
      setTimeout(() => setSearchError(''), 5000);
      return;
    }

    const type = searchValues.type;
    const location = searchValues.location;
    const [minP, maxP] = PRICE_RANGE_MAP[searchValues.price] || [0, 99999];

    navigate('/listings', {
      state: {
        mode: 'all',
        selected: locationOptions.find(o => o.value === location)?.label ?? 'All',
        propertyType: type === 'all' ? 'All'
          : type.charAt(0).toUpperCase() + type.slice(1),
        searchLocation: location,
        searchPriceMin: minP,
        searchPriceMax: maxP,
        searchBudgetLabel: priceOptions.find(o => o.value === searchValues.price)?.label ?? '',
      },
    });
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setTimeout(() => {
      setIsPostTransition(false);
    }, 2500);
  };

  const isBlocked = isPreTransition || isTransitioning;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "IJ Estate & Builders",
    "description": "Premier real estate agency in Lahore, Pakistan specializing in residential and commercial properties in DHA, Bahria Town, and other premium locations.",
    "url": "https://ijestateandbuilders.com",
    "logo": "https://ijestateandbuilders.com/logo512.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    },
    "telephone": "+92-XXX-XXXXXXX",
    "areaServed": "Lahore, Pakistan"
  };

  return (
    <>
      <PagePreloader theme={heroTheme} />
      <SEO
        title="IJ Estate & Builders | Premium Luxury Real Estate & 3D Spatial Experiences"
        description="Explore luxury properties in Lahore with IJ Estate & Builders. Featuring real-time 3D spatial exploration, verified residential villas, commercial towers, and prime plots in Bahria Town & DHA Raya."
        keywords="real estate Lahore, properties for sale Lahore, DHA Lahore properties, Bahria Town Lahore, houses for sale, commercial properties Lahore, real estate agency Pakistan, property investment Lahore"
        canonicalUrl="/"
        structuredData={structuredData}
      />

      {/* Global Fixed Liquid Glass Navbar (Pinned to window viewport at top) */}
      <Navbar variant="hero" heroTheme={heroTheme} onToggleTheme={toggleHeroTheme} />

      <div className={`landing-page ${isPreTransition ? 'landing-page--pretransition' : ''} ${isTransitioning ? 'landing-page--transitioning' : ''} ${isPostTransition ? 'landing-page--posttransition' : ''}`}>

        {/* Film grain noise overlay (asaram.dev) */}
        <div className="landing-grain-overlay" />

        <LocationTransition
          isActive={isTransitioning}
          isShaking={isPreTransition}
          onComplete={handleTransitionComplete}
        />

        {isBlocked && <div className="landing-page__blocker" aria-hidden="true" />}

        {/* ========================================================
            HERO SECTION: PURE 3D GLOWY JELLY COSMOS & KINETIC TYPOGRAPHY WITH PARALLAX
        ======================================================== */}
        <main
          className={`landing-page__hero landing-page__hero--${currentLocation} landing-page__hero--${heroTheme} ${isTransitioning ? 'landing-page__hero--blurred' : ''}`}
          id="home"
          ref={heroMainRef}
        >
          {/* Real-time 3D Bluish Glowy Jelly Canvas with Dynamic Theme & Parallax */}
          <RealEstate3DCanvas mouseSmooth={_mouse} scrollSmooth={_scroll} theme={heroTheme} />

          {/* Blueprint Spatial Grid with Depth Parallax */}
          <div
            className="hero-spatial-grid"
            ref={heroSpatialGridRef}
          />
          <div
            className="hero-glow-aura"
            ref={glowAuraRef}
          />

          {/* Agency Floating Top Badge with Parallax */}
          <div
            className="hero-agency-badge-wrap"
            ref={heroAgencyBadgeRef}
          >
            <div className="hero-agency-badge">
              <span className="agency-pulse-dot" />
              <span>✦ PREMIER LUXURY REAL ESTATE // LAHORE, PAKISTAN</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              ASYMMETRICAL FLOATING LANDMARKS & REAL ESTATE PILLS
          ══════════════════════════════════════════════════════════ */}

          {/* 1. Eiffel Tower Bahria — Upper Right (Tilted +3.5deg, Fast Parallax) */}
          <div
            className="hero-landmark-badge hero-landmark-badge--eiffel"
            ref={heroEiffelRef}
          >
            <div className="landmark-badge-thumb">
              <img src={eiffelImg} alt="Eiffel Tower Bahria Town" width={42} height={42} />
            </div>
            <div className="landmark-badge-text">
              <span className="landmark-badge-name">Eiffel Tower</span>
              <span className="landmark-badge-loc">Bahria Town Lahore</span>
            </div>
          </div>

          {/* 2. Luxury High-Rises — Upper Left (Tilted +2deg, Moderate Parallax) */}
          <div
            className="hero-landmark-badge hero-landmark-badge--building"
            ref={heroBuildingRef}
          >
            <div className="landmark-badge-thumb">
              <img src={buildingImg} alt="Luxury Towers" width={42} height={42} />
            </div>
            <div className="landmark-badge-text">
              <span className="landmark-badge-name">Luxury High-Rises</span>
              <span className="landmark-badge-loc">DHA Raya • Commercial</span>
            </div>
          </div>

          {/* 3. 500+ Verified Properties — Mid Left (Tilted -1.5deg) */}
          <div
            className="hero-floating-pill hero-floating-pill--left"
            ref={heroPillLeftRef}
          >
            <div className="floating-pill-icon">✨</div>
            <div className="floating-pill-info">
              <span className="floating-pill-title">500+ Verified</span>
              <span className="floating-pill-sub">Prime Luxury Properties</span>
            </div>
          </div>

          {/* 4. Top Rated Agency — Mid-Lower Right (Tilted -2.5deg) */}
          <div
            className="hero-floating-pill hero-floating-pill--right"
            ref={heroPillRightRef}
          >
            <div className="floating-pill-icon">💎</div>
            <div className="floating-pill-info">
              <span className="floating-pill-title">Top Rated Agency</span>
              <span className="floating-pill-sub">Bahria & DHA Raya Lahore</span>
            </div>
          </div>

          {/* 5. Grand Jamia Mosque — Deep Lower Left (Tilted -3.5deg, Slow Parallax) */}
          <div
            className="hero-landmark-badge hero-landmark-badge--mosque"
            ref={heroMosqueRef}
          >
            <div className="landmark-badge-thumb">
              <img src={mosqueImg} alt="Grand Jamia Mosque Bahria Town" width={42} height={42} />
            </div>
            <div className="landmark-badge-text">
              <span className="landmark-badge-name">Grand Jamia Mosque</span>
              <span className="landmark-badge-loc">Islamic Landmark • Bahria</span>
            </div>
          </div>

          {/* Signature 3D Kinetic Title with Depth Parallax */}
          <div
            className="landing-page__hero-content"
            ref={heroContentRef}
          >
            <h1 className="landing-giant-title">
              <KineticWord text="IJ ESTATE" />
              <KineticWord text="& BUILDERS" className="gold-text-glow" />
            </h1>
            <p className="landing-page__hero-statement">
              Crafting landmark luxury villas, high-yield commercial towers, and master-planned residential communities across Lahore.
            </p>
          </div>

          {/* Interactive Search Bar with Smooth Parallax Float */}
          <div
            className={`landing-page__search ${searchShake ? 'landing-page__search--shake' : ''}`}
            ref={heroSearchRef}
          >
            {searchError && (
              <div className="landing-page__search-toast landing-page__search-toast--error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                {searchError}
              </div>
            )}

            <div className="landing-page__search-tabs">
              {['Find Premium Properties'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className="landing-page__search-tab landing-page__search-tab--active"
                >
                  <span className="tab-sparkle">✦</span>
                  {tab}
                </button>
              ))}
            </div>

            {/* Unified Glass Pill Search Bar */}
            <div className="landing-page__search-bar">
              {/* Type */}
              <div className="landing-page__search-field landing-page__dropdown">
                <span className="landing-page__field-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 21V12h6v9" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="g1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" /><stop offset="1" stopColor="#1e40af" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <div className="landing-page__field-body">
                  <span className="landing-page__field-label">Type</span>
                  <button
                    type="button"
                    className="landing-page__dropdown-trigger"
                    onClick={() => toggleDropdown('type')}
                  >
                    {typeOptions.find(o => o.value === searchValues.type)?.label}
                    <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className={`landing-page__dropdown-panel ${activeDropdown === 'type' ? 'landing-page__dropdown-panel--open' : ''}`}>
                  {typeOptions.map(option => (
                    <button key={option.value} type="button"
                      className={`landing-page__dropdown-option ${searchValues.type === option.value ? 'landing-page__dropdown-option--active' : ''}`}
                      onClick={() => handleDropdownSelect('type', option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="landing-page__divider" />

              {/* Location */}
              <div className="landing-page__search-field landing-page__dropdown">
                <span className="landing-page__field-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2.5" stroke="url(#g2)" strokeWidth="2" />
                    <defs>
                      <linearGradient id="g2" x1="6" y1="2" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" /><stop offset="1" stopColor="#1e40af" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <div className="landing-page__field-body">
                  <span className="landing-page__field-label">Location</span>
                  <button
                    type="button"
                    className="landing-page__dropdown-trigger"
                    onClick={() => toggleDropdown('location')}
                  >
                    {locationOptions.find(o => o.value === searchValues.location)?.label ?? 'Choose location'}
                    <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className={`landing-page__dropdown-panel ${activeDropdown === 'location' ? 'landing-page__dropdown-panel--open' : ''}`}>
                  {locationOptions.map(option => (
                    <button key={option.value} type="button"
                      className={`landing-page__dropdown-option ${searchValues.location === option.value ? 'landing-page__dropdown-option--active' : ''}`}
                      onClick={() => handleDropdownSelect('location', option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="landing-page__divider" />

              {/* Price */}
              <div className="landing-page__search-field landing-page__dropdown">
                <span className="landing-page__field-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="url(#g3)" strokeWidth="2" />
                    <path d="M12 7v1m0 8v1m-3-5h4.5a1.5 1.5 0 010 3H9m0-3h3a1.5 1.5 0 000-3H9v3z" stroke="url(#g3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="g3" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <div className="landing-page__field-body">
                  <span className="landing-page__field-label">Budget</span>
                  <button
                    type="button"
                    className="landing-page__dropdown-trigger"
                    onClick={() => toggleDropdown('price')}
                  >
                    {searchValues.price ? priceOptions.find(o => o.value === searchValues.price)?.label : 'Any budget'}
                    <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className={`landing-page__dropdown-panel ${activeDropdown === 'price' ? 'landing-page__dropdown-panel--open' : ''}`}>
                  {priceOptions.map(option => (
                    <button key={option.value} type="button"
                      className={`landing-page__dropdown-option ${searchValues.price === option.value ? 'landing-page__dropdown-option--active' : ''}`}
                      onClick={() => handleDropdownSelect('price', option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search button */}
              <button type="button" className="landing-page__search-btn" onClick={handleSearchClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span>Search</span>
              </button>
            </div>

            {/* Quick Search Options */}
            <div className="landing-page__quick-search">
              <span className="landing-page__quick-label">Quick Search:</span>
              <button
                type="button"
                className="landing-page__quick-btn"
                onClick={() => handleQuickSearch('house')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Houses
              </button>
              <button
                type="button"
                className="landing-page__quick-btn"
                onClick={() => handleQuickSearch('apartment')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Apartments
              </button>
              <button
                type="button"
                className="landing-page__quick-btn"
                onClick={() => handleQuickSearch('plot')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
                Plots
              </button>
              <button
                type="button"
                className="landing-page__quick-btn"
                onClick={() => handleQuickSearch('commercial')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2" />
                </svg>
                Commercial
              </button>
            </div>
          </div>
        </main>

        {/* Ambient 3D Parallax Real Estate Tokens Layer */}
        <ParallaxFloatingObjects />

        {/* ========================================================
            INFINITE AGENCY MARQUEE STRIP (asaram.dev) With Velocity Parallax
        ======================================================== */}
        <div className="landing-marquee-strip">
          <div
            className="landing-marquee-track"
            ref={marqueeTrackRef}
          >
            <div className="landing-marquee-content">
              <span>✦ IJ ESTATE & BUILDERS</span>
              <span>✦ DHA RAYA LAHORE</span>
              <span>✦ BAHRIA TOWN LAHORE</span>
              <span>✦ ETIHAD TOWN</span>
              <span>✦ HIGH ROI COMMERCIAL PLOTS</span>
              <span>✦ 100% VERIFIED REGISTRATIONS</span>
              <span>✦ 500+ LUXURY CLOSINGS</span>
              <span>✦ IJ ESTATE & BUILDERS</span>
              <span>✦ DHA RAYA LAHORE</span>
              <span>✦ BAHRIA TOWN LAHORE</span>
              <span>✦ ETIHAD TOWN</span>
              <span>✦ HIGH ROI COMMERCIAL PLOTS</span>
              <span>✦ 100% VERIFIED REGISTRATIONS</span>
              <span>✦ 500+ LUXURY CLOSINGS</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            CORE REAL ESTATE SECTIONS WITH PARALLAX & SPATIAL DEPTH
        ======================================================== */}
        <BrowseProperties currentLocation={currentLocation} />
        <Upcoming currentLocation={currentLocation} />
        <ProjectPromoSection />
        <PopularAreas currentLocation={currentLocation} />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

export default LandingPage;
