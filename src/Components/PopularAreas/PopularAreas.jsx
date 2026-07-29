import './PopularAreas.css';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
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

// Location-specific areas data
const areasByLocation = {
    bahriatown: [
        {
            name: 'Clock Tower',
            image: img1,
            description: "The Clock Tower is the iconic landmark of Bahria Town Lahore. Inspired by Big Ben, it symbolizes elegance and modern living.",
            tags: ['Famous', 'Modern', 'Luxury'],
        },
        {
            name: 'Talwar Chowk',
            image: img8,
            description: "Trafalgar Square in Bahria Town Lahore is a landmark inspired by London's famous square, adding beauty to the community.",
            tags: ['Popular', 'Modern', 'Iconic'],
        },
        {
            name: 'Eiffle Tower',
            image: img3,
            description: "The Eiffel Tower in Bahria Town Lahore is a beautiful replica of the famous Paris landmark, symbolizing elegance and charm.",
            tags: ['Affordable', 'Modern', 'Premium'],
        },
        {
            name: 'Grand Mosque',
            image: img4,
            description: "The Grand Mosque in Bahria Town Lahore is a magnificent symbol of Islamic architecture and spirituality.",
            tags: ['Affordable', 'Modern', 'Established'],
        },
        {
            name: 'Raiha CineGold Plex',
            image: img5,
            description: "Raiha CineGold Plex offers a modern cinema experience with comfortable seating and the latest movie screenings.",
            tags: ['Modern', 'Expensive', 'Luxury'],
        },
        {
            name: 'Winterland & Carnival',
            image: img6,
            description: "Winterland and Carnival offer exciting rides, fun attractions, and entertainment for visitors of all ages.",
            tags: ['Affordable', 'Modern', 'Premium'],
        },
        {
            name: 'Bahria Golf & Country Club',
            image: img7,
            description: "Bahria Golf and Country Club offers a premium golfing experience with beautiful landscapes and modern facilities.",
            tags: ['Affordable', 'Modern', 'Premium'],
        },
        {
            name: 'Bahria Town School & College',
            image: img2,
            description: "Bahria Town School & College provides quality education in a modern and supportive learning environment.",
            tags: ['Affordable', 'Modern', 'Premium'],
        },
    ],
    dharaya: [
        {
            name: 'DHA Golf Club',
            image: img9,
            description: "DHA Golf Club offers world-class golfing facilities with lush green courses and premium amenities.",
            tags: ['Premium', 'Luxury', 'Sports'],
        },
        {
            name: 'DHA Commercial',
            image: img9,
            description: "DHA Commercial area is the heart of business and shopping, offering modern shops, restaurants, and offices.",
            tags: ['Popular', 'Modern', 'Business'],
        },
        {
            name: 'DHA Central Park',
            image: img9,
            description: "DHA Central Park provides a peaceful green space for families to enjoy outdoor activities and relaxation.",
            tags: ['Family', 'Modern', 'Recreation'],
        },
        {
            name: 'DHA Sports Complex',
            image: img9,
            description: "DHA Sports Complex features state-of-the-art facilities for various sports including cricket, football, and tennis.",
            tags: ['Sports', 'Modern', 'Premium'],
        },
    ],
    etihadtown: [
        {
            name: 'Etihad Mall',
            image: img10,
            description: "Etihad Mall is a modern shopping destination offering a wide range of brands, dining, and entertainment options.",
            tags: ['Shopping', 'Modern', 'Popular'],
        },
        {
            name: 'Etihad Town Park',
            image: img10,
            description: "Etihad Town Park offers beautiful landscapes and recreational facilities for families and fitness enthusiasts.",
            tags: ['Family', 'Recreation', 'Modern'],
        },
        {
            name: 'Etihad Commercial Hub',
            image: img10,
            description: "Etihad Commercial Hub is a bustling business center with offices, shops, and restaurants.",
            tags: ['Business', 'Modern', 'Growing'],
        },
    ],
    uniontown: [
        {
            name: 'Union Town Market',
            image: img11,
            description: "Union Town Market is a vibrant shopping area offering local and branded stores for everyday needs.",
            tags: ['Shopping', 'Affordable', 'Popular'],
        },
        {
            name: 'Union Town Mosque',
            image: img11,
            description: "Union Town Mosque is a beautiful place of worship serving the community with modern facilities.",
            tags: ['Religious', 'Modern', 'Community'],
        },
        {
            name: 'Union Town School System',
            image: img11,
            description: "Union Town School System provides quality education with modern teaching methods and facilities.",
            tags: ['Education', 'Modern', 'Growing'],
        },
    ],
};

function PopularAreas({ currentLocation = 'bahriatown' }) {
    const navigate = useNavigate();

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

    const handleExplore = (areaName) => {
        navigate('/listings', { state: { mode: 'area', selected: areaName } });
    };
    return (
        <section className="popular-areas" id="areas">
            <div className="popular-areas__container">
                <h2 className="popular-areas__title">Popular Areas in {locationDisplayName}</h2>

                <div className="popular-areas__grid">
                    {areas.map((area) => (
                        <div key={area.name} className="popular-areas__card">

                            {/* Image */}
                            <div className="popular-areas__img-wrap">
                                <img
                                    src={area.image}
                                    alt={area.name}
                                    className="popular-areas__img"
                                />
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
                                onClick={() => handleExplore(area.name)}
                            >
                                Explore Properties
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PopularAreas;
