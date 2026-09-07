// ─────────────────────────────────────────────────────────────────────────────
// Central SEO configuration for IJ Estate & Builders
//
// One source of truth for every page's title, meta description, keywords,
// canonical URL and JSON-LD structured data. Import the helper you need in a
// page and drop <SEO {...seo.about} /> (or a builder) near the top of its JSX.
//
// Keyword strategy lives in /KEYWORD_MAP.md — keep the two in sync.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://ijestateandbuilders.com';
export const BRAND = 'IJ Estate & Builders';
export const PHONE = '+92-321-9607863'; // Business contact number
export const DEFAULT_OG = `${SITE_URL}/android-chrome-512x512.png`;

// ─── Reusable organisation node (RealEstateAgent = LocalBusiness subtype) ────
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    image: DEFAULT_OG,
    description:
        'IJ Estate & Builders is a trusted real estate agency in Bahria Town Lahore, offering verified houses, plots and commercial properties for sale and investment.',
    telephone: PHONE,
    priceRange: 'PKR',
    areaServed: [
        { '@type': 'City', name: 'Lahore' },
        { '@type': 'Place', name: 'Bahria Town Lahore' },
        { '@type': 'Place', name: 'DHA Lahore' },
    ],
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        addressCountry: 'PK',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 31.3684, longitude: 74.1897 },
    sameAs: [
        // TODO: add real profile URLs
        'https://www.facebook.com/',
        'https://www.instagram.com/',
    ],
};

// ─── Breadcrumb builder ──────────────────────────────────────────────────────
// trail: [{ name, path }] — path relative to site root, e.g. '/listings'
export function breadcrumb(trail) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
        })),
    };
}

// ─── WebPage builder (wraps a page node + breadcrumb into a graph) ───────────
function webPage({ path, name, description, trail }) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            organizationSchema,
            {
                '@type': 'WebPage',
                '@id': `${SITE_URL}${path}#webpage`,
                url: `${SITE_URL}${path}`,
                name,
                description,
                isPartOf: { '@id': `${SITE_URL}/#organization` },
                inLanguage: 'en-PK',
            },
            trail ? breadcrumb(trail) : null,
        ].filter(Boolean),
    };
}

