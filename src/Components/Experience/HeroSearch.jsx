import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HeroSearch — the exact home-page glass search bar, self-contained for the
 * Experience hero. Reuses the global `landing-page__search*` styles (CRA bundles
 * all CSS globally, so no import needed) and carries its own state + handlers.
 */
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
  anybudget: [0, 99999],
  '10lakh-1crore': [10, 100],
  '1crore-10crore': [100, 1000],
  '10crore+': [1000, 99999],
};

export default function HeroSearch({ onLocationSwitch }) {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchValues, setSearchValues] = useState({ type: 'all', location: 'bahriatown', price: 'anybudget' });
  const [searchError, setSearchError] = useState('');
  const [searchShake, setSearchShake] = useState(false);

  const toggleDropdown = (name) => setActiveDropdown((c) => (c === name ? null : name));
  const handleDropdownSelect = (name, value) => {
    setActiveDropdown(null);
    // Picking a different location fires the cinematic 3D location transition.
    if (name === 'location' && value !== searchValues.location && onLocationSwitch) {
      onLocationSwitch(value);
    }
    setSearchValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSearch = (propertyType) => {
    const type = propertyType.toLowerCase();
    const location = searchValues.location;
    navigate('/listings', {
      state: {
        mode: 'all',
        selected: locationOptions.find((o) => o.value === location)?.label ?? 'All',
        propertyType: type.charAt(0).toUpperCase() + type.slice(1),
        searchLocation: location,
        searchPriceMin: null, searchPriceMax: null, searchBudgetLabel: '',
      },
    });
  };

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
        selected: locationOptions.find((o) => o.value === location)?.label ?? 'All',
        propertyType: type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1),
        searchLocation: location,
        searchPriceMin: minP, searchPriceMax: maxP,
        searchBudgetLabel: priceOptions.find((o) => o.value === searchValues.price)?.label ?? '',
      },
    });
  };

  return (
    <div className={`landing-page__search ${searchShake ? 'landing-page__search--shake' : ''}`} style={{ margin: '1.1rem auto 0' }}>
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
        <button type="button" className="landing-page__search-tab landing-page__search-tab--active">
          <span className="tab-sparkle">✦</span>Find Premium Properties
        </button>
      </div>

      <div className="landing-page__search-bar">
        {/* Type */}
        <div className="landing-page__search-field landing-page__dropdown">
          <span className="landing-page__field-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="hg1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop stopColor="#38bdf8" /><stop offset="1" stopColor="#1e40af" /></linearGradient></defs>
            </svg>
          </span>
          <div className="landing-page__field-body">
            <span className="landing-page__field-label">Type</span>
            <button type="button" className="landing-page__dropdown-trigger" onClick={() => toggleDropdown('type')}>
              {typeOptions.find((o) => o.value === searchValues.type)?.label}
              <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className={`landing-page__dropdown-panel ${activeDropdown === 'type' ? 'landing-page__dropdown-panel--open' : ''}`}>
            {typeOptions.map((o) => (
              <button key={o.value} type="button" className={`landing-page__dropdown-option ${searchValues.type === o.value ? 'landing-page__dropdown-option--active' : ''}`} onClick={() => handleDropdownSelect('type', o.value)}>{o.label}</button>
            ))}
          </div>
        </div>

        <span className="landing-page__divider" />

        {/* Location */}
        <div className="landing-page__search-field landing-page__dropdown">
          <span className="landing-page__field-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
              <defs><linearGradient id="hg2" x1="6" y1="2" x2="18" y2="21" gradientUnits="userSpaceOnUse"><stop stopColor="#38bdf8" /><stop offset="1" stopColor="#1e40af" /></linearGradient></defs>
            </svg>
          </span>
          <div className="landing-page__field-body">
            <span className="landing-page__field-label">Location</span>
            <button type="button" className="landing-page__dropdown-trigger" onClick={() => toggleDropdown('location')}>
              {locationOptions.find((o) => o.value === searchValues.location)?.label ?? 'Choose location'}
              <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className={`landing-page__dropdown-panel ${activeDropdown === 'location' ? 'landing-page__dropdown-panel--open' : ''}`}>
            {locationOptions.map((o) => (
              <button key={o.value} type="button" className={`landing-page__dropdown-option ${searchValues.location === o.value ? 'landing-page__dropdown-option--active' : ''}`} onClick={() => handleDropdownSelect('location', o.value)}>{o.label}</button>
            ))}
          </div>
        </div>

        <span className="landing-page__divider" />

        {/* Price */}
        <div className="landing-page__search-field landing-page__dropdown">
          <span className="landing-page__field-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="url(#hg3)" strokeWidth="2" />
              <path d="M12 7v1m0 8v1m-3-5h4.5a1.5 1.5 0 010 3H9m0-3h3a1.5 1.5 0 000-3H9v3z" stroke="url(#hg3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="hg3" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" /></linearGradient></defs>
            </svg>
          </span>
          <div className="landing-page__field-body">
            <span className="landing-page__field-label">Budget</span>
            <button type="button" className="landing-page__dropdown-trigger" onClick={() => toggleDropdown('price')}>
              {searchValues.price ? priceOptions.find((o) => o.value === searchValues.price)?.label : 'Any budget'}
              <svg className="landing-page__chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className={`landing-page__dropdown-panel ${activeDropdown === 'price' ? 'landing-page__dropdown-panel--open' : ''}`}>
            {priceOptions.map((o) => (
              <button key={o.value} type="button" className={`landing-page__dropdown-option ${searchValues.price === o.value ? 'landing-page__dropdown-option--active' : ''}`} onClick={() => handleDropdownSelect('price', o.value)}>{o.label}</button>
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

      {/* Quick search */}
      <div className="landing-page__quick-search">
        <span className="landing-page__quick-label">Quick Search:</span>
        {[['house', 'Houses'], ['apartment', 'Apartments'], ['plot', 'Plots'], ['commercial', 'Commercial']].map(([val, label]) => (
          <button key={val} type="button" className="landing-page__quick-btn" onClick={() => handleQuickSearch(val)}>{label}</button>
        ))}
      </div>
    </div>
  );
}
