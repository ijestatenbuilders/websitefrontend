import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaStreetView, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import './StreetView.css';

// Society centres — used when a property has no coordinates of its own yet.
const LOCATION_DEFAULTS = {
    bahriatown: { lat: 31.3684, lng: 74.1858 },  // Grand Jamia / Main Boulevard area
    dharaya:    { lat: 31.2789, lng: 74.2650 },
    etihadtown: { lat: 31.4028, lng: 74.1560 },
    uniontown:  { lat: 31.4550, lng: 74.2260 },
};

// Pull "@lat,lng" / "!3dlat!4dlng" / "q=lat,lng" out of a pasted Google Maps URL.
function coordsFromMapUrl(url) {
    if (!url) return null;
    const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/,
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
        /[?&](?:q|query|ll|sll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
    return null;
}

// Decide the best coordinates we have for a property.
function resolveCoords(property) {
    if (property?.latitude != null && property?.longitude != null) {
        return { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) };
    }
    const fromUrl = coordsFromMapUrl(property?.map_url || property?.mapUrl);
    if (fromUrl) return fromUrl;
    return LOCATION_DEFAULTS[property?.location] || LOCATION_DEFAULTS.bahriatown;
}

// Keyless, interactive Street View embed URL for a lat/lng (+ optional heading).
function embedFor(lat, lng, heading = 0) {
    return `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,${heading},0,0,0&output=svembed`;
}

// Turn whatever the admin pasted (or the property coords) into an embeddable
// Street View iframe URL.
function resolveEmbed(property) {
    const raw = property?.street_view_url;
    if (raw) {
        // Already embeddable (Google "Embed a map" iframe, or an svembed link).
        if (raw.includes('output=svembed') || raw.includes('/maps/embed?pb=')) return raw;
        // A shared Street View link: @lat,lng,3a,75y,<heading>h,<tilt>t
        const m = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,[\d.]+a)?(?:,[\d.]+y)?(?:,(-?[\d.]+)h)?/);
        if (m) return embedFor(m[1], m[2], m[3] ? Math.round(parseFloat(m[3])) : 0);
        // Any other maps link that still carries coordinates.
        const c = coordsFromMapUrl(raw);
        if (c) return embedFor(c.lat, c.lng);
    }
    const c = resolveCoords(property);
    return embedFor(c.lat, c.lng);
}

function StreetView({ property }) {
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const coords = resolveCoords(property);
    // Keyless, interactive Street View embed — no API key or billing required.
    // Prefers a pasted Street View link, else falls back to the property coords.
    const embedUrl = resolveEmbed(property);
    const gmapsUrl = property?.street_view_url
        || `https://www.google.com/maps/@${coords.lat},${coords.lng},18z/data=!3m1!1e3`;

    // Close on Escape + lock page scroll while the fullscreen view is open.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    const openView = () => { setLoaded(false); setOpen(true); };

    return (
        <>
            <button className="sv-trigger" onClick={openView}>
                <FaStreetView size={15} /> View in Street View
            </button>

            {open && createPortal(
                <div className="sv-fs">
                    {/* Panorama fills the entire screen */}
                    <iframe
                        title={`Street View — ${property?.name || 'Property'}`}
                        className="sv-fs__pano"
                        src={embedUrl}
                        allowFullScreen
                        loading="lazy"
                        onLoad={() => setLoaded(true)}
                    />

                    {/* Floating close button */}
                    <button
                        className="sv-fs__close"
                        onClick={() => setOpen(false)}
                        title="Close (Esc)"
                        aria-label="Close Street View"
                    >
                        <FaTimes size={20} />
                    </button>

                    {!loaded && (
                        <div className="sv-fs__overlay">
                            <div className="sv-fs__spinner" />
                            <p>Loading Street View…</p>
                        </div>
                    )}

                    {/* Bottom hint bar */}
                    <div className="sv-fs__hint">
                        <span>📍 Drag to look around · click the arrows to walk down the street</span>
                        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                            <FaExternalLinkAlt size={12} /> Open in Google Maps
                        </a>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default StreetView;
