/**
 * menu-builder.js
 * Production-Grade Dynamic Navigation System
 */
window.MenuBuilder = {
    storageKey: 'siteMenuSettings',
    defaultMenu: {
        menu: [
            { label: 'Home', link: '/', enabled: true, children: [] },
            {
                label: 'Services', link: '#', enabled: true, children: [
                    { label: 'Web Design', link: '/web-design', enabled: true },
                    { label: 'App Development', link: '/apps', enabled: true }
                ]
            },
            { label: 'About', link: '/about', enabled: true, children: [] },
            { label: 'Contact', link: '/contact', enabled: true, children: [] }
        ]
    },

    init() {
        console.log('[MenuBuilder] Initialized');
        const data = this.getMenu();
        this.renderMenu('dynamic-header', data.menu);
    },

    getMenu() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.defaultMenu;
        } catch (e) {
            console.error('[MenuBuilder] Load Error:', e);
            return this.defaultMenu;
        }
    },

    save(menuArray) {
        localStorage.setItem(this.storageKey, JSON.stringify({ menu: menuArray }));
        this.init(); // Re-render
    },

    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    isValidUrl(url) {
        if (!url || url.startsWith('javascript:')) return false;
        return true; // Simplified for internal/external links
    },

    renderMenu(targetId, menuItems) {
        const header = document.getElementById(targetId);
        if (!header) return;

        const navHtml = `
            <nav class="navbar navbar-expand-lg glass-header py-3">
                <div class="container">
                    <a class="navbar-brand fw-bold fs-4" href="/">PRO<span class="text-primary">PLATFORM</span></a>
                    
                    <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar">
                        <div class="offcanvas-header border-bottom">
                            <h5 class="offcanvas-title fw-bold">Menu</h5>
                            <button type="button" class="btn-close shadow-none" data-bs-dismiss="offcanvas"></button>
                        </div>
                        <div class="offcanvas-body">
                            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                                ${menuItems.filter(item => item.enabled).map(item => this.buildMenuItem(item)).join('')}
                            </ul>
                            <div class="d-flex mt-3 mt-lg-0 gap-2">
                                <a href="/login" class="btn btn-outline-primary rounded-pill px-4">Login</a>
                                <a href="/signup" class="btn btn-primary rounded-pill px-4">Get Started</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        header.innerHTML = navHtml;
    },

    buildMenuItem(item) {
        const hasChildren = item.children && item.children.length > 0;
        const sanitizedLabel = this.sanitize(item.label);
        const link = this.isValidUrl(item.link) ? item.link : '#';

        if (hasChildren) {
            return `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="${link}" role="button" data-bs-toggle="dropdown">
                        ${sanitizedLabel}
                    </a>
                    <ul class="dropdown-menu border-0 shadow-lg rounded-4 overflow-hidden animate slideIn">
                        ${item.children.filter(child => child.enabled).map(child => `
                            <li><a class="dropdown-item py-2 px-3" href="${this.isValidUrl(child.link) ? child.link : '#'}">${this.sanitize(child.label)}</a></li>
                        `).join('')}
                    </ul>
                </li>
            `;
        }

        return `
            <li class="nav-item">
                <a class="nav-link px-3" href="${link}">${sanitizedLabel}</a>
            </li>
        `;
    }
};
