/**
 * services-cms.js
 * Multi-language Dynamic Services Management
 */
import StorageManager from './storage-manager.js';

export const ServicesCMS = {
    STORAGE_KEY: 'services_cms',

    init() {
        if (!StorageManager.get(this.STORAGE_KEY)) {
            StorageManager.set(this.STORAGE_KEY, this.getDefaults());
        }
    },

    getAll() {
        return StorageManager.get(this.STORAGE_KEY, []);
    },

    getById(id) {
        return this.getAll().find(s => s.id === id);
    },

    save(service) {
        const services = this.getAll();
        const index = services.findIndex(s => s.id === service.id);

        if (index > -1) {
            services[index] = { ...services[index], ...service, updatedAt: Date.now() };
        } else {
            service.id = service.id || 'ser_' + Date.now();
            service.createdAt = Date.now();
            services.push(service);
        }

        StorageManager.set(this.STORAGE_KEY, services);
        return service;
    },

    delete(id) {
        const services = this.getAll().filter(s => s.id !== id);
        StorageManager.set(this.STORAGE_KEY, services);
    },

    getDefaults() {
        return [
            {
                id: 'ser_1',
                icon: 'ph ph-graduation-cap',
                title: { en: 'Islamic Theology', ml: 'ഇസ്ലാമിക ദൈവശാസ്ത്രം', ar: 'العقيدة الإسلامية' },
                desc: { en: 'Advanced studies in Aqidah and Fiqh.', ml: 'അഖീദയിലും ഫിഖ്ഹിലും ഉപരിപഠനം.', ar: 'دراسات متقدمة في العقيدة والفقه.' },
                image: '',
                visible: true,
                order: 1
            }
        ];
    }
};

export default ServicesCMS;
