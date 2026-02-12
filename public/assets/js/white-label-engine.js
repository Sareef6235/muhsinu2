/**
 * white-label-engine.js
 * Handles the application of white-label branding based on tenant settings.
 */
window.WhiteLabelEngine = {
    init(config) {
        if (!config || !config.enabled) return;

        console.log('[WhiteLabel] Applying Branding:', config.name);

        // 1. Update Title
        document.title = `${config.name} | Control Center`;

        // 2. Update Logos
        const logos = document.querySelectorAll('.bg-primary.rounded-3.p-2 i');
        logos.forEach(logo => {
            logo.className = config.icon || 'bi bi-lightning-charge-fill';
        });

        const brandNames = document.querySelectorAll('h4.mb-0.fw-bold');
        brandNames.forEach(name => {
            name.textContent = config.name;
        });

        // 3. Inject Custom Colors
        if (config.colors) {
            const style = document.createElement('style');
            style.innerHTML = `
                :root {
                    --bs-primary: ${config.colors.primary || '#3b82f6'};
                    --bs-primary-rgb: ${this.hexToRgb(config.colors.primary || '#3b82f6')};
                }
                .nav-item.active { background: var(--bs-primary) !important; }
            `;
            document.head.appendChild(style);
        }
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '59, 130, 246';
    }
};
