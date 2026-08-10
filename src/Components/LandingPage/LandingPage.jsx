import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import BrowseProperties from '../Properties/Properties';
import Upcoming from '../Upcoming/Upcoming';
import PopularAreas from '../PopularAreas/PopularAreas';
import Footer from '../Footer/Footer';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import LocationTransition from '../LocationTransition/LocationTransition';
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

// Budget option → [minLakhs, maxLakhs]
const PRICE_RANGE_MAP = {
  'anybudget': [0, 99999],
  '10lakh-1crore': [10, 100],
  '1crore-10crore': [100, 1000],
  '10crore+': [1000, 99999],
};

function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
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
      // Commit the new location value first
      setSearchValues((prev) => ({ ...prev, [name]: value }));

      // Start smooth pre-transition animation immediately
      setIsPreTransition(true);

      // After 2s pre-transition, kick off the location transition
      setTimeout(() => {
        setIsPreTransition(false);
        setIsTransitioning(true);

        // Update background during transition (at 2s into the logo animation)
        setTimeout(() => {
          setCurrentLocation(value);
        }, 2000);

        // Start post-transition reappear animation when logo starts returning (at 4.8s)
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
    // Validation — require a specific type and a specific budget
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

    // After 2.5s, remove post-transition class
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
      <SEO
        title="IJ Estate & Builders | Premium Properties in Lahore | DHA, Bahria Town"
        description="Find your dream property in Lahore with IJ Estate & Builders. Explore residential and commercial properties in DHA, Bahria Town, Etihad Town, and Union Town. Expert real estate services."
        keywords="real estate Lahore, properties for sale Lahore, DHA Lahore properties, Bahria Town Lahore, houses for sale, commercial properties Lahore, real estate agency Pakistan, property investment Lahore"
        canonicalUrl="/"
        structuredData={structuredData}
      />
      <div className={`landing-page${isPreTransition ? ' landing-page--pretransition' : ''}${isTransitioning ? ' landing-page--transitioning' : ''}${isPostTransition ? ' landing-page--posttransition' : ''}`}>
        <LocationTransition
          isActive={isTransitioning}
          isShaking={isPreTransition}
          onComplete={handleTransitionComplete}
        />

        {/* Blocks all interaction during shake and transition */}
        {isBlocked && <div className="landing-page__blocker" aria-hidden="true" />}

        <main className={`landing-page__hero landing-page__hero--${currentLocation} ${isTransitioning ? 'landing-page__hero--blurred' : ''}`} id="home">
          {/* Background image in its own clipped wrapper so the zoom
            animation never escapes the hero bounds, while dropdowns
            can still overflow freely above it.                        */}
          <div className="landing-page__hero-bg">
            <div className="landing-page__hero-bg-img" />
          </div>

          <Navbar variant="hero" />

          <div className="landing-page__hero-overlay" />

          <div className="landing-page__hero-content">
            <h1>Find The Perfect Place To Live</h1>
            {/* <p className="landing-page__hero-sub">
            Explore premium properties in Bahria Town Lahore and beyond
          </p> */}
          </div>

          <div className={`landing-page__search${searchShake ? ' landing-page__search--shake' : ''}`}>
            {/* Error toast */}
            {searchError && (
              <div className="landing-page__search-toast landing-page__search-toast--error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                {searchError}
              </div>
            )}
            {/* Sale / Rent / All tabs */}
            <div className="landing-page__search-tabs">
              {['Find Now'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`landing-page__search-tab landing-page__search-tab--active`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
              {/* <button type="button" className="landing-page__search-tab">Sale</button> */}
              {/* <button type="button" className="landing-page__search-tab">Rent</button> */}
            </div>

            {/* Unified pill bar */}
            <div className="landing-page__search-bar">

              {/* Type */}
              <div className="landing-page__search-field landing-page__dropdown">
                <span className="landing-page__field-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 21V12h6v9" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="g1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
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
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
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
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
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
                Search
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2" />
                </svg>
                Commercial
              </button>
            </div>
          </div>
        </main>

        <BrowseProperties currentLocation={currentLocation} />
        <Upcoming currentLocation={currentLocation} />
        <PopularAreas currentLocation={currentLocation} />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

export default LandingPage;
