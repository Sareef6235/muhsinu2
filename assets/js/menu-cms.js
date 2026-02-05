/**
 * menu-cms.js
 * Managing site navigation and visibility
 */
import StorageManager from './storage-manager.js';

export const MenuCMS = {
    STORAGE_KEY: 'site_menu_config',

    init() {
        if (!StorageManager.get(this.STORAGE_KEY)) {
            StorageManager.set(this.STORAGE_KEY, this.getDefaults());
        }
    },

    getConfig() {
        return StorageManager.get(this.STORAGE_KEY, this.getDefaults());
    },

    saveConfig(config) {
        StorageManager.set(this.STORAGE_KEY, config);
        // Custom event for site-nav.js to listen
        window.dispatchEvent(new CustomEvent('menuUpdated'));
    },

    getDefaults() {
        return [
            { id: 'home', label: 'Home', path: 'index.html', visible: true, order: 1 },
            { id: 'about', label: 'About Us', path: '#about', visible: true, order: 2 },
            { id: 'services', label: 'Services', path: 'pages/services/index.html', visible: true, order: 3 },
            { id: 'results', label: 'Results', path: 'pages/results/index.html', visible: true, order: 4 },
            { id: 'news', label: 'News', path: 'pages/news/index.html', visible: true, order: 5 },
            { id: 'contact', label: 'Contact', path: '#contact', visible: true, order: 6 }
        ];
    }
};

export default MenuCMS;
