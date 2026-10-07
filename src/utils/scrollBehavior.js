export function smoothScrollTo(targetY, duration = 1400) {
    if (typeof window === 'undefined') return;

    const startY = window.scrollY || window.pageYOffset || 0;
    const distance = targetY - startY;

    if (distance === 0) return;

    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        window.scrollTo({
            top: startY + distance * eased,
            behavior: 'auto',
        });

        if (progress < 1) {
            window.requestAnimationFrame(tick);
        }
    };

    window.requestAnimationFrame(tick);
}

export function smoothScrollToElement(element, options = {}) {
    if (!element || typeof window === 'undefined') return;

    const {
        offset = 0,
        duration = 1400,
    } = options;

    const targetY = element.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) + offset;
    smoothScrollTo(targetY, duration);
}
