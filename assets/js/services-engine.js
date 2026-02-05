/**
 * ServicesEngine
 * Handles rendering and dynamic logic for the Services section.
 */
import StorageManager from './storage-manager.js';
import { servicesSeed } from './services-seed.js';

const ServicesEngine = {
    KEY: 'site_services',

    init() {
        const stored = StorageManager.get(this.KEY);
        if (!stored || stored.length === 0) {
            StorageManager.set(this.KEY, servicesSeed);
        }
    },

    getAll() {
        return StorageManager.get(this.KEY, []);
    },

    getActive() {
        return this.getAll().filter(s => s.visible !== false);
    },

    renderGrid(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const services = this.getActive();
        container.innerHTML = services.map(s => `
            <div class="service-card glass-mhm" data-aos="fade-up">
                <div class="service-icon">
                    <i class="ph-bold ${s.icon}"></i>
                </div>
                <h3>${s.title}</h3>
                <p>${s.desc}</p>
                <div class="service-footer">
                    <span class="category-tag">${s.category}</span>
                    <button class="btn-lean">Details <i class="ph ph-arrow-right"></i></button>
                </div>
            </div>
        `).join('');
    },

    // Admin Methods
    async addOrUpdate(service) {
        const services = this.getAll();
        const index = services.findIndex(s => s.id === service.id);

        if (index > -1) {
            services[index] = { ...services[index], ...service };
        } else {
            service.id = service.id || 'ser_' + Date.now();
            services.push(service);
        }

        StorageManager.set(this.KEY, services);
    },

    delete(id) {
        StorageManager.delete(this.KEY, s => s.id === id);
    }
};

export default ServicesEngine;
