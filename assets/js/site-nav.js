/**
 * Modern Navigation Controller
 * Single Source of Truth for Site Navigation
 */
const NavigationSystem = {
    // 1. Menu Definitions
    // 1. Menu Definitions
    getBasePath() {
        const path = window.location.pathname;

        // Count how many folders deep we are relative to the root 'muhsin2' or domain root
        // This regex looks for 'pages' or 'hn' (if that's a root folder) and counts slashes after

        if (path.includes('/pages/')) {
            const parts = path.split('/pages/')[1].split('/');
            // If parts = ['admin', 'index.html'] -> depth 1 -> ../../
            // If parts = ['students', 'creative.html'] -> depth 1 -> ../../
            // If parts = ['gallery', 'sub', 'index.html'] -> depth 2 -> ../../../ (example)

            // The logic: 
            // 1 level deep (pages/admin) needs ../../ to get to root
            // 2 levels deep (pages/students/more) needs ../../../

            let depth = parts.length - 1;
            // However, 'pages/' itself is one level deep from root.
            // So pages/admin/index.html is: root -> pages -> admin -> index.html
            // To get to root: up to admin (..), up to pages (..), up to root (..) ?? No.

            // Let's stick to the reliable method:
            if (path.match(/\/pages\/[^/]+\/[^/]+\//)) return '../../../'; // e.g. pages/blog/2023/post.html
            if (path.match(/\/pages\/[^/]+\//)) return '../../';     // e.g. pages/admin/index.html
            return '../'; // Fallback
        }

        // Handle 'hn' folder if it exists as a project root sibling/child
        if (path.includes('/hn/')) {
            return '../';
        }

        return ''; // Root directory
    },

    async getMenu() {
        const BP = this.getBasePath();

        // 1. Fetch from Unified CMS
        let menuConfig = [];
        try {
            const { NavigationCMS } = await import('./nav-cms.js');
            menuConfig = NavigationCMS.getMenu();
        } catch (e) {
            console.warn('NavigationCMS not found, using static fallback');
            menuConfig = this.getStaticFallback();
        }

        const isAdmin = typeof LocalAuth !== 'undefined' && LocalAuth.isAuthenticated();

        // 2. Filter and Apply BasePath
        const processLinks = (items) => {
            return items
                .filter(item => item.visible !== false) // Filter hidden items
                .filter(item => !item.adminOnly || isAdmin) // Filter admin-only items
                .map(item => {
                    const processed = { ...item };
                    // Apply BP to href if it starts with / (root-relative)
                    if (processed.href && processed.href.startsWith('/')) {
                        processed.href = BP + processed.href.substring(1);
                    }
                    if (processed.children) {
                        processed.children = processLinks(processed.children);
                    }
                    return processed;
                });
        };

        return processLinks(menuConfig);
    },

    getStaticFallback() {
        return [
            { id: 'home', label: 'Home', href: '/index.html', tKey: 'home' },
            { id: 'services', label: 'Services', href: '/pages/services/index.html', tKey: 'services' },
            { id: 'results', label: 'Results', href: '/pages/results/index.html', tKey: 'results' },
            { id: 'news', label: 'News', href: '/pages/news/index.html', tKey: 'news' }
        ];
    },

    init() {
        this.checkEditorMode();

        const render = async () => {
            const menu = await this.getMenu();
            this.renderDesktop(menu);
            this.bindEvents();
            this.highlightActive();
            this.checkAdminStatus();
        };

        // Render on load
        if (window.Perf) {
            window.Perf.runIdle(render);
        } else {
            setTimeout(render, 0);
        }

        // Listen for CMS updates
        window.addEventListener('nav-updated', render);

        // Re-render on language change
        window.addEventListener('siteLangChange', render);
    },

    // 0. Editor Mode Detection
    checkEditorMode() {
        const isEditor = window.location.pathname.includes('poster-builder') || document.body.classList.contains('editor-mode');

        if (isEditor) {
            document.body.classList.add('editor-mode');

            // Inject Editor Specific Styles
            const style = document.createElement('style');
            style.innerHTML = `
                /* Editor Mode Overrides */
                body.editor-mode { overflow: hidden; }
                body.editor-mode #main-header { 
                    transform: translateY(-100%); 
                    position: absolute; 
                    pointer-events: none;
                }
                body.editor-mode main { margin-top: 0 !important; height: 100vh; }
                body.editor-mode footer, body.editor-mode #main-footer, body.editor-mode .mini-footer { display: none !important; }
                
                /* Floating Exit Button */
                .editor-exit-btn {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 10000;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s ease;
                    text-decoration: none;
                }
                .editor-exit-btn:hover {
                    background: var(--primary-color);
                    color: black;
                    transform: translateX(5px);
                }
            `;
            document.head.appendChild(style);

            // Add Exit Button
            const BP = this.getBasePath();
            const exitBtn = document.createElement('a');
            exitBtn.href = BP + 'index.html';
            exitBtn.className = 'editor-exit-btn';
            exitBtn.innerHTML = '<i class="ph-bold ph-arrow-left"></i> Exit Editor';
            document.body.appendChild(exitBtn);
        }
    },

    // 2. DOM Rendering
    renderDesktop(menu) {
        const header = document.getElementById('main-header');
        if (!header) return;

        const BP = this.getBasePath();

        header.innerHTML = `
            <div class="container nav-container">
                <div class="logo-wrapper">
                    <a href="${BP}index.html" class="logo">MHMV 2026.</a>
                </div>
                
                <nav class="desktop-nav">
                    <ul class="nav-links">
                        ${menu.map(item => this.buildMenuItem(item)).join('')}
                    </ul>
                </nav>

                <div class="header-right">
                    <div class="lang-injection-point"></div>
                    <button class="mobile-menu-btn" aria-label="Toggle Navigation">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </button>
                </div>
            </div>
            <div class="mobile-nav-overlay" id="mobile-nav-overlay">
                <div class="mobile-nav-content">
                    <div class="mobile-nav-header">
                        <span class="logo">MHMV.</span>
                        <button class="close-mobile-nav">&times;</button>
                    </div>
                    <ul class="mobile-nav-list">
                        ${menu.map(item => this.buildMobileItem(item)).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    buildMobileItem(item) {
        if (item.type === 'dropdown') {
            return `
                <li class="mobile-nav-item">
                    <div class="mobile-accordion">
                        <div class="accordion-header" data-t="${item.tKey}">${item.label} <i class="ph ph-caret-down"></i></div>
                        <div class="accordion-body">
                            ${item.children.map(child => `<a href="${child.href}" class="mobile-link ${child.class || ''}" ${child.onclick ? `onclick="${child.onclick}"` : ''} data-t="${child.tKey}">${child.label}</a>`).join('')}
                        </div>
                    </div>
                </li>
            `;
        }
        return `<li><a href="${item.href}" class="mobile-link ${item.class || ''}" ${item.onclick ? `onclick="${item.onclick}"` : ''} data-t="${item.tKey}">${item.label}</a></li>`;
    },

    // 2. DOM Rendering

    buildMenuItem(item) {
        if (item.type === 'dropdown') {
            return `
                <li class="nav-item">
                    <a href="${item.href}" class="nav-link"><span data-t="${item.tKey}">${item.label}</span> <i class="ph ph-caret-down" style="font-size: 0.8em;"></i></a>
                    <div class="dropdown-menu">
                        ${item.children.map(child => {
                if (child.adminOnly && !LocalAuth.isAuthenticated()) return '';
                return this.buildSubItem(child);
            }).join('')}
                    </div>
                </li>
            `;
        }
        return `<li class="nav-item"><a href="${item.href}" class="nav-link" data-t="${item.tKey}">${item.label}</a></li>`;
    },

    buildSubItem(item) {
        if (item.type === 'submenu') {
            return `
                <div class="has-submenu">
                    <a href="#" class="dropdown-link" data-t="${item.tKey}">${item.label} <i class="ph ph-caret-right"></i></a>
                    <div class="submenu">
                        ${item.children.map(sub => `<a href="${sub.href}" class="dropdown-link ${sub.class || ''}" ${sub.onclick ? `onclick="${sub.onclick}"` : ''} ${sub.style ? `style="${sub.style}"` : ''} data-t="${sub.tKey}">${sub.label}</a>`).join('')}
                    </div>
                </div>
            `;
        }
        return `<a href="${item.href}" class="dropdown-link ${item.class || ''}" ${item.onclick ? `onclick="${item.onclick}"` : ''} ${item.style ? `style="${item.style}"` : ''} data-t="${item.tKey}">${item.label}</a>`;
    },


    // 3. Interactions
    bindEvents() {
        const header = document.getElementById('main-header');

        // Scroll - Throttled for performance
        if (window.Perf && window.Perf.throttle) {
            window.addEventListener('scroll', window.Perf.throttle(() => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, 100)); // Check every 100ms
        } else {
            // Fallback if Perf not loaded yet
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        // Mobile Toggle
        const btn = document.querySelector('.mobile-menu-btn');
        const overlay = document.getElementById('mobile-nav-overlay');
        const closeBtn = document.querySelector('.close-mobile-nav');

        if (btn && overlay) {
            btn.addEventListener('click', () => {
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            const close = () => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };

            if (closeBtn) closeBtn.onclick = close;
            overlay.onclick = (e) => { if (e.target === overlay) close(); };
        }

        // Accordions
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const parent = header.parentElement;
                // Close others
                document.querySelectorAll('.mobile-accordion.open').forEach(acc => {
                    if (acc !== parent) acc.classList.remove('open');
                });
                parent.classList.toggle('open');
            });
        });
    },

    // 4. Active Logic
    highlightActive() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const currentSearch = window.location.search;
        const fullPath = currentPath + currentSearch;

        // Helper to check if link matches current page
        const isMatch = (href) => {
            if (!href || href === '#') return false;
            return href === fullPath || href === currentPath || (currentPath === 'index.html' && href.startsWith('index.html'));
        };

        // Desktop & Mobile
        const allLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-nav-content a');

        allLinks.forEach(link => {
            if (isMatch(link.getAttribute('href'))) {
                link.classList.add('active');

                // 1. Highlight Submenu Parent (Desktop)
                const submenu = link.closest('.submenu');
                if (submenu) {
                    const hasSubmenu = submenu.closest('.has-submenu');
                    if (hasSubmenu) {
                        const parentLink = hasSubmenu.querySelector('.dropdown-link');
                        if (parentLink) parentLink.classList.add('active');
                    }
                }

                // 2. Highlight Top-Level Parent (Desktop)
                const navItem = link.closest('.nav-item');
                if (navItem) {
                    const topLink = navItem.querySelector('.nav-link');
                    if (topLink) topLink.classList.add('active');
                }

                // 3. Highlight Mobile Parent Accordion
                const mobileBody = link.closest('.accordion-body');
                if (mobileBody) {
                    const mobileHeader = mobileBody.previousElementSibling; // .accordion-header
                    if (mobileHeader) mobileHeader.classList.add('active-parent'); // You might need CSS for this
                    mobileBody.parentElement.classList.add('open');
                }
            }
        });
    },

    // 5. Admin Guard
    checkAdminStatus() {
        if (typeof LocalAuth === 'undefined') return;
        const isAdmin = LocalAuth.isAuthenticated();
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => NavigationSystem.init());
