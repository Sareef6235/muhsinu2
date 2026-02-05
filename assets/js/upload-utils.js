/**
 * upload-utils.js
 * Professional Media Upload & Compression Utility
 * Optimized for local-first storage limits (100KB Image / 5MB Video)
 */

export const UploadUtils = {
    CONFIG: {
        IMAGE_MAX_SIZE: 100 * 1024, // 100KB
        VIDEO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
        IMAGE_TARGET_WIDTH: 1000
    },

    /**
     * Processes an image file: Validates, Compresses, and returns Base64 + Specs
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                return reject(new Error('Invalid file type. Please upload an image.'));
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Scale down if too large
                    if (width > this.CONFIG.IMAGE_TARGET_WIDTH) {
                        height *= this.CONFIG.IMAGE_TARGET_WIDTH / width;
                        width = this.CONFIG.IMAGE_TARGET_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Iterative compression
                    let quality = 0.85;
                    let base64 = canvas.toDataURL('image/jpeg', quality);

                    // Multi-pass compression to hit target size
                    while (base64.length > this.CONFIG.IMAGE_MAX_SIZE && quality > 0.1) {
                        quality -= 0.1;
                        base64 = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve({
                        data: base64,
                        name: file.name,
                        type: 'image/jpeg',
                        size: base64.length,
                        originalSize: file.size,
                        isCompressed: base64.length < file.size
                    });
                };
            };
            reader.onerror = () => reject(new Error('File reading failed.'));
        });
    },

    /**
     * Validates video file size
     */
    async validateVideo(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('video/')) {
                return reject(new Error('Invalid file type. Please upload a video.'));
            }

            if (file.size > this.CONFIG.VIDEO_MAX_SIZE) {
                return reject(new Error(`Video too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Max limit is 5MB.`));
            }

            // Return blob or dataUrl depending on needs
            resolve({
                file: file,
                name: file.name,
                size: file.size,
                type: file.type
            });
        });
    },

    /**
     * Utility to create a preview URL for images or videos
     */
    getPreview(fileOrData) {
        if (typeof fileOrData === 'string') return fileOrData;
        return URL.createObjectURL(fileOrData);
    },

    /**
     * Formats bytes into human-readable string
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

export default UploadUtils;
