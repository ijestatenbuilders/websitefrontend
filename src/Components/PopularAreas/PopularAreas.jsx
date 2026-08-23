import { useState, useRef, useEffect } from 'react';
import './PopularAreas.css';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useReveal } from '../../utils/useReveal';
import img1 from '../../Assets/images/clocktower.jfif';
import img2 from '../../Assets/images/school.png';
import img3 from '../../Assets/images/eiffletower.png';
import img4 from '../../Assets/images/background.jpeg';
import img5 from '../../Assets/images/cinema.jpg';
import img6 from '../../Assets/images/carnival.png';
import img7 from '../../Assets/images/countryclub.jpg';
import img8 from '../../Assets/images/talwar.png';
import img9 from '../../Assets/images/dha.jpg';
import img10 from '../../Assets/images/etihad.png';
import img11 from '../../Assets/images/union.jpg';
import img12 from '../../Assets/images/dolmenwebp.webp';

// Location-specific areas data
// Each area has a `block` field — the nearest real block in the backend
const areasByLocation = {
    bahriatown: [
        {
            name: 'Clock Tower',
            image: img1,
            description: "The Clock Tower is the iconic landmark of Bahria Town Lahore. Inspired by Big Ben, it symbolizes elegance and modern living.",
            tags: ['Famous', 'Modern', 'Luxury'],
            block: 'Tauheed Block',
        },
        {
            name: 'Talwar Chowk',
            image: img8,
            description: "Trafalgar Square in Bahria Town Lahore is a landmark inspired by London's famous square, adding beauty to the community.",
            tags: ['Popular', 'Modern', 'Iconic'],
            block: 'Quaid Block',
        },
        {
            name: 'Eiffle Tower',
            image: img3,
            description: "The Eiffel Tower in Bahria Town Lahore is a beautiful replica of the famous Paris landmark, symbolizing elegance and charm.",
            tags: ['Affordable', 'Modern', 'Premium'],
            block: 'Ghaznavi Block',
        },
        {
            name: 'Grand Mosque',
            image: img4,
            description: "The Grand Mosque in Bahria Town Lahore is a magnificent symbol of Islamic architecture and spirituality.",
            tags: ['Affordable', 'Modern', 'Established'],
            block: 'Johar Block',
        },
        {
            name: 'Raiha CineGold Plex',
            image: img5,
            description: "Raiha CineGold Plex offers a modern cinema experience with comfortable seating and the latest movie screenings.",
            tags: ['Modern', 'Expensive', 'Luxury'],
            block: 'Umar Block',
        },
        {
            name: 'Winterland & Carnival',
            image: img6,
            description: "Winterland and Carnival offer exciting rides, fun attractions, and entertainment for visitors of all ages.",
            tags: ['Affordable', 'Modern', 'Premium'],
            block: 'Ghazi Block',
        },
        {
            name: 'Bahria Golf & Country Club',
            image: img7,
            description: "Bahria Golf and Country Club offers a premium golfing experience with beautiful landscapes and modern facilities.",
            tags: ['Affordable', 'Modern', 'Premium'],
            block: 'Safari Villas',
        },
        {
            name: 'Bahria Town School & College',
            image: img2,
            description: "Bahria Town School & College provides quality education in a modern and supportive learning environment.",
            tags: ['Affordable', 'Modern', 'Premium'],
            block: 'Jasmine Block',
        },
    ],
    dharaya: [
        {
            name: 'Dolmen Mall',
            image: img12,
            description: "Dolmen Malls is a premier chain of modern shopping centers in Pakistan operated by the Dolmen Group.",
            tags: ['Premium', 'Luxury', 'Sports'],
            block: 'Overseas A',
        },
        {
            name: 'Golf & Country Club',
            image: img9,
            description: "DHA Commercial area is the heart of business and shopping, offering modern shops, restaurants, and offices.",
            tags: ['Popular', 'Modern', 'Business'],
            block: 'BB Block',
        },
        {
            name: 'DHA Central Park',
            image: img9,
            description: "DHA Central Park provides a peaceful green space for families to enjoy outdoor activities and relaxation.",
            tags: ['Family', 'Modern', 'Recreation'],
            block: 'Hussain Block',
        },
        {
            name: 'DHA Sports Complex',
            image: img9,
            description: "DHA Sports Complex features state-of-the-art facilities for various sports including cricket, football, and tennis.",
            tags: ['Sports', 'Modern', 'Premium'],
            block: 'Sikandar Block',
        },
    ],
    etihadtown: [
        {
            name: 'Etihad Mall',
            image: img10,
            description: "Etihad Mall is a modern shopping destination offering a wide range of brands, dining, and entertainment options.",
            tags: ['Shopping', 'Modern', 'Popular'],
            block: 'Alamgir Block',
        },
        {
            name: 'Etihad Town Park',
            image: img10,
            description: "Etihad Town Park offers beautiful landscapes and recreational facilities for families and fitness enthusiasts.",
            tags: ['Family', 'Recreation', 'Modern'],
            block: 'Alamgir Ext',
        },
        {
            name: 'Etihad Commercial Hub',
            image: img10,
            description: "Etihad Commercial Hub is a bustling business center with offices, shops, and restaurants.",
            tags: ['Business', 'Modern', 'Growing'],
            block: 'New Shaheen Block',
        },
    ],
    uniontown: [
        {
            name: 'Union Town Market',
            image: img11,
            description: "Union Town Market is a vibrant shopping area offering local and branded stores for everyday needs.",
            tags: ['Shopping', 'Affordable', 'Popular'],
            block: 'Tipu Extension',
        },
        {
            name: 'Union Town Mosque',
            image: img11,
            description: "Union Town Mosque is a beautiful place of worship serving the community with modern facilities.",
            tags: ['Religious', 'Modern', 'Community'],
            block: 'Tipu Extension',
        },
        {
            name: 'Union Town School System',
            image: img11,
            description: "Union Town School System provides quality education with modern teaching methods and facilities.",
            tags: ['Education', 'Modern', 'Growing'],
            block: 'Tipu Extension',
        },
    ],
};

