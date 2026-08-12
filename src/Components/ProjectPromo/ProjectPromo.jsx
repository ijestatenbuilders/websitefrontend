import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimes, FaArrowRight, FaBuilding } from 'react-icons/fa';
import './ProjectPromo.css';

/**
 * ProjectPromo – floating bottom-right card that slides in after 3 s.
 * Shows on every page load/refresh. Hidden on the project's own page.
 * No overlay, fully dismissable.
 */
function ProjectPromo() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on the project's own page
    const isOnProjectPage = location.pathname === '/commercial/business-bay';

    useEffect(() => {
        if (isOnProjectPage) { setVisible(false); return; }
        // No sessionStorage check — always shows on every fresh load/refresh
        const t = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(t);
    }, [isOnProjectPage]);

    const dismiss = () => {
        setExiting(true);
        // Only hide in current React state — refreshing will show it again
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
            aria-label="New project announcement"
        >
            {/* Dismiss */}
            <button className="promo-float__close" onClick={dismiss} aria-label="Dismiss">
                <FaTimes />
            </button>

            {/* Badge */}
            <div className="promo-float__badge">
                <span className="promo-float__badge-dot" />
                New Launch
            </div>

            {/* Icon + heading */}
            <div className="promo-float__header">
                <div className="promo-float__icon">
                    <FaBuilding />
                </div>
                <div>
                    <h3 className="promo-float__title">Business Bay Commercial</h3>
                    <p className="promo-float__sub">Bahria Town Lahore</p>
                </div>
            </div>

            {/* Highlights */}
            <ul className="promo-float__highlights">
                <li>Prime commercial plots</li>
                <li>Multiple sizes available</li>
                <li>High ROI location</li>
            </ul>

            {/* CTA */}
            <button className="promo-float__cta" onClick={handleCTA}>
                Explore Project <FaArrowRight />
            </button>
        </aside>
    );
}

export default ProjectPromo;
