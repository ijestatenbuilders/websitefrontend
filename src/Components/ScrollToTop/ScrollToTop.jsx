import { useEffect, useState } from 'react';
import './ScrollToTop.css';

function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            type="button"
            className={`scroll-to-top ${visible ? 'scroll-to-top--visible' : ''}`}
            onClick={handleClick}
            aria-label="Scroll to top"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 19V5M5 12l7-7 7 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

export default ScrollToTop;
