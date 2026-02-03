/**
 * Dynamic Page Router
 * Handles URL parameters and injects content into the portal template.
 * Usage: portal.html?type=[service|news|result]&id=[xyz]
 */

import { Storage } from './storage.js';

export const Router = {
    init() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const id = params.get('id');

        if (!type) {
            this.render404('Page type not specified.');
            return;
        }

        switch (type) {
            case 'service':
                this.loadService(id);
                break;
            case 'news':
                this.loadNews(id);
                break;
            default:
                this.render404('Unknown page type.');
        }
    },

    async loadService(id) {
        const service = Storage.getById('services', id);

        if (!service) {
            // Fallback: Try loading from static JSON if local storage is empty
            const fallback = await this.fetchFallback('services');
            const staticService = fallback.find(s => s.id === id);

            if (staticService) {
                this.renderService(staticService);
                return;
            }

            this.render404('Service not found.');
            return;
        }

        this.renderService(service);
    },

    renderService(service) {
        document.title = `${service.title} | MHMV Services`;

        // Inject Content
        this.safeSetText('page-title', service.title);
        this.safeSetText('page-desc', service.content.desc || service.desc); // Handle both structures during migration

        const contentContainer = document.getElementById('page-content');
        if (contentContainer) {
            contentContainer.innerHTML = service.content.full || service.content; // Handle HTML content
        }

        // Hero Image
        const hero = document.getElementById('page-hero');
        if (hero && service.image) {
            hero.style.backgroundImage = `url('${service.image}')`;
        }
    },

    async fetchFallback(type) {
        try {
            const res = await fetch(`../assets/data/${type}.json`);
            return await res.json();
        } catch (e) {
            console.error('Fallback load failed:', e);
            return [];
        }
    },

    render404(msg) {
        document.body.innerHTML = `
            <div style="text-align:center; padding:50px; color:#fff; font-family:sans-serif;">
                <h1>404</h1>
                <p>${msg}</p>
                <a href="index.html" style="color:#00f3ff;">Go Home</a>
            </div>
        `;
    },

    safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => Router.init());
