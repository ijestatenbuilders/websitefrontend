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

    // Internal RAF loop — scroll parallax goes directly to DOM (zero React re-renders)
    useEffect(() => {
        let animId;
        let scrollSmooth = window.scrollY;
        let scrollTarget = window.scrollY;
        const LERP = 0.08;

        const onScroll = () => { scrollTarget = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });

        const loop = () => {
            scrollSmooth += (scrollTarget - scrollSmooth) * LERP;
            const sy = scrollSmooth;

            if (bgGridRef.current)
                bgGridRef.current.style.transform = `translate3d(0, ${((sy - 1500) * 0.07).toFixed(2)}px, 0)`;
            if (headerRef.current)
                headerRef.current.style.transform = `translate3d(0, ${((sy - 1550) * -0.035).toFixed(2)}px, 0)`;

            cardRefs.current.forEach((card, i) => {
                if (!card) return;
                const cp = (i % 2 === 0 ? -1 : 1) * 8;
                card.style.transform = `translate3d(0, ${((sy - 1700) * -0.030 + cp).toFixed(2)}px, 0)`;
            });
            imgRefs.current.forEach((img) => {
                if (!img) return;
                img.style.transform = `scale(1.08) translate3d(0, ${((sy - 1750) * 0.042).toFixed(2)}px, 0)`;
            });

            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <section className="upcoming-projects" id='new' ref={revealRef}>
            <div className="upcoming-parallax-grid" ref={bgGridRef} aria-hidden="true" />
            <div className="upcoming-container">
                <div className="upcoming-header-wrap" ref={headerRef} data-reveal="fade-up">
                    <div className="upcoming-eyebrow">
                        <span className="upcoming-eyebrow-pulse" />
                        <span>EXCLUSIVE NEW LAUNCHES // HIGH ROI</span>
                    </div>
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
