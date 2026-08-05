import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaTimes, FaBuilding, FaRuler } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import './BusinessBayCommercial.css';
import { bbcPlots, bbcUniqueSizes } from '../../data/bbcPlots';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function BusinessBayCommercial() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [contactOpen, setContactOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('All');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProjectData();
    }, [slug]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            // Use the slug from URL or default to 'business-bay-commercial'
            const projectSlug = slug || 'business-bay-commercial';
            const response = await fetch(`${API_URL}/api/projects/${projectSlug}/`);

            if (!response.ok) {
                throw new Error('Project not found');
            }

            const data = await response.json();
            setProject(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard nav for lightbox
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setContactOpen(false);
                setLightboxOpen(false);
            }
            if (e.key === 'ArrowRight' && lightboxOpen) nextLightbox();
            if (e.key === 'ArrowLeft' && lightboxOpen) prevLightbox();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const prevSlide = () => setActiveSlide(i => (i === 0 ? getAllImages().length - 1 : i - 1));
    const nextSlide = () => setActiveSlide(i => (i === getAllImages().length - 1 ? 0 : i + 1));
    const openLightbox = (i) => { setLightboxIndex(i); setLightboxOpen(true); };
    const prevLightbox = () => setLightboxIndex(i => (i === 0 ? getAllImages().length - 1 : i - 1));
    const nextLightbox = () => setLightboxIndex(i => (i === getAllImages().length - 1 ? 0 : i + 1));

    // Get all images (featured + gallery)
    const getAllImages = () => {
        if (!project) return [];
        const images = [];
        if (project.featured_image) {
            images.push(project.featured_image);
        }
        if (project.images && project.images.length > 0) {
            images.push(...project.images.map(img => img.image));
        }
        return images;
    };

    // Filter plots based on selected size
    const filteredPlots = selectedSize === 'All'
        ? bbcPlots
        : bbcPlots.filter(plot => plot.size === selectedSize);

    // Get unique sizes for filter buttons
    const uniqueSizes = bbcUniqueSizes;

    // Get location display name
    const getLocationDisplay = (locationCode) => {
        const locations = {
            'bahriatown': 'Bahria Town Lahore',
            'dharaya': 'DHA Raya Lahore',
            'etihadtown': 'Etihad Town Lahore',
            'uniontown': 'Union Town Lahore',
        };
        return locations[locationCode] || locationCode;
    };

    if (loading) {
        return (
            <div className="bbc-page">
                <Navbar />
                <div className="bbc-loading">
                    <div className="bbc-loading__spinner"></div>
                    <p>Loading project details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="bbc-page">
                <Navbar />
                <div className="bbc-error">
                    <h2>Project Not Found</h2>
                    <p>{error || 'The requested project could not be found.'}</p>
                    <button onClick={() => navigate('/')} className="bbc-error__btn">
                        Go to Homepage
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const allImages = getAllImages();
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(getLocationDisplay(project.location))}`;

    return (
        <div className="bbc-page">
            <Navbar />

            {/* ── Breadcrumb ── */}
            <div className="bbc-breadcrumb">
                <div className="bbc-breadcrumb__inner">
                    <button onClick={() => navigate(-1)} className="bbc-breadcrumb__back">
                        <FaChevronLeft size={12} /> Back
                    </button>
                    <span className="bbc-breadcrumb__sep">›</span>
                    <button className="bbc-breadcrumb__link" onClick={() => navigate('/')}>Home</button>
                    <span className="bbc-breadcrumb__sep">›</span>
                    <button className="bbc-breadcrumb__link" onClick={() => navigate('/#new')}>New Projects</button>
                    <span className="bbc-breadcrumb__sep">›</span>
                    <span className="bbc-breadcrumb__current">{project.title}</span>
                </div>
            </div>

            <div className="bbc-layout">

                {/* ── LEFT COLUMN ── */}
                <div className="bbc-left">

                    {/* Image slider */}
                    {allImages.length > 0 && (
                        <div className="bbc-slider">
                            <div className="bbc-slider__main" onClick={() => openLightbox(activeSlide)}>
                                <img
                                    src={allImages[activeSlide]}
                                    alt={`${project.title} — ${activeSlide + 1}`}
                                    className="bbc-slider__img"
                                />
                                {project.status === 'launched' && <span className="bbc-slider__badge">New Launch</span>}
                                {project.status === 'upcoming' && <span className="bbc-slider__badge">Coming Soon</span>}
                                <span className="bbc-slider__type">Commercial</span>
                                {allImages.length > 1 && (
                                    <>
                                        <button className="bbc-slider__arrow bbc-slider__arrow--prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                            <FaChevronLeft />
                                        </button>
                                        <button className="bbc-slider__arrow bbc-slider__arrow--next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                            <FaChevronRight />
                                        </button>
                                        <div className="bbc-slider__counter">{activeSlide + 1} / {allImages.length}</div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="bbc-slider__thumbs">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            className={`bbc-slider__thumb ${i === activeSlide ? 'bbc-slider__thumb--active' : ''}`}
                                            onClick={() => setActiveSlide(i)}
                                        >
                                            <img src={img} alt={`Thumbnail ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="bbc-section bbc-description">
                        <h2 className="bbc-section__title">About This Project</h2>
                        <p className="bbc-description__text">{project.description}</p>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="bbc-right">

                    {/* Title card */}
                    <div className="bbc-card bbc-title-card">
                        <h1 className="bbc-title-card__name">{project.title}</h1>
                        <div className="bbc-title-card__meta">
                            <span className="bbc-title-card__meta-item">
                                <FaMapMarkerAlt size={13} />
                                {getLocationDisplay(project.location)}
                            </span>
                            <span className="bbc-title-card__meta-item">
                                <FaBuilding size={13} />
                                {project.status === 'launched' ? 'New Launch' : project.status === 'upcoming' ? 'Coming Soon' : 'Available'}
                            </span>
                        </div>
                    </div>

                    {/* Map card */}
                    <div className="bbc-card bbc-map-card">
                        <h3 className="bbc-map-card__title">
                            <MdLocationOn size={18} /> Location
                        </h3>
                        <p className="bbc-map-card__address">{getLocationDisplay(project.location)}, Punjab, Pakistan</p>
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bbc-map-card__btn"
                        >
                            <FaMapMarkerAlt size={14} /> View on Google Maps
                        </a>
                    </div>

                    {/* Contact card */}
                    <div className="bbc-card bbc-contact-card">
                        <h3 className="bbc-contact-card__title">Interested in this project?</h3>
                        <p className="bbc-contact-card__sub">Our agents are ready to help you.</p>
                        <button
                            className="bbc-contact-card__btn"
                            onClick={() => setContactOpen(true)}
                        >
                            <FaPhone size={14} /> Contact Us
                        </button>
                    </div>

                    {/* Available Sizes Card */}
                    <div className="bbc-card bbc-sizes-card">
                        <h3 className="bbc-sizes-card__title">Available Plot Sizes</h3>
                        <div className="bbc-sizes__grid">
                            {uniqueSizes.map((size) => (
                                <button
                                    key={size}
                                    className={`bbc-size-btn ${selectedSize === size ? 'bbc-size-btn--selected' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    <span className="bbc-size-btn__label">{size}</span>
                                    <span className="bbc-size-btn__status">Available</span>
                                </button>
                            ))}
                        </div>
                        {selectedSize && (
                            <p className="bbc-sizes__note">
                                {selectedSize === 'All' ? 'Showing all available plots' : `Showing ${selectedSize} plots`}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FULL WIDTH PLOT CARDS SECTION ── */}
            <div className="bbc-full-width-section">
                {/* Available Plots Section */}
                <div className="bbc-plots-section">
                    <div className="bbc-plots-header">
                        <h2 className="bbc-plots-title">Available Commercial Plots</h2>
                        <p className="bbc-plots-subtitle">
                            Showing <strong>{filteredPlots.length}</strong> {filteredPlots.length === 1 ? 'plot' : 'plots'}
                            {selectedSize !== 'All' && <> for <strong>{selectedSize}</strong></>}
                        </p>
                    </div>

                    {/* Size Filter Pills */}
                    <div className="bbc-filter-pills">
                        {uniqueSizes.map(size => (
                            <button
                                key={size}
                                className={`bbc-filter-pill ${selectedSize === size ? 'bbc-filter-pill--active' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Plots Grid */}
                    <div className="bbc-plots-grid">
                        {filteredPlots.map(plot => (
                            <div key={plot.id} className="bbc-plot-card">
                                {plot.badge && <span className="bbc-plot-card__badge">{plot.badge}</span>}
                                <div className="bbc-plot-card__image">
                                    <img src={plot.image} alt={`${plot.size} plot`} />
                                    <div className="bbc-plot-card__image-overlay">
                                        <FaRuler size={24} />
                                    </div>
                                </div>
                                <div className="bbc-plot-card__header">
                                    <div className="bbc-plot-card__size">
                                        <FaRuler size={18} />
                                        <span>{plot.size}</span>
                                    </div>
                                    <div className="bbc-plot-card__price">{plot.price}</div>
                                </div>
                                <div className="bbc-plot-card__features">
                                    {plot.features.map((feature, idx) => (
                                        <span key={idx} className="bbc-plot-card__feature">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    className="bbc-plot-card__btn"
                                    onClick={() => setContactOpen(true)}
                                >
                                    <FaPhone size={13} />
                                    Contact for Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredPlots.length === 0 && (
                        <div className="bbc-plots-empty">
                            <p>No plots available for the selected size.</p>
                        </div>
                    )}
                </div>

                {/* Explore More Commercials Button */}
                <div className="bbc-more-commercials">
                    <button
                        className="bbc-more-commercials__btn"
                        onClick={() => navigate('/#new')}
                    >
                        <span className="bbc-more-commercials__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span className="bbc-more-commercials__content">
                            <span className="bbc-more-commercials__label">Explore More</span>
                            <span className="bbc-more-commercials__title">Commercial Projects</span>
                        </span>
                        <span className="bbc-more-commercials__arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>

            <Footer />

            {/* ── Contact Modal ── */}
            {contactOpen && (
                <div className="bbc-modal-backdrop" onClick={() => setContactOpen(false)}>
                    <div className="bbc-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="bbc-modal__close" onClick={() => setContactOpen(false)}>
                            <FaTimes />
                        </button>

                        <div className="bbc-modal__icon-wrap">
                            <FaBuilding size={28} className="bbc-modal__icon" />
                        </div>

                        <h2 className="bbc-modal__title">Contact Us</h2>

                        <div className="bbc-modal__contacts">
                            <a href="tel:+923001234567" className="bbc-modal__contact-item">
                                <span className="bbc-modal__contact-icon"><FaPhone size={16} /></span>
                                <div>
                                    <p className="bbc-modal__contact-label">Phone 1</p>
                                    <p className="bbc-modal__contact-value">+92 300 123 4567</p>
                                </div>
                            </a>
                            <a href="tel:+923211234567" className="bbc-modal__contact-item">
                                <span className="bbc-modal__contact-icon"><FaPhone size={16} /></span>
                                <div>
                                    <p className="bbc-modal__contact-label">Phone 2</p>
                                    <p className="bbc-modal__contact-value">+92 321 123 4567</p>
                                </div>
                            </a>
                            <a href="mailto:info@ijestate.com" className="bbc-modal__contact-item">
                                <span className="bbc-modal__contact-icon"><FaEnvelope size={16} /></span>
                                <div>
                                    <p className="bbc-modal__contact-label">Email</p>
                                    <p className="bbc-modal__contact-value">info@ijestate.com</p>
                                </div>
                            </a>
                        </div>

                        <p className="bbc-modal__footer">Available Mon – Sat, 9 AM to 7 PM</p>
                    </div>
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxOpen && allImages.length > 0 && (
                <div className="bbc-lightbox" onClick={() => setLightboxOpen(false)}>
                    <button className="bbc-lightbox__close" onClick={() => setLightboxOpen(false)}>
                        <FaTimes />
                    </button>
                    {allImages.length > 1 && (
                        <>
                            <button className="bbc-lightbox__arrow bbc-lightbox__arrow--prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
                                <FaChevronLeft />
                            </button>
                            <button className="bbc-lightbox__arrow bbc-lightbox__arrow--next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
                                <FaChevronRight />
                            </button>
                        </>
                    )}
                    <img
                        src={allImages[lightboxIndex]}
                        alt={`Lightbox ${lightboxIndex + 1}`}
                        className="bbc-lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="bbc-lightbox__counter">{lightboxIndex + 1} / {allImages.length}</p>
                </div>
            )}
        </div>
    );
}

export default BusinessBayCommercial;

return (
    <div className="bbc-page">
        <Navbar />

        {/* ── Breadcrumb ── */}
        <div className="bbc-breadcrumb">
            <div className="bbc-breadcrumb__inner">
                <button onClick={() => navigate(-1)} className="bbc-breadcrumb__back">
                    <FaChevronLeft size={12} /> Back
                </button>
                <span className="bbc-breadcrumb__sep">›</span>
                <button className="bbc-breadcrumb__link" onClick={() => navigate('/')}>Home</button>
                <span className="bbc-breadcrumb__sep">›</span>
                <button className="bbc-breadcrumb__link" onClick={() => navigate('/#new')}>New Projects</button>
                <span className="bbc-breadcrumb__sep">›</span>
                <span className="bbc-breadcrumb__current">{commercialData.title}</span>
            </div>
        </div>

        <div className="bbc-layout">

            {/* ── LEFT COLUMN ── */}
            <div className="bbc-left">

                {/* Image slider */}
                <div className="bbc-slider">
                    <div className="bbc-slider__main" onClick={() => openLightbox(activeSlide)}>
                        <img
                            src={commercialData.images[activeSlide]}
                            alt={`${commercialData.title} — ${activeSlide + 1}`}
                            className="bbc-slider__img"
                        />
                        <span className="bbc-slider__badge">New Launch</span>
                        <span className="bbc-slider__type">Commercial</span>
                        <button className="bbc-slider__arrow bbc-slider__arrow--prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                            <FaChevronLeft />
                        </button>
                        <button className="bbc-slider__arrow bbc-slider__arrow--next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                            <FaChevronRight />
                        </button>
                        <div className="bbc-slider__counter">{activeSlide + 1} / {commercialData.images.length}</div>
                    </div>

                    {/* Thumbnails */}
                    <div className="bbc-slider__thumbs">
                        {commercialData.images.map((img, i) => (
                            <button
                                key={i}
                                className={`bbc-slider__thumb ${i === activeSlide ? 'bbc-slider__thumb--active' : ''}`}
                                onClick={() => setActiveSlide(i)}
                            >
                                <img src={img} alt={`Thumbnail ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="bbc-section bbc-description">
                    <h2 className="bbc-section__title">About This Project</h2>
                    <p className="bbc-description__text">{commercialData.description}</p>
                </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="bbc-right">

                {/* Title card */}
                <div className="bbc-card bbc-title-card">
                    <h1 className="bbc-title-card__name">{commercialData.title}</h1>
                    <div className="bbc-title-card__meta">
                        <span className="bbc-title-card__meta-item">
                            <FaMapMarkerAlt size={13} />
                            Bahria Town Lahore
                        </span>
                        <span className="bbc-title-card__meta-item">
                            <FaBuilding size={13} />
                            New Launch
                        </span>
                    </div>
                </div>

                {/* Map card */}
                <div className="bbc-card bbc-map-card">
                    <h3 className="bbc-map-card__title">
                        <MdLocationOn size={18} /> Location
                    </h3>
                    <p className="bbc-map-card__address">{commercialData.location}</p>
                    <a
                        href={commercialData.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bbc-map-card__btn"
                    >
                        <FaMapMarkerAlt size={14} /> View on Google Maps
                    </a>
                </div>

                {/* Contact card */}
                <div className="bbc-card bbc-contact-card">
                    <h3 className="bbc-contact-card__title">Interested in this project?</h3>
                    <p className="bbc-contact-card__sub">Our agents are ready to help you.</p>
                    <button
                        className="bbc-contact-card__btn"
                        onClick={() => setContactOpen(true)}
                    >
                        <FaPhone size={14} /> Contact Us
                    </button>
                </div>

                {/* Available Sizes Card */}
                <div className="bbc-card bbc-sizes-card">
                    <h3 className="bbc-sizes-card__title">Available Plot Sizes</h3>
                    <div className="bbc-sizes__grid">
                        {uniqueSizes.map((size) => (
                            <button
                                key={size}
                                className={`bbc-size-btn ${selectedSize === size ? 'bbc-size-btn--selected' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                <span className="bbc-size-btn__label">{size}</span>
                                <span className="bbc-size-btn__status">Available</span>
                            </button>
                        ))}
                    </div>
                    {selectedSize && (
                        <p className="bbc-sizes__note">
                            {selectedSize === 'All' ? 'Showing all available plots' : `Showing ${selectedSize} plots`}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* ── FULL WIDTH PLOT CARDS SECTION ── */}
        <div className="bbc-full-width-section">
            {/* Available Plots Section */}
            <div className="bbc-plots-section">
                <div className="bbc-plots-header">
                    <h2 className="bbc-plots-title">Available Commercial Plots</h2>
                    <p className="bbc-plots-subtitle">
                        Showing <strong>{filteredPlots.length}</strong> {filteredPlots.length === 1 ? 'plot' : 'plots'}
                        {selectedSize !== 'All' && <> for <strong>{selectedSize}</strong></>}
                    </p>
                </div>

                {/* Size Filter Pills */}
                <div className="bbc-filter-pills">
                    {uniqueSizes.map(size => (
                        <button
                            key={size}
                            className={`bbc-filter-pill ${selectedSize === size ? 'bbc-filter-pill--active' : ''}`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                {/* Plots Grid */}
                <div className="bbc-plots-grid">
                    {filteredPlots.map(plot => (
                        <div key={plot.id} className="bbc-plot-card">
                            {plot.badge && <span className="bbc-plot-card__badge">{plot.badge}</span>}
                            <div className="bbc-plot-card__image">
                                <img src={plot.image} alt={`${plot.size} plot`} />
                                <div className="bbc-plot-card__image-overlay">
                                    <FaRuler size={24} />
                                </div>
                            </div>
                            <div className="bbc-plot-card__header">
                                <div className="bbc-plot-card__size">
                                    <FaRuler size={18} />
                                    <span>{plot.size}</span>
                                </div>
                                <div className="bbc-plot-card__price">{plot.price}</div>
                            </div>
                            <div className="bbc-plot-card__features">
                                {plot.features.map((feature, idx) => (
                                    <span key={idx} className="bbc-plot-card__feature">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {feature}
                                    </span>
                                ))}
                            </div>
                            <button
                                className="bbc-plot-card__btn"
                                onClick={() => setContactOpen(true)}
                            >
                                <FaPhone size={13} />
                                Contact for Details
                            </button>
                        </div>
                    ))}
                </div>

                {filteredPlots.length === 0 && (
                    <div className="bbc-plots-empty">
                        <p>No plots available for the selected size.</p>
                    </div>
                )}
            </div>

            {/* Explore More Commercials Button */}
            <div className="bbc-more-commercials">
                <button
                    className="bbc-more-commercials__btn"
                    onClick={() => navigate('/#new')}
                >
                    <span className="bbc-more-commercials__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </span>
                    <span className="bbc-more-commercials__content">
                        <span className="bbc-more-commercials__label">Explore More</span>
                        <span className="bbc-more-commercials__title">Commercial Projects</span>
                    </span>
                    <span className="bbc-more-commercials__arrow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>

        <Footer />

        {/* ── Contact Modal ── */}
        {contactOpen && (
            <div className="bbc-modal-backdrop" onClick={() => setContactOpen(false)}>
                <div className="bbc-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="bbc-modal__close" onClick={() => setContactOpen(false)}>
                        <FaTimes />
                    </button>

                    <div className="bbc-modal__icon-wrap">
                        <FaBuilding size={28} className="bbc-modal__icon" />
                    </div>

                    <h2 className="bbc-modal__title">Contact Us</h2>

                    <div className="bbc-modal__contacts">
                        <a href="tel:+923001234567" className="bbc-modal__contact-item">
                            <span className="bbc-modal__contact-icon"><FaPhone size={16} /></span>
                            <div>
                                <p className="bbc-modal__contact-label">Phone 1</p>
                                <p className="bbc-modal__contact-value">+92 300 123 4567</p>
                            </div>
                        </a>
                        <a href="tel:+923211234567" className="bbc-modal__contact-item">
                            <span className="bbc-modal__contact-icon"><FaPhone size={16} /></span>
                            <div>
                                <p className="bbc-modal__contact-label">Phone 2</p>
                                <p className="bbc-modal__contact-value">+92 321 123 4567</p>
                            </div>
                        </a>
                        <a href="mailto:info@ijestate.com" className="bbc-modal__contact-item">
                            <span className="bbc-modal__contact-icon"><FaEnvelope size={16} /></span>
                            <div>
                                <p className="bbc-modal__contact-label">Email</p>
                                <p className="bbc-modal__contact-value">info@ijestate.com</p>
                            </div>
                        </a>
                    </div>

                    <p className="bbc-modal__footer">Available Mon – Sat, 9 AM to 7 PM</p>
                </div>
            </div>
        )}

        {/* ── Lightbox ── */}
        {lightboxOpen && (
            <div className="bbc-lightbox" onClick={() => setLightboxOpen(false)}>
                <button className="bbc-lightbox__close" onClick={() => setLightboxOpen(false)}>
                    <FaTimes />
                </button>
                <button className="bbc-lightbox__arrow bbc-lightbox__arrow--prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
                    <FaChevronLeft />
                </button>
                <img
                    src={commercialData.images[lightboxIndex]}
                    alt={`Lightbox ${lightboxIndex + 1}`}
                    className="bbc-lightbox__img"
                    onClick={(e) => e.stopPropagation()}
                />
                <button className="bbc-lightbox__arrow bbc-lightbox__arrow--next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
                    <FaChevronRight />
                </button>
                <p className="bbc-lightbox__counter">{lightboxIndex + 1} / {commercialData.images.length}</p>
            </div>
        )}
    </div>
);
}

export default BusinessBayCommercial;
