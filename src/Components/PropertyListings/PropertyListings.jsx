import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../SEO/SEO';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { fetchProperties, fetchFilterOptions } from '../../services/api';
import { FaMapMarkerAlt, FaPhone, FaRuler } from 'react-icons/fa';
import { VscSettingsCompact } from "react-icons/vsc";
import { bbcPlots, bbcUniqueSizes } from '../../data/bbcPlots';
import './PropertyListings.css';

/* ═══════════════════════════════════════════════════════════
   PRICE UTILITIES
   Handles: "PKR 2.8 Crore", "PKR 85 Lakh", "PKR 1.5 Crore"
═══════════════════════════════════════════════════════════ */

/** Convert a price string to a plain number (in Lakhs for consistency) */
function parsePriceLakhs(str) {
    if (!str) return null;
    const s = str.toString().toLowerCase().replace(/,/g, '');
    const num = parseFloat(s.match(/[\d.]+/)?.[0] ?? '0');
    if (s.includes('crore')) return num * 100;   // 1 Crore = 100 Lakh
    if (s.includes('lakh')) return num;
    if (s.includes('arab')) return num * 10000;
    // bare number — assume already in Lakhs
    return num;
}

/** Format Lakhs back to display string */
function formatPrice(lakhs) {
    if (lakhs >= 100) {
        const crore = lakhs / 100;
        return `PKR ${crore % 1 === 0 ? crore : crore.toFixed(1)} Cr`;
    }
    return `PKR ${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)} Lakh`;
}

/** Build [min, max] from a property list */
function buildPriceBounds(properties) {
    const values = properties.map(p => parsePriceLakhs(p.price)).filter(v => v !== null && !isNaN(v));
    if (!values.length) return [0, 1000];
    return [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))];
}

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER IMAGE
═══════════════════════════════════════════════════════════ */
const placeholderImage = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#f1f5f9" />
    <rect x="80" y="80" width="1040" height="640" rx="24" fill="#e2e8f0" />
    <path d="M220 570c70-120 145-190 250-190 100 0 165 60 250 190" fill="#cbd5e1" />
    <circle cx="430" cy="330" r="95" fill="#94a3b8" />
    <text x="600" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#475569">No image available</text>
  </svg>
