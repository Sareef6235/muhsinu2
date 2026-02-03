/**
 * Media Optimizer Module
 * strictly enforces client-side file limits:
 * - Images: Max 100KB (Auto-compress via Canvas)
 * - Videos: Max 5MB (Reject if larger)
 */

export const MediaOptimizer = {

    // Config
    MAX_IMAGE_SIZE_KB: 100,
    MAX_VIDEO_SIZE_MB: 5,

    /**
     * Process an image file.
     * Returns a Promise resolving to a Data URL (Base64) under 100KB.
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject("Invalid image file.");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Start compression
                    resolve(this.compressImageToLimit(img, file.type));
                };
                img.onerror = () => reject("Failed to load image.");
            };
            reader.onerror = () => reject("File reading error.");
        });
    },

    /**
     * Recursive compression to ensure < 100KB
     */
    compressImageToLimit(img, type) {
        const MAX_WIDTH = 1200; // Reasonable web max
        const MAX_HEIGHT = 1200;
        let quality = 0.9;

        // Initial Canvas Setup
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if too huge
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            } else {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress loop
        let dataUrl = canvas.toDataURL(type, quality);
        let sizeKB = dataUrl.length / 1024; // Approx

        // Binary search approch is too complex for this snippet, linear reduction is safer
        while (sizeKB > this.MAX_IMAGE_SIZE_KB && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality); // Force JPEG if PNG is huge
            sizeKB = dataUrl.length / 1024;
        }

        if (sizeKB > this.MAX_IMAGE_SIZE_KB) {
            // Even at 0.1 quality it's too big? Resize drastically.
            console.warn("Image still too big, forcing resize.");
            canvas.width = width * 0.7;
            canvas.height = height * 0.7;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        }

        console.log(`Image Compressed: ${sizeKB.toFixed(2)} KB (Quality: ${quality.toFixed(1)})`);
        return dataUrl;
    },

    /**
     * Validate Video File.
     * Rejects if > 5MB. Returns object with { src, warning }.
     */
    async processVideo(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('video/')) {
                reject("Invalid video file.");
                return;
            }

            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > this.MAX_VIDEO_SIZE_MB) {
                reject(`Video too large (${sizeMB.toFixed(1)}MB). Limit is 5MB.`);
                return;
            }

            // For small videos (<5MB), we can try to Read as DataURL for persistence
            // BUT Base64 adds 33% overhead. 5MB file -> 6.6MB string.
            // LocalStorage limit is usually 5-10MB TOTAL. 
            // So practically, we can only safely store videos < 2MB in localStorage.

            const SAFE_PERSIST_LIMIT_MB = 2.0;

            if (sizeMB <= SAFE_PERSIST_LIMIT_MB) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    resolve({
                        src: e.target.result,
                        type: 'base64',
                        warning: null
                    });
                };
            } else {
                // Between 2MB - 5MB: Use Blob URL (Session Only)
                // We cannot save this to localStorage safely.
                const url = URL.createObjectURL(file);
                resolve({
                    src: url,
                    type: 'blob',
                    warning: "Video saved for Session Only (Too large for permanent storage)."
                });
            }
        });
    }
};

// Global export for HTML usage if module not supported
window.MediaOptimizer = MediaOptimizer;
