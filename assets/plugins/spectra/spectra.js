/**
 * SPECTRA PLUGIN
 * Premium UI blocks and components
 */

window.Spectra = {
    version: '1.0.0',

    init() {
        console.log('💎 Spectra Blocks initialized');
        this.enhanceBlocks();
    },

    enhanceBlocks() {
        // Add animations to spectra blocks
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        });

        document.querySelectorAll('.spectra-block').forEach(block => {
            observer.observe(block);
        });
    }
};

export default window.Spectra;
