/**
 * Admin Media Handler
 * Provides safe browser-side image/video handling, optimization, and preview.
 */

import { MediaOptimizer } from './media-optimizer.js';

export const AdminMedia = {
    /**
     * Handle Image Upload with Preview and Compression
     * @param {File} file 
     * @param {HTMLElement} previewContainer 
     * @returns {Promise<string>} Base64 optimized image
     */
    async handleImageUpload(file, previewContainer) {
        if (!file.type.startsWith('image/')) {
            throw new Error("Invalid file type. Please upload an image.");
        }

        // Show immediate preview (unoptimized)
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewContainer) {
                previewContainer.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 10px; margin-top: 10px;">`;
            }
        };
        reader.readAsDataURL(file);

        // Optimize and return
        try {
            const optimized = await MediaOptimizer.compressImage(file, {
                maxWidth: 1200,
                quality: 0.8,
                type: 'image/webp'
            });
            return optimized;
        } catch (e) {
            console.error("Optimization failed, using original:", e);
            return new Promise((resolve) => {
                const r = new FileReader();
                r.onload = (ev) => resolve(ev.target.result);
                r.readAsDataURL(file);
            });
        }
    },

    /**
     * Handle Video Upload with Preview and Size Validation
     * @param {File} file 
     * @param {HTMLElement} previewContainer 
     * @returns {Promise<File>} The validated file
     */
    async handleVideoUpload(file, previewContainer) {
        if (!file.type.startsWith('video/')) {
            throw new Error("Invalid file type. Please upload a video.");
        }

        // Check size (e.g., max 20MB for client-side storage/handling)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error("Video too large. Please use a file under 5MB.");
        }

        // Show local preview
        if (previewContainer) {
            const url = URL.createObjectURL(file);
            previewContainer.innerHTML = `
                <video controls style="max-width: 100%; border-radius: 10px; margin-top: 10px;">
                    <source src="${url}" type="${file.type}">
                    Your browser does not support the video tag.
                </video>
            `;
        }

        return file;
    }
};
