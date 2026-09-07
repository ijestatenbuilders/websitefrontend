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
    const cardRef = useRef(null);

    // Parallax RELATIVE to viewport position (bounded) — works wherever the
    // section sits. The card only gets a mouse-tilt + gentle bounded float; its
    // inner elements are left in normal flow so nothing overlaps. The card
    // entrance is the pop-scale reveal on .pps-visual (not overridden here).
    useEffect(() => {
        let animId;
        let mxS = 0.5, myS = 0.5, mxT = 0.5, myT = 0.5;
        const LERP = 0.08;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const onMouse = (e) => {
            mxT = e.clientX / window.innerWidth;
            myT = e.clientY / window.innerHeight;
        };
        window.addEventListener('mousemove', onMouse, { passive: true });

        const prog = (el) => {
            const r = el.parentElement.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            return (r.top + r.height / 2 - vh / 2) / vh;
        };

        const loop = () => {
            mxS += (mxT - mxS) * LERP;
            myS += (myT - myS) * LERP;
            const mx = mxS - 0.5;
            const my = myS - 0.5;

            if (bgGridRef.current)
                bgGridRef.current.style.transform = `translate3d(0, ${clamp(prog(bgGridRef.current) * 40, -50, 50).toFixed(2)}px, 0)`;
            if (bgCircle1Ref.current)
                bgCircle1Ref.current.style.transform = `translate3d(${(mx * 28).toFixed(2)}px, ${clamp(prog(bgCircle1Ref.current) * -40, -45, 45).toFixed(2)}px, 0)`;
            if (bgCircle2Ref.current)
                bgCircle2Ref.current.style.transform = `translate3d(${(mx * -22).toFixed(2)}px, ${clamp(prog(bgCircle2Ref.current) * 45, -45, 45).toFixed(2)}px, 0)`;
            if (contentRef.current)
                contentRef.current.style.transform = `translate3d(0, ${clamp(prog(contentRef.current) * -12, -16, 16).toFixed(2)}px, 0)`;
            if (cardRef.current)
                cardRef.current.style.transform = `perspective(1000px) translate3d(${(mx * 10).toFixed(2)}px, ${(my * 8).toFixed(2)}px, 0) rotateY(${(mx * 8).toFixed(2)}deg) rotateX(${(my * -8).toFixed(2)}deg)`;

            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => {
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
                <div className="pps-visual" ref={visualRef} data-reveal="pop-scale" data-delay="2" aria-hidden="true">
                    <div className="pps-card" ref={cardRef}>
                        <div className="pps-card__tag">
                            Commercial
                        </div>

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
