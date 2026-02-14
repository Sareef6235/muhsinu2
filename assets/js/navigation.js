/**
 * Antigravity Results System - Unified Navigation System
 * Manages dynamic menu rendering, active link highlighting, and mobile responsiveness.
 */

const NavigationSystem = {
    config: {
        headerId: 'site-header',
        footerId: 'site-footer',
        activeClass: 'active'
    },

    init(menuData) {
        this.menuData = menuData;
        this.renderHeader();
        this.highlightActive();
        this.bindEvents();
        console.log("NavigationSystem Initialized");
    },

    renderHeader() {
        const header = document.getElementById(this.config.headerId);
        if (!header) return;

        const navHtml = `
            <div class="nav-container">
                <div class="nav-logo">
                    <a href="/index.html">
                        <img src="/assets/logo.png" alt="Logo" onerror="this.src='https://placehold.co/40x40?text=Logo'">
                        <span>MIFTHAHUL HUDA</span>
                    </a>
                </div>
                
                <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>

                <nav class="nav-links" id="nav-links">
                    ${this.generateMenuItems(this.menuData.headerMenu)}
                </nav>
            </div>
        `;
        header.innerHTML = navHtml;
    },

    generateMenuItems(items) {
        return items.filter(item => item.enabled).map(item => {
            const hasChildren = item.children && item.children.length > 0;
            const currentPath = window.location.pathname;
            const isActive = item.link === currentPath || (hasChildren && item.children.some(c => c.link === currentPath));

            if (hasChildren) {
                return `
                    <div class="nav-item-dropdown">
                        <a href="${item.link}" class="nav-link dropdown-toggle ${isActive ? 'active' : ''}">${item.label} <i class="ph ph-caret-down"></i></a>
                        <div class="dropdown-menu">
                            ${this.generateMenuItems(item.children)}
                        </div>
                    </div>
                `;
            }
            return `<a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}" data-id="${item.id}">${item.label}</a>`;
        }).join('');
    },

    highlightActive() {
        // Handled within generateMenuItems for better reliability
    },

    bindEvents() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('nav-links');

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('mobile-active');
                toggle.querySelector('i').className = nav.classList.contains('mobile-active') ? 'ph ph-x' : 'ph ph-list';
            });
        }

        // Close dropdowns on click outside (for mobile)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item-dropdown')) {
                document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
            }
        });
    }
};

window.NavigationSystem = NavigationSystem;
export default NavigationSystem;