// ─── Static page configs ─────────────────────────────────────────────────────
export const seo = {
    home: {
        title: 'IJ Estate & Builders | Real Estate in Bahria Town Lahore — Houses, Plots & Commercial',
        description:
            'Buy verified houses, plots and commercial property in Bahria Town Lahore with IJ Estate & Builders. Trusted property dealer for Safari Villas, Rafi Block, Johar Block, DHA & more. Explore listings in 3D.',
        keywords:
            'Bahria Town Lahore real estate, property dealer Bahria Town Lahore, houses for sale Bahria Town Lahore, plots for sale Bahria Town Lahore, IJ Estate & Builders, real estate agency Lahore',
        canonicalUrl: '/',
        structuredData: {
            '@context': 'https://schema.org',
            '@graph': [
                organizationSchema,
                {
                    '@type': 'WebSite',
                    '@id': `${SITE_URL}/#website`,
                    url: SITE_URL,
                    name: BRAND,
                    publisher: { '@id': `${SITE_URL}/#organization` },
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: `${SITE_URL}/listings?q={search_term_string}`,
                        'query-input': 'required name=search_term_string',
                    },
                },
            ],
        },
    },

    listings: {
        title: 'Houses & Plots for Sale in Bahria Town Lahore | IJ Estate & Builders',
        description:
            'Browse the latest houses and plots for sale in Bahria Town Lahore — 5 Marla, 10 Marla and 1 Kanal in Safari Villas, Rafi Block, Johar Block & more. Verified listings with prices by IJ Estate & Builders.',
        keywords:
            'houses for sale Bahria Town Lahore, plots for sale Bahria Town Lahore, 5 marla house Bahria Town Lahore, 10 marla plot Bahria Town, 1 kanal house Lahore, property for sale Lahore',
        canonicalUrl: '/listings',
        structuredData: webPage({
            path: '/listings',
            name: 'Property Listings in Bahria Town Lahore',
            description:
                'Verified houses and plots for sale in Bahria Town Lahore by IJ Estate & Builders.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Listings', path: '/listings' },
            ],
        }),
    },

    about: {
        title: 'About IJ Estate & Builders | Trusted Property Dealer in Bahria Town Lahore',
        description:
            'IJ Estate & Builders has 13+ years helping 1700+ families buy and sell property in Bahria Town Lahore. Learn about our team, values and track record as a trusted Lahore real estate agency.',
        keywords:
            'about IJ Estate & Builders, trusted property dealer Bahria Town Lahore, real estate agency Lahore, best property dealer Lahore',
        canonicalUrl: '/about',
        structuredData: webPage({
            path: '/about',
            name: 'About IJ Estate & Builders',
            description:
                'Trusted real estate agency serving Bahria Town Lahore for 13+ years.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
            ],
        }),
    },

    contact: {
        title: 'Contact IJ Estate & Builders | Real Estate Agent in Bahria Town Lahore',
        description:
            'Get in touch with IJ Estate & Builders to buy, sell or invest in property in Bahria Town Lahore. Call, email or send us a message and our agents will help you find the right home or plot.',
        keywords:
            'contact IJ Estate & Builders, real estate agent Bahria Town Lahore contact, property dealer Lahore phone number, buy property Bahria Town Lahore',
        canonicalUrl: '/contact',
        structuredData: {
            '@context': 'https://schema.org',
            '@graph': [
                organizationSchema,
                {
                    '@type': 'ContactPage',
                    '@id': `${SITE_URL}/contact#webpage`,
                    url: `${SITE_URL}/contact`,
                    name: 'Contact IJ Estate & Builders',
                    isPartOf: { '@id': `${SITE_URL}/#organization` },
                },
                breadcrumb([
                    { name: 'Home', path: '/' },
                    { name: 'Contact', path: '/contact' },
                ]),
            ],
        },
    },

    businessBay: {
        title: 'Business Bay Commercial Bahria Town Lahore | Plots for Sale — IJ Estate & Builders',
        description:
            'Invest in Business Bay Commercial, Bahria Town Lahore — a landmark commercial project with plots in multiple sizes for shops, offices and restaurants. Prices and availability by IJ Estate & Builders.',
        keywords:
            'Business Bay Commercial Bahria Town Lahore, commercial plots Bahria Town Lahore, shops for sale Bahria Town Lahore, commercial property Lahore, Business Bay plots price',
        canonicalUrl: '/commercial/business-bay',
        structuredData: webPage({
            path: '/commercial/business-bay',
            name: 'Business Bay Commercial, Bahria Town Lahore',
            description:
                'Commercial plots for sale in Business Bay, Bahria Town Lahore.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Commercial', path: '/commercial/business-bay' },
                { name: 'Business Bay', path: '/commercial/business-bay' },
            ],
        }),
    },

    commercial: {
        title: 'Commercial Property in Bahria Town Lahore | IJ Estate & Builders',
        description:
            'Explore commercial plots, shops and office space for sale in Bahria Town Lahore with IJ Estate & Builders — prime locations, wide boulevards and strong investment potential.',
        keywords:
            'commercial property Bahria Town Lahore, commercial plots Lahore, shops for sale Lahore, office space Bahria Town Lahore',
        canonicalUrl: '/commercial/generic',
        structuredData: webPage({
            path: '/commercial/generic',
            name: 'Commercial Property in Bahria Town Lahore',
            description: 'Commercial plots and shops for sale in Bahria Town Lahore.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Commercial', path: '/commercial/generic' },
            ],
        }),
    },

    map: {
        title: 'Bahria Town Lahore Map | Blocks, Sectors & Locations — IJ Estate & Builders',
        description:
            'Interactive map of Bahria Town Lahore — explore blocks, sectors and landmarks including Safari Villas, Rafi Block and Johar Block, and find properties for sale by location.',
        keywords:
            'Bahria Town Lahore map, Bahria Town blocks map, Bahria Town Lahore location, Safari Villas map, Rafi Block map',
        canonicalUrl: '/map',
        structuredData: webPage({
            path: '/map',
            name: 'Bahria Town Lahore Map',
            description: 'Interactive block and sector map of Bahria Town Lahore.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Map', path: '/map' },
            ],
        }),
    },

    virtual3d: {
        title: 'Bahria Town Lahore Virtual Tour & Street View | IJ Estate & Builders',
        description:
            'Take a 3D virtual tour and street view walk through Bahria Town Lahore landmarks and blocks — the Grand Mosque, Eiffel Tower, Cinema and more — before you visit in person.',
        keywords:
            'Bahria Town Lahore virtual tour, Bahria Town Lahore street view, Bahria Town 3D tour, Bahria Town Lahore landmarks',
        canonicalUrl: '/virtual-3d',
        structuredData: webPage({
            path: '/virtual-3d',
            name: 'Bahria Town Lahore Virtual Tour',
            description: '3D virtual tour and street view of Bahria Town Lahore.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Virtual Tour', path: '/virtual-3d' },
            ],
        }),
    },

    forums: {
        title: 'Bahria Town Lahore Property Community & Forum | IJ Estate & Builders',
        description:
            'Join the IJ Estate & Builders community forum to discuss property prices, investment tips and life in Bahria Town Lahore with buyers, sellers and residents.',
        keywords:
            'Bahria Town Lahore property forum, Bahria Town community, property investment discussion Lahore, Bahria Town Lahore prices',
        canonicalUrl: '/forums',
        structuredData: webPage({
            path: '/forums',
            name: 'Community Forums',
            description: 'Property discussion community for Bahria Town Lahore.',
            trail: [
                { name: 'Home', path: '/' },
                { name: 'Forums', path: '/forums' },
            ],
        }),
    },
};

