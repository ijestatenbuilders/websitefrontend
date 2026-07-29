import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ContactUs.css';

function ContactUs() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [showNotification, setShowNotification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:8000/api/enquiries/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Show success notification
                setShowNotification(true);

                // Clear form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });

                // Hide notification after 3 seconds
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            } else {
                console.error('Failed to submit enquiry');
            }
        } catch (error) {
            console.error('Error submitting enquiry:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <Navbar />

            {/* Success Notification */}
            <div className={`contact-notification ${showNotification ? 'contact-notification--show' : ''}`}>
                <div className="contact-notification__content">
                    <svg className="contact-notification__icon" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="contact-notification__text">
                        <p className="contact-notification__title">Enquiry Sent Successfully!</p>
                        <p className="contact-notification__message">We'll get back to you soon.</p>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="contact-hero">
                <div className="contact-hero__inner">
                    <span className="contact-hero__tag">Get In Touch</span>
                    <h1 className="contact-hero__title">
                        Let's Discuss Your<br />
                        <span>Property Needs</span>
                    </h1>
                    <p className="contact-hero__subtitle">
                        Whether you're buying, selling, or investing, our team is here to help you every step of the way
                    </p>
                </div>
            </div>

            {/* Contact Section */}
            <div className="contact-section">
                <div className="contact-section__inner">
                    <div className="contact-content">
                        {/* Contact Info Cards */}
                        <div className="contact-info">
                            <h2 className="contact-section__title">Contact Information</h2>
                            <p className="contact-section__lead">
                                Reach out to us through any of these channels, or fill out the enquiry form and we'll get back to you within 24 hours.
                            </p>

                            <div className="contact-cards">
                                <div className="contact-card">
                                    <div className="contact-card__icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="url(#phone-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <defs>
                                                <linearGradient id="phone-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <h3 className="contact-card__title">Phone</h3>
                                    <p className="contact-card__text">+92 3214754689</p>
                                    <p className="contact-card__text">+92 3219607863</p>
                                    <p className="contact-card__text">+92 3214340004</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-card__icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="url(#email-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <defs>
                                                <linearGradient id="email-gradient" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <h3 className="contact-card__title">Email</h3>
                                    <p className="contact-card__text">info@ijestates.com</p>
                                    <p className="contact-card__text">sales@ijestates.com</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-card__icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="url(#location-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="url(#location-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <defs>
                                                <linearGradient id="location-gradient" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <h3 className="contact-card__title">Office Location</h3>
                                    <p className="contact-card__text">Tipu Block Sector C, 257 Commercial Zone, 2nd Floor, Bahria Town Lahore, Pakistan</p>
                                </div>

                                <div className="contact-card">
                                    <div className="contact-card__icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="url(#time-gradient)" strokeWidth="2" />
                                            <path d="M12 6v6l4 2" stroke="url(#time-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <defs>
                                                <linearGradient id="time-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <h3 className="contact-card__title">Office Hours</h3>
                                    <p className="contact-card__text">Mon - Sun: 10:00 AM - 10:00 PM</p>
                                    <p className="contact-card__text">Friday: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Enquiry Form */}
                        <div className="contact-form-wrapper">
                            <h2 className="contact-section__title">Send Us An Enquiry</h2>
                            <p className="contact-section__lead">
                                Fill out the form below and we'll respond within 24 hours
                            </p>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="contact-form__group">
                                    <label className="contact-form__label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="contact-form__input"
                                        placeholder="Enter Your Name"
                                        required
                                    />
                                </div>

                                <div className="contact-form__row">
                                    <div className="contact-form__group">
                                        <label className="contact-form__label">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="contact-form__input"
                                            placeholder="email@example.com"
                                        />
                                    </div>

                                    <div className="contact-form__group">
                                        <label className="contact-form__label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="contact-form__input"
                                            placeholder="+92 300 1234567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="contact-form__group">
                                    <label className="contact-form__label">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="contact-form__textarea"
                                        placeholder="Tell us about your enquiry..."
                                        rows="5"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="contact-form__submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ContactUs;