function PopularAreas({ currentLocation = 'bahriatown' }) {
    const navigate = useNavigate();
    const revealRef = useReveal();

    // DOM refs for RAF-driven scroll parallax
    const gridRef = useRef(null);
    const headerRef = useRef(null);
    const bgGridRef = useRef(null);
    const cardInnerRefs = useRef([]);
    const imgRefs = useRef([]);

    // Get areas for the current location
    const areas = areasByLocation[currentLocation] || areasByLocation.bahriatown;

    // Get location display name
    const locationNames = {
        bahriatown: 'Bahria Town Lahore',
        dharaya: 'DHA Raya Lahore',
        etihadtown: 'Etihad Town Lahore',
        uniontown: 'Union Town Lahore',
    };

    const locationDisplayName = locationNames[currentLocation] || 'Bahria Town Lahore';

    // Internal RAF loop — background parallax & tilt on inner elements (never overrides entrance transform)
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

            if (bgGridRef.current) {
                bgGridRef.current.style.transform = `translate3d(0, ${((sy - 2800) * 0.07).toFixed(2)}px, 0)`;
            }
            if (headerRef.current) {
                headerRef.current.style.transform = `translate3d(0, ${((sy - 2850) * -0.038).toFixed(2)}px, 0)`;
            }

            imgRefs.current.forEach((img) => {
                if (!img) return;
                img.style.transform = `scale(1.06) translate3d(0, ${((sy - 2900) * 0.025).toFixed(2)}px, 0)`;
            });

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(animId);
        };
    }, []);

    const handleCardMouseMove = (index, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (-y * 9).toFixed(2);
        const ry = (x * 10).toFixed(2);
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        if (cardInnerRefs.current[index]) {
            cardInnerRefs.current[index].style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            cardInnerRefs.current[index].style.setProperty('--pa-mouse-x', `${px}px`);
            cardInnerRefs.current[index].style.setProperty('--pa-mouse-y', `${py}px`);
        }
    };

    const handleCardMouseLeave = (index) => {
        if (cardInnerRefs.current[index]) {
            cardInnerRefs.current[index].style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        }
    };

    const handleExplore = (area) => {
        navigate('/listings', {
            state: {
                mode: 'block',
                selected: area.block,
                propertyType: 'All',
            }
        });
    };

    return (
        <section className="popular-areas" id="areas" ref={revealRef}>
            {/* Parallax Blueprint Grid */}
            <div
                className="popular-parallax-grid"
                ref={bgGridRef}
                aria-hidden="true"
            />

            <div className="popular-areas__container">
                <div className="popular-header-wrap" ref={headerRef} data-reveal="fade-up">
                    <div className="popular-eyebrow">
                        <span className="popular-eyebrow-pulse" />
                        <span>LANDMARKS & PRIME LOCALES</span>
                    </div>
                    <h2 className="popular-areas__title">Popular Areas in {locationDisplayName}</h2>
                    <p className="popular-areas__subtitle">
                        Explore iconic architectural wonders, vibrant commercial squares, and high-yield lifestyle communities.
                    </p>
                </div>

                <div className="popular-areas__grid" ref={gridRef}>
                    {areas.map((area, index) => (
                        <div
                            key={area.name}
                            className="popular-areas__card-reveal"
                            data-reveal="pop-scale"
                            data-delay={index % 8}
                        >
                            <div
                                className="popular-areas__card"
                                ref={(el) => { cardInnerRefs.current[index] = el; }}
                                onMouseMove={(e) => handleCardMouseMove(index, e)}
                                onMouseLeave={() => handleCardMouseLeave(index)}
                            >
                                {/* Image with parallax viewport translation & floating tag */}
                                <div className="popular-areas__img-wrap">
                                    <span className="popular-areas__floating-tag">
                                        ✦ {area.tags[0] || 'Prime'}
                                    </span>
                                    <img
                                        src={area.image}
                                        alt={area.name}
                                        className="popular-areas__img"
                                        ref={(el) => { imgRefs.current[index] = el; }}
                                    />
                                    <div className="popular-areas__img-overlay" />
                                </div>

                                {/* Icon + Name */}
                                <div className="popular-areas__card-icon">
                                    <FaMapMarkerAlt size={18} />
                                    <h3 className="popular-areas__card-name">{area.name}</h3>
                                </div>

                                <p className="popular-areas__card-desc">{area.description}</p>

                                <div className="popular-areas__tags">
                                    {area.tags.map((tag) => (
                                        <span key={tag} className="popular-areas__tag">{tag}</span>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="popular-areas__link"
                                    onClick={() => handleExplore(area)}
                                >
                                    <span>Explore Properties</span>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PopularAreas;

