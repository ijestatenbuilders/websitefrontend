import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './Components/LandingPage/LandingPage';
import PropertyListings from './Components/PropertyListings/PropertyListings';
import PropertyDetail from './Components/PropertyDetail/PropertyDetail';
import AboutUs from './Components/AboutUs/AboutUs';
import ContactUs from './Components/ContactUs/ContactUs';
import CommercialDetail from './Components/CommercialDetail/CommercialDetail';
import BusinessBayCommercial from './Components/BusinessBayCommercial/BusinessBayCommercial';
import MapView from './Components/MapView/MapView';
import NotFound from './Components/NotFound/NotFound';

function App() {
  return (
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
          {/* 404 Catch-All Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
