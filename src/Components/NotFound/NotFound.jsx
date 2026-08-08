import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaMapMarkerAlt, FaBuilding, FaArrowLeft } from 'react-icons/fa';
import './NotFound.css';

function NotFound() {
    const navigate = useNavigate();

    const quickLinks = [
        { icon: <FaHome size={20} />, label: 'Home', path: '/' },
        { icon: <FaSearch size={20} />, label: 'Browse Properties', path: '/properties' },
        { icon: <FaBuilding size={20} />, label: 'New Projects', path: '/#new' },
        { icon: <FaMapMarkerAlt size={20} />, label: 'Popular Areas', path: '/#areas' },
    ];

    return (
        <div className="notfound-page">

            <div className="notfound-container">
                {/* Animated Background Elements */}
                <div className="notfound-bg-elements">
                    <div className="notfound-circle notfound-circle-1"></div>
                    <div className="notfound-circle notfound-circle-2"></div>
                    <div className="notfound-circle notfound-circle-3"></div>
                </div>

                <div className="notfound-content">
                    {/* 404 Number with Animation */}
                    <div className="notfound-number">
                        <span className="notfound-digit">4</span>
                        <span className="notfound-digit notfound-digit-middle">
                            <svg className="notfound-home-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="notfound-digit">4</span>
                    </div>

                    {/* Main Message */}
                    <div className="notfound-message">
                        <h1 className="notfound-title">Page Not Found</h1>
                        <p className="notfound-subtitle">
                            Oops! The property you're looking for seems to have moved to a new location.
                        </p>
                        <p className="notfound-description">
                            Don't worry, we have plenty of amazing properties waiting for you to explore!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="notfound-actions">
                        <button
                            className="notfound-btn notfound-btn-primary"
                            onClick={() => navigate('/')}
                        >
                            <FaHome size={16} />
                            <span>Back to Home</span>
                        </button>
                        <button
                            className="notfound-btn notfound-btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            <FaArrowLeft size={16} />
                            <span>Go Back</span>
                        </button>
                    </div>

                    {/* Quick Links */}
                    <div className="notfound-quicklinks">
                        <h3 className="notfound-quicklinks-title">Quick Links</h3>
                        <div className="notfound-quicklinks-grid">
                            {quickLinks.map((link, index) => (
                                <button
                                    key={index}
                                    className="notfound-quicklink"
                                    onClick={() => navigate(link.path)}
                                >
                                    <span className="notfound-quicklink-icon">{link.icon}</span>
                                    <span className="notfound-quicklink-label">{link.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
