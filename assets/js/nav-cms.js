/**
 * nav-cms.js
 * Unified Navigation Engine - Handles site-wide menu structure
 */
import StorageManager from './storage-manager.js';

export const NavigationCMS = {
    STORAGE_KEY: 'site_menu_config',

    DEFAULT_MENU: [
        { id: 'home', label: 'Home', href: '/index.html', visible: true, order: 1 },
        { id: 'about', label: 'About Us', href: '/pages/about/index.html', visible: true, order: 2 },
        { id: 'services', label: 'Services', href: '/pages/services/index.html', visible: true, order: 3 },
        {
            id: 'exam',
            label: 'Exam',
            href: '#',
            type: 'dropdown',
            visible: true,
            order: 4,
            children: [
                { id: 'results', label: 'Exam Results', href: '/pages/results/index.html' },
                { id: 'archive', label: 'Result Archive', href: '/pages/results/archive.html' },
                { id: 'rules', label: 'Result Rules', href: '/pages/results/rules.html' }
            ]
        },
        { id: 'news', label: 'News', href: '/pages/news/index.html', visible: true, order: 5 },
        { id: 'poster', label: 'Poster Builder', href: '/pages/poster-builder/index.html', visible: true, order: 6 },
        { id: 'contact', label: 'Contact', href: '#contact', visible: true, order: 7 },
        { id: 'admin', label: 'Admin Panel', href: '/pages/admin/dashboard.html', visible: true, order: 8, adminOnly: true }
    ],

    init() {
        if (!StorageManager.get(this.STORAGE_KEY)) {
            StorageManager.set(this.STORAGE_KEY, this.DEFAULT_MENU);
        }
    },

    getMenu() {
        const menu = StorageManager.get(this.STORAGE_KEY, this.DEFAULT_MENU);
        return menu.sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    saveMenu(menu) {
        StorageManager.set(this.STORAGE_KEY, menu);
        window.dispatchEvent(new CustomEvent('nav-updated'));
    },

    addItem(item) {
        const menu = this.getMenu();
        item.id = item.id || 'item_' + Date.now();
        item.order = item.order || (menu.length + 1);
        item.visible = item.visible !== false;
        menu.push(item);
        this.saveMenu(menu);
        return item;
    },

    updateItem(id, data) {
        let menu = this.getMenu();
        const idx = menu.findIndex(m => m.id === id);
        if (idx !== -1) {
            menu[idx] = { ...menu[idx], ...data };
            this.saveMenu(menu);
            return true;
        }
        return false;
    },

    deleteItem(id) {
        let menu = this.getMenu().filter(m => m.id !== id);
        this.saveMenu(menu);
    },

    toggleVisibility(id) {
        const menu = this.getMenu();
        const item = menu.find(m => m.id === id);
        if (item) {
            item.visible = !item.visible;
            this.saveMenu(menu);
        }
    }
};

export default NavigationCMS;
