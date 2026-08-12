import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt, FaChartLine, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import './ProjectPromoSection.css';

/**
 * ProjectPromoSection – full-width inline promotional section.
 * Placed between Upcoming and PopularAreas on the landing page.
 * Fully SEO-safe: all content is visible in the DOM, uses semantic HTML.
 */
function ProjectPromoSection() {
    const navigate = useNavigate();

    const highlights = [
        { icon: <FaBuilding />,    text: 'Prime commercial plots in Bahria Town' },
        { icon: <FaChartLine />,   text: 'High ROI — ideal for long-term investment' },
        { icon: <FaMapMarkerAlt />,text: 'Central Business Bay location' },
        { icon: <FaCheckCircle />, text: 'Multiple plot sizes — book your slot now' },
    ];

    return (
        <section className="pps-section" aria-label="Business Bay Commercial — Featured Project">
            {/* Decorative background shapes */}
            <div className="pps-bg" aria-hidden="true">
                <div className="pps-bg__circle pps-bg__circle--1" />
                <div className="pps-bg__circle pps-bg__circle--2" />
                <div className="pps-bg__line" />
            </div>

            <div className="pps-inner">
                {/* Left: text content */}
                <div className="pps-content">
                    <div className="pps-eyebrow">
                        <span className="pps-eyebrow__dot" />
                        Featured New Launch
                    </div>

                    <h2 className="pps-title">
                        Business Bay<br />
                        <span className="pps-title--accent">Commercial</span>
                    </h2>

                    <p className="pps-desc">
                        Secure your stake in one of Bahria Town Lahore's most strategically
                        positioned commercial developments. Flexible plot sizes, transparent
                        pricing, and unmatched location advantage.
                    </p>

                    <ul className="pps-highlights">
                        {highlights.map((h, i) => (
                            <li key={i} className="pps-highlight">
                                <span className="pps-highlight__icon">{h.icon}</span>
                                <span className="pps-highlight__text">{h.text}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="pps-actions">
                        <button
                            className="pps-cta"
                            onClick={() => navigate('/commercial/business-bay')}
                        >
                            View Project Details <FaArrowRight />
                        </button>
                        <button
                            className="pps-cta-secondary"
                            onClick={() => navigate('/contact')}
                        >
                            Request Callback
                        </button>
                    </div>
                </div>

                {/* Right: visual card */}
                <div className="pps-visual" aria-hidden="true">
                    <div className="pps-card">
                        <div className="pps-card__tag">Commercial</div>

                        <div className="pps-card__icon-wrap">
                            <FaBuilding className="pps-card__icon" />
                        </div>

                        <h3 className="pps-card__name">Business Bay Commercial</h3>
                        <p className="pps-card__location">
                            <FaMapMarkerAlt /> Bahria Town Lahore
                        </p>

                        <div className="pps-card__divider" />

                        <div className="pps-card__stats">
                            <div className="pps-card__stat">
                                <span className="pps-card__stat-value">4+</span>
                                <span className="pps-card__stat-label">Plot Sizes</span>
                            </div>
                            <div className="pps-card__stat-sep" />
                            <div className="pps-card__stat">
                                <span className="pps-card__stat-value">100%</span>
                                <span className="pps-card__stat-label">Legal Clear</span>
                            </div>
                            <div className="pps-card__stat-sep" />
                            <div className="pps-card__stat">
                                <span className="pps-card__stat-value">Now</span>
                                <span className="pps-card__stat-label">Booking Open</span>
                            </div>
                        </div>

                        {/* Animated glow ring */}
                        <div className="pps-card__glow" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProjectPromoSection;
