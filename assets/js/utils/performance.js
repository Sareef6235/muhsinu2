/**
 * Performance Utilities Library
 * standardized helpers for async operations, event throttling, and lazy loading.
 */

const Perf = {
    /**
     * Debounce: Delay function call until after 'wait' ms have passed since last invocation.
     * Best for: Search inputs, window resize, auto-save.
     */
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    /**
     * Throttle: Limit function execution to once every 'limit' ms.
     * Best for: Scroll events, drag-and-drop, mousemove.
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Run Idle: Execute task when browser is idle, or fallback to setTimeout.
     * Best for: Non-critical initialization (analytics, rigid footer, heavy template rendering).
     */
    runIdle(taskFn, timeout = 2000) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(taskFn, { timeout });
        } else {
            setTimeout(taskFn, 1);
        }
    },

    /**
     * Async Chunking: Process a large array in chunks to avoid blocking main thread.
     * @param {Array} items - Array to process
     * @param {Function} processFn - Function to handle each item (or chunk of items)
     * @param {number} chunkSize - Items per frame
     */
    processChunks(items, processFn, chunkSize = 10) {
        let index = 0;

        function nextChunk() {
            const end = Math.min(index + chunkSize, items.length);
            for (let i = index; i < end; i++) {
                processFn(items[i], i);
            }
            index += chunkSize;

            if (index < items.length) {
                Perf.runIdle(nextChunk);
            }
        }

        nextChunk();
    },

    /**
     * Lazy Load: Use IntersectionObserver to load images or trigger callbacks when element enters viewport.
     * @param {string|NodeList} selector 
     * @param {Function} onIntersect - Optional custom handler
     */
    lazyLoad(selector, onIntersect = null) {
        const targets = typeof selector === 'string'
            ? document.querySelectorAll(selector)
            : selector;

        if (!('IntersectionObserver' in window)) {
            // Fallback: Load immediately
            targets.forEach(el => {
                if (onIntersect) onIntersect(el);
                else {
                    if (el.dataset.src) {
                        el.src = el.dataset.src;
                        el.removeAttribute('data-src');
                    }
                }
            });
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (onIntersect) {
                        onIntersect(el);
                    } else {
                        // Default image behavior
                        if (el.dataset.src) {
                            el.src = el.dataset.src;
                            el.removeAttribute('data-src');
                            el.classList.add('loaded');
                        }
                    }
                    obs.unobserve(el);
                }
            });
        }, { rootMargin: '50px' });

        targets.forEach(el => observer.observe(el));
    },

    /**
     * Get Base Path: Calculates the relative path to the project root
     * Works for nested directories in /pages/ and handles root correctly.
     */
    getBasePath() {
        const path = window.location.pathname;

        // If we are at root or index.html in root
        if (path === '/' || path.endsWith('/index.html') || (!path.includes('/pages/') && !path.includes('/assets/'))) {
            return '';
        }

        // Calculate depth based on /muhsin2/ or root if not local
        // We look for the "muhsin2" segment or count from the first "pages" segment
        const segments = path.split('/').filter(p => p.length > 0);
        const pagesIdx = segments.findIndex(s => s === 'pages');

        if (pagesIdx === -1) return '';

        // Depth is the number of segments after 'pages' plus 1 (for 'pages' itself)
        // Example: /pages/admin/dashboard.html -> segments are [pages, admin, dashboard.html]
        // pagesIdx is 0. segments.length is 3. depth = 3 - 0 - 1 = 2 steps up (../../)
        const depth = segments.length - pagesIdx - 1;
        return '../'.repeat(depth + 1);
    }
};

// Expose globally
window.Perf = Perf;
