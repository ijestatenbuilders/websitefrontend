import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaTimes, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import './CommercialDetail.css';

// Import images for Business Bay Commercial
import projectImage1 from '../../Assets/images/upcoming-project-1.jpg';
import clocktower from '../../Assets/images/clocktower.png';
import eiffletower from '../../Assets/images/eiffletower.png';
import cinema from '../../Assets/images/cinema.jpg';

const commercialData = {
    title: 'Business Bay Commercial',
    description: 'Business Bay Commercial is a landmark commercial destination in Bahria Town Lahore, thoughtfully designed for businesses seeking visibility, accessibility, and long-term growth. Positioned within one of Lahore\'s most prestigious and well-established communities, it offers a dynamic environment for retail outlets, corporate offices, restaurants, cafes, banks, clinics, and modern commercial ventures. Featuring contemporary architecture, wide boulevards, premium infrastructure, and a vibrant business ecosystem, Business Bay Commercial is built to meet the needs of today\'s entrepreneurs and investors. Its strategic location provides seamless connectivity to Canal Road, Raiwind Road, Multan Road, and the Lahore Ring Road, ensuring convenient access for customers, employees, and visitors. It is newly launched and has available plots in different size for our customers to buy.',
    images: [projectImage1, clocktower, eiffletower, cinema],
    location: 'Bahria Town Lahore, Punjab, Pakistan',
    mapUrl: 'https://maps.google.com/?q=Bahria+Town+Lahore',
    sizes: [
        // { label: '5 Kanal', available: true },
        { label: 'All', available: true },
        { label: '4 Kanal', available: true },
        { label: '3 Kanal', available: true },
        { label: '1.25 Kanal', available: true },
        { label: '10 Marla', available: true },
        { label: '5 Marla', available: true },
    ]
};