`);

function resolveImage(property) {
    return property.image || placeholderImage;
}

/* ═══════════════════════════════════════════════════════════
   DUAL-HANDLE PRICE RANGE SLIDER
═══════════════════════════════════════════════════════════ */
function PriceRangeSlider({ min, max, values, onChange }) {
    const trackRef = useRef(null);
    const dragging = useRef(null); // 'min' | 'max' | null

    const pct = (v) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));

    const valueFromEvent = useCallback((clientX) => {
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const raw = min + ratio * (max - min);
        // snap to nearest step, then clamp hard to [min, max]
        const step = max > 500 ? 25 : 5;
        return Math.min(max, Math.max(min, Math.round(raw / step) * step));
    }, [min, max]);

    const startDrag = (handle, e) => {
        e.preventDefault();
        dragging.current = handle;

        const move = (ev) => {
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const v = valueFromEvent(clientX);
            if (dragging.current === 'min') {
                onChange([Math.min(Math.max(v, min), values[1] - 5), values[1]]);
            } else {
                onChange([values[0], Math.max(Math.min(v, max), values[0] + 5)]);
            }
        };
        const up = () => {
            dragging.current = null;
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', up);
    };

    const leftPct = pct(values[0]);
    const rightPct = pct(values[1]);
    const isFiltered = values[0] > min || values[1] < max;

    return (
        <div className="prs">
            {/* Header row */}
            <div className="prs__header">
                <span className="prs__label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 9h.01M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Price Range
                </span>
                {isFiltered && (
                    <button
                        type="button"
                        className="prs__reset"
                        onClick={() => onChange([min, max])}
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Value display */}
            <div className="prs__values">
                <span className="prs__value prs__value--min">{formatPrice(values[0])}</span>
                <span className="prs__sep">—</span>
                <span className="prs__value prs__value--max">{formatPrice(values[1])}</span>
            </div>

            {/* Slider track */}
            <div className="prs__track-wrap" ref={trackRef}>
                {/* Background rail */}
                <div className="prs__rail" />

                {/* Filled range */}
                <div
                    className="prs__fill"
                    style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
                />

                {/* Min handle */}
                <div
                    className={`prs__thumb prs__thumb--min ${dragging.current === 'min' ? 'prs__thumb--active' : ''}`}
                    style={{ left: `${leftPct}%` }}
                    onMouseDown={(e) => startDrag('min', e)}
                    onTouchStart={(e) => startDrag('min', e)}
                    role="slider"
                    aria-label="Minimum price"
                    aria-valuemin={min}
                    aria-valuemax={values[1]}
                    aria-valuenow={values[0]}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        const step = max > 500 ? 25 : 5;
                        if (e.key === 'ArrowLeft') onChange([Math.max(min, values[0] - step), values[1]]);
                        if (e.key === 'ArrowRight') onChange([Math.min(values[0] + step, values[1] - step), values[1]]);
                    }}
                >
                    <div className="prs__thumb-inner" />
                </div>

                {/* Max handle */}
                <div
                    className={`prs__thumb prs__thumb--max ${dragging.current === 'max' ? 'prs__thumb--active' : ''}`}
                    style={{ left: `${rightPct}%` }}
                    onMouseDown={(e) => startDrag('max', e)}
                    onTouchStart={(e) => startDrag('max', e)}
                    role="slider"
                    aria-label="Maximum price"
                    aria-valuemin={values[0]}
                    aria-valuemax={max}
                    aria-valuenow={values[1]}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        const step = max > 500 ? 25 : 5;
                        if (e.key === 'ArrowLeft') onChange([values[0], Math.max(values[0] + step, values[1] - step)]);
                        if (e.key === 'ArrowRight') onChange([values[0], Math.min(max, values[1] + step)]);
                    }}
                >
                    <div className="prs__thumb-inner" />
                </div>
            </div>

            {/* Min / Max hint */}
            <div className="prs__bounds">
                <span>{formatPrice(min)}</span>
                <span>{formatPrice(max)}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
function PropertyListings() {
    const location = useLocation();
    const navigate = useNavigate();

    // State from browse-cards (existing flow) + new fields from hero search
    const {
        mode = 'all',
        selected = 'All',
        propertyType = 'All',
        searchLocation = null,
        searchPriceMin = null,
        searchPriceMax = null,
        searchBudgetLabel = '',
    } = location.state || {};

    const [properties, setProperties] = useState([]);
    const [marlaOptions, setMarlaOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [bbcSizeFilter, setBbcSizeFilter] = useState('All');

    // Price range state
    const [priceBounds, setPriceBounds] = useState([0, 1000]);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const priceSeeded = useRef(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        fetchFilterOptions()
            .then(data => {
                setMarlaOptions(data.marlaOptions || []);
                setBlockOptions(data.blockOptions || []);
            })
            .catch(() => { setMarlaOptions([]); setBlockOptions([]); });
    }, []);

    // Reset pill filter and price-seed flag whenever the search changes
    useEffect(() => {
        setActiveFilter('All');
        setBbcSizeFilter('All');
        priceSeeded.current = false;
    }, [mode, selected, propertyType, searchLocation, searchPriceMin, searchPriceMax]);

    // Load properties from API
    useEffect(() => {
        setLoading(true);
        setError('');
        const params = {};

        // Property type
        if (propertyType && propertyType !== 'All') params.type = propertyType;

        // Location — from hero search takes priority
        if (searchLocation) {
            params.location = searchLocation;
        }

        // Pill filter
        if (mode === 'all') {
            if (activeFilter !== 'All') {
                if (marlaOptions.includes(activeFilter)) params.marla = activeFilter;
                else if (blockOptions.includes(activeFilter)) params.block = activeFilter;
            }
        } else if (mode === 'size') {
            if (selected && selected !== 'All') params.marla = selected;
            if (activeFilter !== 'All') params.block = activeFilter;
        } else {
            if (selected && selected !== 'All') params.block = selected;
            if (activeFilter !== 'All') params.marla = activeFilter;
        }

        fetchProperties(params)
            .then(data => {
                const list = Array.isArray(data) ? data : data.results || [];
                setProperties(list);

                const bounds = buildPriceBounds(list);
                setPriceBounds(bounds);

                // Seed slider from hero search exactly once per navigation
                if (!priceSeeded.current) {
                    if (searchPriceMin !== null && searchPriceMax !== null) {
                        const lo = Math.max(bounds[0], searchPriceMin);
                        const hi = Math.min(bounds[1], searchPriceMax);
                        setPriceRange(lo <= hi ? [lo, hi] : bounds);
                    } else {
                        setPriceRange(bounds);
                    }
                    priceSeeded.current = true;
                } else {
                    // Re-clamp current range within the new bounds so handles never go outside
                    setPriceRange(prev => {
                        const lo = Math.min(Math.max(prev[0], bounds[0]), bounds[1]);
                        const hi = Math.max(Math.min(prev[1], bounds[1]), bounds[0]);
                        return lo <= hi ? [lo, hi] : bounds;
                    });
                }
            })
            .catch(() => {
                setProperties([]);
                setError('Unable to load properties from the backend right now.');
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter, mode, propertyType, selected, searchLocation, marlaOptions, blockOptions]);

    // Client-side price filter
    const filteredProperties = properties.filter(p => {
        const v = parsePriceLakhs(p.price);
        if (v === null || isNaN(v)) return true;
        return v >= priceRange[0] && v <= priceRange[1];
    });

    const isPriceFiltered = priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1];

    // BBC plots — only shown when Commercial type is explicitly selected
    const isCommercial = propertyType === 'Commercial';
    const filteredBbcPlots = bbcSizeFilter === 'All'
        ? bbcPlots
        : bbcPlots.filter(p => p.size === bbcSizeFilter);

    const basePills = mode === 'all'
        ? [...marlaOptions, ...blockOptions.filter(b => !marlaOptions.includes(b))]
        : mode === 'size' ? blockOptions : marlaOptions;
    const pills = basePills.includes('All') ? basePills : ['All', ...basePills];

    // ── Hero text ──────────────────────────────────────────
    // When arriving from the hero search bar, show richer context
    const isFromSearch = !!searchLocation;

    const LOCATION_LABELS = {
        bahriatown: 'Bahria Town Lahore',
        dharaya: 'DHA Raya Lahore',
        etihadtown: 'Etihad Town Lahore',
        uniontown: 'Union Town Lahore',
    };

    const heroTitle = isFromSearch
        ? <>
            {propertyType && propertyType !== 'All' ? <em>{propertyType}s</em> : 'Properties'}
            {' '}in{' '}
            <em>{LOCATION_LABELS[searchLocation] ?? searchLocation}</em>
        </>
        : mode === 'all'
            ? <>Properties — <em>{selected}</em></>
            : mode === 'size'
                ? <><em>{selected}</em> — Properties</>
                : <>Properties — <em>{selected}</em></>;

    const heroSubtitle = isFromSearch
        ? [
            propertyType && propertyType !== 'All' ? `${propertyType}s` : 'All properties',
            searchBudgetLabel && searchBudgetLabel !== 'Any Budget'
                ? ` · ${searchBudgetLabel}`
                : '',
            ` · ${LOCATION_LABELS[searchLocation] ?? searchLocation}`,
        ].join('')
        : mode === 'all'
            ? `Showing all ${propertyType && propertyType !== 'All' ? propertyType.toLowerCase() : 'available'} properties. Filter by size or block below.`
            : mode === 'size'
                ? `Showing ${propertyType && propertyType !== 'All' ? propertyType.toLowerCase() : 'available'} properties for ${selected}. Filter by block below.`
                : `Browsing ${selected} properties across all sizes. Filter by size below.`;

    return (
        <>
            <SEO
                title={`${selected || 'All'} Properties for Sale in Lahore | IJ Estate & Builders`}
                description={`Browse ${propertyType || 'residential and commercial'} properties in ${searchLocation || selected || 'Lahore'}. Find houses, apartments, plots, and commercial spaces with IJ Estate & Builders.`}
                keywords={`properties for sale ${searchLocation || selected || 'Lahore'}, ${propertyType || 'real estate'} ${searchLocation || selected || 'Lahore'}, buy property Pakistan, houses for sale, apartments Lahore`}
                canonicalUrl="/listings"
            />
            <div className="listings-page">
                <Navbar variant="listings" />

                {/* ── Hero ── */}
                <div className="listings-hero">
                    <div className="listings-hero__inner">
                        <button className="listings-hero__back" onClick={() => navigate(-1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back
                        </button>
                        <p className="listings-hero__breadcrumb">
                            <button className="listings-hero__breadcrumb-link" onClick={() => navigate('/')}>Home</button>
                            <span>›</span>
                            <button className="listings-hero__breadcrumb-link" onClick={() => { navigate('/'); setTimeout(() => { const el = document.getElementById('properties'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Properties</button>
                            <span>›</span>
                            <strong>
                                {isFromSearch
                                    ? (LOCATION_LABELS[searchLocation] ?? searchLocation)
                                    : selected}
                            </strong>
                        </p>
                        <h1 className="listings-hero__title">{heroTitle}</h1>
                        <p className="listings-hero__subtitle">{heroSubtitle}</p>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="listings-body">

                    {/* ── Filter pills ── */}
                    <div className="listings-filter">
                        <p className="listings-filter__label">
                            Filter <VscSettingsCompact className="settings-icon" size={16} />
                        </p>
                        <div className="listings-filter__pills">
                            {pills.map((pill) => (
                                <button
                                    key={pill}
                                    type="button"
                                    className={`listings-filter__pill ${activeFilter === pill ? 'listings-filter__pill--active' : ''}`}
                                    onClick={() => setActiveFilter(pill)}
                                >
                                    {pill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Price range slider ── */}
                    {!loading && properties.length > 0 && (
                        <PriceRangeSlider
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            values={priceRange}
                            onChange={setPriceRange}
                        />
                    )}

                    {/* ── Results count ── */}
                    <div className="listings-meta">
                        <p className="listings-meta__count">
                            {loading ? 'Loading properties…' : (
                                <>
                                    Showing <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'property' : 'properties'}
                                    {activeFilter !== 'All' && <> for <strong>{activeFilter}</strong></>}
                                    {isPriceFiltered && <> · <span style={{ color: '#1E90FF' }}>price filtered</span></>}
                                </>
                            )}
                        </p>
                    </div>

                    {error && !loading && (
                        <div className="listings-empty">
                            <div className="listings-empty__icon">⚠️</div>
                            <p className="listings-empty__text">{error}</p>
                        </div>
                    )}

                    {/* ── Cards grid ── */}
                    <div className="listings-grid">
                        {loading ? (
                            <div className="listings-empty">
                                <div className="listings-empty__icon">⏳</div>
                                <p className="listings-empty__text">Loading properties…</p>
                            </div>
                        ) : (
                            <>
                                {/* BBC plot cards first — only for Commercial */}
                                {isCommercial && filteredBbcPlots.map((plot) => (
                                    <BbcPlotCard
                                        key={plot.id}
                                        plot={plot}
                                        onContact={() => navigate('/commercial/business-bay')}
                                    />
                                ))}

                                {/* Backend property cards */}
                                {filteredProperties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}

                                {/* Empty state — only if no BBC cards AND no backend cards */}
                                {filteredProperties.length === 0 && !isCommercial && (
                                    <div className="listings-empty">
                                        <div className="listings-empty__icon">🏠</div>
                                        <p className="listings-empty__text">No properties found</p>
                                        <p className="listings-empty__sub">Try adjusting the price range or filter above.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   PROPERTY CARD
═══════════════════════════════════════════════════════════ */
function PropertyCard({ property }) {
    const navigate = useNavigate();
    const imgSrc = resolveImage(property);
    return (
        <div className="prop-card">
            <div className="prop-card__img-wrap">
                <img src={imgSrc} alt={property.name} className="prop-card__img" />
                {property.badge && <span className="prop-card__badge">{property.badge}</span>}
                <span className="prop-card__type-tag">{property.type}</span>
            </div>
            <div className="prop-card__body">
                <div className="prop-card__meta">
                    <FaMapMarkerAlt size={12} />
                    {property.block} · {property.marla}
                </div>
                <h3 className="prop-card__name">{property.name}</h3>
                <p className="prop-card__desc">{property.description}</p>
                <div className="prop-card__footer">
                    <div className="prop-card__price">{property.price}</div>
                    <button type="button" className="prop-card__btn" onClick={() => navigate(`/property/${property.id}`)}>
                        Check Property
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   BBC PLOT CARD (shown inline in Commercial listings)
   — exact same design as the BusinessBayCommercial detail page
═══════════════════════════════════════════════════════════ */
function BbcPlotCard({ plot, onContact }) {
    return (
        <div className="bbc-lcard">
            {/* image */}
            <div className="bbc-lcard__img-wrap">
                <img src={plot.image} alt={plot.size} className="bbc-lcard__img" />
                <div className="bbc-lcard__img-overlay">
                    <FaRuler size={22} />
                </div>
                {plot.badge && (
                    <span className="bbc-lcard__badge">{plot.badge}</span>
                )}
                <span className="bbc-lcard__source-tag">Business Bay</span>
            </div>

            {/* size + price */}
            <div className="bbc-lcard__header">
                <div className="bbc-lcard__size">
                    <FaRuler size={14} />
                    {plot.size}
                </div>
                <div className="bbc-lcard__price">{plot.price}</div>
            </div>

            {/* features */}
            <div className="bbc-lcard__features">
                {plot.features.map((f, i) => (
                    <span key={i} className="bbc-lcard__feature">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                    </span>
                ))}
            </div>

            {/* CTA */}
            <button className="bbc-lcard__btn" onClick={onContact}>
                <FaPhone size={12} />
                View Plot Details
            </button>
        </div>
    );
}

export default PropertyListings;
