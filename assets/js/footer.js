/**
 * Antigravity Results System - Unified Footer System
 */

const FooterSystem = {
    config: {
        footerId: 'site-footer'
    },

    init() {
        if (window.SiteSettings) {
            console.log("FooterSystem: Deferring to SiteSettings for dynamic footer.");
            return;
        }
        this.renderFooter();
        console.log("FooterSystem Initialized (Static Fallback)");
    },

    renderFooter() {
        const footer = document.getElementById(this.config.footerId);
        if (!footer) return;

        const currentYear = new Date().getFullYear();

        footer.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col">
                        <div class="footer-logo" style="font-size: 1.5rem; font-weight: 800; margin-bottom: 20px;">
                            MIFTHAHUL HUDA
                        </div>
                        <p style="color: #666; font-size: 0.9rem;">
                            Dedicated to excellence in Islamic and academic education since 1995.
                        </p>
                    </div>
                    <div class="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/index.html">Home</a></li>
                            <li><a href="/pages/about/index.html">About Us</a></li>
                            <li><a href="/pages/results/index.html">Results</a></li>
                            <li><a href="/pages/news/index.html">Latest News</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Community</h4>
                        <ul>
                            <li><a href="/pages/services/index.html">Services</a></li>
                            <li><a href="/pages/gallery/index.html">Media Gallery</a></li>
                            <li><a href="/pages/booking/index.html">Tuition Booking</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Connect</h4>
                        <div class="social-links" style="display: flex; gap: 15px; font-size: 1.5rem;">
                            <a href="#"><i class="ph ph-facebook-logo"></i></a>
                            <a href="#"><i class="ph ph-instagram-logo"></i></a>
                            <a href="#"><i class="ph ph-whatsapp-logo"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    &copy; ${currentYear} Antigravity Results System. All rights reserved.
                </div>
            </div>
        `;
    }
};

window.FooterSystem = FooterSystem;
export default FooterSystem;
