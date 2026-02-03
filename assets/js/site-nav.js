/**
 * Modern Navigation Controller v2.0
 * Features: Auto-path resolution, Auth-awareness, Multi-language, Glassmorphism UI
 */
export const NavigationSystem = {
    // ... (rest of the object)
    // 1. Menu Config - SINGLE SOURCE OF TRUTH
    getConfig() {
        const BP = this.getBasePath();

        const galleryItems = [
            { label: 'Photo Gallery', href: BP + 'pages/gallery/?tab=photo', tKey: 'photo_gallery' },
            { label: 'Video Gallery', href: BP + 'pages/gallery/?tab=video', tKey: 'video_gallery' }
        ];

        const studentItems = [
            { label: 'Fee Payment', href: BP + 'pages/students/creative.html', tKey: 'fee_payment' },
            { label: 'My Receipts', href: BP + 'pages/students/creation_receipt.html', tKey: 'receipts' },
            { label: 'Submit Work', href: BP + 'pages/students/creations.html', tKey: 'submit_work' },
            { label: 'Results Archive', href: BP + 'pages/results/', tKey: 'results_menu' }
        ];

        const proItems = [
            { label: 'Poster Builder', href: BP + 'pages/poster-builder/', tKey: 'poster_builder', class: 'new-item' },
            { label: 'Admin Dashboard', href: BP + 'pages/admin/dashboard.html', tKey: 'admin_dashboard', class: 'admin-only-link' },
            { label: 'News Archive', href: BP + 'pages/news/', tKey: 'news_archive' }
        ];

        return [
            { label: 'Home', href: BP || './', tKey: 'home' },
            { label: 'About Us', href: BP + 'pages/about/', tKey: 'about' },
            { label: 'Services', href: BP + 'pages/services/', tKey: 'services' },
            { label: 'News', href: BP + 'pages/news/', tKey: 'news' },
            { label: 'Gallery', href: '#', type: 'dropdown', children: galleryItems, tKey: 'gallery' },
            { label: 'Student Zone', href: '#', type: 'dropdown', children: studentItems, tKey: 'student_zone' },
            { label: 'Pro Tools', href: '#', type: 'dropdown', children: proItems, tKey: 'pro_tools' },
            // { label: 'Tuition', href: BP + 'pages/booking/', tKey: 'booking', class: 'btn-nav' } // Optional
        ];
    },

    // 2. Path Resolution Engine
    getBasePath() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p.length > 0);

        // Handle local file system (e.g. C:/Users/...)
        const rootIndex = parts.indexOf('muhsin2');
        if (rootIndex !== -1) {
            const depth = parts.length - 1 - rootIndex;
            if (depth <= 0) return '';
            return '../'.repeat(depth);
        }

        // Fallback for relative counting based on 'pages' folder
        if (path.includes('/pages/')) {
            const afterPages = path.split('/pages/')[1];
            if (afterPages.includes('/')) return '../../';
            return '../';
        }
        return '';
    },

    // 3. UI Generator
    render(targetElement) {
        // Allow passing a target element directly (e.g. shadow root or specific container)
        const header = targetElement || document.getElementById('main-header');
        if (!header) return;

        const config = this.getConfig();
        const BP = this.getBasePath();

        // Check if we need to wrap it in #main-header structure or if we are injecting INSIDE it
        // The CSS expects #main-header to contain .nav-container
        // If 'header' IS #main-header, we inject .nav-container inside.

        header.innerHTML = `
            <div class="nav-container">
                <a href="${BP || './'}" class="nav-logo">
                    <span class="logo-accent">MH</span>MV 2026.
                </a>

                <nav class="desktop-nav">
                    <ul class="nav-links">
                        ${config.map(item => this.createNavItem(item)).join('')}
                    </ul>
                </nav>

                <div class="nav-actions">
                    <div id="lang-switcher-nav"></div>
                    <button class="menu-toggle" aria-label="Open Menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>

            <div class="mobile-overlay">
                <div class="mobile-content">
                    <div class="mobile-header">
                        <span class="mobile-logo">MHMV.</span>
                        <button class="close-menu">&times;</button>
                    </div>
                    <ul class="mobile-list">
                        ${config.map(item => this.createMobileItem(item)).join('')}
                    </ul>
                </div>
            </div>
        `;

        this.bindEvents(header); // Pass header to scope events if needed
        this.highlightActive(header);
        this.syncAdminVisibility(header);
    },

    createNavItem(item) {
        if (item.type === 'dropdown') {
            return `
                <li class="nav-item dropdown">
                    <a href="${item.href}" class="nav-link" data-t="${item.tKey}">
                        ${item.label} <i class="ph ph-caret-down"></i>
                    </a>
                    <div class="dropdown-menu">
                        ${item.children.map(child => `
                            <a href="${child.href}" class="dropdown-link ${child.class || ''}" data-t="${child.tKey}">
                                ${child.label}
                                ${child.class === 'new-item' ? '<span class="badge">NEW</span>' : ''}
                            </a>
                        `).join('')}
                    </div>
                </li>
            `;
        }
        return `
            <li class="nav-item">
                <a href="${item.href}" class="nav-link ${item.class || ''}" data-t="${item.tKey}">${item.label}</a>
            </li>
        `;
    },

    createMobileItem(item) {
        if (item.type === 'dropdown') {
            return `
                <li class="mobile-item">
                    <div class="mobile-accordion">
                        <div class="accordion-trigger" data-t="${item.tKey}">${item.label} <i class="ph ph-caret-down"></i></div>
                        <div class="accordion-content">
                            ${item.children.map(child => `
                                <a href="${child.href}" class="mobile-link ${child.class || ''}" data-t="${child.tKey}">${child.label}</a>
                            `).join('')}
                        </div>
                    </div>
                </li>
            `;
        }
        return `
            <li class="mobile-item">
                <a href="${item.href}" class="mobile-link ${item.class || ''}" data-t="${item.tKey}">${item.label}</a>
            </li>
        `;
    },

    // 4. Interactions
    bindEvents(scope = document) {
        const toggle = scope.querySelector('.menu-toggle');
        const close = scope.querySelector('.close-menu');
        const overlay = scope.querySelector('.mobile-overlay');

        if (toggle && overlay) {
            toggle.onclick = () => overlay.classList.add('active');
            if (close) close.onclick = () => overlay.classList.remove('active');
            overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };
        }

        // Accordions
        scope.querySelectorAll('.accordion-trigger').forEach(trigger => {
            trigger.onclick = () => {
                const parent = trigger.parentElement;
                parent.classList.toggle('open');
            };
        });

        // Header Scroll Effect - Global window event
        window.onscroll = () => {
            const header = document.getElementById('main-header');
            if (header) {
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
            }
        };
    },

    highlightActive(scope = document) {
        const path = window.location.pathname;
        const links = scope.querySelectorAll('.nav-link, .dropdown-link, .mobile-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && path.includes(href.replace('../', ''))) {
                link.classList.add('active');
                // Highlight parents
                const dropdown = link.closest('.dropdown');
                if (dropdown) dropdown.querySelector('.nav-link').classList.add('active-parent');
            }
        });
    },

    syncAdminVisibility(scope = document) {
        // Listen for Auth Guard's window.userData
        const updateVisibility = () => {
            const isAdmin = window.userData && window.userData.role === 'admin';
            scope.querySelectorAll('.admin-only-link').forEach(link => {
                link.style.display = isAdmin ? 'flex' : 'none';
            });
        };

        if (window.userData) updateVisibility();
        window.addEventListener('user-data-loaded', updateVisibility);
    },

    init() {
        this.render();
    }
};
