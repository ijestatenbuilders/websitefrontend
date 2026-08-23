import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import './App.css';
import LandingPage from './Components/LandingPage/LandingPage';
import PropertyListings from './Components/PropertyListings/PropertyListings';
import PropertyDetail from './Components/PropertyDetail/PropertyDetail';
import AboutUs from './Components/AboutUs/AboutUs';
import ContactUs from './Components/ContactUs/ContactUs';
import CommercialDetail from './Components/CommercialDetail/CommercialDetail';
import BusinessBayCommercial from './Components/BusinessBayCommercial/BusinessBayCommercial';
import MapView from './Components/MapView/MapView';
import CommunityForums from './Components/CommunityForums/CommunityForums';
import ThreadDetail from './Components/ThreadDetail/ThreadDetail';
import NotFound from './Components/NotFound/NotFound';
import ProjectPromo from './Components/ProjectPromo/ProjectPromo';

// Lazy load new flagship 3D Showcase (Inspired by asaram.dev & Aether Shoes)
const Showcase3D = lazy(() => import('./Components/Showcase3D/Showcase3D'));
// Legacy fallbacks
const SimpleShowcase = lazy(() => import('./Components/SimpleShowcase/SimpleShowcase'));
const FixedShowcase = lazy(() => import('./Components/FixedShowcase/FixedShowcase'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/listings" element={<PropertyListings />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/commercial/business-bay" element={<BusinessBayCommercial />} />
            <Route path="/commercial/generic" element={<CommercialDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/forums" element={<CommunityForums />} />
            <Route path="/forums/thread/:threadId" element={<ThreadDetail />} />
            {/* Flagship Next-Gen 3D Showcase */}
            <Route
              path="/3d-showcase"
              element={
                <Suspense fallback={<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: '#fbbf24', fontFamily: 'sans-serif' }}><div style={{ width: '40px', height: '40px', border: '3px solid rgba(251,191,36,0.2)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><span>INITIALIZING 3D ENGINE...</span></div>}>
                  <Showcase3D />
                </Suspense>
              }
            />
            <Route
              path="/3d"
              element={
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: '#fbbf24' }}>Loading 3D Experience...</div>}>
                  <Showcase3D />
                </Suspense>
              }
            />
            {/* Legacy backup routes */}
            <Route
              path="/3d-legacy"
              element={
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#60a5fa' }}>Loading...</div>}>
                  <FixedShowcase />
                </Suspense>
              }
            />
            <Route
              path="/3d-css"
              element={
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#60a5fa' }}>Loading...</div>}>
                  <SimpleShowcase />
                </Suspense>
              }
            />
            {/* 404 Catch-All Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Floating promo card — shown on all pages except the project page itself */}
          <ProjectPromo />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
