import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './AboutUs.css';

const stats = [
    { number: '1000+', label: 'Properties Sold' },
    { number: '13+', label: 'Years of Experience' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '1700+', label: 'Happy Families' },
];

const ValueIcon = ({ type }) => {
    const icons = {
        trust: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M6 12l4 4 8-8" stroke="url(#vg-trust)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="url(#vg-trust)" strokeWidth="2" />
                <defs>
                    <linearGradient id="vg-trust" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        excellence: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" stroke="url(#vg-excel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="vg-excel" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        location: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="url(#vg-loc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="8" r="2.5" stroke="url(#vg-loc)" strokeWidth="2" />
                <defs>
                    <linearGradient id="vg-loc" x1="6" y1="2" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        invest: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M2 20h20M6 20V10m4 10V4m4 16v-7m4 7v-3" stroke="url(#vg-invest)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="vg-invest" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        speed: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#vg-speed)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="vg-speed" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        client: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="url(#vg-client)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="vg-client" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e90ff" /><stop offset="1" stopColor="#0d5bb5" />
                    </linearGradient>
                </defs>
            </svg>
        ),
    };
    return icons[type] || null;
};

const values = [
    {
        iconType: 'trust',
        title: 'Trust & Transparency',
        text: 'Every transaction we handle is built on honest communication and complete transparency. We believe informed clients make confident decisions.',
    },
    {
        iconType: 'excellence',
        title: 'Excellence',
        text: 'We hold ourselves to the highest standards in property consultation, market analysis, and customer service. Always going the extra mile.',
    },
    {
        iconType: 'location',
        title: 'Local Expertise',
        text: 'Deep knowledge of Bahria Town Lahore and surrounding areas means we find the right property in the right location at the right price.',
    },
    {
        iconType: 'invest',
        title: 'Smart Investing',
        text: 'We help clients see beyond the listing, evaluating growth potential, ROI, and long-term value so every rupee works harder.',
    },
    {
        iconType: 'speed',
        title: 'Speed & Efficiency',
        text: 'From the first call to final handover, our streamlined process saves you time without cutting corners on due diligence.',
    },
    {
        iconType: 'client',
        title: 'Client First',
        text: "Your goals are our goals. Whether it's your first home or your tenth investment, we treat every client's journey with personal dedication.",
    },
];

const team = [
    {
        emoji: '👨‍💼',
        name: 'Javed Iqbal',
        role: 'Founder & CEO',
        bio: 'With over 20 years in the Real estate market, Javed founded IJ Estates on a simple belief which is buying property should be straightforward, not stressful.',
    },
    {
        emoji: '👩‍💼',
        name: 'Shazam Ali',
        role: 'Head of Sales',
        bio: 'Shazam brings 8 years of property sales expertise and an unmatched ability to match clients with their dream homes quickly and confidently.',
    },
    {
        emoji: '👨‍💼',
        name: 'Mian Razaq',
        role: 'Property Consultant',
        bio: 'Abdul Razaq specialises in investment plots and commercial properties, helping investors build portfolios that deliver consistent returns.',
    },
];

function AboutUs() {
    const navigate = useNavigate();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="about-page">
            <Navbar />

            {/* ── Hero ── */}
            <div className="about-hero">
                <div className="about-hero__inner">
                    <span className="about-hero__tag">Who We Are</span>
                    <h1 className="about-hero__title">
                        Lahore's Most Trusted<br />
                        <span>Property Partner</span>
                    </h1>
                    <p className="about-hero__subtitle">
                        IJ Estates & Builders has been helping families find their perfect home
                        and investors unlock real value in Bahria Town Lahore since 2013
                    </p>
                </div>
            </div>

            {/* ── Our Story ── */}
            <div className="about-section">
                <div className="about-section__inner">
                    <h2 className="about-section__title">Our Story</h2>
                    <div className="about-story">
                        {/* Left: text */}
                        <div className="about-story__text">
                            <p className="about-section__lead">
                                IJ Estates &amp; Builders was founded in 2013 by Javed Iqbal with a single
                                office in Bahria Town Lahore and a straightforward promise to help people find
                                the right property at the right price, with zero confusion and zero hidden
                                surprises. Over a decade later, that promise still drives everything we do.
                            </p>
                            <p className="about-section__lead">
                                What began as a one-man consultancy quickly earned a reputation for honest
                                advice and genuine results. Word spread. Referrals grew. Families who bought
                                their first home through us came back years later to invest in plots and
                                commercial units. That loyalty is the clearest measure of what we stand for.
                            </p>
                            <p className="about-section__lead">
                                Today, IJ Estates is a full-service real estate agency with a dedicated team
                                of property consultants, investment advisors, and legal support specialists.
                                Our deep roots in Bahria Town mean we understand every block, every phase, and
                                every opportunity in one of Pakistan's most sought-after residential communities.
                            </p>
                            <p className="about-section__lead">
                                We have guided first-time buyers through the anxiety of their first purchase,
                                helped overseas Pakistanis invest with confidence from abroad, and supported
                                seasoned investors in building portfolios that generate real, long-term returns.
                                Every client, every deal, every property handled with the same care that we would
                                want for our own family.
                            </p>
                            <p className="about-section__lead">
                                Whether you are buying your first home, selling a plot, or building a
                                long-term property portfolio, IJ Estates brings the local knowledge,
                                professional network, and personal attention to make it happen smoothly
                                from first conversation to final handover.
                            </p>
                        </div>

                        {/* Right: stats */}
                        <div className="about-story__stats">
                            {stats.map((s) => (
                                <div className="about-stat" key={s.label}>
                                    <p className="about-stat__number">{s.number}</p>
                                    <p className="about-stat__label">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mission & Vision ── */}
            <div className="about-section">
                <div className="about-section__inner">
                    <h2 className="about-section__title">Mission & Vision</h2>
                    <div className="about-mv">
                        <div className="about-mv__card">
                            <div className="about-mv__icon">🎯</div>
                            <h3 className="about-mv__title">Our Mission</h3>
                            <p className="about-mv__text">
                                To simplify the property journey for every client by delivering
                                honest advice, accurate market insights, and a seamless buying or
                                selling experience. We are committed to making real estate
                                accessible, transparent, and rewarding for all.
                            </p>
                        </div>
                        <div className="about-mv__card">
                            <div className="about-mv__icon">🚀</div>
                            <h3 className="about-mv__title">Our Vision</h3>
                            <p className="about-mv__text">
                                To become the most respected and recommended property agency in
                                Lahore which is known not just for the deals we close, but for the
                                long-term relationships we build and the lives we help improve
                                through smart real estate decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Values ── */}
            <div className="about-section">
                <div className="about-section__inner">
                    <h2 className="about-section__title">What We Stand For</h2>
                    <p className="about-section__lead">
                        These six principles are not just words on a wall, they shape every
                        interaction, every recommendation, and every decision we make on your behalf.
                    </p>
                    <div className="about-values">
                        {values.map((v) => (
                            <div className="about-value" key={v.title}>
                                <div className="about-value__icon">
                                    <ValueIcon type={v.iconType} />
                                </div>
                                <h4 className="about-value__title">{v.title}</h4>
                                <p className="about-value__text">{v.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Team ── */}
            <div className="about-section">
                <div className="about-section__inner">
                    <h2 className="about-section__title">Meet the Team</h2>
                    <p className="about-section__lead">
                        Behind every successful property deal is a team of dedicated professionals
                        who genuinely care about getting it right for you.
                    </p>
                    <div className="about-team">
                        {team.map((member) => (
                            <div className="about-team__card" key={member.name}>
                                <div className="about-team__avatar">
                                    {member.emoji}
                                </div>
                                <div className="about-team__info">
                                    <h3 className="about-team__name">{member.name}</h3>
                                    <p className="about-team__role">{member.role}</p>
                                    <p className="about-team__bio">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA ── */}
            <div className="about-cta">
                <div className="about-cta__text">
                    <h2>Ready to Find Your Dream Property?</h2>
                    <p>
                        Browse our latest listings or get in touch with our team today.
                        We are here to help you every step of the way.
                    </p>
                </div>
                <button className="about-cta__btn" onClick={() => navigate('/')}>
                    Explore Properties →
                </button>
            </div>

            <Footer />
        </div>
    );
}

export default AboutUs;
