/**
 * JetServices Plugin
 * Handles the "Services" Custom Post Type logic.
 */
import { MediaOptimizer } from '../../media-optimizer.js';
// Re-using the optimizer we built, but wrapping it in the plugin system later.

class JetServices {
    constructor() {
        this.storageKey = 'mhmv_jet_services';
        this.core = null;
    }

    init(core) {
        this.core = core;
        this.ensureDataStructure();
        // expose API
        window.JetServices = this;
    }

    /**
     * Data Migration & Integrity Check
     */
    ensureDataStructure() {
        let data = this.getAll();
        const now = new Date().toISOString();
        let modified = false;

        data = data.map(svc => {
            // Add Slug if missing
            if (!svc.slug) {
                svc.slug = this.generateSlug(svc.content.en.title);
                modified = true;
            }
            // Add Category if missing
            if (!svc.category) {
                svc.category = 'general';
                modified = true;
            }
            // Add Meta
            if (!svc.meta) {
                svc.meta = { views: 0, order: 0 };
                modified = true;
            }
            return svc;
        });

        if (modified) this.saveAll(data);
    }

    // --- CRUD ---

    getAll() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    get(id) {
        return this.getAll().find(s => s.id === id);
    }

    getBySlug(slug) {
        return this.getAll().find(s => s.slug === slug);
    }

    saveAll(list) {
        localStorage.setItem(this.storageKey, JSON.stringify(list));
        this.core?.dispatch('services:updated', list);
    }

    add(service) {
        const list = this.getAll();
        service.id = 'svc_' + Date.now();
        service.slug = this.generateSlug(service.content.en.title);
        service.date = new Date().toISOString();
        list.push(service);
        this.saveAll(list);
        this.core?.notify('Service added successfully!', 'success');
        return service;
    }

    update(id, updates) {
        const list = this.getAll();
        const index = list.findIndex(s => s.id === id);
        if (index === -1) return false;

        list[index] = { ...list[index], ...updates };

        // Regenerate slug if title changed (optional, maybe dangerous for SEO, let's keep it persistent for now unless forced)
        // list[index].slug = this.generateSlug(list[index].content.en.title); 

        this.saveAll(list);
        this.core?.notify('Service saved.', 'success');
        return true;
    }

    delete(id) {
        let list = this.getAll();
        list = list.filter(s => s.id !== id);
        this.saveAll(list);
        this.core?.notify('Service deleted.', 'error');
    }

    // --- Helpers ---

    generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start
            .replace(/-+$/, '');            // Trim - from end
    }

    getCategories() {
        const list = this.getAll();
        const cats = new Set(list.map(s => s.category || 'general'));
        return Array.from(cats);
    }
}

// Register with Core
if (window.MHMV) {
    window.MHMV.registerPlugin('JetServices', new JetServices());
} else {
    // Fallback if loaded before Core (should check defer)
    window.addEventListener('load', () => {
        if (window.MHMV) window.MHMV.registerPlugin('JetServices', new JetServices());
    });
}
