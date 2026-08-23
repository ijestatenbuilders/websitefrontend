import { useEffect, useRef } from 'react';
import './Footer.css';
import logo from '../../Assets/images/logo.jpg';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FaMapLocationDot, FaPhone, FaEnvelope } from 'react-icons/fa6';
import { useReveal } from '../../utils/useReveal';

const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Properties', href: '#properties' },
    { label: 'Popular Areas', href: '#popular-areas' },
    { label: 'New Projects', href: '#upcoming' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
];

const propertyLinks = [
    { label: 'Houses for Sale' },
    { label: 'Houses for Rent' },
    { label: 'Plots for Sale' },
    { label: 'Commercial Spaces' },
    { label: 'Apartments' },
    { label: 'New Launches' },
];

const socials = [
    { icon: FaFacebookF, label: 'Facebook', href: '#' },
    { icon: FaInstagram, label: 'Instagram', href: '#' },
    { icon: FaWhatsapp, label: 'WhatsApp', href: '#' },
    { icon: FaYoutube, label: 'YouTube', href: '#' },
];

function Footer() {
    const revealRef = useReveal();
    const bgGridRef = useRef(null);

    useEffect(() => {
        let animId;
        let scrollSmooth = window.scrollY;
        let scrollTarget = window.scrollY;
        const LERP = 0.08;

        const onScroll = () => { scrollTarget = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });

        const loop = () => {
            scrollSmooth += (scrollTarget - scrollSmooth) * LERP;
            if (bgGridRef.current) {
                bgGridRef.current.style.transform = `translate3d(0, ${((scrollSmooth - 3300) * 0.06).toFixed(2)}px, 0)`;
            }
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(animId);
        };
    }, []);

    const handleScroll = (e, href) => {
        e.preventDefault();
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', href);
        }
    };

    return (
        <footer className="footer" id="contact" ref={revealRef}>
            {/* Parallax Blueprint Grid */}
            <div className="footer-parallax-grid" ref={bgGridRef} aria-hidden="true" />

            {/* top fluid blobs */}
            <div className="footer__blob footer__blob--tl" aria-hidden="true" />
            <div className="footer__blob footer__blob--br" aria-hidden="true" />

            <div className="footer__inner">

                {/* ── Brand column ── */}
                <div className="footer__col footer__col--brand" data-reveal="fade-up" data-delay="1">
                    <a href="#home" className="footer__brand" onClick={(e) => handleScroll(e, '#home')}>
                        <img src={logo} alt="IJ Estates logo" className="footer__logo" />
                        <div>
                            <span className="footer__brand-name">IJ Estate</span>
                            <span className="footer__brand-sub">& Builders</span>
                        </div>
                    </a>
                    <p className="footer__tagline">
                        Your trusted partner in finding the perfect property across Lahore's most sought-after communities.
                    </p>

                    <div className="footer__socials">
                        {socials.map(({ icon: Icon, label, href }) => (
                            <a key={label} href={href} className="footer__social-btn" aria-label={label}>
                                <Icon size={15} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Quick links ── */}
                <div className="footer__col" data-reveal="fade-up" data-delay="2">
                    <h4 className="footer__col-title">Quick Links</h4>
                    <ul className="footer__list">
                        {quickLinks.map(({ label, href }) => (
                            <li key={label}>
                                <a href={href} className="footer__list-link" onClick={(e) => handleScroll(e, href)}>
                                    <span className="footer__list-arrow">›</span>
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Contact ── */}
                <div className="footer__col footer__col--contact" data-reveal="fade-up" data-delay="3">
                    <h4 className="footer__col-title">Get In Touch</h4>
                    <ul className="footer__contact-list">
                        <li>
                            <FaMapLocationDot size={16} className="footer__contact-icon" />
                            <span className='contact-span'>Bahria Town Lahore, Punjab, Pakistan</span>
                        </li>
                        <li>
                            <FaPhone size={14} className="footer__contact-icon" />
                            <a href="tel:+923001234567" className="footer__contact-link">+92 300 1234567</a>
                        </li>
                        <li>
                            <FaEnvelope size={14} className="footer__contact-icon" />
                            <a href="mailto:info@ijestate.pk" className="footer__contact-link">info@ijestate.pk</a>
                        </li>
                    </ul>

                    {/* Shown on desktop, hidden on mobile */}
                    <div className="footer__newsletter footer__newsletter--desktop">
                        <p className="footer__newsletter-label">Stay updated with new listings</p>
                        <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="footer__newsletter-input"
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="footer__newsletter-btn">Subscribe</button>
                        </form>
                    </div>
                </div>

                {/* Shown on mobile only — full-width newsletter row */}
                <div className="footer__col footer__col--newsletter-mobile" data-reveal="fade-up" data-delay="4">
                    <p className="footer__newsletter-label">Stay updated with new listings</p>
                    <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="footer__newsletter-input"
                            aria-label="Email for newsletter"
                        />
                        <button type="submit" className="footer__newsletter-btn">Subscribe</button>
                    </form>
                </div>

            </div>

            {/* ── Bottom bar ── */}
            <div className="footer__bottom" data-reveal="fade-up" data-delay="2">
                <p className="footer__copy">© {new Date().getFullYear()} | IJ Estate & Builders | All rights reserved.</p>
                <div className="footer__bottom-links">
                    <a href="#" className="footer__bottom-link">Privacy Policy</a>
                    <span className="footer__bottom-dot">·</span>
                    <a href="#" className="footer__bottom-link">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
