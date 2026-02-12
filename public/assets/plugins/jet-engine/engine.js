/**
 * JET ENGINE PLUGIN
 * Dynamic content engine with CPT, meta fields, and listings
 * Refactored from existing Services Manager
 */

window.JetEngine = {
    version: '1.0.0',
    settings: {},
    cpts: new Map(),
    metaFields: new Map(),

    /**
     * Initialize plugin
     */
    init() {
        console.log('🚀 JetEngine initialized');
        this.loadSettings();
        this.registerDefaultCPTs();
    },

    /**
     * Activate plugin
     */
    activate() {
        console.log('✅ JetEngine activated');
        // Trigger any activation hooks
    },

    /**
     * Deactivate plugin
     */
    deactivate() {
        console.log('⚠️ JetEngine deactivated');
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('jetengine_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        } else {
            this.settings = {
                enableCPT: true,
                enableMetaFields: true,
                enableListings: true
            };
        }
    },

    /**
     * Save settings
     */
    saveSettings() {
        localStorage.setItem('jetengine_settings', JSON.stringify(this.settings));
    },

    /**
     * Register default Custom Post Types
     */
    registerDefaultCPTs() {
        this.registerCPT('service', {
            label: 'Services',
            singular: 'Service',
            icon: 'ph-briefcase',
            supports: ['title', 'description', 'thumbnail', 'meta'],
            metaFields: [
                { name: 'price', type: 'number', label: 'Price' },
                { name: 'duration', type: 'text', label: 'Duration' },
                { name: 'category', type: 'select', label: 'Category', options: ['Academic', 'Creative', 'Sports'] }
            ]
        });

        this.registerCPT('poster', {
            label: 'Posters',
            singular: 'Poster',
            icon: 'ph-paint-brush-broad',
            supports: ['title', 'thumbnail', 'meta'],
            metaFields: [
                { name: 'event_date', type: 'date', label: 'Event Date' },
                { name: 'category', type: 'text', label: 'Category' }
            ]
        });
    },

    /**
     * Register a Custom Post Type
     */
    registerCPT(slug, config) {
        this.cpts.set(slug, {
            slug,
            ...config,
            items: this.loadCPTItems(slug)
        });
        console.log(`📦 Registered CPT: ${config.label}`);
    },

    /**
     * Load CPT items from localStorage
     */
    loadCPTItems(slug) {
        const key = `jetengine_cpt_${slug}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Save CPT items
     */
    saveCPTItems(slug, items) {
        const key = `jetengine_cpt_${slug}`;
        localStorage.setItem(key, JSON.stringify(items));
    },

    /**
     * Create new CPT item
     */
    createItem(slug, data) {
        const cpt = this.cpts.get(slug);
        if (!cpt) {
            throw new Error(`CPT not found: ${slug}`);
        }

        const item = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        cpt.items.push(item);
        this.saveCPTItems(slug, cpt.items);

        return item;
    },

    /**
     * Update CPT item
     */
    updateItem(slug, id, data) {
        const cpt = this.cpts.get(slug);
        if (!cpt) {
            throw new Error(`CPT not found: ${slug}`);
        }

        const index = cpt.items.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Item not found: ${id}`);
        }

        cpt.items[index] = {
            ...cpt.items[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        this.saveCPTItems(slug, cpt.items);
        return cpt.items[index];
    },

    /**
     * Delete CPT item
     */
    deleteItem(slug, id) {
        const cpt = this.cpts.get(slug);
        if (!cpt) {
            throw new Error(`CPT not found: ${slug}`);
        }

        cpt.items = cpt.items.filter(item => item.id !== id);
        this.saveCPTItems(slug, cpt.items);
    },

    /**
     * Get all items for a CPT
     */
    getItems(slug, query = {}) {
        const cpt = this.cpts.get(slug);
        if (!cpt) {
            throw new Error(`CPT not found: ${slug}`);
        }

        let items = [...cpt.items];

        // Apply filters
        if (query.filter) {
            items = items.filter(item => {
                for (const [key, value] of Object.entries(query.filter)) {
                    if (item[key] !== value) return false;
                }
                return true;
            });
        }

        // Apply sorting
        if (query.orderBy) {
            const order = query.order || 'asc';
            items.sort((a, b) => {
                if (order === 'asc') {
                    return a[query.orderBy] > b[query.orderBy] ? 1 : -1;
                } else {
                    return a[query.orderBy] < b[query.orderBy] ? 1 : -1;
                }
            });
        }

        // Apply limit
        if (query.limit) {
            items = items.slice(0, query.limit);
        }

        return items;
    },

    /**
     * Get single item
     */
    getItem(slug, id) {
        const cpt = this.cpts.get(slug);
        if (!cpt) {
            throw new Error(`CPT not found: ${slug}`);
        }

        return cpt.items.find(item => item.id === id);
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Render dynamic listing
     */
    renderListing(slug, container, template = 'grid') {
        const items = this.getItems(slug);
        const containerEl = typeof container === 'string' ?
            document.querySelector(container) : container;

        if (!containerEl) {
            console.error('Container not found');
            return;
        }

        if (template === 'grid') {
            containerEl.innerHTML = items.map(item => this.renderGridItem(slug, item)).join('');
        } else if (template === 'list') {
            containerEl.innerHTML = items.map(item => this.renderListItem(slug, item)).join('');
        }
    },

    /**
     * Render grid item
     */
    renderGridItem(slug, item) {
        return `
            <div class="jet-item" data-id="${item.id}">
                ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}">` : ''}
                <h3>${item.title || 'Untitled'}</h3>
                <p>${item.description || ''}</p>
            </div>
        `;
    },

    /**
     * Render list item
     */
    renderListItem(slug, item) {
        return `
            <div class="jet-list-item" data-id="${item.id}">
                <h4>${item.title || 'Untitled'}</h4>
                <p>${item.description || ''}</p>
            </div>
        `;
    }
};

// Auto-initialize if plugin is active
if (window.PluginManager) {
    window.addEventListener('plugin:activated', (e) => {
        if (e.detail.plugin.id === 'jet-engine') {
            window.JetEngine.init();
        }
    });
}

export default window.JetEngine;
