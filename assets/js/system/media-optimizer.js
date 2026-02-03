/**
 * Media Optimizer
 * Critical requirement: Images < 100KB, Videos < 5MB
 * Client-side compression using Canvas and File APIs
 */

export const MediaOptimizer = {
    MAX_IMG_SIZE: 100 * 1024, // 100KB
    MAX_VIDEO_SIZE: 5 * 1024 * 1024, // 5MB

    // Compress Image
    async processImage(file) {
        if (file.size <= this.MAX_IMG_SIZE) {
            return { file, url: await this.readFileAsDataURL(file), compressed: false };
        }

        console.log(`Compressing image: ${(file.size / 1024).toFixed(2)}KB`);

        try {
            const dataUrl = await this.readFileAsDataURL(file);
            const image = await this.loadImage(dataUrl);

            // Start with quality 0.7
            let quality = 0.7;
            let compressedDataUrl = this.compressCanvas(image, quality);

            // Binary search-ish approach to find best quality under limit
            // Simplified: Reduce quality until fits or hits min quality of 0.1
            while (this.byteCount(compressedDataUrl) > this.MAX_IMG_SIZE && quality > 0.1) {
                quality -= 0.1;
                compressedDataUrl = this.compressCanvas(image, quality);
            }

            return {
                file: base64ToFile(compressedDataUrl, file.name),
                url: compressedDataUrl,
                compressed: true
            };

        } catch (e) {
            console.error("Image compression failed", e);
            throw new Error("Could not compress image.");
        }
    },

    // Check Video (Cannot compress comfortably client-side easily without ffmpeg.wasm which is heavy)
    // We will strictly enforce limit and maybe trim/reject.
    processVideo(file) {
        return new Promise((resolve, reject) => {
            if (file.size > this.MAX_VIDEO_SIZE) {
                // For now, strict rejection as requested "Restrict logic"
                // Future: ffmpeg.wasm integration if needed, but 'heavy' ruled out.
                reject(`Video is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed is 5MB.`);
            } else {
                resolve(file);
            }
        });
    },

    // Helpers
    readFileAsDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    },

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    compressCanvas(image, quality) {
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;

        // Resize if massive (max 1920px width)
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        // Return jpeg (better compression than png)
        return canvas.toDataURL('image/jpeg', quality);
    },

    byteCount(s) {
        return encodeURI(s).split(/%..|./).length - 1;
    }
};

// Helper: Convert Base64 back to file object for storage/form
function base64ToFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
