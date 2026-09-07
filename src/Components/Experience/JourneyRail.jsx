import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../utils/perf';
import './Experience.css';

import res1 from '../../Assets/images/upcoming-project-1.jpg';
import res2 from '../../Assets/images/dha.jpg';
import res3 from '../../Assets/images/countryclub.jpg';
import res4 from '../../Assets/images/cinema.jpg';
import res5 from '../../Assets/images/union.jpg';

gsap.registerPlugin(ScrollTrigger);

const RESIDENCES = [
  { img: res1, tag: 'Signature Villa', name: 'The Grand Boulevard Residence', area: 'Bahria Town · Sector B', price: 'PKR 8.5 Cr', beds: 6, baths: 7, size: '1 Kanal' },
  { img: res2, tag: 'Modern Estate', name: 'DHA Raya Skyline Manor', area: 'DHA Raya · Phase 1', price: 'PKR 6.2 Cr', beds: 5, baths: 6, size: '20 Marla' },
  { img: res3, tag: 'Golf Facing', name: 'Country Club Panorama', area: 'Bahria Town · Golf City', price: 'PKR 11.0 Cr', beds: 7, baths: 8, size: '2 Kanal' },
  { img: res4, tag: 'Urban Loft', name: 'Cinema District Penthouse', area: 'Bahria Town · Entertainment', price: 'PKR 4.8 Cr', beds: 4, baths: 4, size: '10 Marla' },
  { img: res5, tag: 'Green Living', name: 'Union Garden Townhouse', area: 'Union Town · Lahore', price: 'PKR 3.9 Cr', beds: 4, baths: 5, size: '8 Marla' },
];

/**
 * JourneyRail — the "Homes worth the journey" horizontal pinned rail, extracted
 * so both the /experience page and the home page share the exact same section.
 * Self-contained: owns its pin/scrub ScrollTrigger + head reveal, tuned to stay
 * buttery under rapid spam-scrolling.
 */
export default function JourneyRail() {
  const navigate = useNavigate();
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const reduce = prefersReducedMotion();

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const cleanups = [];
    const ctx = gsap.context(() => {
      // Head reveal
      gsap.utils.toArray('.xp-rail__head .xp-reveal').forEach((el) => {
        gsap.from(el, {
          y: reduce ? 0 : 44, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        });
      });

      // Reduced motion → skip the scroll-jack; CSS turns it into a plain swipe.
      if (reduce) { railRef.current?.classList.add('xp-rail--reduced'); return; }

      const track = trackRef.current;
      const rail = railRef.current;
      if (!track || !rail) return;

      // REAL pin: the whole section is fixed on screen and physically cannot be
      // scrolled past until the track has finished sweeping. `scrub: true` locks
      // the cards 1:1 to the scrollbar so finishing the scroll == finishing the
      // cards — no blank gap, no lag, no skipping. `pinType: 'fixed'` +
      // invalidate/refresh keeps the pin length correct on every width & reload.
      const getDistance = () => Math.max(1, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: rail,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          pinSpacing: true,
          pinType: 'fixed',
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Recompute the pin length once late-loading card images settle, on window
      // load, and after a short delay — the usual causes of a mis-measured pin.
      const refresh = () => ScrollTrigger.refresh();
      const imgs = Array.from(track.querySelectorAll('img'));
      let pending = imgs.length;
      const settle = () => { if (--pending <= 0) refresh(); };
      if (pending === 0) refresh();
      imgs.forEach((img) => {
        if (img.complete) settle();
        else { img.addEventListener('load', settle); img.addEventListener('error', settle); }
      });
      window.addEventListener('load', refresh);
      const t = setTimeout(refresh, 800);
      cleanups.push(() => { clearTimeout(t); window.removeEventListener('load', refresh); });
    }, railRef);

    return () => { cleanups.forEach((fn) => fn()); ctx.revert(); };
  }, [reduce]);

  return (
    <section className="xp-rail" id="residences" ref={railRef}>
      <div className="xp-rail__head">
        <h2 className="xp-section-title xp-reveal">Homes worth the journey</h2>
      </div>
      <div className="xp-rail__viewport">
        <div className="xp-rail__track" ref={trackRef}>
          <div className="xp-rail__intro">
            <p>A hand-picked collection of signature homes. Scroll through the story of each address.</p>
            <span className="xp-rail__hint">SCROLL TO EXPLORE →</span>
          </div>
          {RESIDENCES.map((r, i) => (
            <article className="xp-rescard" key={i}>
              <div className="xp-rescard__media">
                <img src={r.img} alt={r.name} loading="lazy" decoding="async" />
                <span className="xp-rescard__tag">{r.tag}</span>
                <span className="xp-rescard__price">{r.price}</span>
              </div>
              <div className="xp-rescard__body">
                <h3>{r.name}</h3>
                <p className="xp-rescard__area">{r.area}</p>
                <div className="xp-rescard__specs">
                  <span>{r.beds} Beds</span>
                  <span>{r.baths} Baths</span>
                  <span>{r.size}</span>
                </div>
                <button className="xp-rescard__btn" onClick={() => navigate('/listings')}>
                  View Details <span>→</span>
                </button>
              </div>
            </article>
          ))}
          <div className="xp-rail__end">
            <h3>See the full portfolio</h3>
            <button className="xp-btn xp-btn--primary" onClick={() => navigate('/listings')}>
              All Listings <span className="xp-btn__arrow">→</span>
            </button>
          </div>
        </div>{/* track */}
      </div>{/* viewport */}
    </section>
  );
}
