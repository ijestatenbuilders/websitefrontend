import React, { useState, useRef } from 'react';
import { sound } from './AudioEngine';

const PENTHOUSES = [
  {
    id: 'sovereign-sky-triplex',
    title: 'The Sovereign Sky Triplex',
    tier: 'ROYAL COLLECTION // LEVEL 86-88',
    price: '125,000,000 AED',
    usd: '$34,000,000 USD',
    specs: {
      beds: '6 Beds + Staff',
      baths: '8 Baths',
      area: '14,500 sq.ft',
      views: '360° Arabian Gulf & Skyline'
    },
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Private Helipad', 'Cantilever Glass Pool', '12-Car Garage']
  },
  {
    id: 'celestial-oculus-penthouse',
    title: 'The Celestial Oculus Suite',
    tier: 'SKYBRIDGE COLLECTION // LEVEL 45',
    price: '48,000,000 AED',
    usd: '$13,000,000 USD',
    specs: {
      beds: '4 Master Suites',
      baths: '5 Baths',
      area: '8,200 sq.ft',
      views: 'Panoramic Horizon & Marina'
    },
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Glass Floor Bridge', 'Double Height Living', 'Private Spa']
  },
  {
    id: 'aurora-high-rise-estate',
    title: 'The Aurora Duplex Sky Villa',
    tier: 'HIGH-RISE SIGNATURE // LEVEL 72',
    price: '32,500,000 AED',
    usd: '$8,850,000 USD',
    specs: {
      beds: '3 Bed Duplex',
      baths: '4.5 Baths',
      area: '6,400 sq.ft',
      views: 'Sunset Sea & Palm Jumeirah'
    },
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    tags: ['Infinity Plunge Pool', 'Italian Calacatta Marble', 'Smart Butler']
  }
];

function PenthouseCard3DItem({ item, onOpenInquiry }) {
  const cardRef = useRef();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className="penthouse-card-3d-wrap interactive"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`
      }}
    >
      {/* Glare effect */}
      <div
        className="card-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
          opacity: glare.opacity
        }}
      />

      <div className="card-image-box">
        <img src={item.image} alt={item.title} className="card-img" />
        <div className="card-badge-floating">
          <span className="badge-pulse-dot" />
          <span>VIP EXCLUSIVE</span>
        </div>
      </div>

      <div className="card-content-box">
        <span className="card-tier-label">{item.tier}</span>
        <h3 className="card-title">{item.title}</h3>

        <div className="card-pricing-row">
          <span className="price-aed">{item.price}</span>
          <span className="price-usd">{item.usd}</span>
        </div>

        <div className="card-specs-matrix">
          <div className="spec-cell">
            <span className="spec-k">AREA</span>
            <span className="spec-v">{item.specs.area}</span>
          </div>
          <div className="spec-cell">
            <span className="spec-k">BEDROOMS</span>
            <span className="spec-v">{item.specs.beds}</span>
          </div>
          <div className="spec-cell">
            <span className="spec-k">BATHS</span>
            <span className="spec-v">{item.specs.baths}</span>
          </div>
          <div className="spec-cell">
            <span className="spec-k">VIEW</span>
            <span className="spec-v">{item.specs.views}</span>
          </div>
        </div>

        <div className="card-tags-row">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="card-tag">
              ✦ {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="card-cta-btn interactive"
          onClick={() => {
            sound.playClick();
            onOpenInquiry(item);
          }}
        >
          <span>Schedule Private Showing</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default function PenthouseCards3D() {
  const [activeModal, setActiveModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '' });

  const handleOpenInquiry = (item) => {
    setActiveModal(item);
    setBookingSuccess(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    sound.playChime(660, 0.3);
    setBookingSuccess(true);
  };

  return (
    <section className="penthouse-cards-section">
      <div className="section-head-center">
        <span className="section-super-tag">05 // MASTER COLLECTION</span>
        <h2 className="section-main-title">
          Signature Penthouse Suites
        </h2>
        <p className="section-subtitle">
          Hover over each residence to engage 3D parallax depth and inspect architectural floor plates.
        </p>
      </div>

      <div className="penthouse-grid-3d">
        {PENTHOUSES.map((item) => (
          <PenthouseCard3DItem
            key={item.id}
            item={item}
            onOpenInquiry={handleOpenInquiry}
          />
        ))}
      </div>

      {/* VIP Booking Modal */}
      {activeModal && (
        <div className="vip-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="vip-modal-dialog interactive"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn interactive"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="modal-success-state">
                <div className="success-icon-gem">✦</div>
                <h3>Showing Request Confirmed</h3>
                <p>
                  Thank you for your interest in <strong>{activeModal.title}</strong>. Our Private Client Executive will reach out within 2 hours to coordinate your bespoke 3D VR and in-person showing.
                </p>
                <button
                  type="button"
                  className="modal-btn-primary interactive"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="modal-form">
                <div className="modal-head">
                  <span className="modal-tag">PRIVATE CLIENT CONCIERGE</span>
                  <h3>Schedule Showing: {activeModal.title}</h3>
                  <p className="modal-price-note">{activeModal.price} ({activeModal.usd})</p>
                </div>

                <div className="form-row">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheikh Alexander"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alexander@private.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <label>Direct Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <label>Preferred Showing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <button type="submit" className="modal-btn-primary interactive">
                  Request VIP Showing Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
