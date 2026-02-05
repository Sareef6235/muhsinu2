/**
 * Premium Animation Controller
 * Handles interactive motion, text splitting, and animation state
 */

class PremiumAnimationEngine {
    constructor() {
        this.magneticElements = [];
        this.init();
    }

    init() {
        this.observeDOM();
        this.setupMagneticHover();
        this.initObserver();
    }

    /**
     * Scroll Animation Observer
     */
    initObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, we can unobserve if we want one-shot
                    // observer.unobserve(entry.target);
                }
            });
        }, options);

        const animatables = document.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-scale-in');
        animatables.forEach(el => observer.observe(el));
    }

    /**
     * Observe DOM for newly added elements to apply triggers
     */
    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.hasAttribute('data-anim-trigger')) {
                        this.initTrigger(node);
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Apply an animation preset to an element
     */
    applyPreset(el, presetName, config = {}) {
        // Clear existing anim classes
        el.classList.forEach(cls => {
            if (cls.startsWith('anim-')) el.classList.remove(cls);
        });

        // Apply config variables
        if (config.duration) el.style.setProperty('--anim-duration', config.duration + 's');
        if (config.delay) el.style.setProperty('--anim-delay', config.delay + 's');
        if (config.intensity) el.style.setProperty('--anim-intensity', config.intensity);

        // Add new class
        el.classList.add(`anim-${presetName}`);

        // Handle Text Staggering if applicable
        if (config.stagger && el.innerText) {
            this.splitText(el);
        }

        // Trigger reflow to restart animation
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = '';
    }

    /**
     * Splits text into individual letters for staggered animation
     */
    splitText(el) {
        const text = el.innerText;
        el.innerHTML = '';
        el.classList.add('text-stagger-parent');

        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.animationDelay = `${i * 0.05}s`;
            span.classList.add('stagger-char');
            el.appendChild(span);
        });
    }

    /**
     * Magnetic Hover Effect
     */
    setupMagneticHover() {
        // Cache elements to avoid querying DOM on every mousemove
        let magnetics = [];

        const updateCache = () => {
            magnetics = Array.from(document.querySelectorAll('.magnetic-element')).map(el => ({
                el,
                rect: el.getBoundingClientRect()
            }));
        };

        // Update cache on load and resize
        updateCache();
        window.addEventListener('resize', updateCache);

        // Use throttled mousemove if Perf is available, otherwise native
        const handleMove = (e) => {
            magnetics.forEach(item => {
                const { el, rect } = item;
                // Re-calc rect if needed, but for now use cached
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const distanceX = e.clientX - centerX;
                const distanceY = e.clientY - centerY;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                const threshold = 100;

                if (distance < threshold) {
                    const power = (threshold - distance) / threshold;
                    const x = distanceX * power * 0.4;
                    const y = distanceY * power * 0.4;
                    el.style.transform = `translate(${x}px, ${y}px)`;
                } else {
                    el.style.transform = `translate(0, 0)`;
                }
            });
        };

        if (window.Perf && window.Perf.throttle) {
            document.addEventListener('mousemove', window.Perf.throttle(handleMove, 10));
        } else {
            document.addEventListener('mousemove', handleMove);
        }
    }

    /**
     * Preview an animation for the user in the UI
     */
    previewInUI(presetName) {
        const previewBox = document.getElementById('animation-preview-box');
        if (!previewBox) return;

        previewBox.innerHTML = '<div class="preview-target">Preview</div>';
        const target = previewBox.querySelector('.preview-target');
        this.applyPreset(target, presetName);
    }
}

// Global instance
window.animationEngine = new PremiumAnimationEngine();
