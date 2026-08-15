import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../Assets/images/logo.jpg';
import AIChat from '../AIChat/AIChat';

/* ═══════════════════════════════════════════════════════════
   SEARCH MODAL DATA  (mirrors LandingPage options exactly)
═══════════════════════════════════════════════════════════ */
const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];

const LOCATION_OPTIONS = [
  { value: 'bahriatown', label: 'Bahria Town Lahore' },
  { value: 'dharaya', label: 'DHA Raya Lahore' },
  { value: 'etihadtown', label: 'Etihad Town Lahore' },
  { value: 'uniontown', label: 'Union Town Lahore' },
];

const PRICE_OPTIONS = [
  { value: 'anybudget', label: 'Any Budget' },
  { value: '10lakh-1crore', label: '10 Lakh – 1 Crore' },
  { value: '1crore-10crore', label: '1 Crore – 10 Crore' },
  { value: '10crore+', label: '10 Crore+' },
];

const PRICE_RANGE_MAP = {
  anybudget: [0, 99999],
  '10lakh-1crore': [10, 100],
  '1crore-10crore': [100, 1000],
  '10crore+': [1000, 99999],
};

/* ═══════════════════════════════════════════════════════════
   FIND PROPERTY MODAL
═══════════════════════════════════════════════════════════ */
function FindPropertyModal({ onClose }) {
  const navigate = useNavigate();

  const [values, setValues] = useState({ type: 'all', location: 'bahriatown', price: 'anybudget' });
  const [openDrop, setOpenDrop] = useState(null); // 'type' | 'location' | 'price' | null
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const backdropRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.fpm__field')) setOpenDrop(null);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const select = (field, val) => {
    setValues(prev => ({ ...prev, [field]: val }));
    setOpenDrop(null);
  };

  // Quick search by property type only - go directly to listings
  const handleQuickSearch = (propertyType) => {
    const type = propertyType.toLowerCase();
    const locLabel = LOCATION_OPTIONS.find(o => o.value === values.location);

    onClose();
    navigate('/listings', {
      state: {
        mode: 'all',
        selected: locLabel?.label ?? 'All',
        propertyType: propertyType,
        searchLocation: values.location,
        searchPriceMin: null,
        searchPriceMax: null,
        searchBudgetLabel: '',
      },
    });
  };

  const handleSearch = () => {
    if (values.type === 'all' || values.price === 'anybudget') {
      const missing = [];
      if (values.type === 'all') missing.push('property type');
      if (values.price === 'anybudget') missing.push('budget range');
      setError(`Please select a ${missing.join(' and ')}.`);
      setShake(true);
      setTimeout(() => setShake(false), 650);
      setTimeout(() => setError(''), 4000);
      return;
    }

    const [minP, maxP] = PRICE_RANGE_MAP[values.price] || [0, 99999];
    const typeLabel = TYPE_OPTIONS.find(o => o.value === values.type);
    const locLabel = LOCATION_OPTIONS.find(o => o.value === values.location);

    onClose();
    navigate('/listings', {
      state: {
        mode: 'all',
        selected: locLabel?.label ?? 'All',
        propertyType: typeLabel
          ? typeLabel.label === 'All Types'
            ? 'All'
            : typeLabel.label
          : 'All',
        searchLocation: values.location,
        searchPriceMin: minP,
        searchPriceMax: maxP,
        searchBudgetLabel: PRICE_OPTIONS.find(o => o.value === values.price)?.label ?? '',
      },
    });
  };

  const DropField = ({ field, icon, label, opts, currentVal }) => (
    <div className="fpm__field" onClick={() => setOpenDrop(openDrop === field ? null : field)}>
      <div className="fpm__field-icon">{icon}</div>
      <div className="fpm__field-body">
        <span className="fpm__field-label">{label}</span>
        <span className="fpm__field-value">
          {opts.find(o => o.value === currentVal)?.label ?? '—'}
          <svg className={`fpm__chevron ${openDrop === field ? 'fpm__chevron--open' : ''}`}
            viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {openDrop === field && (
        <div className="fpm__dropdown">
          {opts.map(o => (
            <button
              key={o.value}
              type="button"
              className={`fpm__dropdown-item ${currentVal === o.value ? 'fpm__dropdown-item--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); select(field, o.value); }}
            >
              {currentVal === o.value && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fpm__backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="fpm__panel">

        {/* Close */}
        <button className="fpm__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.3"
              strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="fpm__header">
          <div className="fpm__header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="fpm__title">Find Your Property</h2>
            <p className="fpm__subtitle">Filter by type, location, and budget</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="fpm__error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Fields */}
        <div className={`fpm__fields${shake ? ' fpm__fields--shake' : ''}`}>

          <DropField
            field="type"
            currentVal={values.type}
            opts={TYPE_OPTIONS}
            label="Property Type"
            icon={
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z"
                  stroke="url(#mg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21V12h6v9" stroke="url(#mg1)" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="mg1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa" /><stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            }
          />

          <div className="fpm__divider" />

          <DropField
            field="location"
            currentVal={values.location}
            opts={LOCATION_OPTIONS}
            label="Location"
            icon={
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
                  stroke="url(#mg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="8" r="2.5" stroke="url(#mg2)" strokeWidth="2" />
                <defs>
                  <linearGradient id="mg2" x1="6" y1="2" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa" /><stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            }
          />

          <div className="fpm__divider" />

          <DropField
            field="price"
            currentVal={values.price}
            opts={PRICE_OPTIONS}
            label="Budget"
            icon={
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <circle cx="12" cy="12" r="9" stroke="url(#mg3)" strokeWidth="2" />
                <path d="M12 7v1m0 8v1m-3-5h4.5a1.5 1.5 0 010 3H9m0-3h3a1.5 1.5 0 000-3H9v3z"
                  stroke="url(#mg3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="mg3" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa" /><stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            }
          />
        </div>

        {/* Search button */}
        <button className="fpm__search-btn" onClick={handleSearch}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Search Properties
        </button>

        {/* Quick links */}
        <div className="fpm__quick">
          <span className="fpm__quick-label">Quick search:</span>
          <button
            type="button"
            className="fpm__quick-chip"
            onClick={() => handleQuickSearch('House')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Houses
          </button>
          <button
            type="button"
            className="fpm__quick-chip"
            onClick={() => handleQuickSearch('Plot')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            Plots
          </button>
          <button
            type="button"
            className="fpm__quick-chip"
            onClick={() => handleQuickSearch('Apartment')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Apartments
          </button>
          <button
            type="button"
            className="fpm__quick-chip"
            onClick={() => handleQuickSearch('Commercial')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2" />
            </svg>
            Commercial
          </button>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV LINKS
═══════════════════════════════════════════════════════════ */
const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Properties', href: '#properties' },
  { label: 'New Projects', href: '#new' },
  { label: 'Forums', href: '/forums', external: true },
  { label: 'About Us', href: '#about' },
  { label: 'Contact Us', href: '#contact' },
];

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
function Navbar({ variant = 'default' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(variant === 'scrolled' ? true : false);
  const [activeLink, setActiveLink] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHero = variant === 'hero';
  const forceScrolled = variant === 'scrolled';
  const onListings = location.pathname === '/listings';
  const onDetailPage = location.pathname.startsWith('/property/');
  const onAbout = location.pathname === '/about';
  const onContact = location.pathname === '/contact';
  const onCommercial = location.pathname.startsWith('/commercial/');
  const onMap = location.pathname === '/map';
  const onForums = location.pathname === '/forums';

  useEffect(() => {
    if (forceScrolled) return; // Don't listen to scroll if forced scrolled
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceScrolled]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const toggleMenu = () => setMenuOpen(o => !o);
  const closeMenu = () => setMenuOpen(false);

  const handleLinkClick = (e, href, external = false) => {
    e.preventDefault();

    // Handle external/route links (Forums)
    if (external) {
      navigate(href);
      closeMenu();
      return;
    }

    const sectionId = href.replace('#', '');
    closeMenu();

    if (sectionId === 'about') { navigate('/about'); return; }
    if (sectionId === 'contact') { navigate('/contact'); return; }

    setActiveLink(sectionId);

    if (onListings || onDetailPage || onAbout || onContact || onCommercial || onMap || onForums) {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
    }
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      const target = document.getElementById(location.state.scrollTo);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location]);

  const openModal = (e) => { e.preventDefault(); setModalOpen(true); closeMenu(); };
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <header className={`navbar ${isHero ? 'navbar--hero' : ''} ${isScrolled || onListings || onDetailPage || onAbout || onContact || onCommercial || onMap ? 'navbar--scrolled' : ''}`}>
        <nav className="navbar__inner">
          <a
            href="/"
            className="navbar__brand"
            onClick={(e) => { e.preventDefault(); navigate('/'); closeMenu(); }}
          >
            <span className="navbar__brand-mark">
              <img className="navbar__brand-logo" src={logo} alt="IJ Estates logo" width={60} height={60} />
            </span>
            <span className="navbar__brand-text">
              <span className="navbar__brand-name">IJ Estate</span>
              <span className="navbar__brand-subtitle">& Builders</span>
            </span>
          </a>

          <ul className="navbar__links navbar__links--desktop">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = link.external
                ? onForums
                : (onListings || onDetailPage)
                  ? sectionId === 'properties'
                  : onAbout ? sectionId === 'about'
                    : onContact ? sectionId === 'contact'
                      : activeLink === sectionId;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                    onClick={(e) => handleLinkClick(e, link.href, link.external)}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="navbar__actions">
            <button
              className={`navbar__map-btn navbar__map-btn--desktop ${onMap ? 'navbar__map-btn--active' : ''}`}
              onClick={() => navigate('/map')}
              aria-label="View Map"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 2L3 6v14l6-4 6 4 6-4V2l-6 4-6-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 6v14M15 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>View Map</span>
            </button>

            {/* AI Assistant Button */}
            <button
              className="navbar__ai-btn navbar__ai-btn--desktop"
              onClick={() => setAiChatOpen(true)}
              aria-label="AI Assistant"
            >
              <span className="navbar__ai-pulse"></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>AI</span>
            </button>

            {/* Find Property → opens modal */}
            <a
              href="#find"
              className="navbar__cta navbar__cta--desktop"
              onClick={openModal}
            >
              Find Property
            </a>

            <button
              type="button"
              className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>

          <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
            <ul className="navbar__links navbar__links--mobile">
              {navLinks.map((link) => {
                const sectionId = link.href.replace('#', '');
                const isActive = link.external
                  ? onForums
                  : onListings ? sectionId === 'properties' : activeLink === sectionId;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                      onClick={(e) => handleLinkClick(e, link.href, link.external)}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            <button
              className={`navbar__map-btn navbar__map-btn--mobile ${onMap ? 'navbar__map-btn--active' : ''}`}
              onClick={() => { navigate('/map'); closeMenu(); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 2L3 6v14l6-4 6 4 6-4V2l-6 4-6-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 6v14M15 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>View Map</span>
            </button>
            <button
              className="navbar__ai-btn navbar__ai-btn--mobile"
              onClick={() => { setAiChatOpen(true); closeMenu(); }}
            >
              <span className="navbar__ai-pulse"></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>AI</span>
            </button>
            <a href="#find" className="navbar__cta" onClick={openModal}>
              Find Property
            </a>
          </div>
        </nav>
      </header>

      {/* Modal */}
      {modalOpen && <FindPropertyModal onClose={closeModal} />}

      {/* AI Chat */}
      <AIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
}

export default Navbar;
