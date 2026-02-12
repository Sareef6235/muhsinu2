/**
 * JETPACK PLUGIN
 * Performance and optimization tools
 */

window.Jetpack = {
    version: '1.0.0',

    init() {
        console.log('🚀 Jetpack initialized');
        this.enableLazyLoading();
    },

    enableLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });
        console.log(`Jetpack: Enabled lazy loading for ${images.length} images.`);
    }
};

export default window.Jetpack;
