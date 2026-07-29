import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upcoming.css';
import projectImage from '../../Assets/images/upcoming-project-1.jpg';

function Upcoming({ currentLocation = 'bahriatown' }) {
    const navigate = useNavigate();
    const [upcomingProjects, setUpcomingProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get location display name
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
            setError(null);

            try {
                const response = await fetch(
                    `http://localhost:8000/api/projects/?location=${currentLocation}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();
                // Handle paginated response - extract results array
                const projects = data.results || data;
                setUpcomingProjects(projects);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(err.message);
                // Fallback to hardcoded data if API fails
                setUpcomingProjects(getFallbackProjects(currentLocation));
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [currentLocation]);

    // Fallback data in case API is not available
    const getFallbackProjects = (location) => {
        const fallbackData = {
            bahriatown: [
                {
                    id: 1,
                    title: 'Business Bay Commercial',
                    description:
                        'Business Bay Commercial is a landmark commercial destination in Bahria Town Lahore, thoughtfully designed for businesses seeking visibility, accessibility, and long-term growth. Positioned within one of Lahores most prestigious and well-established communities, it offers a dynamic environment for retail outlets, corporate offices, restaurants, cafes, banks, clinics, and modern commercial ventures. Featuring contemporary architecture, wide boulevards, premium infrastructure, and a vibrant business ecosystem, Business Bay Commercial is built to meet the needs of todays entrepreneurs and investors. Its strategic location provides seamless connectivity to Canal Road, Raiwind Road, Multan Road, and the Lahore Ring Road, ensuring convenient access for customers, employees, and visitors.',
                    image: projectImage,
                    link: '/commercial/business-bay',
                },
            ],
            dharaya: [],
            etihadtown: [],
            uniontown: [],
        };
        return fallbackData[location] || [];
    };

    return (
        <section className="upcoming-projects" id='new'>
            <div className="upcoming-container">
                <h2 className="upcoming-title">Newly Launched Projects</h2>

                {loading ? (
                    <div className="upcoming-loading">
                        <div className="upcoming-spinner"></div>
                        <p>Loading projects...</p>
                    </div>
                ) : upcomingProjects.length > 0 ? (
                    <div className="upcoming-grid">
                        {upcomingProjects.map((project) => (
                            <article key={project.id} className="upcoming-card">
                                <div className="upcoming-content">
                                    <div className="upcoming-text">
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
                                    <div className="upcoming-image-wrap">
                                        <span className="upcoming-label">New</span>
                                        <img
                                            src={project.image || projectImage}
                                            alt={project.title}
                                            className="upcoming-image"
                                        />
                                    </div>
                                </div>
                            </article>
                        ))}
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
