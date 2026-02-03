/**
 * Advanced Dynamic Footer System - JS
 * Functionality: Dynamic Injection, Multi-language (EN, ML, AR), Theme Detection, Sticky Mini-Footer
 */

const FooterSystem = {
    // 1. Dictionary is now in site-languages.js
    // Hook into global lang change
    onLangChange(lang) {
        this.render();
        this.bindEvents();
    },

    // 2. Configuration & State
    state: {
        get lang() { return document.documentElement.lang || 'en'; },
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        isMobile: window.innerWidth <= 768
    },

    // 3. Helper to get relative path
    getBasePath() {
        return (window.Perf && window.Perf.getBasePath) ? window.Perf.getBasePath() : '';
    },

    // 4. Initialization
    // 4. Initialization
    init() {
        const initFooter = () => {
            this.render();
            this.bindEvents();
            this.checkVisibility();
            this.initThemeDetection();
        };

        if (window.Perf) {
            window.Perf.runIdle(initFooter);
        } else {
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initFooter);
            } else {
                initFooter();
            }
        }

        // Listen for global language changes
        window.addEventListener('siteLangChange', (e) => this.onLangChange(e.detail.lang));
    },

    // 5. Render Footer
    render() {
        const BP = this.getBasePath();
        const isRTL = this.state.lang === 'ar';

        // Check for existing placeholder
        let footer = document.getElementById('main-footer');
        if (!footer) {
            footer = document.createElement('footer');
            footer.id = 'main-footer';
            document.body.appendChild(footer);
        }

        // Apply RTL if needed
        footer.dir = isRTL ? 'rtl' : 'ltr';

        footer.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <!-- Brand Column -->
                    <div class="footer-brand">
                        <a href="${BP}index.html" class="logo">MHMV 2026.</a>
                        <p data-t="brand_desc">Empowering students through knowledge, creativity, and spiritual growth.</p>
                        <div class="footer-social">
                            <a href="#" class="social-link" title="WhatsApp"><i class="ph-bold ph-whatsapp-logo"></i></a>
                            <a href="#" class="social-link" title="Instagram"><i class="ph-bold ph-instagram-logo"></i></a>
                            <a href="#" class="social-link" title="YouTube"><i class="ph-bold ph-youtube-logo"></i></a>
                            <a href="https://github.com/Sareef6235" class="social-link" title="GitHub"><i class="ph-bold ph-github-logo"></i></a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="footer-column">
                        <h4 data-t="quick_links">Quick Links</h4>
                        <div class="footer-links-wrapper">
                            <ul class="footer-links">
                                <li><a href="${BP || './'}" data-t="home">Home</a></li>
                                <li><a href="${BP}pages/services/" data-t="services">Services</a></li>
                                <li><a href="${BP}pages/gallery/" data-t="gallery">Gallery</a></li>
                                <li><a href="${BP}pages/about/" data-t="about">About Us</a></li>
                                <li><a href="${BP}pages/booking/" data-t="booking">Book Tuition</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Student Zone -->
                    <div class="footer-column">
                        <h4 data-t="student_zone">Student Zone</h4>
                        <div class="footer-links-wrapper">
                            <ul class="footer-links">
                                <li><a href="${BP}pages/students/creative.html" data-t="fee_payment">Fee Payment</a></li>
                                <li><a href="${BP}pages/results/" data-t="exam_results">Exam Results</a></li>
                                <li><a href="${BP}pages/students/achievements.html" data-t="achievements">Achievements</a></li>
                                <li><a href="${BP}pages/poster-builder/" data-t="poster_builder">Poster Builder</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="footer-column">
                        <h4 data-t="contact">Contact</h4>
                        <div class="footer-links-wrapper">
                            <div class="footer-contact-item">
                                <i class="ph-bold ph-map-pin"></i>
                                <span data-t="address">Vengara S S Road</span>
                            </div>
                            <div class="footer-contact-item">
                                <i class="ph-bold ph-phone"></i>
                                <a href="tel:+916235989198" style="color:inherit; text-decoration:none;">+91 6235989198</a>
                            </div>
                            <div class="footer-contact-item">
                                <i class="ph-bold ph-envelope"></i>
                                <a href="mailto:contact@mhmv.org" style="color:inherit; text-decoration:none;">contact@mhmv.org</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div class="copyright">
                        &copy; 2026 MHMV. <span data-t="copyright">All rights reserved.</span>
                    </div>
                    
                    <div class="footer-meta">
                        <!-- Switcher is now auto-injected by site-languages.js -->
                        <a href="${BP}pages/privacy.html" data-t="privacy">Privacy</a>
                        <a href="${BP}pages/terms.html" data-t="terms">Terms</a>
                        <a href="${BP}pages/admin/dashboard.html" data-t="admin">Admin</a>
                    </div>
                </div>
            </div>

            <!-- Sticky Mini Footer for Mobile -->
            <div class="mini-footer" id="sticky-mini-footer">
                <a href="${BP || './'}" class="mini-footer-item ${window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') ? 'active' : ''}">
                    <i class="ph-bold ph-house"></i>
                    <span data-t="home">Home</span>
                </a>
                <a href="${BP}pages/booking/" class="mini-footer-item ${window.location.pathname.includes('booking') ? 'active' : ''}">
                    <i class="ph-bold ph-calendar-plus"></i>
                    <span data-t="booking">Booking</span>
                </a>
                <a href="#contact" class="mini-footer-item" id="mini-contact-trigger">
                    <i class="ph-bold ph-chat-circle-dots"></i>
                    <span data-t="contact">Contact</span>
                </a>
                <div class="mini-footer-item" id="mini-expand-trigger">
                    <i class="ph-bold ph-list"></i>
                    <span>Menu</span>
                </div>
            </div>
        `;

        this.updateMiniFooterVisibility();
    },

    // Simplified bindEvents - switcher logic moved to LanguageSystem
    bindEvents() {

        // Mobile Accordions
        document.querySelectorAll('.footer-column h4').forEach(header => {
            header.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    const col = header.parentElement;
                    col.classList.toggle('active');

                    // Close other columns
                    document.querySelectorAll('.footer-column').forEach(other => {
                        if (other !== col) other.classList.remove('active');
                    });
                }
            });
        });

        // Mini Footer Expand
        const expandBtn = document.getElementById('mini-expand-trigger');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                const footer = document.getElementById('main-footer');
                footer.scrollIntoView({ behavior: 'smooth' });
                // Briefly highlight the footer or open first accordion
                const firstCol = document.querySelector('.footer-column');
                if (firstCol) firstCol.classList.add('active');
            });
        }

        // Contact Trigger
        const contactBtn = document.getElementById('mini-contact-trigger');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    e.preventDefault();
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Scroll listener for sticky mini-footer
        window.addEventListener('scroll', () => {
            this.updateMiniFooterVisibility();
        });

        // Handle path-based hiding
        this.checkVisibility();
    },


    // Simplified onLangChange

    // 8. Theme Detection
    initThemeDetection() {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', e => {
            this.state.theme = e.matches ? 'dark' : 'light';
            // CSS handles the rest via media queries, but we could trigger JS events here if needed
        });
    },

    // 9. Visibility Logic
    checkVisibility() {
        const path = window.location.pathname;
        const footer = document.getElementById('main-footer');
        if (!footer) return;

        // Hide on Poster Builder
        if (path.includes('poster-builder')) {
            footer.style.display = 'none';
            const mini = document.getElementById('sticky-mini-footer');
            if (mini) mini.style.display = 'none';
        }
    },

    updateMiniFooterVisibility() {
        const mini = document.getElementById('sticky-mini-footer');
        if (!mini) return;

        if (window.innerWidth <= 768) {
            // Show only if we've scrolled a bit
            if (window.scrollY > 300) {
                mini.classList.add('visible');
            } else {
                mini.classList.remove('visible');
            }

            // Hide if at the very bottom (to avoid overlapping main footer)
            const scrollBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
            if (scrollBottom < 100) {
                mini.classList.remove('visible');
            }
        } else {
            mini.classList.remove('visible');
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    FooterSystem.init();
});
