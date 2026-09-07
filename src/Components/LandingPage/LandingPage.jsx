import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../SEO/SEO';
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'IJ Estate & Builders',
    description:
      'Premier real estate agency in Lahore, Pakistan specializing in residential and commercial properties in DHA, Bahria Town, and other premium locations.',
    url: 'https://ijestateandbuilders.com',
    logo: 'https://ijestateandbuilders.com/logo512.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    telephone: '+92-XXX-XXXXXXX',
    areaServed: 'Lahore, Pakistan',
  };

  return (
    <>
      <PagePreloader theme="light" />
      <SEO
        title="IJ Estate & Builders | Premium Luxury Real Estate & 3D Spatial Experiences"
        description="Explore luxury properties in Lahore with IJ Estate & Builders. Featuring real-time 3D spatial exploration, verified residential villas, commercial towers, and prime plots in Bahria Town & DHA Raya."
        keywords="real estate Lahore, properties for sale Lahore, DHA Lahore properties, Bahria Town Lahore, houses for sale, commercial properties Lahore, real estate agency Pakistan, property investment Lahore"
        canonicalUrl="/"
        structuredData={structuredData}
      />

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

          {/* "Homes worth the journey" — horizontal pinned rail, under the hero */}
          <JourneyRail />
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
