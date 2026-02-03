/**
 * Services CMS (Local Version)
 * Manages service data using the local Storage engine.
 */

import { Storage } from './core/storage.js';

const COLLECTION = 'services';

export const ServicesCMS = {

    /**
     * Get all services
     */
    async getAll() {
        // Migration check: If empty, load default data
        const list = Storage.getAll(COLLECTION);
        if (list.length === 0) {
            console.log("Local CMS empty, loading defaults...");
            try {
                const res = await fetch('../assets/data/services.json');
                const defaults = await res.json();
                defaults.forEach(item => Storage.save(COLLECTION, item));
                return defaults;
            } catch (e) {
                console.error("Failed to load default services:", e);
                return [];
            }
        }
        return list;
    },

    /**
     * Get single service by ID
     */
    async getById(id) {
        return Storage.getById(COLLECTION, id);
    },

    /**
     * Add new service
     */
    async add(service) {
        if (!service.id) service.id = 'srv_' + Date.now();
        Storage.save(COLLECTION, service);
        return service;
    },

    /**
     * Update existing service
     */
    async update(id, data) {
        const existing = Storage.getById(COLLECTION, id);
        if (existing) {
            const updated = { ...existing, ...data };
            Storage.save(COLLECTION, updated);
            return updated;
        }
        return null;
    },

    /**
     * Delete service
     */
    async delete(id) {
        Storage.delete(COLLECTION, id);
    },

    /**
     * Save (Upsert wrapper for convenience)
     */
    async save(data) {
        if (!data.id) data.id = 'srv_' + Date.now();
        Storage.save(COLLECTION, data);
    },

    /**
     * Get Template Options (Static)
     */
    getTemplates() {
        return [
            { id: 'corporate', name: 'Corporate Standard', icon: 'ph-buildings' },
            { id: 'creative', name: 'Creative Neon', icon: 'ph-paint-brush' },
            { id: 'minimal', name: 'Minimal Modern', icon: 'ph-text-aa' },
            { id: 'gallery', name: 'Gallery Showcase', icon: 'ph-image' },
            { id: 'glass', name: 'Glassmorphism', icon: 'ph-rows' },
            { id: '3d', name: '3D Futuristic', icon: 'ph-cube' },
            { id: 'poster', name: 'Poster Style', icon: 'ph-layout' },
            { id: 'video', name: 'Video Hero', icon: 'ph-video-camera' },
            { id: 'calligraphy', name: 'Arabic Calligraphy', icon: 'ph-pen-nib' },
            { id: 'typography', name: 'Malayalam Typography', icon: 'ph-text-t' }
        ];
    }
};

// Global Exposure for Admin Panel usage
window.ServicesCMS = ServicesCMS;
