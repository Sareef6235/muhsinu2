/**
 * IVORY SEARCH PLUGIN
 * Advanced site search with autocomplete
 */

window.IvorySearch = {
    version: '1.0.0',

    init() {
        console.log('🔍 Ivory Search initialized');
        this.enhanceSearchInputs();
    },

    enhanceSearchInputs() {
        document.querySelectorAll('input[type="search"]').forEach(input => {
            input.addEventListener('input', (e) => {
                console.log('Searching for:', e.target.value);
                // Mock autocomplete logic
            });
        });
    }
};

export default window.IvorySearch;
