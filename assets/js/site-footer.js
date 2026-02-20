/**
 * ============================================
 * UNIFIED FOOTER SYSTEM - JavaScript
 * Consolidated: site-footer.js + global-footer.js
 * Features: Dynamic Injection, Multi-language, Sticky Mini-Footer
 * ============================================
 */

const FooterSystem = {
    state: {
        get lang() { return document.documentElement.lang || 'en'; },
        isMobile: window.innerWidth <= 768
    },

    config: {
        brandName: 'MHMV 2026',
        description: 'Empowering students through knowledge, creativity, and spiritual growth.',
        socialLinks: [
            { id: 'whatsapp', icon: 'ph-bold ph-whatsapp-logo', url: 'https://wa.me/916235989198', label: 'WhatsApp' },
            { id: 'instagram', icon: 'ph-bold ph-instagram-logo', url: '#', label: 'Instagram' },
            { id: 'youtube', icon: 'ph-bold ph-youtube-logo', url: '#', label: 'YouTube' },
            { id: 'github', icon: 'ph-bold ph-github-logo', url: 'https://github.com/Sareef6235', label: 'GitHub' }
        ]
    },

    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            if (path.match(/\/pages\/[^/]+\/[^/]+\//)) return '../../../';
            if (path.match(/\/pages\/[^/]+\//)) return '../../';
            return '../';
        }
        if (path.includes('/hn/')) return '../';
        return '';
    },

    init() {
        const setup = () => {
            this.render();
            this.bindEvents();
            this.checkVisibility();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }

        window.addEventListener('siteLangChange', () => {
            this.render();
            this.bindEvents();
        });
    },

    render() {
        const BP = this.getBasePath();
        const isRTL = this.state.lang === 'ar';
        const container = document.getElementById('global-footer') || document.getElementById('main-footer');

        if (!container) return;

        container.dir = isRTL ? 'rtl' : 'ltr';
        container.innerHTML = `
            <footer class="site-footer" role="contentinfo">
                <div class="footer-container">
                    <div class="footer-grid">
                        <!-- Brand Column -->
                        <div class="footer-brand">
                            <a href="${BP}index.html" class="footer-logo">${this.config.brandName}.</a>
                            <p data-t="brand_desc">${this.config.description}</p>
                            <div class="footer-social">
                                ${this.config.socialLinks.map(s => `
                                    <a href="${s.url}" class="social-link" title="${s.label}" target="_blank" rel="noopener">
                                        <i class="${s.icon}"></i>
                                    </a>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Menu Columns -->
                        <div class="footer-column">
                            <h4 data-t="quick_links">Quick Links</h4>
                            <ul class="footer-links">
                                <li><a href="${BP}index.html" data-t="home">Home</a></li>
                                <li><a href="${BP}pages/services/index.html" data-t="services">Services</a></li>
                                <li><a href="${BP}pages/gallery/index.html" data-t="gallery">Gallery</a></li>
                                <li><a href="${BP}pages/about/index.html" data-t="about">About Us</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h4 data-t="student_zone">Student Zone</h4>
                            <ul class="footer-links">
                                <li><a href="${BP}pages/results/index.html" data-t="exam_results">Exam Results</a></li>
                                <li><a href="${BP}pages/students/creative.html" data-t="creative_corner">Creative Corner</a></li>
                                <li><a href="${BP}pages/poster-builder/index.html" data-t="poster_builder">Poster Builder</a></li>
                                <li><a href="${BP}pages/students/fee.html" data-t="fee_payment">Fee Payment</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h4 data-t="contact">Contact</h4>
                            <div class="footer-contact-info">
                                <div class="contact-item">
                                    <i class="ph-bold ph-map-pin"></i>
                                    <span data-t="address">Vengara S S Road</span>
                                </div>
                                <div class="contact-item">
                                    <i class="ph-bold ph-phone"></i>
                                    <a href="tel:+916235989198">+91 6235989198</a>
                                </div>
                                <div class="contact-item">
                                    <i class="ph-bold ph-envelope"></i>
                                    <a href="mailto:contact@mhmv.org">contact@mhmv.org</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <div class="copyright">
                            &copy; 2026 ${this.config.brandName}. <span data-t="copyright">All rights reserved.</span>
                        </div>
                        <div class="footer-meta">
                            <a href="${BP}pages/privacy.html" data-t="privacy">Privacy</a>
                            <a href="${BP}pages/terms.html" data-t="terms">Terms</a>
                            <a href="${BP}pages/admin/dashboard.html" data-t="admin">Admin</a>
                        </div>
                    </div>
                </div>

                <!-- Sticky Mini Footer for Mobile -->
                <div class="mini-footer" id="sticky-mini-footer">
                    <a href="${BP}index.html" class="mini-footer-item ${window.location.pathname.endsWith('index.html') ? 'active' : ''}">
                        <i class="ph-bold ph-house"></i>
                        <span data-t="home">Home</span>
                    </a>
                    <a href="${BP}pages/students/booking.html" class="mini-footer-item">
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
            </footer>
        `;

        this.updateMiniFooterVisibility();
    },

    bindEvents() {
        // Mobile Accordions
        document.querySelectorAll('.footer-column h4').forEach(header => {
            header.onclick = () => {
                if (window.innerWidth <= 768) {
                    const col = header.parentElement;
                    const isActive = col.classList.contains('active');
                    document.querySelectorAll('.footer-column').forEach(c => c.classList.remove('active'));
                    if (!isActive) col.classList.add('active');
                }
            };
        });

        // Mini Footer Logic
        const expandBtn = document.getElementById('mini-expand-trigger');
        if (expandBtn) {
            expandBtn.onclick = () => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            };
        }

        const contactBtn = document.getElementById('mini-contact-trigger');
        if (contactBtn) {
            contactBtn.onclick = (e) => {
                const contact = document.getElementById('contact');
                if (contact) {
                    e.preventDefault();
                    contact.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }

        window.onscroll = () => this.updateMiniFooterVisibility();
    },

    checkVisibility() {
        if (window.location.pathname.includes('poster-builder')) {
            const footer = document.querySelector('.site-footer');
            if (footer) footer.style.display = 'none';
        }
    },

    updateMiniFooterVisibility() {
        const mini = document.getElementById('sticky-mini-footer');
        if (!mini) return;

        if (window.innerWidth <= 768) {
            const shouldShow = window.scrollY > 300 &&
                (document.documentElement.scrollHeight - window.innerHeight - window.scrollY > 150);
            mini.classList.toggle('visible', shouldShow);
        } else {
            mini.classList.remove('visible');
        }
    }
};

FooterSystem.init();
window.FooterSystem = FooterSystem;
