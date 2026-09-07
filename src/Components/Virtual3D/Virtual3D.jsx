import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaStreetView, FaMapMarkerAlt, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import SiteNav from '../SiteNav/SiteNav';
import Footer from '../Footer/Footer';
import SEO from '../SEO/SEO';
import { seo } from '../../seo/seoConfig';
import { useReveal } from '../../utils/useReveal';
import { embedFor, embedFromUrl } from '../../utils/streetView';
import './Virtual3D.css';

// Landmark / block imagery (reused from the site's Bahria Town asset set)
import imgMosque from '../../Assets/images/background.jpeg';
import imgClock from '../../Assets/images/clocktower.jfif';
import imgTalwar from '../../Assets/images/talwar.png';
import imgEiffel from '../../Assets/images/eiffletower.png';
import imgCinema from '../../Assets/images/cinema.jpg';
import imgCarnival from '../../Assets/images/carnival.png';
import imgClub from '../../Assets/images/countryclub.jpg';
import imgSchool from '../../Assets/images/school.png';
import imgBg1 from '../../Assets/images/background1.jpg';
import imgBg2 from '../../Assets/images/background2.jpg';
import imgBg3 from '../../Assets/images/background3.jpeg';

/*
  Bahria Town Lahore blocks (from the backend BLOCK_CHOICES).
  Coordinates are approximate centres inside each block — good enough to drop
  Street View right in the neighbourhood. Fine-tune any `lat`/`lng` here, or
  paste a Google Street View share link into `streetViewUrl` to pin an exact spot.
*/
const BLOCKS = [
    {
        name: 'Grand Jamia Mosque',
        area: 'Central Landmark · Main Boulevard',
        tags: ['Landmark', 'Iconic', 'Must-See'],
        image: imgMosque,
        lat: 31.3676, lng: 74.1852,
        featured: true,
    },
    {
        name: 'Rafi Block',
        area: '5, 8 & 10 Marla · Residential',
        tags: ['Residential', 'Popular'],
        image: imgBg1,
        lat: 31.3639, lng: 74.1725,
    },
    {
        name: 'Johar Block',
        area: '5 & 10 Marla · Prime Residential',
        tags: ['Residential', 'Prime'],
        image: imgBg2,
        lat: 31.3606, lng: 74.1783,
    },
    {
        name: 'Shershah Block',
        area: 'Commercial & Residential Mix',
        tags: ['Commercial', 'Central'],
        image: imgClub,
        lat: 31.3661, lng: 74.1699,
    },
    {
        name: 'Nishtar Block',
        area: '10 Marla & 1 Kanal · Residential',
        tags: ['Residential', 'Spacious'],
        image: imgBg3,
        lat: 31.3583, lng: 74.1811,
    },
    {
        name: 'Tauheed Block',
        area: 'Near Clock Tower · Premium',
        tags: ['Premium', 'Iconic'],
        image: imgClock,
        lat: 31.3670, lng: 74.1770,
    },
    {
        name: 'Umar Block',
        area: 'Near Raiha CineGold · Lifestyle',
        tags: ['Lifestyle', 'Modern'],
        image: imgCinema,
        lat: 31.3625, lng: 74.1758,
    },
    {
        name: 'Sikandar Block',
        area: 'Near Sports Complex · Residential',
        tags: ['Sports', 'Family'],
        image: imgBg1,
        lat: 31.3600, lng: 74.1740,
    },
    {
        name: 'Quaid Block',
        area: 'Near Talwar Chowk · Prime',
        tags: ['Iconic', 'Prime'],
        image: imgTalwar,
        lat: 31.3690, lng: 74.1810,
    },
    {
        name: 'Ghaznavi Block',
        area: 'Near Eiffel Tower · Premium',
        tags: ['Premium', 'Iconic'],
        image: imgEiffel,
        lat: 31.3720, lng: 74.1830,
    },
    {
        name: 'Ghazi Block',
        area: 'Near Winterland & Carnival',
        tags: ['Family', 'Entertainment'],
        image: imgCarnival,
        lat: 31.3740, lng: 74.1795,
    },
    {
        name: 'Hussain Block',
        area: 'Central · Residential',
        tags: ['Residential', 'Central'],
        image: imgBg2,
        lat: 31.3655, lng: 74.1850,
    },
    {
        name: 'New Shaheen Block',
        area: '5 & 10 Marla · Residential',
        tags: ['Residential', 'Growing'],
        image: imgBg3,
        lat: 31.3550, lng: 74.1680,
    },
    {
        name: 'Talha Block',
        area: '5 Marla · Affordable Living',
        tags: ['Affordable', 'Residential'],
        image: imgBg1,
        lat: 31.3560, lng: 74.1760,
    },
    {
        name: 'Janiper Block',
        area: '10 Marla · Residential',
        tags: ['Residential', 'Quiet'],
        image: imgBg2,
        lat: 31.3690, lng: 74.1750,
    },
    {
        name: 'Tulip Block',
        area: '5 & 8 Marla · Residential',
        tags: ['Residential', 'Popular'],
        image: imgBg3,
        lat: 31.3600, lng: 74.1680,
    },
    {
        name: 'Jasmine Block',
        area: 'Near School & College · Family',
        tags: ['Family', 'Education'],
        image: imgSchool,
        lat: 31.3580, lng: 74.1720,
    },
    {
        name: 'Safari Villas',
        area: 'Near Golf & Country Club · Luxury',
        tags: ['Luxury', 'Villas'],
        image: imgClub,
        lat: 31.3520, lng: 74.1850,
    },
    {
        name: 'Overseas A',
        area: 'Overseas Enclave · Premium',
        tags: ['Premium', 'Overseas'],
        image: imgCinema,
        lat: 31.3760, lng: 74.1870,
    },
    {
        name: 'BB Block',
        area: 'Residential · Developing',
        tags: ['Residential', 'Developing'],
        image: imgBg1,
        lat: 31.3500, lng: 74.1900,
    },
];

