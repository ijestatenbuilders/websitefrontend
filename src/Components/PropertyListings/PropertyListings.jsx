import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import SEO from '../SEO/SEO';
import { seo } from '../../seo/seoConfig';
import SiteNav from '../SiteNav/SiteNav';
import Footer from '../Footer/Footer';
import ListingsParallax from './ListingsParallax';
import { prefersReducedMotion, getDeviceTier, isTouch } from '../../utils/perf';
import { fetchProperties, fetchFilterOptions } from '../../services/api';
import { FaMapMarkerAlt, FaPhone, FaRuler } from 'react-icons/fa';
import { VscSettingsCompact } from "react-icons/vsc";
import { bbcPlots } from '../../data/bbcPlots';
import dhaImg from '../../Assets/images/dha.jpg';
import etihadImg from '../../Assets/images/etihad.png';
import unionImg from '../../Assets/images/union.jpg';
import bahriaTownImg from '../../Assets/images/bahriamap.png';
import './PropertyListings.css';

gsap.registerPlugin(ScrollTrigger);

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
        view = 'properties',
    } = location.state || {};
    const isContactView = view === 'contact';

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
    const gridRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    /* Buttery-smooth inertial scrolling (Lenis), synced to GSAP's ticker +
       ScrollTrigger so the card-reveal batches stay perfectly in step.
       Gated to capable, non-touch hardware — phones and low-end laptops get
       the OS's own native inertial scroll, which is smoother than fighting it
       with a JS smooth-scroll (see the landing hero for the same reasoning). */
    useEffect(() => {
        if (prefersReducedMotion() || isTouch() || getDeviceTier() === 'low') return;
        const lenis = new Lenis({
            // lerp-based (not duration-based) interpolation gives that heavy,
            // continuously-gliding "parallax" feel of the home page rather than
            // snapping to the wheel. Lower = smoother/slower glide. Paired with a
            // sub-1 wheel multiplier so each notch travels less → never too fast.
            lerp: 0.07,
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
        });

        const onLenisScroll = () => ScrollTrigger.update();
        lenis.on('scroll', onLenisScroll);

        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off('scroll', onLenisScroll);
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        if (isContactView) return;
        fetchFilterOptions()
            .then(data => {
                setMarlaOptions(data.marlaOptions || []);
                setBlockOptions(data.blockOptions || []);
            })
            .catch(() => { setMarlaOptions([]); setBlockOptions([]); });
    }, [isContactView]);

    // Reset pill filter and price-seed flag whenever the search changes
    useEffect(() => {
        setActiveFilter('All');
        setBbcSizeFilter('All');
        priceSeeded.current = false;
    }, [mode, selected, propertyType, searchLocation, searchPriceMin, searchPriceMax]);

    // Load properties from API
    useEffect(() => {
        if (isContactView) {
            setLoading(false);
            setProperties([]);
            return;
        }
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
    }, [activeFilter, mode, propertyType, selected, searchLocation, marlaOptions, blockOptions, isContactView]);

    // Client-side price filter
    const filteredProperties = properties.filter(p => {
        const v = parsePriceLakhs(p.price);
        if (v === null || isNaN(v)) return true;
        return v >= priceRange[0] && v <= priceRange[1];
    });

    const isPriceFiltered = priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1];

    // GSAP ScrollTrigger — cinematic fade-up reveal for the cards as they enter.
    // useLayoutEffect (not useEffect) so the hidden initial state is committed
    // BEFORE the browser paints — otherwise the cards flash in fully-visible for
    // one frame and then jump to opacity:0, which reads as a flicker.
    useLayoutEffect(() => {
        if (loading || prefersReducedMotion()) return;
        const cards = gridRef.current?.querySelectorAll('.prop-card, .bbc-lcard');
        if (!cards || !cards.length) return;
        const ctx = gsap.context(() => {
            // will-change promotes each card to its own compositor layer up front
            // so the fade-up runs on the GPU without a layout/paint per frame.
            gsap.set(cards, { opacity: 0, y: 40, willChange: 'transform, opacity' });
            ScrollTrigger.batch(cards, {
                start: 'top 90%',
                once: true,
                onEnter: (batch) => gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    stagger: { each: 0.07, ease: 'power1.out' },
                    ease: 'power3.out',
                    overwrite: true,
                    // Drop the initial inline props (incl. will-change) once the
                    // card has settled, so CSS hover transforms take back over and
                    // we don't leave every card permanently layer-promoted.
                    clearProps: 'transform,opacity,willChange',
                }),
            });
        }, gridRef);
        ScrollTrigger.refresh();
        return () => ctx.revert();
    }, [loading, filteredProperties.length]);

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
        dharaya: 'DHA Lahore',
        etihadtown: 'Etihad Town Lahore',
        uniontown: 'Union Town Lahore',
    };

    const heroTitle = isContactView
        ? <>Contact <em>{selected}</em></>
        : isFromSearch
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

    const heroSubtitle = isContactView
        ? `Speak with our expert agents about ${selected}.`
        : isFromSearch
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

    // ── Determine current location for "Other Areas" filtering ──
    // Use searchLocation if available, otherwise default to showing all except Bahria
    const currentAreaLocation = searchLocation || 'bahriatown';

    return (
        <>
            <SEO
                title={`${selected || 'All'} Properties for Sale in Lahore | IJ Estate & Builders`}
                description={`Browse ${propertyType || 'residential and commercial'} properties in ${searchLocation || selected || 'Lahore'}. Find houses, apartments, plots, and commercial spaces with IJ Estate & Builders.`}
                keywords={`properties for sale ${searchLocation || selected || 'Lahore'}, ${propertyType || 'real estate'} ${searchLocation || selected || 'Lahore'}, buy property Pakistan, houses for sale, apartments Lahore`}
                canonicalUrl="/listings"
                structuredData={seo.listings.structuredData}
            />
            <div className="listings-page">
                <SiteNav />

                {/* ── Hero ── */}
                <div className="listings-hero">
                    {/* Cinematic floating 3D ambient objects (desktop, high-tier only) */}
                    <ListingsParallax />
                    <div className="listings-hero__mesh" aria-hidden="true" />
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
                        <span className="listings-hero__eyebrow">
                            <span className="listings-hero__eyebrow-pulse" />
                            CURATED LISTINGS
                        </span>
                        <h1 className="listings-hero__title">{heroTitle}</h1>
                        <p className="listings-hero__subtitle">{heroSubtitle}</p>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="listings-body">

                    {!isContactView && <>
                        {/* ── Toolbar (filters + price range) ── */}
                        <div className="listings-toolbar">
                            <div className="listings-toolbar__pills">
                                {pills.map((pill) => (
                                    <button
                                        key={pill}
                                        type="button"
                                        className={`listings-pill ${activeFilter === pill ? 'listings-pill--active' : ''}`}
                                        onClick={() => setActiveFilter(pill)}
                                    >
                                        {pill}
                                    </button>
                                ))}
                            </div>
                            <PriceRangeSlider
                                min={priceBounds[0]}
                                max={priceBounds[1]}
                                values={priceRange}
                                onChange={setPriceRange}
                            />
                        </div>

                        {/* ── Grid ── */}
                        {loading ? (
                            <div className="listings-loading">
                                <div className="listings-loading__spinner" />
                                <p>Loading properties...</p>
                            </div>
                        ) : error ? (
                            <div className="listings-error">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        ) : filteredProperties.length === 0 && (!isCommercial || filteredBbcPlots.length === 0) ? (
                            <div className="listings-empty">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="listings-empty__title">No properties found</p>
                                <p className="listings-empty__subtitle">
                                    Try adjusting your filters or{' '}
                                    {isPriceFiltered && (
                                        <button
                                            type="button"
                                            className="listings-empty__reset"
                                            onClick={() => setPriceRange(priceBounds)}
                                        >
                                            reset your price range
                                        </button>
                                    )}
                                    {!isPriceFiltered && activeFilter !== 'All' && (
                                        <button
                                            type="button"
                                            className="listings-empty__reset"
                                            onClick={() => setActiveFilter('All')}
                                        >
                                            clear your filters
                                        </button>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Property Cards Grid */}
                                <div className="listings-grid" ref={gridRef}>
                                    {filteredProperties.map((prop) => (
                                        <PropertyCard key={prop.id} property={prop} />
                                    ))}
                                    {isCommercial && filteredBbcPlots.map((plot, i) => (
                                        <BbcPlotCard
                                            key={`bbc-${i}`}
                                            plot={plot}
                                            onContact={() => navigate('/business-bay-commercial')}
                                        />
                                    ))}
                                </div>

                                {/* BBC Size Filter Pills (only for Commercial) */}
                                {isCommercial && bbcPlots.length > 0 && (
                                    <div className="listings-bbc-filter">
                                        <div className="listings-bbc-filter__label">
                                            <VscSettingsCompact size={18} />
                                            Business Bay Commercial
                                        </div>
                                        <div className="listings-bbc-filter__pills">
                                            {['All', '3.5 Marla', '4 Marla', '5 Marla', '8 Marla'].map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    className={`listings-pill ${bbcSizeFilter === size ? 'listings-pill--active' : ''}`}
                                                    onClick={() => setBbcSizeFilter(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                    </>}

                    {/* ── Contact Section ── */}
                    {isContactView && <div className="listings-contact-section">
                        <div className="listings-contact-hero">
                            <div className="listings-contact-hero__icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="url(#phone-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs>
                                        <linearGradient id="phone-grad" x1="3" y1="3" x2="21" y2="21">
                                            <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="listings-contact-hero__title">
                                Get in Touch with Our Expert Agents
                            </h2>
                            <p className="listings-contact-hero__subtitle">
                                Interested in {selected}? Our experienced real estate consultants are ready to help you find your perfect property.
                            </p>
                        </div>

                        <div className="listings-contact-cards">
                            <div className="listings-contact-card">
                                <div className="listings-contact-card__icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="listings-contact-card__title">Call Us Directly</h3>
                                <p className="listings-contact-card__subtitle">Speak with our agents now</p>
                                <div className="listings-contact-card__numbers">
                                    <a href="tel:+923219607863" className="listings-contact-card__number">
                                        <FaPhone size={14} />
                                        +92 321 9607863
                                    </a>
                                    <a href="tel:+923214340004" className="listings-contact-card__number">
                                        <FaPhone size={14} />
                                        +92 321 4340004
                                    </a>
                                </div>
                            </div>

                            <div className="listings-contact-card">
                                <div className="listings-contact-card__icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="listings-contact-card__title">Visit Our Office</h3>
                                <p className="listings-contact-card__subtitle">Meet us in person</p>
                                <div className="listings-contact-card__address">
                                    <FaMapMarkerAlt size={14} />
                                    <p>Tulip Block Sector C, 257 Commercial Zone, 2nd Floor, Bahria Town Lahore</p>
                                </div>
                                <p className="listings-contact-card__hours">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Mon - Sun: 10:00 AM - 10:00 PM
                                </p>
                            </div>

                            <div className="listings-contact-card">
                                <div className="listings-contact-card__icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="listings-contact-card__title">Send an Email</h3>
                                <p className="listings-contact-card__subtitle">Get a detailed response</p>
                                <div className="listings-contact-card__emails">
                                    <a href="mailto:ijestateandbuilders@gmail.com" className="listings-contact-card__email">
                                        ijestateandbuilders@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="listings-contact-cta">
                            <p className="listings-contact-cta__text">
                                Our consultants specialize in {isCommercial ? 'commercial' : 'residential'} properties and can provide personalized recommendations based on your requirements.
                            </p>
                            <button
                                type="button"
                                className="listings-contact-cta__btn"
                                onClick={() => navigate('/contact')}
                            >
                                Fill Contact Form
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>}

                    {/* ── Our Other Areas Section ── */}
                    <div className="listings-other-areas">
                        <div className="listings-other-areas__header">
                            <h2 className="listings-other-areas__title">Explore Other Areas</h2>
                            <p className="listings-other-areas__subtitle">
                                Discover premium properties in Lahore's most sought-after locations
                            </p>
                        </div>

                        <div className="listings-other-areas__grid">
                            {/* Show different areas based on current location */}
                            {currentAreaLocation !== 'bahriatown' && (
                                <div
                                    className="area-card"
                                    onClick={() => navigate('/', { state: { scrollTo: 'hero' } })}
                                >
                                    <div className="area-card__image-wrapper">
                                        <img src={bahriaTownImg} alt="Bahria Town Lahore" className="area-card__image" />
                                        <div className="area-card__overlay" />
                                    </div>
                                    <div className="area-card__content">
                                        <h3 className="area-card__name">Bahria Town</h3>
                                        <p className="area-card__location">Lahore</p>
                                    </div>
                                </div>
                            )}

                            {currentAreaLocation !== 'dharaya' && (
                                <div
                                    className="area-card"
                                    onClick={() => navigate('/', { state: { scrollTo: 'hero' } })}
                                >
                                    <div className="area-card__image-wrapper">
                                        <img src={dhaImg} alt="DHA Raya Lahore" className="area-card__image" />
                                        <div className="area-card__overlay" />
                                    </div>
                                    <div className="area-card__content">
                                        <h3 className="area-card__name">DHA Raya</h3>
                                        <p className="area-card__location">Lahore</p>
                                    </div>
                                </div>
                            )}

                            {currentAreaLocation !== 'etihadtown' && (
                                <div
                                    className="area-card"
                                    onClick={() => navigate('/', { state: { scrollTo: 'hero' } })}
                                >
                                    <div className="area-card__image-wrapper">
                                        <img src={etihadImg} alt="Etihad Town Lahore" className="area-card__image" />
                                        <div className="area-card__overlay" />
                                    </div>
                                    <div className="area-card__content">
                                        <h3 className="area-card__name">Etihad Town</h3>
                                        <p className="area-card__location">Lahore</p>
                                    </div>
                                </div>
                            )}

                            {currentAreaLocation !== 'uniontown' && (
                                <div
                                    className="area-card"
                                    onClick={() => navigate('/', { state: { scrollTo: 'hero' } })}
                                >
                                    <div className="area-card__image-wrapper">
                                        <img src={unionImg} alt="Union Town Lahore" className="area-card__image" />
                                        <div className="area-card__overlay" />
                                    </div>
                                    <div className="area-card__content">
                                        <h3 className="area-card__name">Union Town</h3>
                                        <p className="area-card__location">Lahore</p>
                                    </div>
                                </div>
                            )}
                        </div>
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
                <img src={imgSrc} alt={property.name} className="prop-card__img" loading="lazy" decoding="async" />
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