// ─── Dynamic builder: property detail pages ──────────────────────────────────
// Builds SEO props from a property object (see src/data/propertiesData.js).
export function propertySeo(property) {
    if (!property) return { title: `Property | ${BRAND}`, noindex: true };

    const loc = property.block ? `${property.block}, Bahria Town Lahore` : 'Bahria Town Lahore';
    const title = `${property.name} — ${property.marla || ''} ${property.type || 'Property'} in ${loc} | ${BRAND}`.replace(/\s+/g, ' ');
    const description = (property.description || '').slice(0, 155).trim() +
        ` For sale at ${property.price || 'a great price'} by ${BRAND}.`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            organizationSchema,
            {
                '@type': ['Product', 'Residence'],
                '@id': `${SITE_URL}/property/${property.id}#product`,
                name: property.name,
                description: property.description,
                image: property.images && property.images.length ? property.images : undefined,
                brand: { '@id': `${SITE_URL}/#organization` },
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'PKR',
                    price: parsePrice(property.price),
                    availability: 'https://schema.org/InStock',
                    url: `${SITE_URL}/property/${property.id}`,
                    seller: { '@id': `${SITE_URL}/#organization` },
                },
            },
            breadcrumb([
                { name: 'Home', path: '/' },
                { name: 'Listings', path: '/listings' },
                { name: property.name, path: `/property/${property.id}` },
            ]),
        ],
    };

    return {
        title,
        description,
        keywords: `${property.name}, ${property.marla || ''} ${property.type || ''} Bahria Town Lahore, ${property.block || ''} property for sale, buy ${property.type || 'property'} Bahria Town Lahore`,
        canonicalUrl: `/property/${property.id}`,
        ogImage: property.image,
        ogType: 'product',
        structuredData,
    };
}

// "PKR 2.8 Crore" -> 28000000 (best-effort; omit if unparseable)
function parsePrice(price) {
    if (!price) return undefined;
    const m = String(price).match(/([\d.]+)\s*(crore|lakh|lac)?/i);
    if (!m) return undefined;
    const n = parseFloat(m[1]);
    const unit = (m[2] || '').toLowerCase();
    if (unit === 'crore') return Math.round(n * 10000000);
    if (unit === 'lakh' || unit === 'lac') return Math.round(n * 100000);
    return Math.round(n);
}
