/**
 * COOKIEYES PLUGIN
 * Cookie consent and GDPR compliance
 */

window.CookieYes = {
    version: '1.0.0',

    init() {
        console.log('🍪 CookieYes initialized');
        if (!localStorage.getItem('cookie_consent')) {
            this.showBanner();
        }
    },

    showBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div style="background: #222; color: #fff; padding: 15px; position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; z-index: 10000; border-top: 1px solid #444;">
                <span>We use cookies to improve your experience.</span>
                <button onclick="window.CookieYes.accept()" style="background: #00f3ff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer;">Accept</button>
            </div>
        `;
        document.body.appendChild(banner);
    },

    accept() {
        localStorage.setItem('cookie_consent', 'true');
        document.querySelector('.cookie-banner').remove();
    }
};

export default window.CookieYes;
