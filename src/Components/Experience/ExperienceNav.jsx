import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../Assets/images/logo.jpg';
import './ExperienceNav.css';

const DEFAULT_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'residences', label: 'Residences' },
  { id: 'developments', label: 'Developments' },
  { id: 'journey', label: 'The Journey' },
  { id: 'contact', label: 'Contact' },
];

const MapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 2L3 6v14l6-4 6 4 6-4V2l-6 4-6-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 6v14M15 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AiraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * ExperienceNav — a bespoke, light-themed floating navbar. Framer-Motion
 * entrance, magnetic CTA, a sliding ink-pill that tracks the hovered / active
 * section, and scroll-spy that lights the current in-page section.
 *
 * Configurable so it serves both the /experience page (default links + Main Site
 * / Book a Viewing) and the main home page (home links + Map / Aira AI):
 *  - `links`     : [{ id?, label, to?, external? }]  (id → in-page scroll)
 *  - `secondary` : { label, onClick, icon }          (the left ghost button)
 *  - `primary`   : { label, onClick, icon }          (the magnetic CTA)
 */
export default function ExperienceNav({ links = DEFAULT_LINKS, secondary, primary }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(links[0]?.id || '');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const [pill, setPill] = useState({ x: 0, w: 0, opacity: 0 });

  // magnetic CTA
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onCtaMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const onCtaLeave = () => { mx.set(0); my.set(0); };

  // scroll state + scroll-spy (in-page links only)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = links
      .filter((l) => l.id)
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, [links]);

  // move the sliding pill to a given link element.
  // Use layout metrics (offsetLeft/offsetWidth), NOT getBoundingClientRect: the
  // bar shrinks via a CSS transform: scale() when scrolled, and getBoundingClientRect
  // returns already-scaled sizes. The pill's own left/width are set in the bar's
  // untransformed coordinate space, so scaled values would be applied a second
  // time — leaving the pill too small and the link text overflowing it. offset*
  // are in that same untransformed space, so the pill stays aligned at any scale.
  const movePill = (el) => {
    if (!el || !listRef.current) return;
    const w = el.offsetWidth;
    // Bail on a zero-width measurement (layout/webfont not ready yet) instead of
    // collapsing the pill to nothing — restPill re-runs once fonts settle.
    if (!w) return;
    setPill({ x: el.offsetLeft, w, opacity: 1 });
  };
  // Rest the pill under whichever link is currently active — works for both
  // in-page section links (data-id) and full-route links (to), since it keys off
  // the .is-active class rather than the scroll-spy section id.
  const restPill = () => {
    const el = listRef.current?.querySelector('.xnav__link.is-active');
    if (el) movePill(el); else setPill((p) => ({ ...p, opacity: 0 }));
  };

  useLayoutEffect(() => {
    // Rest after paint (double rAF) so link metrics are final, and again once
    // webfonts load — otherwise the first measurement can be 0-width and the
    // active pill never appears on a fresh page load.
    let r1 = requestAnimationFrame(() => { r1 = requestAnimationFrame(restPill); });
    if (document.fonts?.ready) document.fonts.ready.then(restPill).catch(() => {});
    const onResize = () => restPill();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(r1); window.removeEventListener('resize', onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, scrolled, location.pathname]);

  // navigate to an in-page section (scroll), else follow the route
  const go = (link) => {
    setOpen(false);
    if (link.external || link.to) { navigate(link.to); return; }
    const el = document.getElementById(link.id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    // Section isn't on this page → go to the home page and scroll to it there.
    navigate('/', { state: { scrollTo: link.id } });
  };

  // Tell the hero's 3D jelly canvas to fully drop off the compositor while the
  // menu is open — its WebGL layer otherwise saturates a weak GPU and makes the
  // menu open with a big lag, but ONLY over the hero (elsewhere the canvas is
  // already paused offscreen). Fired in a layout effect so the canvas is gone
  // BEFORE the browser paints the opening menu.
  useLayoutEffect(() => {
    window.dispatchEvent(new CustomEvent('xnav:menu', { detail: { open } }));
  }, [open]);

  const isLinkActive = (link) =>
    link.to ? location.pathname === link.to : active === link.id;

  const secondaryAction = secondary || { label: 'Main Site', onClick: () => navigate('/') };
  const primaryAction = primary || { label: 'Book a Viewing', onClick: () => go({ id: 'contact' }) };

  return (
    <>
    <motion.header
      className={`xnav ${scrolled ? 'xnav--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0, scale: 1 }}
      animate={{ y: 0, opacity: 1, scale: scrolled ? 0.94 : 1 }}
      transition={{
        duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15,
        // the shrink runs on its own quick, delay-free compositor tween
        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="xnav__inner">
        {/* Brand */}
        <button className="xnav__brand" onClick={() => go({ id: links[0]?.id || 'hero' })} aria-label="IJ Estate & Builders">
          <span className="xnav__brand-logo">
            <img src={logo} alt="IJ Estate & Builders" />
          </span>
        </button>

        {/* Desktop links with sliding pill */}
        <nav className="xnav__links" ref={listRef} onMouseLeave={restPill}>
          <span
            className="xnav__pill"
            style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: pill.opacity }}
            aria-hidden="true"
          />
          {links.map((l) => (
            <button
              key={l.id || l.to}
              data-id={l.id || ''}
              className={`xnav__link ${isLinkActive(l) ? 'is-active' : ''}`}
              onMouseEnter={(e) => movePill(e.currentTarget)}
              onClick={() => go(l)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="xnav__actions">
          <button className="xnav__ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
          <motion.button
            className="xnav__cta"
            onMouseMove={onCtaMove}
            onMouseLeave={onCtaLeave}
            onClick={primaryAction.onClick}
            style={{ x: sx, y: sy }}
            whileTap={{ scale: 0.96 }}
          >
            {primaryAction.icon || <span className="xnav__cta-dot" />}
            {primaryAction.label}
          </motion.button>

          <button
            className={`xnav__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </motion.header>

    {/* Full-screen mobile menu — CSS-only fluid reveal that scales open from the
        top-right corner. It runs entirely on the compositor (a transform on a
        solid layer), so it can't lag from the 3D canvas / JS load and can't
        "fail to show" like the Framer versions did. Always mounted; the whole
        thing is driven by the .is-open class. Kept a plain sibling of the navbar
        so it never glitches the bar. */}
    <div
      className={`xnav__sheet ${open ? 'is-open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      aria-hidden={!open}
    >
      <span className="xnav__sheet-fill" aria-hidden="true" />
      <nav className="xnav__sheet-links">
        {links.map((l) => (
          <button
            key={l.id || l.to}
            className={`xnav__sheet-link ${isLinkActive(l) ? 'is-active' : ''}`}
            tabIndex={open ? 0 : -1}
            onClick={() => go(l)}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="xnav__sheet-actions">
        <button className="xnav__sheet-cta" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); primaryAction.onClick(); }}>
          {primaryAction.label}
        </button>
        <button className="xnav__sheet-ghost" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); secondaryAction.onClick(); }}>
          {secondaryAction.label}
        </button>
      </div>
    </div>
    </>
  );
}

export { MapIcon, AiraIcon };