function CommercialDetail() {
    const navigate = useNavigate();
    const [activeSlide, setActiveSlide] = useState(0);
    const [contactOpen, setContactOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');

    useEffect(() => { window.scrollTo(0, 0); }, []);

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

    const prevSlide = () => setActiveSlide(i => (i === 0 ? commercialData.images.length - 1 : i - 1));
    const nextSlide = () => setActiveSlide(i => (i === commercialData.images.length - 1 ? 0 : i + 1));
    const openLightbox = (i) => { setLightboxIndex(i); setLightboxOpen(true); };
    const prevLightbox = () => setLightboxIndex(i => (i === 0 ? commercialData.images.length - 1 : i - 1));
    const nextLightbox = () => setLightboxIndex(i => (i === commercialData.images.length - 1 ? 0 : i + 1));

    return (
        <div className="cd-page">
            <Navbar />

            {/* ── Breadcrumb ── */}
            <div className="cd-breadcrumb">
                <div className="cd-breadcrumb__inner">
                    <button onClick={() => navigate(-1)} className="cd-breadcrumb__back">
                        <FaChevronLeft size={12} /> Back
                    </button>
                    <span className="cd-breadcrumb__sep">›</span>
                    <button className="cd-breadcrumb__link" onClick={() => navigate('/')}>Home</button>
                    <span className="cd-breadcrumb__sep">›</span>
                    <button className="cd-breadcrumb__link" onClick={() => navigate('/#new')}>New Projects</button>
                    <span className="cd-breadcrumb__sep">›</span>
                    <span className="cd-breadcrumb__current">{commercialData.title}</span>
                </div>
            </div>

            <div className="cd-layout">

                {/* ── LEFT COLUMN ── */}
                <div className="cd-left">

                    {/* Image slider */}
                    <div className="cd-slider">
                        <div className="cd-slider__main" onClick={() => openLightbox(activeSlide)}>
                            <img
                                src={commercialData.images[activeSlide]}
                                alt={`${commercialData.title} — ${activeSlide + 1}`}
                                className="cd-slider__img"
                            />
                            <span className="cd-slider__badge">New Launch</span>
                            <span className="cd-slider__type">Commercial</span>
                            <button className="cd-slider__arrow cd-slider__arrow--prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                <FaChevronLeft />
                            </button>
                            <button className="cd-slider__arrow cd-slider__arrow--next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                <FaChevronRight />
                            </button>
                            <div className="cd-slider__counter">{activeSlide + 1} / {commercialData.images.length}</div>
                        </div>

                        {/* Thumbnails */}
                        <div className="cd-slider__thumbs">
                            {commercialData.images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`cd-slider__thumb ${i === activeSlide ? 'cd-slider__thumb--active' : ''}`}
                                    onClick={() => setActiveSlide(i)}
                                >
                                    <img src={img} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="cd-section cd-description">
                        <h2 className="cd-section__title">About This Project</h2>
                        <p className="cd-description__text">{commercialData.description}</p>
                    </div>

                    {/* Check Out More Commercials Button */}
                    <div className="cd-more-commercials">
                        <button
                            className="cd-more-commercials__btn"
                            onClick={() => navigate('/#new')}
                        >
                            <span className="cd-more-commercials__icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </span>
                            <span className="cd-more-commercials__content">
                                <span className="cd-more-commercials__label">Explore More</span>
                                <span className="cd-more-commercials__title">Commercial Projects</span>
                            </span>
                            <span className="cd-more-commercials__arrow">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="cd-right">

                    {/* Title card */}
                    <div className="cd-card cd-title-card">
                        <h1 className="cd-title-card__name">{commercialData.title}</h1>
                        <div className="cd-title-card__meta">
                            <span className="cd-title-card__meta-item">
                                <FaMapMarkerAlt size={13} />
                                Bahria Town Lahore
                            </span>
                            <span className="cd-title-card__meta-item">
                                <FaBuilding size={13} />
                                New Launch
                            </span>
                        </div>
                    </div>

                    {/* Map card */}
                    <div className="cd-card cd-map-card">
                        <h3 className="cd-map-card__title">
                            <MdLocationOn size={18} /> Location
                        </h3>
                        <p className="cd-map-card__address">{commercialData.location}</p>
                        <a
                            href={commercialData.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cd-map-card__btn"
                        >
                            <FaMapMarkerAlt size={14} /> View on Google Maps
                        </a>
                    </div>

                    {/* Contact card */}
                    <div className="cd-card cd-contact-card">
                        <h3 className="cd-contact-card__title">Interested in this project?</h3>
                        <p className="cd-contact-card__sub">Our agents are ready to help you.</p>
                        <button
                            className="cd-contact-card__btn"
                            onClick={() => setContactOpen(true)}
                        >
                            <FaPhone size={14} /> Contact Us
                        </button>
                    </div>

                    {/* Available Sizes - Commented out for generic commercial */}
                    {/* <div className="cd-card cd-sizes-card">
                        <h3 className="cd-sizes-card__title">Available Plot Sizes</h3>
                        <div className="cd-sizes__grid">
                            {commercialData.sizes.map((size) => (
                                <button
                                    key={size.label}
                                    className={`cd-size-btn ${selectedSize === size.label ? 'cd-size-btn--selected' : ''}`}
                                    onClick={() => setSelectedSize(size.label)}
                                >
                                    <span className="cd-size-btn__label">{size.label}</span>
                                    <span className="cd-size-btn__status">Available</span>
                                </button>
                            ))}
                        </div>
                        {selectedSize && (
                            <p className="cd-sizes__note">
                                Selected: <strong>{selectedSize}</strong> — Contact us for pricing and availability
                            </p>
                        )}
                    </div> */}
                </div>
            </div>

            <Footer />

            {/* ── Contact Modal ── */}
            {contactOpen && (
                <div className="cd-modal-backdrop" onClick={() => setContactOpen(false)}>
                    <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="cd-modal__close" onClick={() => setContactOpen(false)}>
                            <FaTimes />
                        </button>

                        <div className="cd-modal__icon-wrap">
                            <FaBuilding size={28} className="cd-modal__icon" />
                        </div>

                        <h2 className="cd-modal__title">Contact Us</h2>

                        <div className="cd-modal__contacts">
                            <a href="tel:+923001234567" className="cd-modal__contact-item">
                                <span className="cd-modal__contact-icon"><FaPhone size={16} /></span>
                                <div>
                                    <p className="cd-modal__contact-label">Phone 1</p>
                                    <p className="cd-modal__contact-value">+92 300 123 4567</p>
                                </div>
                            </a>
                            <a href="tel:+923211234567" className="cd-modal__contact-item">
                                <span className="cd-modal__contact-icon"><FaPhone size={16} /></span>
                                <div>
                                    <p className="cd-modal__contact-label">Phone 2</p>
                                    <p className="cd-modal__contact-value">+92 321 123 4567</p>
                                </div>
                            </a>
                            <a href="mailto:info@ijestate.com" className="cd-modal__contact-item">
                                <span className="cd-modal__contact-icon"><FaEnvelope size={16} /></span>
                                <div>
                                    <p className="cd-modal__contact-label">Email</p>
                                    <p className="cd-modal__contact-value">info@ijestate.com</p>
                                </div>
                            </a>
                        </div>

                        <p className="cd-modal__footer">Available Mon – Sat, 9 AM to 7 PM</p>
                    </div>
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxOpen && (
                <div className="cd-lightbox" onClick={() => setLightboxOpen(false)}>
                    <button className="cd-lightbox__close" onClick={() => setLightboxOpen(false)}>
                        <FaTimes />
                    </button>
                    <button className="cd-lightbox__arrow cd-lightbox__arrow--prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
                        <FaChevronLeft />
                    </button>
                    <img
                        src={commercialData.images[lightboxIndex]}
                        alt={`Lightbox ${lightboxIndex + 1}`}
                        className="cd-lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="cd-lightbox__arrow cd-lightbox__arrow--next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
                        <FaChevronRight />
                    </button>
                    <p className="cd-lightbox__counter">{lightboxIndex + 1} / {commercialData.images.length}</p>
                </div>
            )}
        </div>
    );
}

export default CommercialDetail;
