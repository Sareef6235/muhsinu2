/**
 * Media Optimizer & Validator
 * Handles client-side compression for high performance.
 */
export const MediaOptimizer = {
    LIMITS: {
        IMAGE: 100 * 1024, // 100 KB
        VIDEO: 5 * 1024 * 1024 // 5 MB
    },

    /**
     * Compress an image file
     * @returns {Promise<{data: string, originalSize: number, newSize: number}>}
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) return reject('Invalid image file');

            const reader = new FileReader();
            const originalSize = file.size;
            reader.readAsDataURL(file);

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Step 1: Max width constraint
                    const MAX_WIDTH = 1000;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Step 2: Iterative quality reduction to reach < 100KB
                    let quality = 0.8;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);

                    while (dataUrl.length > this.LIMITS.IMAGE && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve({
                        data: dataUrl,
                        originalSize: originalSize,
                        newSize: dataUrl.length
                    });
                };
            };
            reader.onerror = reject;
        });
    },

    /**
     * Validate video size
     */
    validateVideo(file) {
        if (!file.type.startsWith('video/')) return { valid: false, error: 'Invalid video file' };

        const isValid = file.size <= this.LIMITS.VIDEO;
        return {
            valid: isValid,
            size: file.size,
            error: isValid ? null : `Video exceeds 5MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        };
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
