import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../SEO/SEO';
import { seo } from '../../seo/seoConfig';
import BrowseProperties from '../Properties/Properties';
import Upcoming from '../Upcoming/Upcoming';
import PopularAreas from '../PopularAreas/PopularAreas';
import Footer from '../Footer/Footer';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import ProjectPromoSection from '../ProjectPromo/ProjectPromoSection';
import PagePreloader from '../Preloader/PagePreloader';
import SiteNav from '../SiteNav/SiteNav';
import ExperienceHero from '../Experience/ExperienceHero';
import JourneyRail from '../Experience/JourneyRail';
import LocationTransition from '../LocationTransition/LocationTransition';
import './LandingPage.css';

function LandingPage() {
  const location = useLocation();
  // Location drives the sections' content; switching it plays the 3D transition.
  const [currentLocation, setCurrentLocation] = useState('bahriatown');
  const [pendingLocation, setPendingLocation] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Drive the site-wide brand accent from the active location.
  useEffect(() => {
    document.documentElement.setAttribute('data-loc', currentLocation);
    try { localStorage.setItem('ij-loc', currentLocation); } catch (e) { /* ignore */ }
  }, [currentLocation]);

  const handleLocationSwitch = (loc) => {
    if (!loc || loc === currentLocation) return;
    setPendingLocation(loc);
    setIsTransitioning(true);
  };
  // Swap the location (recolours hero/jelly/navbar/sections) while the loader
  // fully covers the screen — so there's no colour flash when it recedes.
  const handleTransitionCovered = () => {
    if (pendingLocation) setCurrentLocation(pendingLocation);
  };
  const handleTransitionDone = () => {
    setPendingLocation(null);
    setIsTransitioning(false);
  };

  // Honor cross-page nav (e.g. clicking "Properties" from another page routes
  // here with state.scrollTo, then we scroll to that section once mounted).
  useEffect(() => {
    const id = location.state?.scrollTo;
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <>
      <PagePreloader theme="light" />
      {/* Home SEO (title, description, keywords, WebSite + RealEstateAgent JSON-LD)
          is owned by the central config in src/seo/seoConfig.js. Edit it there —
          do NOT hardcode meta here, or the homepage drifts off its target
          keywords and re-introduces the broken logo/placeholder-phone schema. */}
      <SEO {...seo.home} />

      {/* Site-wide floating navbar */}
      <SiteNav />

      {/* Cinematic 3D loader shown when switching location */}
      <LocationTransition isActive={isTransitioning} onCovered={handleTransitionCovered} onComplete={handleTransitionDone} />

      <div className="landing-page">
        {/* .xp provides the Experience design tokens/background the hero + rail
            rely on (they are page-scoped to .xp). */}
        <div className="xp">
          {/* Cinematic light hero (shared with /experience) */}
          <ExperienceHero onLocationSwitch={handleLocationSwitch} location={currentLocation} />

          {/* Scrolling landmark marquee (shared with /experience) */}
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

          {/* "Homes worth the journey" — horizontal pinned rail, under the hero.
              Temporarily hidden (not removed) — re-enable by uncommenting. */}
          {/* <JourneyRail /> */}
        </div>

        {/* Core real estate sections */}
        <BrowseProperties currentLocation={currentLocation} />
        <Upcoming currentLocation={currentLocation} />
        <ProjectPromoSection />
        <PopularAreas currentLocation={currentLocation} />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

export default LandingPage;
