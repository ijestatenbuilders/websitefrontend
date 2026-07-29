// Shared Business Bay Commercial plot data
// Used by both BusinessBayCommercial page and PropertyListings

import fourkanal from '../Assets/images/8.jpg';
import threekanal from '../Assets/images/3.jpg';
import tenmarla from '../Assets/images/1.jpg';
import clocktower from '../Assets/images/clocktower.png';

export const bbcPlots = [
    {
        id: 'bbc-1',
        size: '4 Kanal',
        price: 'PKR 26 Lakh Per Marla',
        features: ['Prime Location', 'Corner Plot', 'Main Boulevard'],
        badge: 'Newly Launched',
        image: fourkanal,
    },
    {
        id: 'bbc-2',
        size: '3 Kanal',
        price: 'PKR 26 Lakh Per Marla',
        features: ['Near Entrance', 'High Visibility', 'Developed Area'],
        badge: 'Newly Launched',
        image: threekanal,
    },
    {
        id: 'bbc-3',
        size: '1.25 Kanal',
        price: 'PKR 19 Crore',
        features: ['Premium Block', 'Investment Ready', 'Easy Access'],
        badge: 'Newly Launched',
        image: clocktower,
    },
    {
        id: 'bbc-4',
        size: '10 Marla',
        price: 'PKR 8 Crore',
        features: ['Commercial Zone', 'Prime Location', 'High ROI'],
        badge: 'Newly Launched',
        image: tenmarla,
    },
    {
        id: 'bbc-5',
        size: '5 Marla',
        price: 'PKR 5 Crore',
        features: ['Ideal for Retail', 'Affordable', 'Main Road'],
        badge: 'Newly Launched',
        image: clocktower,
    },
];

export const bbcUniqueSizes = ['All', ...new Set(bbcPlots.map(p => p.size))];
