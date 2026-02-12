/**
 * menu-manager.js
 * Extensible Menu Management with Translation Support
 */
import StorageManager from './storage-manager.js';

export const MenuManager = {
    KEYS: {
        MENU_CONFIG: 'site_menu_config'
    },

    /**
     * Default Menu structure aligned with site-nav.js requirements
     */
    DEFAULT_MENU: [
        { id: 'home', label: 'Home', href: '/index.html', tKey: 'home' },
        { id: 'about', label: 'About', href: '/pages/about/index.html', tKey: 'about' },
        { id: 'services', label: 'Services', href: '/pages/services/index.html', tKey: 'services' },
        {
            id: 'exam',
            label: 'Exam',
            href: '#',
            type: 'dropdown',
            tKey: 'exam',
            children: [
                { id: 'results', label: 'Exam Results', href: '/pages/results/index.html', tKey: 'results' },
                { id: 'rules', label: 'Result Rules', href: '/pages/results/rules.html', tKey: 'rules' },
                { id: 'archive', label: 'Result Archive', href: '/pages/results/archive.html', tKey: 'archive' }
            ]
        },
        { id: 'news', label: 'News', href: '/pages/news/index.html', tKey: 'news' },
        { id: 'contact', label: 'Contact', href: '#contact', tKey: 'contact' },
        { id: 'admin', label: 'Admin Portal', href: '/pages/admin/dashboard.html', adminOnly: true, tKey: 'dashboard' }
    ],

    getMenu() {
        // Return custom menu if exists, else default
        const menu = StorageManager.get(this.KEYS.MENU_CONFIG, this.DEFAULT_MENU);

        // Ensure relative paths are handled if needed, 
        // but site-nav.js usually handles base paths.
        return menu;
    },

    saveMenu(config) {
        StorageManager.set(this.KEYS.MENU_CONFIG, config);
    },

    /**
     * Resets menu to defaults
     */
    reset() {
        this.saveMenu(this.DEFAULT_MENU);
        return this.DEFAULT_MENU;
    }
};

export default MenuManager;
