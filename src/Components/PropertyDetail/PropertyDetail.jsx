import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProperty, submitEnquiry } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaTimes, FaHome, FaRuler, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import './PropertyDetail.css';

const placeholderImage = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#f8fafc" />
    <rect x="80" y="80" width="1040" height="640" rx="24" fill="#e2e8f0" />
    <path d="M220 570c70-120 145-190 250-190 100 0 165 60 250 190" fill="#cbd5e1" />
    <circle cx="430" cy="330" r="95" fill="#94a3b8" />
    <text x="600" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#475569">Property image unavailable</text>
  </svg>
`);

function resolveGallery(property) {
    const apiImages = (property.images || [])
        .map(img => (typeof img === 'string' ? img : img?.image))
        .filter(Boolean);

    if (apiImages.length) return apiImages;
    if (property.image) return [property.image];
    return [placeholderImage];
}

function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSlide, setActiveSlide] = useState(0);
    const [contactOpen, setContactOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Enquiry form state
    const [enquiry, setEnquiry] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Fetch property from API only
    useEffect(() => {
        setLoading(true);
        setError('');
        fetchProperty(id)
            .then(data => setProperty(data))
            .catch(() => {
                setProperty(null);
                setError('Unable to load property from the backend right now.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Keyboard nav for lightbox
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') { setContactOpen(false); setLightboxOpen(false); }
            if (e.key === 'ArrowRight' && lightboxOpen) nextLightbox();
            if (e.key === 'ArrowLeft' && lightboxOpen) prevLightbox();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const handleEnquiryChange = (e) => {
        setEnquiry(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!enquiry.name || !enquiry.phone) {
            setSubmitError('Name and phone number are required.');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        try {
            await submitEnquiry({ ...enquiry, property: property?.id || null });
            setSubmitted(true);
        } catch {
            setSubmitError('Failed to send. Please call us directly.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="pd-page">
                <Navbar />
                <div className="pd-notfound__inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading property…</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="pd-notfound">
                <Navbar />
                <div className="pd-notfound__inner">
                    <h2>{error || 'Property not found'}</h2>
                    <button onClick={() => navigate(-1)}>Go back</button>
                </div>
                <Footer />
            </div>
        );
    }

    // Resolve images using helper (handles API urls + local fallbacks)
    const images = resolveGallery(property);
    const hasMultiple = images.length > 1;

    // Normalise features — API returns { label }, local returns strings
    const features = (property.features || []).map(f => (typeof f === 'string' ? f : f.label));

    const prevSlide = () => setActiveSlide(i => (i === 0 ? images.length - 1 : i - 1));
    const nextSlide = () => setActiveSlide(i => (i === images.length - 1 ? 0 : i + 1));
    const openLightbox = (i) => { setLightboxIndex(i); setLightboxOpen(true); };
    const prevLightbox = () => setLightboxIndex(i => (i === 0 ? images.length - 1 : i - 1));
    const nextLightbox = () => setLightboxIndex(i => (i === images.length - 1 ? 0 : i + 1));

    return (
        <div className="pd-page">
            <Navbar />

            {/* ── Breadcrumb ── */}
            <div className="pd-breadcrumb">
                <div className="pd-breadcrumb__inner">
                    <button onClick={() => navigate(-1)} className="pd-breadcrumb__back">
                        <FaChevronLeft size={12} /> Back
                    </button>
                    <span className="pd-breadcrumb__sep">›</span>
                    <button className="pd-breadcrumb__link" onClick={() => navigate('/')}>Home</button>
                    <span className="pd-breadcrumb__sep">›</span>
                    <button className="pd-breadcrumb__link" onClick={() => navigate(-1)}>Properties</button>
                    <span className="pd-breadcrumb__sep">›</span>
                    <span className="pd-breadcrumb__current">{property.name}</span>
                </div>
            </div>

            <div className="pd-layout">

                {/* ── LEFT COLUMN ── */}
                <div className="pd-left">

                    {/* Image slider */}
                    <div className="pd-slider">
                        <div className="pd-slider__main" onClick={() => openLightbox(activeSlide)}>
                            <img
                                src={images[activeSlide]}
                                alt={`${property.name} — ${activeSlide + 1}`}
                                className="pd-slider__img"
                            />
                            {property.badge && (
                                <span className="pd-slider__badge">{property.badge}</span>
                            )}
                            <span className="pd-slider__type">{property.type}</span>
                            {hasMultiple && (
                                <>
                                    <button className="pd-slider__arrow pd-slider__arrow--prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                        <FaChevronLeft />
                                    </button>
                                    <button className="pd-slider__arrow pd-slider__arrow--next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                        <FaChevronRight />
                                    </button>
                                    <div className="pd-slider__counter">{activeSlide + 1} / {images.length}</div>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {hasMultiple && (
                            <div className="pd-slider__thumbs">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`pd-slider__thumb ${i === activeSlide ? 'pd-slider__thumb--active' : ''}`}
                                        onClick={() => setActiveSlide(i)}
                                    >
                                        <img src={img} alt={`Thumbnail ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title card */}
                    <div className="pd-card pd-title-card">
                        <h1 className="pd-title-card__name">{property.name}</h1>
                        <div className="pd-title-card__meta">
                            <span className="pd-title-card__meta-item">
                                <FaMapMarkerAlt size={13} />
                                {property.block}
                            </span>
                            <span className="pd-title-card__meta-item">
                                <FaRuler size={13} />
                                {property.marla}
                            </span>
                            <span className="pd-title-card__meta-item">
                                <FaHome size={13} />
                                {property.type}
                            </span>
                        </div>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                        <div className="pd-section pd-features">
                            <h2 className="pd-section__title">Key Features</h2>
                            <ul className="pd-features__list">
                                {features.map((f) => (
                                    <li key={f} className="pd-features__item">
                                        <span className="pd-features__dot" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Price card */}
                    <div className="pd-card pd-price-card">
                        <p className="pd-price-card__label">Listed Price</p>
                        <p className="pd-price-card__value">{property.price}</p>
                        <p className="pd-price-card__note">Price may vary — contact us for final quote</p>
                    </div>

                    {/* Contact card */}
                    <div className="pd-card pd-contact-card">
                        <h3 className="pd-contact-card__title">Interested in this property?</h3>
                        <p className="pd-contact-card__sub">We are ready to help you.</p>
                        <button
                            className="pd-contact-card__btn"
                            onClick={() => setContactOpen(true)}
                        >
                            <FaPhone size={14} /> Contact Us
                        </button>
                    </div>

                    {/* Map card */}
                    <div className="pd-card pd-map-card">
                        <h3 className="pd-map-card__title">
                            <MdLocationOn size={18} /> Location
                        </h3>
                        <p className="pd-map-card__address">
                            {property.block}, Bahria Town Lahore, Punjab, Pakistan
                        </p>
                        <a
                            href={property.map_url || property.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pd-map-card__btn"
                        >
                            <FaMapMarkerAlt size={14} /> View on Google Maps
                        </a>
                    </div>

                    {/* Description */}
                    <div className="pd-section pd-description">
                        <h2 className="pd-section__title">About this Property</h2>
                        <p className="pd-description__text">{property.description}</p>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (Desktop only) ── */}
                <div className="pd-right">

                    {/* Title card */}
                    <div className="pd-card pd-title-card pd-title-card--desktop">
                        <h1 className="pd-title-card__name">{property.name}</h1>
                        <div className="pd-title-card__meta">
                            <span className="pd-title-card__meta-item">
                                <FaMapMarkerAlt size={13} />
                                {property.block}
                            </span>
                            <span className="pd-title-card__meta-item">
                                <FaRuler size={13} />
                                {property.marla}
                            </span>
                            <span className="pd-title-card__meta-item">
                                <FaHome size={13} />
                                {property.type}
                            </span>
                        </div>
                    </div>

                    {/* Price card */}
                    <div className="pd-card pd-price-card pd-price-card--desktop">
                        <p className="pd-price-card__label">Listed Price</p>
                        <p className="pd-price-card__value">{property.price}</p>
                        <p className="pd-price-card__note">Price may vary — contact us for final quote</p>
                    </div>

                    {/* Map card */}
                    <div className="pd-card pd-map-card pd-map-card--desktop">
                        <h3 className="pd-map-card__title">
                            <MdLocationOn size={18} /> Location
                        </h3>
                        <p className="pd-map-card__address">
                            {property.block}, Bahria Town Lahore, Punjab, Pakistan
                        </p>
                        <a
                            href={property.map_url || property.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pd-map-card__btn"
                        >
                            <FaMapMarkerAlt size={14} /> View on Google Maps
                        </a>
                    </div>

                    {/* Contact card */}
                    <div className="pd-card pd-contact-card pd-contact-card--desktop">
                        <h3 className="pd-contact-card__title">Interested in this property?</h3>
                        <p className="pd-contact-card__sub">We are ready to help you.</p>
                        <button
                            className="pd-contact-card__btn"
                            onClick={() => setContactOpen(true)}
                        >
                            <FaPhone size={14} /> Contact Us
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            {/* ── Contact Modal ── */}
            {contactOpen && (
                <div className="pd-modal-backdrop" onClick={() => { setContactOpen(false); setSubmitted(false); setSubmitError(''); }}>
                    <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="pd-modal__close" onClick={() => { setContactOpen(false); setSubmitted(false); }}>
                            <FaTimes />
                        </button>

                        <div className="pd-modal__icon-wrap">
                            <FaBuilding size={28} className="pd-modal__icon" />
                        </div>

                        <h2 className="pd-modal__title">Contact Us</h2>
                        {/* <p className="pd-modal__sub">
                            Enquiring about <strong>{property.name}</strong>
                        </p> */}

                        {submitted ? (
                            <div className="pd-modal__success">
                                <FaCheckCircle size={40} className="pd-modal__success-icon" />
                                <p className="pd-modal__success-text">Thank you! We'll be in touch soon.</p>
                                <button className="pd-modal__success-btn" onClick={() => { setContactOpen(false); setSubmitted(false); }}>
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="pd-modal__contacts">
                                <a href="tel:+923001234567" className="pd-modal__contact-item">
                                    <span className="pd-modal__contact-icon"><FaPhone size={16} /></span>
                                    <div>
                                        <p className="pd-modal__contact-label">Phone 1</p>
                                        <p className="pd-modal__contact-value">+92 300 123 4567</p>
                                    </div>
                                </a>
                                <a href="tel:+923211234567" className="pd-modal__contact-item">
                                    <span className="pd-modal__contact-icon"><FaPhone size={16} /></span>
                                    <div>
                                        <p className="pd-modal__contact-label">Phone 2</p>
                                        <p className="pd-modal__contact-value">+92 321 123 4567</p>
                                    </div>
                                </a>
                                <a href="mailto:info@ijestate.com" className="pd-modal__contact-item">
                                    <span className="pd-modal__contact-icon"><FaEnvelope size={16} /></span>
                                    <div>
                                        <p className="pd-modal__contact-label">Email</p>
                                        <p className="pd-modal__contact-value">info@ijestate.com</p>
                                    </div>
                                </a>
                            </div>
                        )}

                        <p className="pd-modal__footer">Available Mon – Sat, 9 AM to 7 PM</p>
                    </div>
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxOpen && (
                <div className="pd-lightbox" onClick={() => setLightboxOpen(false)}>
                    <button className="pd-lightbox__close" onClick={() => setLightboxOpen(false)}>
                        <FaTimes />
                    </button>
                    <button className="pd-lightbox__arrow pd-lightbox__arrow--prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
                        <FaChevronLeft />
                    </button>
                    <img
                        src={images[lightboxIndex]}
                        alt={`Lightbox ${lightboxIndex + 1}`}
                        className="pd-lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="pd-lightbox__arrow pd-lightbox__arrow--next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
                        <FaChevronRight />
                    </button>
                    <p className="pd-lightbox__counter">{lightboxIndex + 1} / {images.length}</p>
                </div>
            )}
        </div>
    );
}

export default PropertyDetail;
