import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimes, FaArrowRight, FaBuilding, FaCheckCircle, FaFire } from 'react-icons/fa';
import './ProjectPromo.css';

/**
 * ProjectPromo – Floating bottom-right card with luxury glassmorphism,
 * dynamic float micro-animation, and rich color palette.
 */
function ProjectPromo() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on the project's own page or 3D showcase
    const isOnProjectPage = location.pathname === '/commercial/business-bay' || location.pathname.startsWith('/3d');

    useEffect(() => {
        if (isOnProjectPage) { setVisible(false); return; }
        const t = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(t);
    }, [isOnProjectPage]);

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => setVisible(false), 380);
    };

    const handleCTA = () => {
        dismiss();
        navigate('/commercial/business-bay');
    };

    if (!visible) return null;

    return (
        <aside
            className={`promo-float ${exiting ? 'promo-float--exit' : 'promo-float--enter'}`}
            role="complementary"
            aria-label="Featured Commercial Project Announcement"
        >
            {/* Top gradient shimmer glow accent */}
            <div className="promo-float__glow-bar" />

            {/* Dismiss button */}
            <button className="promo-float__close" onClick={dismiss} aria-label="Dismiss Announcement">
                <FaTimes />
            </button>

            {/* Header top status badge */}
            <div className="promo-float__badge-row">
                <div className="promo-float__badge">
                    <span className="promo-float__badge-dot" />
                    <span className="promo-float__badge-text">New Launch</span>
                </div>
                <div className="promo-float__trending">
                    <FaFire className="promo-float__fire-icon" /> Hot Investment
                </div>
            </div>

            {/* Icon + Title + Location */}
            <div className="promo-float__header">
                <div className="promo-float__icon">
                    <FaBuilding />
                </div>
                <div className="promo-float__titles">
                    <h3 className="promo-float__title">Business Bay Commercial</h3>
                    <p className="promo-float__sub">Bahria Town Lahore</p>
                </div>
            </div>

            {/* Feature points */}
            <ul className="promo-float__highlights">
                <li>
                    <FaCheckCircle className="promo-float__check" />
                    <span>Prime commercial plots & shops</span>
                </li>
                <li>
                    <FaCheckCircle className="promo-float__check" />
                    <span>Multiple plot sizes available</span>
                </li>
                <li>
                    <FaCheckCircle className="promo-float__check" />
                    <span>High ROI & immediate capital gain</span>
                </li>
            </ul>

            {/* Interactive Explore CTA */}
            <button className="promo-float__cta" onClick={handleCTA}>
                <span>Explore Project</span>
                <FaArrowRight className="promo-float__cta-arrow" />
            </button>
        </aside>
    );
}

export default ProjectPromo;
