import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt, FaChartLine, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { useReveal } from '../../utils/useReveal';
import './ProjectPromoSection.css';

/**
 * ProjectPromoSection – full-width inline promotional section.
 * All scroll + mouse parallax driven by internal RAF loop with DOM refs.
 * Zero React re-renders on scroll.
 */
function ProjectPromoSection() {
    const navigate = useNavigate();
    const revealRef = useReveal();

    // DOM refs for zero-rerender parallax
    const bgGridRef = useRef(null);
    const bgCircle1Ref = useRef(null);
    const bgCircle2Ref = useRef(null);
    const contentRef = useRef(null);
    const visualRef = useRef(null);
    const cardTagRef = useRef(null);
    const cardIconRef = useRef(null);
    const cardStatsRef = useRef(null);

    useEffect(() => {
        let animId;
        let scrollSmooth = window.scrollY;
        let scrollTarget = window.scrollY;
        let mouseXSmooth = 0.5;
        let mouseYSmooth = 0.5;
        let mouseXTarget = 0.5;
        let mouseYTarget = 0.5;
        const LERP = 0.08;

        const onScroll = () => { scrollTarget = window.scrollY; };
        const onMouse = (e) => {
            mouseXTarget = e.clientX / window.innerWidth;
            mouseYTarget = e.clientY / window.innerHeight;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });

        const loop = () => {
            scrollSmooth += (scrollTarget - scrollSmooth) * LERP;
            mouseXSmooth += (mouseXTarget - mouseXSmooth) * LERP;
            mouseYSmooth += (mouseYTarget - mouseYSmooth) * LERP;

            const sy = scrollSmooth;
            const mx = mouseXSmooth - 0.5;
            const my = mouseYSmooth - 0.5;

            if (bgGridRef.current)
                bgGridRef.current.style.transform = `translate3d(0, ${((sy - 2000) * 0.07).toFixed(2)}px, 0)`;
            if (bgCircle1Ref.current)
                bgCircle1Ref.current.style.transform = `translate3d(${(mx * 28).toFixed(2)}px, ${((sy - 2000) * -0.10).toFixed(2)}px, 0)`;
            if (bgCircle2Ref.current)
                bgCircle2Ref.current.style.transform = `translate3d(${(mx * -22).toFixed(2)}px, ${((sy - 2000) * 0.13).toFixed(2)}px, 0)`;
            if (contentRef.current)
                contentRef.current.style.transform = `translate3d(0, ${((sy - 2100) * -0.035).toFixed(2)}px, 0)`;
            if (visualRef.current)
                visualRef.current.style.transform = `translate3d(${(mx * 10).toFixed(2)}px, ${((sy - 2100) * -0.06 + my * 8).toFixed(2)}px, 0) rotateY(${(mx * 8).toFixed(2)}deg) rotateX(${(my * -8).toFixed(2)}deg)`;
            if (cardTagRef.current)
                cardTagRef.current.style.transform = `translate3d(0, ${((sy - 2100) * -0.018).toFixed(2)}px, 15px)`;
            if (cardIconRef.current)
                cardIconRef.current.style.transform = `translate3d(0, ${((sy - 2100) * -0.035).toFixed(2)}px, 25px)`;
            if (cardStatsRef.current)
                cardStatsRef.current.style.transform = `translate3d(0, ${((sy - 2100) * -0.025).toFixed(2)}px, 20px)`;

            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('mousemove', onMouse);
            cancelAnimationFrame(animId);
        };
    }, []);

    const highlights = [
        { icon: <FaBuilding />,    text: 'Prime commercial plots in Bahria Town' },
        { icon: <FaChartLine />,   text: 'High ROI — ideal for long-term investment' },
        { icon: <FaMapMarkerAlt />,text: 'Central Business Bay location' },
        { icon: <FaCheckCircle />, text: 'Multiple plot sizes — book your slot now' },
    ];

    return (
        <section className="pps-section" aria-label="Business Bay Commercial — Featured Project" ref={revealRef}>
            {/* Parallax Blueprint Spatial Grid */}
            <div className="pps-parallax-grid" ref={bgGridRef} aria-hidden="true" />

            {/* Decorative background shapes with parallax offset */}
            <div className="pps-bg" aria-hidden="true">
                <div className="pps-bg__circle pps-bg__circle--1" ref={bgCircle1Ref} />
                <div className="pps-bg__circle pps-bg__circle--2" ref={bgCircle2Ref} />
                <div className="pps-bg__line" />
            </div>

            <div className="pps-inner">
                {/* Left: text content with spring parallax */}
                <div className="pps-content" ref={contentRef} data-reveal="slide-left">
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
                            <li key={i} className="pps-highlight" data-reveal="slide-left" data-delay={i + 1}>
                                <span className="pps-highlight__icon">{h.icon}</span>
                                <span className="pps-highlight__text">{h.text}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="pps-actions" data-reveal="fade-up" data-delay="4">
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

                {/* Right: visual 3D card with differential parallax floating layers */}
                <div className="pps-visual" ref={visualRef} data-reveal="perspective-pop" data-delay="2" aria-hidden="true">
                    <div className="pps-card">
                        <div className="pps-card__tag" ref={cardTagRef}>
                            Commercial
                        </div>

                        <div className="pps-card__icon-wrap" ref={cardIconRef}>
                            <FaBuilding className="pps-card__icon" />
                        </div>

                        <h3 className="pps-card__name">Business Bay Commercial</h3>
                        <p className="pps-card__location">
                            <FaMapMarkerAlt /> Bahria Town Lahore
                        </p>

                        <div className="pps-card__divider" />

                        <div className="pps-card__stats" ref={cardStatsRef}>
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
