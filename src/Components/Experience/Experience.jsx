import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../SEO/SEO';
import Footer from '../Footer/Footer';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import ExperienceNav from './ExperienceNav';
import ExperienceHero from './ExperienceHero';
import JourneyRail from './JourneyRail';
import { prefersReducedMotion } from '../../utils/perf';

// Development imagery (Bahria Town Lahore icons)
import eiffelImg from '../../Assets/images/eiffletower.png';
import mosqueImg from '../../Assets/images/background.jpeg';
import talwarImg from '../../Assets/images/talwar.png';
import clockImg from '../../Assets/images/clocktower.png';
import etihadImg from '../../Assets/images/etihad.png';

import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const DEVELOPMENTS = [
  { img: eiffelImg, name: 'Eiffel Tower Replica', meta: 'Iconic Landmark', size: 'tall' },
  { img: mosqueImg, name: 'Grand Jamia Mosque', meta: 'Architectural Wonder', size: 'wide' },
  { img: talwarImg, name: 'Talwar Chowk', meta: 'Central Gateway', size: 'std' },
  { img: clockImg, name: 'Clock Tower Square', meta: 'Heritage District', size: 'std' },
  { img: etihadImg, name: 'Etihad Town Gateway', meta: 'Emerging Corridor', size: 'wide' },
];

const STATS = [
  { value: 2500, suffix: '+', label: 'Homes Delivered' },
  { value: 18, suffix: 'yrs', label: 'Of Trusted Legacy' },
  { value: 12, suffix: 'K', label: 'Happy Families' },
  { value: 98, suffix: '%', label: 'Client Retention' },
];

const JOURNEY = [
  { n: '01', t: 'Discover', d: 'Tell us your vision. We curate a shortlist of residences matched to your lifestyle, budget and future plans.' },
  { n: '02', t: 'Experience', d: 'Walk through cinematic virtual tours and private on-site viewings across Bahria Town, DHA and beyond.' },
  { n: '03', t: 'Secure', d: 'Transparent pricing, verified titles and flexible plans. Our advisors handle every document for you.' },
  { n: '04', t: 'Move In', d: 'From handover to interiors, we stay with you — turning a purchase into the home you always imagined.' },
];

function StatItem({ value, suffix, label, reduce }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, reduce]);

  return (
    <div className="xp-stat" ref={ref}>
      <div className="xp-stat__num">{shown.toLocaleString()}<span>{suffix}</span></div>
      <div className="xp-stat__label">{label}</div>
    </div>
  );
}

export default function Experience() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const reduce = prefersReducedMotion();

  /* Section reveals + developments parallax. The hero and the pinned rail own
     their own GSAP now (ExperienceHero / JourneyRail), so this only handles the
     remaining sections. Rail-head reveals are excluded — JourneyRail does those. */
  useLayoutEffect(() => {
    ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.xp-reveal')
        .filter((el) => !el.closest('.xp-rail'))
        .forEach((el) => {
          gsap.from(el, {
            y: reduce ? 0 : 44,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          });
        });

      if (!reduce) {
        gsap.utils.toArray('.xp-dev__img').forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -12 },
            {
              yPercent: 12,
              ease: 'none',
              scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div className="xp" ref={rootRef}>
      <SEO
        title="IJ Estate & Builders — The Experience | Luxury Real Estate, Lahore"
        description="A cinematic walkthrough of Lahore's finest residences and iconic developments across Bahria Town, DHA Raya and beyond."
        canonicalUrl="/experience"
      />
      <ScrollToTop />
      <ExperienceNav />

      {/* ═══════════ HERO ═══════════ */}
      <ExperienceHero />

      {/* ═══════════ MARQUEE ═══════════ */}
      <div className="xp-marquee" aria-hidden="true">
        <div className="xp-marquee__track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div className="xp-marquee__group" key={k}>
              {['Bahria Town', '✦', 'DHA Raya', '✦', 'Etihad Town', '✦', 'Union Town', '✦', 'Golf City', '✦', 'Country Club', '✦'].map((w, i) => (
                <span key={i} className="xp-marquee__item">{w}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ HOMES WORTH THE JOURNEY — horizontal pinned rail ═══════════ */}
      <JourneyRail />

      {/* ═══════════ STATS ═══════════ */}
      <section className="xp-stats xp-reveal">
        {STATS.map((s, i) => (
          <StatItem key={i} {...s} reduce={reduce} />
        ))}
      </section>

      {/* ═══════════ DEVELOPMENTS — bento parallax ═══════════ */}
      <section className="xp-dev" id="developments">
        <div className="xp-dev__head">
          <div className="xp-eyebrow xp-reveal">— ICONIC DEVELOPMENTS</div>
          <h2 className="xp-section-title xp-reveal">Landmarks you'll call neighbours</h2>
          <p className="xp-dev__lead xp-reveal">
            Life beside world-famous replicas and world-class amenities. This is what living
            inside Bahria Town Lahore feels like.
          </p>
        </div>
        <div className="xp-dev__grid">
          {DEVELOPMENTS.map((d, i) => (
            <article className={`xp-dev__card xp-dev__card--${d.size} xp-reveal`} key={i}>
              <div className="xp-dev__frame">
                <img className="xp-dev__img" src={d.img} alt={d.name} loading="lazy" decoding="async" />
              </div>
              <div className="xp-dev__overlay">
                <span className="xp-dev__meta">{d.meta}</span>
                <h3>{d.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ JOURNEY ═══════════ */}
      <section className="xp-journey" id="journey">
        <div className="xp-journey__head">
          <div className="xp-eyebrow xp-reveal">— THE JOURNEY</div>
          <h2 className="xp-section-title xp-reveal">Four steps to your front door</h2>
        </div>
        <div className="xp-journey__steps">
          {JOURNEY.map((j, i) => (
            <div className="xp-jstep xp-reveal" key={i}>
              <div className="xp-jstep__n">{j.n}</div>
              <div className="xp-jstep__body">
                <h3>{j.t}</h3>
                <p>{j.d}</p>
              </div>
            </div>
          ))}
          <span className="xp-journey__spine" aria-hidden="true" />
        </div>
      </section>

      {/* ═══════════ CTA / CONTACT ═══════════ */}
      <section className="xp-cta" id="contact">
        <div className="xp-cta__inner xp-reveal">
          <span className="xp-cta__aura" aria-hidden="true" />
          <div className="xp-eyebrow xp-eyebrow--light">— LET'S BEGIN</div>
          <h2 className="xp-cta__title">Your next address is<br />waiting to be discovered.</h2>
          <p className="xp-cta__sub">
            Speak with an IJ Estate advisor today. Private viewings, honest guidance,
            and the finest homes in Lahore — all in one place.
          </p>
          <div className="xp-cta__row">
            <button className="xp-btn xp-btn--light" onClick={() => navigate('/contact')}>
              Book a Viewing <span className="xp-btn__arrow">→</span>
            </button>
            <button className="xp-btn xp-btn--outline" onClick={() => navigate('/listings')}>
              Browse Listings
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
