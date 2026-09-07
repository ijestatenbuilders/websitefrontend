// True only while react-snap's headless Chrome is snapshotting the app.
// react-snap sets navigator.userAgent to "ReactSnap", which lets us skip
// anything that shouldn't run at build time — chiefly WebGL/Three.js scenes,
// which are decorative and would waste time (or hang) during prerendering.
export const isPrerender = () =>
    typeof navigator !== 'undefined' && /ReactSnap/i.test(navigator.userAgent || '');
