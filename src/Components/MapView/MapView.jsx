import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { FaChevronLeft, FaMap, FaStreetView, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { MdMyLocation } from 'react-icons/md';
import './MapView.css';

// Placeholder map image - user will replace with actual Bahria Town map
import mapPlaceholder from '../../Assets/images/bahriamap.png';

// Google Maps API Key - IMPORTANT: Replace with your actual API key
// Get your key at: https://console.cloud.google.com/
// Follow instructions in GOOGLE_MAPS_SETUP.md in the project root
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAC2eaZ1U6Ek-DzEUWLn8wcGhLk9npiFzo';

function MapView() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('map');
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const [apiError, setApiError] = useState(false);
    const [mapLightboxOpen, setMapLightboxOpen] = useState(false);
    const panoramaRef = useRef(null);
    const streetViewRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Load Google Maps Script
    useEffect(() => {
        // Check if API key is set
        if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            setApiError(true);
            console.error('⚠️ Please add your Google Maps API key in MapView.jsx or .env file');
            return;
        }

        if (window.google) {
            setMapsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapsLoaded(true);
        script.onerror = () => {
            setApiError(true);
            console.error('Failed to load Google Maps API. Check your API key and billing settings.');
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Initialize Street View when modal opens
    useEffect(() => {
        if (!virtualTourOpen || !panoramaRef.current || !mapsLoaded || !window.google) return;

        try {
            // Multiple Bahria Town Lahore locations with confirmed Street View coverage
            const locations = [
                { lat: 31.3574, lng: 74.1733, name: "Main Boulevard" },
                { lat: 31.3414, lng: 74.1683, name: "Civic Center" },
                { lat: 31.3500, lng: 74.1800, name: "Safari Villas" },
            ];

            const primaryLocation = locations[0];

            // Create Street View Service to check coverage
            const streetViewService = new window.google.maps.StreetViewService();

            // First check if Street View is available at this location
            streetViewService.getPanorama(
                {
                    location: primaryLocation,
                    radius: 50, // Search within 50 meters
                    source: window.google.maps.StreetViewSource.OUTDOOR, // Use outdoor imagery
                },
                (data, status) => {
                    if (status === window.google.maps.StreetViewStatus.OK) {
                        // Street View is available, initialize panorama
                        const panorama = new window.google.maps.StreetViewPanorama(
                            panoramaRef.current,
                            {
                                position: data.location.latLng,
                                pov: { heading: 165, pitch: 0 },
                                zoom: 1,
                                addressControl: true,
                                linksControl: true,
                                panControl: true,
                                enableCloseButton: false,
                                fullscreenControl: false,
                                motionTracking: true,
                                motionTrackingControl: true,
                                showRoadLabels: true,
                                visible: true,
                            }
                        );

                        streetViewRef.current = panorama;

                        // Add listener for panorama errors
                        panorama.addListener('status_changed', () => {
                            if (panorama.getStatus() !== 'OK') {
                                console.error('Street View status error:', panorama.getStatus());
                            }
                        });
                    } else {
                        // No Street View available, show error
                        console.error('Street View not available at this location:', status);

                        // Display error message in the panorama container
                        if (panoramaRef.current) {
                            panoramaRef.current.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #1a1a1a; color: white; flex-direction: column; gap: 1rem; padding: 2rem; text-align: center;">
                                    <div style="font-size: 3rem;">🗺️</div>
                                    <h3 style="margin: 0; font-size: 1.5rem;">Street View Not Available</h3>
                                    <p style="margin: 0; color: #94a3b8; max-width: 500px;">
                                        Street View imagery is not available at this exact location in Bahria Town Lahore. 
                                        This may be due to limited coverage in the area.
                                    </p>
                                    <button 
                                        onclick="window.open('https://www.google.com/maps/@31.3574,74.1733,3a,75y,90t/data=!3m7!1e1!3m5!1s-!2e0!6s!7i16384!8i8192', '_blank')"
                                        style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #1e90ff, #0d5bb5); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 600;"
                                    >
                                        Open in Google Maps
                                    </button>
                                </div>
                            `;
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Error initializing Street View:', error);
        }

        return () => {
            if (streetViewRef.current) {
                streetViewRef.current = null;
            }
        };
    }, [virtualTourOpen, mapsLoaded]);

    // Handle escape key to close virtual tour and lightbox
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (virtualTourOpen) setVirtualTourOpen(false);
                if (mapLightboxOpen) setMapLightboxOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [virtualTourOpen, mapLightboxOpen]);

    const openVirtualTour = () => {
        if (apiError) {
            alert('Google Maps API key is not configured.\n\nPlease follow these steps:\n\n1. Get a free API key at: https://console.cloud.google.com/\n2. Enable Maps JavaScript API\n3. Add your key to .env file as:\n   REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here\n\nOR edit MapView.jsx line 11 directly.\n\nSee GOOGLE_MAPS_SETUP.md for detailed instructions.');
            return;
        }

        if (!mapsLoaded) {
            alert('Google Maps is still loading. Please try again in a moment.');
            return;
        }
        setVirtualTourOpen(true);
    };

    const closeVirtualTour = () => {
        setVirtualTourOpen(false);
        setIsFullscreen(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const openGoogleMaps = () => {
        window.open('https://www.google.com/maps/place/Bahria+Town+Lahore/@31.3414345,74.1682847,13z', '_blank');
    };

    const openMapLightbox = () => {
        setMapLightboxOpen(true);
    };

    const downloadMap = () => {
        const link = document.createElement('a');
        link.href = mapPlaceholder;
        link.download = 'Bahria-Town-Lahore-Map.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printMap = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bahria Town Lahore Map</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        h2 { font-family: Arial, sans-serif; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h2>Bahria Town Lahore Map</h2>
                    <img src="${mapPlaceholder}" alt="Bahria Town Lahore Map" />
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="map-view-page">
            <Navbar />

            {/* Breadcrumb */}
            <div className="map-view-breadcrumb">
                <div className="map-view-breadcrumb__inner">
                    <button onClick={() => navigate(-1)} className="map-view-breadcrumb__back">
                        <FaChevronLeft size={12} /> Back
                    </button>
                    <span className="map-view-breadcrumb__sep">›</span>
                    <button className="map-view-breadcrumb__link" onClick={() => navigate('/')}>Home</button>
                    <span className="map-view-breadcrumb__sep">›</span>
                    <span className="map-view-breadcrumb__current">Map</span>
                </div>
            </div>

            <div className="map-view-container">
                {/* Header */}
                <div className="map-view-header">
                    <div className="map-view-header__content">
                        <h1 className="map-view-header__title">
                            <FaMap className="map-view-header__icon" />
                            Bahria Town Lahore Map
                        </h1>
                        <p className="map-view-header__subtitle">
                            Explore our community through interactive maps and virtual tours
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="map-view-tabs">
                    <button
                        className={`map-view-tab ${activeTab === 'map' ? 'map-view-tab--active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        <FaMap size={16} />
                        <span>Map</span>
                    </button>
                    {/* <button
                        className={`map-view-tab ${activeTab === 'virtual' ? 'map-view-tab--active' : ''}`}
                        onClick={() => setActiveTab('virtual')}
                    >
                        <FaStreetView size={16} />
                        <span>Virtual Tour</span>
                    </button> */}
                    <button
                        className={`map-view-tab ${activeTab === 'google' ? 'map-view-tab--active' : ''}`}
                        onClick={() => setActiveTab('google')}
                    >
                        <MdMyLocation size={16} />
                        <span>Google Maps</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="map-view-content">
                    {activeTab === 'map' && (
                        <div className="map-view-static">
                            <div className="map-view-static__container">
                                <img
                                    src={mapPlaceholder}
                                    alt="Bahria Town Lahore Map"
                                    className="map-view-static__image"
                                />
                                <div className="map-view-static__overlay">
                                    <p className="map-view-static__note">
                                        Map of Bahria Town Lahore
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar with Actions */}
                            <div className="map-view-sidebar">
                                <div className="map-view-sidebar__card">
                                    <div className="map-view-sidebar__header">
                                        <FaMap className="map-view-sidebar__icon" size={32} />
                                        <h3 className="map-view-sidebar__title">Map Actions</h3>
                                        <p className="map-view-sidebar__subtitle">
                                            Explore and interact with the map
                                        </p>
                                    </div>

                                    <div className="map-view-sidebar__actions">
                                        <button
                                            className="map-view-sidebar__btn map-view-sidebar__btn--primary"
                                            onClick={openMapLightbox}
                                        >
                                            <FaExpand size={16} />
                                            <span>View Fullscreen</span>
                                        </button>

                                        <button
                                            className="map-view-sidebar__btn"
                                            onClick={downloadMap}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            <span>Download Map</span>
                                        </button>

                                        <button
                                            className="map-view-sidebar__btn"
                                            onClick={printMap}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                <rect x="6" y="14" width="12" height="8"></rect>
                                            </svg>
                                            <span>Print Map</span>
                                        </button>

                                        <button
                                            className="map-view-sidebar__btn"
                                            onClick={openGoogleMaps}
                                        >
                                            <MdMyLocation size={16} />
                                            <span>Open in Google Maps</span>
                                        </button>
                                    </div>

                                    <div className="map-view-sidebar__info">
                                        <div className="map-view-sidebar__info-item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <p>
                                                <strong>Interactive Map</strong>
                                                <span>Click "View Fullscreen" to zoom and explore the detailed map of Bahria Town Lahore.</span>
                                            </p>
                                        </div>

                                        <div className="map-view-sidebar__info-item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <p>
                                                <strong>Location</strong>
                                                <span>Bahria Town, Lahore, Punjab, Pakistan</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'virtual' && (
                        <div className="map-view-virtual">
                            <div className="map-view-virtual__card">
                                <div className="map-view-virtual__icon-wrap">
                                    <FaStreetView size={48} />
                                </div>
                                <h2 className="map-view-virtual__title">360° Virtual Tour</h2>
                                <p className="map-view-virtual__desc">
                                    Experience Bahria Town Lahore like never before. Navigate through streets,
                                    explore neighborhoods, and discover amenities with our live Google Street View integration.
                                </p>
                                <div className="map-view-virtual__info">
                                    ℹ️ <strong>Important:</strong> Demo/test API keys don't support Street View.
                                    You need a valid Google Maps API key with billing enabled.
                                </div>
                                <button
                                    className="map-view-virtual__btn"
                                    onClick={openVirtualTour}
                                    disabled={apiError}
                                >
                                    <FaStreetView size={18} />
                                    Start Virtual Tour
                                </button>
                                {apiError && (
                                    <div className="map-view-virtual__error">
                                        <p>⚠️ Google Maps API key required</p>
                                        <p className="map-view-virtual__error-detail">
                                            Please add your API key to use this feature.
                                            <br />
                                            See <strong>GOOGLE_MAPS_SETUP.md</strong> for instructions.
                                        </p>
                                    </div>
                                )}
                                {!mapsLoaded && !apiError && (
                                    <p className="map-view-virtual__loading">Loading Google Maps...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'google' && (
                        <div className="map-view-google">
                            <div className="map-view-google__card">
                                <div className="map-view-google__icon-wrap">
                                    <MdMyLocation size={48} />
                                </div>
                                <h2 className="map-view-google__title">Google Maps Navigation</h2>
                                <p className="map-view-google__desc">
                                    Get real-time directions, traffic updates, and satellite views
                                    of Bahria Town Lahore on Google Maps.
                                </p>
                                <button
                                    className="map-view-google__btn"
                                    onClick={openGoogleMaps}
                                >
                                    <MdMyLocation size={18} />
                                    Open in Google Maps
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {/* Map Lightbox */}
            {mapLightboxOpen && (
                <div className="map-lightbox" onClick={() => setMapLightboxOpen(false)}>
                    <button className="map-lightbox__close" onClick={() => setMapLightboxOpen(false)}>
                        <FaTimes size={20} />
                    </button>
                    <img
                        src={mapPlaceholder}
                        alt="Bahria Town Lahore Map - Fullscreen"
                        className="map-lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="map-lightbox__controls">
                        <button className="map-lightbox__control-btn" onClick={(e) => { e.stopPropagation(); downloadMap(); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>
                        <button className="map-lightbox__control-btn" onClick={(e) => { e.stopPropagation(); printMap(); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Print
                        </button>
                    </div>
                    <p className="map-lightbox__title">Bahria Town Lahore Map</p>
                </div>
            )}

            {/* Virtual Tour Modal with Real Google Street View */}
            {virtualTourOpen && (
                <div className={`virtual-tour-modal ${isFullscreen ? 'virtual-tour-modal--fullscreen' : ''}`}>
                    <div className="virtual-tour-modal__backdrop" onClick={closeVirtualTour} />

                    <div className="virtual-tour-modal__container">
                        {/* Header Controls */}
                        <div className="virtual-tour-modal__header">
                            <div className="virtual-tour-modal__title">
                                <FaStreetView size={20} />
                                <span>360° Virtual Tour - Bahria Town Lahore</span>
                            </div>
                            <div className="virtual-tour-modal__controls">
                                <button
                                    className="virtual-tour-modal__control-btn"
                                    onClick={toggleFullscreen}
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                </button>
                                <button
                                    className="virtual-tour-modal__control-btn virtual-tour-modal__control-btn--close"
                                    onClick={closeVirtualTour}
                                    title="Close (Esc)"
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Google Street View Panorama */}
                        <div
                            ref={panoramaRef}
                            className="virtual-tour-modal__streetview"
                        >
                            {/* Loading indicator */}
                            <div className="virtual-tour-modal__loading">
                                <div className="virtual-tour-modal__loading-spinner"></div>
                                <p>Loading Street View...</p>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="virtual-tour-modal__footer">
                            <p className="virtual-tour-modal__footer-text">
                                📍 Bahria Town Lahore - Use mouse to look around, click arrows to navigate
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;
