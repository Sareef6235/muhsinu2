/**
 * Premium Animation Controller
 * Handles interactive motion, text splitting, and animation state
 */

class PremiumAnimationEngine {
    constructor() {
        this.magneticElements = [];
        this.observer = null;
        this.init();
    }

    init() {
        this.setupObservers();
        this.setupMagneticHover();
    }

    /**
     * Setup both Scroll and DOM Mutation observers
     */
    setupObservers() {
        // 1. Intersection Observer for scroll animations
        const scrollOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    // Optional: remove class when out of view for better performance on loop
                    // entry.target.classList.remove('active');
                }
            });
        }, scrollOptions);

        // 2. Mutation Observer for dynamic content
        this.mutationObserver = new MutationObserver((mutations) => {
            let needsRefresh = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('magnetic-element') || node.querySelector('.magnetic-element')) {
                            needsRefresh = true;
                        }
                        this.bindElements(node);
                    }
                });
            });
            if (needsRefresh) this.cacheMagneticElements();
        });

        this.mutationObserver.observe(document.body, { childList: true, subtree: true });

        // Initial binding
        this.bindElements(document.body);
        this.cacheMagneticElements();
    }

    /**
     * Bind animation triggers to elements
     */
    bindElements(root) {
        const animatables = root.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-scale-in');
        animatables.forEach(el => this.scrollObserver.observe(el));

        const triggers = root.querySelectorAll('[data-anim-trigger]');
        triggers.forEach(node => this.initTrigger(node));
    }

    /**
     * Cache magnetic elements for the mousemove listener
     */
    cacheMagneticElements() {
        this.magneticElements = Array.from(document.querySelectorAll('.magnetic-element'));
    }

    /**
     * Optimized Magnetic Hover Effect with Throttling
     */
    setupMagneticHover() {
        let ticking = false;

        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateMagneticEffect(e.clientX, e.clientY);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateMagneticEffect(mX, mY) {
        this.magneticElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Optimization: Skip if element is not in viewport
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = mX - centerX;
            const distanceY = mY - centerY;
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

            const threshold = 100;

            if (distance < threshold) {
                const power = (threshold - distance) / threshold;
                const x = distanceX * power * 0.4;
                const y = distanceY * power * 0.4;
                el.style.transform = `translate(${x}px, ${y}px)`;
            } else if (el.style.transform !== 'translate(0px, 0px)') {
                el.style.transform = `translate(0, 0)`;
            }
        });
    }

    /**
     * Apply an animation preset to an element
     */
    applyPreset(el, presetName, config = {}) {
        // Clear existing anim classes
        el.className.split(' ').forEach(cls => {
            if (cls.startsWith('anim-')) el.classList.remove(cls);
        });

        // Apply config variables
        if (config.duration) el.style.setProperty('--anim-duration', config.duration + 's');
        if (config.delay) el.style.setProperty('--anim-delay', config.delay + 's');
        if (config.intensity) el.style.setProperty('--anim-intensity', config.intensity);

        // Add new class
        el.classList.add(`anim-${presetName}`);

        // Handle Text Staggering
        if (config.stagger && el.innerText) {
            this.splitText(el);
        }

        // Trigger reflow
        el.offsetHeight;
    }

    splitText(el) {
        const text = el.innerText;
        el.innerHTML = '';
        el.classList.add('text-stagger-parent');

        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.className = 'stagger-char';
            span.style.animationDelay = `${i * 0.05}s`;
            el.appendChild(span);
        });
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
