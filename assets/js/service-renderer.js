/**
 * Service Renderer Engine
 * Generates dynamic HTML layouts (Templates) for the Service Detail Page.
 */
export const ServiceRenderer = {

    /**
     * Render the full service detail page content
     * @param {Object} service - The service data object
     * @param {String} lang - Current language ('en', 'ar', 'ml')
     * @returns {String} HTML string
     */
    render(service, lang = 'en') {
        const content = service.content[lang] || service.content['en'];
        const isRTL = lang === 'ar';
        const dir = isRTL ? 'rtl' : 'ltr';
        const fontFamily = lang === 'ar' ? "'Cairo', sans-serif" : lang === 'ml' ? "'Manjari', sans-serif" : "'Outfit', sans-serif";

        // Template Dispatcher
        switch (service.templateId) {
            case 'corporate': return this.templateCorporate(service, content, dir, fontFamily);
            case 'creative': return this.templateCreative(service, content, dir, fontFamily);
            case 'gallery': return this.templateGallery(service, content, dir, fontFamily);
            case 'minimal': return this.templateMinimal(service, content, dir, fontFamily);
            // ... Add more templates as needed, defaulting to Corporate
            default: return this.templateCorporate(service, content, dir, fontFamily);
        }
    },

    // --- TEMPLATE 1: CORPORATE (Clean, Structured) ---
    templateCorporate(service, content, dir, font) {
        return `
            <div class="service-layout corporate" style="font-family: ${font}; direction: ${dir};">
                <header class="svc-header" style="background-image: url('${service.image || ''}');">
                    <div class="overlay"></div>
                    <div class="container animate-fade-up">
                        <div class="icon-badge"><i class="${service.icon}"></i></div>
                        <h1>${content.title}</h1>
                        <p class="subtitle">${content.shortDesc}</p>
                    </div>
                </header>
                <div class="container svc-body">
                    <div class="main-text animate-fade-up delay-1">
                        <h2>Overview</h2>
                        <p>${content.fullDesc}</p>
                    </div>
                    <div class="features-grid animate-fade-up delay-2">
                        ${content.features.map(f => `
                            <div class="feature-card">
                                <i class="ph-fill ph-check-circle"></i>
                                <span>${f}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 2: CREATIVE (Neon, Asymmetric) ---
    templateCreative(service, content, dir, font) {
        return `
            <div class="service-layout creative" style="font-family: ${font}; direction: ${dir};">
                <div class="container">
                    <div class="creative-grid">
                        <div class="text-col animate-slide-right">
                            <h1 class="gradient-text">${content.title}</h1>
                            <div class="highlight-box">
                                <i class="${service.icon}"></i>
                                <p>${content.shortDesc}</p>
                            </div>
                            <p class="body-text">${content.fullDesc}</p>
                            <ul class="neon-list">
                                ${content.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="visual-col animate-slide-left">
                            <div class="blob-bg"></div>
                            <img src="${service.image || 'assets/placeholder.jpg'}" class="floating-img">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 3: MINIMAL (Text Focused, Elegant) ---
    templateMinimal(service, content, dir, font) {
        return `
            <div class="service-layout minimal" style="font-family: ${font}; direction: ${dir};">
                <div class="container narrow">
                    <div class="minimal-icon"><i class="${service.icon}"></i></div>
                    <h1>${content.title}</h1>
                    <div class="divider"></div>
                    <p class="intro">${content.shortDesc}</p>
                    <img src="${service.image}" class="minimal-hero-img">
                    <div class="content-body">
                        ${content.fullDesc.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
    }

    // Additional templates can be added similarly
};

// CSS Injection for Templates (Dynamic Styles)
const css = `
    /* Common Layout Styles */
    .service-layout { min-height: 80vh; padding-bottom: 50px; }
    .svc-header { position: relative; padding: 150px 0 100px; background-size: cover; background-position: center; color: white; text-align: center; }
    .svc-header .overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); }
    .svc-header .container { position: relative; z-index: 2; }
    .icon-badge { font-size: 3rem; color: var(--primary-color); margin-bottom: 20px; }
    .svc-body { padding: 60px 0; }
    
    /* Corporate */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
    .feature-card { background: var(--glass-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--glass-border); display: flex; align-items: center; gap: 10px; }
    
    /* Creative */
    .creative-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; padding-top: 100px; }
    .gradient-text { background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3.5rem; }
    .highlight-box { background: rgba(255,255,255,0.05); padding: 30px; border-left: 4px solid var(--primary-color); margin: 30px 0; border-radius: 0 20px 20px 0; }
    .floating-img { border-radius: 30px; transform: rotate(-5deg); box-shadow: 0 20px 50px rgba(0,0,0,0.5); width: 100%; z-index: 2; position: relative; }

    /* Minimal */
    .narrow { max-width: 800px; margin: 0 auto; padding-top: 100px; text-align: center; }
    .minimal-icon { font-size: 4rem; color: #fff; margin-bottom: 20px; }
    .divider { width: 50px; height: 3px; background: var(--primary-color); margin: 30px auto; }
    .minimal-hero-img { width: 100%; border-radius: 4px; margin: 40px 0; filter: grayscale(20%); transition: 0.5s; }
    .minimal-hero-img:hover { filter: grayscale(0%); }
    .content-body { text-align: left; font-size: 1.2rem; line-height: 1.8; color: #ccc; }

    /* Responsive */
    @media (max-width: 768px) {
        .creative-grid { grid-template-columns: 1fr; }
        .gradient-text { font-size: 2.5rem; }
    }
`;

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
