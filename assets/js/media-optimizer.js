/**
 * Media Optimizer & Validator
 * Handles client-side compression and validation for the Services System.
 */
export const MediaOptimizer = {
    /**
     * Compress an image file to WebP < 100KB
     * @param {File} file - The input image file
     * @returns {Promise<string>} - Base64 data URL of the compressed image
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject('Invalid file type. Please upload an image.');
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions (HD is usually enough for web)
                    const MAX_WIDTH = 1280;
                    const MAX_HEIGHT = 1280;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Aggressive compression logic
                    let quality = 0.8;
                    let dataUrl = canvas.toDataURL('image/webp', quality);

                    // Loop to ensure < 100KB
                    while (dataUrl.length > 100 * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/webp', quality);
                    }

                    resolve(dataUrl);
                };
                img.onerror = (err) => reject('Failed to load image for processing.');
            };
            reader.onerror = (err) => reject('Failed to read file.');
        });
    },

    /**
     * Validate Video File
     * @param {File} file 
     * @returns {Promise<boolean>}
     */
    async validateVideo(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('video/')) {
                reject('Invalid file type. Please upload a video.');
                return;
            }

            // Client-side limit: 5MB
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                reject(`Video is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed is 5MB.`);
                return;
            }

            // Ideal formatted check (optional, but good for UX)
            if (file.type !== 'video/webm' && file.type !== 'video/mp4') {
                // Not rejecting strictly, but warning could be added here
                console.warn('Preferred format is WebM or MP4.');
            }

            resolve(true);
        });
    }
};
