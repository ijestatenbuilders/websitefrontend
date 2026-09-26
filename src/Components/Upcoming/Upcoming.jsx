import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upcoming.css';
import projectImage from '../../Assets/images/upcoming-project-1.jpg';
import { API_URL } from '../../services/api';
import { useReveal } from '../../utils/useReveal';

function Upcoming({ currentLocation = 'bahriatown' }) {
    const navigate = useNavigate();
    const revealRef = useReveal();
    const [upcomingProjects, setUpcomingProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // DOM refs for RAF-driven scroll parallax (zero re-renders)
    const bgGridRef = useRef(null);
    const headerRef = useRef(null);
    const cardRefs = useRef([]);
    const imgRefs = useRef([]);

    const locationNames = {
        bahriatown: 'Bahria Town Lahore',
        dharaya: 'DHA Raya Lahore',
        etihadtown: 'Etihad Town Lahore',
        uniontown: 'Union Town Lahore',
    };
    const locationDisplayName = locationNames[currentLocation] || 'Bahria Town Lahore';

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/projects/?location=${currentLocation}`);
                if (!response.ok) throw new Error('Failed to fetch projects');
                const data = await response.json();
                setUpcomingProjects(data.results || data);
            } catch (err) {
                setUpcomingProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [currentLocation]);

    // Update parallax only on scroll/resize and while this section is nearby.
    useEffect(() => {
        const section = revealRef.current;
        if (!section) return;

        let animId = null;
        let visible = false;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const update = () => {
            animId = null;
            if (!visible) return;
            const vh = window.innerHeight || 1;

            if (bgGridRef.current) {
                const r = bgGridRef.current.parentElement.getBoundingClientRect();
                const p = (r.top + r.height / 2 - vh / 2) / vh;
                bgGridRef.current.style.translate = `0 ${clamp(p * 40, -50, 50).toFixed(2)}px`;
            }
            if (headerRef.current) {
                const r = headerRef.current.parentElement.getBoundingClientRect();
                const p = (r.top - vh / 2) / vh;
                headerRef.current.style.translate = `0 ${clamp(p * -10, -14, 14).toFixed(2)}px`;
            }
            imgRefs.current.forEach((img) => {
                if (!img) return;
                const r = img.parentElement.getBoundingClientRect();
                const p = (r.top + r.height / 2 - vh / 2) / vh;
                img.style.translate = `0 ${clamp(p * -16, -9, 9).toFixed(2)}px`;
            });
        };
        const requestUpdate = () => {
            if (visible && animId === null) animId = requestAnimationFrame(update);
        };
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) requestUpdate();
        }, { rootMargin: '100px 0px' });
        observer.observe(section);
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        requestUpdate();
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', requestUpdate);
            if (animId !== null) cancelAnimationFrame(animId);
        };
    }, [upcomingProjects, revealRef]);

    return (
        <section className="upcoming-projects" id='new' ref={revealRef}>
            <div className="upcoming-parallax-grid" ref={bgGridRef} aria-hidden="true" />
            <div className="upcoming-container">
                <div className="upcoming-header-wrap" ref={headerRef} data-reveal="fade-up">
                    <h2 className="upcoming-title">Newly Launched Projects</h2>
                </div>

                {loading ? (
                    <div className="upcoming-loading">
                        <div className="upcoming-spinner"></div>
                        <p>Loading projects...</p>
                    </div>
                ) : upcomingProjects.length > 0 ? (
                    <div className="upcoming-grid">
                        {upcomingProjects.map((project, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <article
                                    key={project.id}
                                    className="upcoming-card"
                                    data-reveal="fade-up"
                                    data-delay={index}
                                    ref={(el) => { cardRefs.current[index] = el; }}
                                >
                                    <div className="upcoming-content">
                                        <div
                                            className="upcoming-text"
                                            data-reveal={isEven ? "slide-left" : "slide-right"}
                                        >
                                            <div className="upcoming-tag-strip">
                                                <span className="upcoming-exclusive-tag">✦ EXCLUSIVE OPPORTUNITY</span>
                                            </div>
                                            <h3 className='upcoming-project-title'>{project.title}</h3>
                                            <p className='upcoming-project-desc'>{project.description}</p>
                                            <button
                                                onClick={() => navigate(project.link)}
                                                className="upcoming-learn-more"
                                            >
                                                Learn More
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div
                                            className="upcoming-image-wrap"
                                            data-reveal={isEven ? "slide-right" : "slide-left"}
                                        >
                                            <span className="upcoming-label">New Launch</span>
                                            <img
                                                src={project.image || projectImage}
                                                alt={project.title}
                                                className="upcoming-image"
                                                ref={(el) => { imgRefs.current[index] = el; }}
                                            />
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="upcoming-empty-state">
                        <div className="upcoming-empty-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.3" />
                                <path d="M12 8v4M12 16h.01" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#1e90ff" />
                                        <stop offset="1" stopColor="#0d5bb5" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h3 className="upcoming-empty-title">No Projects Available</h3>
                        <p className="upcoming-empty-message">
                            We don't have any newly launched projects for <strong>{locationDisplayName}</strong> at the moment,
                            but stay tuned! Exciting developments might be coming your way in the near future.
                        </p>
                        <div className="upcoming-empty-decoration">
                            <span className="upcoming-shimmer"></span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Upcoming;
