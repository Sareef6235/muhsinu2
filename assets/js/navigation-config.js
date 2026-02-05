/**
 * ============================================
 * NAVIGATION CONFIGURATION
 * Centralized menu structure for entire site
 * ============================================
 */

// Define your menu structure here
const MENU_CONFIG = {
    containerId: 'global-nav',
    logoText: 'MHMV 2026',
    logoHref: '/index.html',
    logoIcon: null, // Optional: '/assets/images/logo.png'
    sticky: true,
    hideOnScroll: false,
    theme: 'light', // 'light', 'dark', 'auto'
    activeDetection: 'auto', // 'auto', 'manual', 'path'

    menuItems: [
        // Home
        {
            id: 'home',
            label: 'Home',
            href: '/index.html',
            icon: 'ph ph-house'
        },

        // About
        {
            id: 'about',
            label: 'About Us',
            href: '/pages/about/index.html',
            icon: 'ph ph-info'
        },

        // Services (with dropdown)
        {
            id: 'services',
            label: 'Services',
            href: '/pages/services/index.html',
            icon: 'ph ph-briefcase',
            children: [
                {
                    id: 'tuition',
                    label: 'Tuition Classes',
                    href: '/pages/services/tuition.html',
                    icon: 'ph ph-book-open'
                },
                {
                    id: 'online-learning',
                    label: 'Online Learning',
                    href: '/pages/services/online.html',
                    icon: 'ph ph-video-camera'
                },
                {
                    id: 'workshops',
                    label: 'Workshops',
                    href: '/pages/services/workshops.html',
                    icon: 'ph ph-users-three'
                }
            ]
        },

        // Exams & Results (with dropdown)
        {
            id: 'exams',
            label: 'Exams',
            href: '#',
            icon: 'ph ph-exam',
            children: [
                {
                    id: 'results-portal',
                    label: 'Result Portal',
                    href: '/pages/results/index.html',
                    icon: 'ph ph-app-window'
                },
                {
                    id: 'result-archive',
                    label: 'Result Archive',
                    href: '/pages/results/archive.html',
                    icon: 'ph ph-archive'
                },
                {
                    id: 'exam-rules',
                    label: 'Exam Rules',
                    href: '/pages/results/rules.html',
                    icon: 'ph ph-list-checks'
                }
            ]
        },

        // Student Zone (with nested submenu)
        {
            id: 'students',
            label: 'Student Zone',
            href: '#',
            icon: 'ph ph-student',
            children: [
                {
                    id: 'creative-corner',
                    label: 'Creative Corner',
                    href: '/pages/students/creative.html',
                    icon: 'ph ph-paint-brush'
                },
                {
                    id: 'fee-submission',
                    label: 'Fee Submission',
                    href: '/pages/students/fee.html',
                    icon: 'ph ph-receipt'
                },
                {
                    id: 'tuition-booking',
                    label: 'Book Tuition',
                    href: '/pages/students/booking.html',
                    icon: 'ph ph-calendar-check'
                }
            ]
        },

        // News
        {
            id: 'news',
            label: 'News',
            href: '/pages/news/index.html',
            icon: 'ph ph-newspaper'
        },

        // Poster Builder (with "New" badge)
        {
            id: 'poster-builder',
            label: 'Poster Builder',
            href: '/pages/poster-builder/index.html',
            icon: 'ph ph-palette',
            badge: 'New'
        },

        // Gallery
        {
            id: 'gallery',
            label: 'Gallery',
            href: '/pages/gallery/index.html',
            icon: 'ph ph-images'
        },

        // Contact
        {
            id: 'contact',
            label: 'Contact',
            href: '#contact',
            icon: 'ph ph-envelope'
        },

        // Admin (only visible when authenticated)
        {
            id: 'admin',
            label: 'Admin',
            href: '/pages/admin/dashboard.html',
            icon: 'ph ph-shield-check',
            // You can conditionally add this based on auth status
        }
    ]
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated (optional)
    const isAdmin = typeof LocalAuth !== 'undefined' && LocalAuth.isAuthenticated();

    // Filter menu items based on auth status if needed
    let menuItems = MENU_CONFIG.menuItems;
    if (!isAdmin) {
        menuItems = menuItems.filter(item => item.id !== 'admin');
    }

    // Initialize navigation
    const nav = new GlobalNavigation({
        ...MENU_CONFIG,
        menuItems: menuItems
    });

    // Make navigation instance globally available
    window.siteNavigation = nav;
});

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Add a new menu item dynamically
 * @param {Object} item - Menu item object
 * @param {number} position - Position to insert (optional)
 */
function addMenuItem(item, position = null) {
    if (window.siteNavigation) {
        window.siteNavigation.addMenuItem(item, position);
    }
}

/**
 * Remove a menu item by ID
 * @param {string} id - Menu item ID
 */
function removeMenuItem(id) {
    if (window.siteNavigation) {
        window.siteNavigation.removeMenuItem(id);
    }
}

/**
 * Update the entire menu
 * @param {Array} newItems - New menu items array
 */
function updateMenu(newItems) {
    if (window.siteNavigation) {
        window.siteNavigation.updateMenu(newItems);
    }
}

/**
 * Set active page manually
 * @param {string} pageId - Page ID to mark as active
 */
function setActivePage(pageId) {
    if (window.siteNavigation) {
        window.siteNavigation.setActivePage(pageId);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MENU_CONFIG, addMenuItem, removeMenuItem, updateMenu, setActivePage };
}
