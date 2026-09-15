import { Helmet } from 'react-helmet-async';

function SEO({ 
    title, 
    description, 
    keywords, 
    canonicalUrl,
    ogImage,
    ogType = 'website',
    structuredData,
    noindex = false
}) {
    const siteUrl = 'https://ijestateandbuilders.com';
    // Must point at a file that actually exists in /public. logo512.png was
    // never shipped, so this default previously 404'd on every page's social
    // share preview. android-chrome-512x512.png is the real 512px asset.
    const defaultImage = `${siteUrl}/android-chrome-512x512.png`;
    const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
    
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullUrl} />
            
            {/* Robots */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            )}
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultImage} />
            <meta property="og:site_name" content="IJ Estate & Builders" />
            <meta property="og:locale" content="en_PK" />
            
            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage || defaultImage} />
            
            {/* Additional Meta Tags */}
            <meta name="author" content="IJ Estate & Builders" />
            <meta name="geo.region" content="PK-PB" />
            <meta name="geo.placename" content="Bahria Town Lahore" />
            {/* Bahria Town Lahore coords — matches the RealEstateAgent geo node
                in seoConfig.js so location signals are consistent, not Lahore centre. */}
            <meta name="geo.position" content="31.3684;74.1897" />
            <meta name="ICBM" content="31.3684, 74.1897" />
            
            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}

export default SEO;