function StreetViewModal({ block, onClose }) {
    const [loaded, setLoaded] = useState(false);

    const embedUrl = embedFromUrl(block.streetViewUrl) || embedFor(block.lat, block.lng);
    const gmapsUrl = `https://www.google.com/maps/@${block.lat},${block.lng},18z/data=!3m1!1e3`;

    // Close on Escape + lock page scroll while open.
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return createPortal(
        <div className="v3d-fs">
            <iframe
                title={`Street View — ${block.name}`}
                className="v3d-fs__pano"
                src={embedUrl}
                allowFullScreen
                loading="lazy"
                onLoad={() => setLoaded(true)}
            />

            <div className="v3d-fs__label">
                <FaMapMarkerAlt size={13} /> {block.name}
            </div>

            <button
                className="v3d-fs__close"
                onClick={onClose}
                title="Close (Esc)"
                aria-label="Close Street View"
            >
                <FaTimes size={20} />
            </button>

            {!loaded && (
                <div className="v3d-fs__overlay">
                    <div className="v3d-fs__spinner" />
                    <p>Loading 360° Street View…</p>
                </div>
            )}

            <div className="v3d-fs__hint">
                <span>📍 Drag to look around · click the arrows to walk down the street</span>
                <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt size={12} /> Open in Google Maps
                </a>
            </div>
        </div>,
        document.body
    );
}

function BlockCard({ block, index, onOpen }) {
    return (
        <button
            type="button"
            className={`v3d-card${block.featured ? ' v3d-card--featured' : ''}`}
            data-reveal="pop-scale"
            data-delay={index % 8}
            onClick={() => onOpen(block)}
        >
            <div className="v3d-card__media">
                <img
                    src={block.image}
                    alt={block.name}
                    className="v3d-card__img"
                    loading="lazy"
                    decoding="async"
                />
                <div className="v3d-card__overlay" />
                <span className="v3d-card__badge">
                    <FaStreetView size={12} /> 360°
                </span>
                {block.featured && (
                    <span className="v3d-card__ribbon">✦ Featured</span>
                )}
                <span className="v3d-card__play">
                    <FaStreetView size={22} />
                </span>
            </div>

            <div className="v3d-card__body">
                <h3 className="v3d-card__name">
                    <FaMapMarkerAlt size={14} /> {block.name}
                </h3>
                <p className="v3d-card__area">{block.area}</p>
                <div className="v3d-card__tags">
                    {block.tags.map((tag) => (
                        <span key={tag} className="v3d-card__tag">{tag}</span>
                    ))}
                </div>
                <span className="v3d-card__cta">
                    <FaStreetView size={14} /> Walk the Streets
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>
        </button>
    );
}

function Virtual3D() {
    const [active, setActive] = useState(null); // selected block or null
    const revealRef = useReveal();

    // Grand Mosque leads the expanding row and sits enlarged by default (at the
    // same size a card reaches on hover). Hover any of the 3 to expand it instead.
    const featured = BLOCKS.find((b) => b.featured);
    const rest = BLOCKS.filter((b) => !b.featured);
    const rowBlocks = [featured, ...rest.slice(0, 2)].filter(Boolean);
    const gridRest = rest.slice(2);

    return (
        <div className="v3d-page">
            <SEO {...seo.virtual3d} />
            <SiteNav />

            {/* ── Hero ── */}
            <header className="v3d-hero">
                <div className="v3d-hero__grid" aria-hidden="true" />
                <div className="v3d-hero__inner">
                    <div className="v3d-eyebrow">
                        <span className="v3d-eyebrow__pulse" />
                        <span>IMMERSIVE 360° EXPERIENCE</span>
                    </div>
                    <h1 className="v3d-hero__title">
                        Virtual <span className="v3d-hero__title-accent">3D</span> Street View
                    </h1>
                    <p className="v3d-hero__subtitle">
                        Take a walk through every block of Bahria Town Lahore without leaving your
                        seat. Pick a block below and step inside a live, interactive 360° street view.
                    </p>
                </div>
            </header>

            {/* ── Blocks ── */}
            <section className="v3d-section" ref={revealRef}>
                <div className="v3d-section__inner">
                    {/* Expanding row — Grand Mosque leads, enlarged by default.
                        Hover any of the 3 to enlarge it instead. */}
                    <div className="v3d-expand-row">
                        {rowBlocks.map((block, i) => (
                            <BlockCard key={block.name} block={block} index={i} onOpen={setActive} />
                        ))}
                    </div>

                    {/* Remaining blocks */}
                    <div className="v3d-grid">
                        {gridRest.map((block, i) => (
                            <BlockCard key={block.name} block={block} index={i + 3} onOpen={setActive} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            {active && <StreetViewModal block={active} onClose={() => setActive(null)} />}
        </div>
    );
}

export default Virtual3D;
