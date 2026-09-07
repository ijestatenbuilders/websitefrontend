// Shared Street View helpers — turn coordinates or a pasted Google Maps link
// into a keyless, interactive Street View embed URL (no API key / billing).

// Keyless, interactive Street View embed URL for a lat/lng (+ optional heading).
export function embedFor(lat, lng, heading = 0) {
    return `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,${heading},0,0,0&output=svembed`;
}

// Pull "@lat,lng" / "!3dlat!4dlng" / "q=lat,lng" out of a pasted Google Maps URL.
export function coordsFromMapUrl(url) {
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

// Turn whatever was pasted (embed link, Street View share link, or any maps URL
// carrying coordinates) into an embeddable Street View iframe URL.
export function embedFromUrl(raw) {
    if (!raw) return null;
    // Already embeddable (Google "Embed a map" iframe, or an svembed link).
    if (raw.includes('output=svembed') || raw.includes('/maps/embed?pb=')) return raw;
    // A shared Street View link: @lat,lng,3a,75y,<heading>h,<tilt>t
    const m = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,[\d.]+a)?(?:,[\d.]+y)?(?:,(-?[\d.]+)h)?/);
    if (m) return embedFor(m[1], m[2], m[3] ? Math.round(parseFloat(m[3])) : 0);
    // Any other maps link that still carries coordinates.
    const c = coordsFromMapUrl(raw);
    if (c) return embedFor(c.lat, c.lng);
    return null;
}
