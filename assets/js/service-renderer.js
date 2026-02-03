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
            case 'minimal': return this.templateMinimal(service, content, dir, fontFamily);
            case 'gallery': return this.templateGallery(service, content, dir, fontFamily);
            case 'glass': return this.templateGlass(service, content, dir, fontFamily);
            case '3d': return this.template3D(service, content, dir, fontFamily);
            case 'poster': return this.templatePoster(service, content, dir, fontFamily);
            case 'video': return this.templateVideo(service, content, dir, fontFamily);
            case 'calligraphy': return this.templateCalligraphy(service, content, dir, fontFamily);
            case 'typography': return this.templateTypography(service, content, dir, fontFamily);
            default: return this.templateCorporate(service, content, dir, fontFamily);
        }
    },

    // --- TEMPLATE 1: CORPORATE (Clean, Structured) ---
    templateCorporate(service, content, dir, font) {
        return `
            <div class="svc-layout corporate" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-hero" style="background-image: url('${service.image || ''}');">
                    <div class="svc-overlay"></div>
                    <div class="svc-container">
                        <div class="svc-badge animate-fade-up"><i class="${service.icon}"></i></div>
                        <h1 class="animate-fade-up delay-1">${content.title}</h1>
                        <p class="svc-subtitle animate-fade-up delay-2">${content.shortDesc}</p>
                    </div>
                </div>
                <div class="svc-container svc-body">
                    <div class="svc-main-text animate-fade-up delay-3">
                        <h2>Overview</h2>
                        <p>${content.fullDesc}</p>
                    </div>
                    <div class="svc-features-grid animate-fade-up delay-4">
                        ${content.features.map(f => `
                            <div class="svc-feature-card">
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
            <div class="svc-layout creative" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container">
                    <div class="creative-flex">
                        <div class="creative-text animate-slide-right">
                            <h1 class="gradient-text">${content.title}</h1>
                            <div class="creative-highlight">
                                <i class="${service.icon}"></i>
                                <p>${content.shortDesc}</p>
                            </div>
                            <p class="body-p">${content.fullDesc}</p>
                            <div class="creative-tags">
                                ${content.features.map(f => `<span class="tag">${f}</span>`).join('')}
                            </div>
                        </div>
                        <div class="creative-visual animate-slide-left">
                            <div class="blob"></div>
                            <img src="${service.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}" class="svc-img">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 3: MINIMAL (Text Focused, Elegant) ---
    templateMinimal(service, content, dir, font) {
        return `
            <div class="svc-layout minimal" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container narrow">
                    <div class="minimal-icon animate-fade-up"><i class="${service.icon}"></i></div>
                    <h1 class="animate-fade-up delay-1">${content.title}</h1>
                    <div class="svc-divider animate-fade-up delay-2"></div>
                    <p class="svc-intro animate-fade-up delay-3">${content.shortDesc}</p>
                    <img src="${service.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}" class="svc-img minimal-img animate-fade-up delay-4">
                    <div class="svc-content-body animate-fade-up delay-5">
                        ${content.fullDesc}
                        <ul class="minimal-list">
                            ${content.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 4: GALLERY (Visual Focus) ---
    templateGallery(service, content, dir, font) {
        return `
            <div class="svc-layout gallery" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container">
                    <div class="gallery-header animate-fade-up">
                         <h1>${content.title}</h1>
                         <p>${content.shortDesc}</p>
                    </div>
                    <div class="gallery-grid">
                        <div class="gallery-main animate-fade-up delay-1">
                            <img src="${service.image || 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800'}" alt="main">
                        </div>
                        <div class="gallery-side animate-fade-up delay-2">
                             <div class="side-card">
                                 <i class="${service.icon}"></i>
                                 <p>${content.fullDesc}</p>
                             </div>
                             <div class="gallery-tags">
                                 ${content.features.map(f => `<div class="tag-item">${f}</div>`).join('')}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 5: GLASSMORPHISM ---
    templateGlass(service, content, dir, font) {
        return `
            <div class="svc-layout glass" style="font-family: ${font}; direction: ${dir};">
                <div class="bg-blur"></div>
                <div class="svc-container">
                    <div class="glass-card animate-fade-up">
                        <div class="glass-flex">
                            <div class="glass-icon"><i class="${service.icon}"></i></div>
                            <div class="glass-title">
                                <h1>${content.title}</h1>
                                <p>${content.shortDesc}</p>
                            </div>
                        </div>
                        <div class="glass-content">
                            <p>${content.fullDesc}</p>
                            <div class="glass-features">
                                ${content.features.map(f => `<div class="g-feature"><span>${f}</span></div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 6: 3D / FUTURISTIC ---
    template3D(service, content, dir, font) {
        return `
            <div class="svc-layout futuristic" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container">
                    <div class="futuristic-grid">
                        <div class="f-col-1">
                            <div class="perspective-box animate-float">
                                <i class="${service.icon}"></i>
                            </div>
                        </div>
                        <div class="f-col-2">
                            <h1 class="glow-text animate-fade-up">${content.title}</h1>
                            <p class="f-desc animate-fade-up delay-1">${content.shortDesc}</p>
                            <div class="f-stats">
                                ${content.features.map(f => `
                                    <div class="stat-box animate-fade-up delay-2">
                                        <div class="bar"></div>
                                        <span>${f}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <p class="f-full animate-fade-up delay-3">${content.fullDesc}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 7: POSTER STYLE ---
    templatePoster(service, content, dir, font) {
        return `
            <div class="svc-layout poster-style" style="font-family: ${font}; direction: ${dir};">
                <div class="poster-container animate-fade-up">
                    <div class="poster-inner">
                        <div class="poster-bg" style="background-image: url('${service.image || ''}')"></div>
                        <div class="poster-content">
                            <div class="poster-header">
                                <div class="poster-icon"><i class="${service.icon}"></i></div>
                                <h1>${content.title}</h1>
                            </div>
                            <p class="poster-desc">${content.fullDesc}</p>
                            <div class="poster-points">
                                ${content.features.map(f => `<span class="point">• ${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 8: VIDEO HERO ---
    templateVideo(service, content, dir, font) {
        return `
            <div class="svc-layout video-focused" style="font-family: ${font}; direction: ${dir};">
                <div class="video-container">
                    ${service.video ?
                `<video src="${service.video}" autoplay muted loop playsinline class="bg-video"></video>` :
                `<div class="video-placeholder">No video available</div>`
            }
                    <div class="video-overlay"></div>
                    <div class="svc-container video-content">
                        <h1 class="animate-fade-up">${content.title}</h1>
                        <p class="animate-fade-up delay-1">${content.shortDesc}</p>
                        <div class="video-features animate-fade-up delay-2">
                            ${content.features.map(f => `<span class="v-tag">${f}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="svc-container v-body animate-fade-up delay-3">
                    <p>${content.fullDesc}</p>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 9: ARABIC CALLIGRAPHY FOCUS ---
    templateCalligraphy(service, content, dir, font) {
        return `
            <div class="svc-layout calligraphy" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container">
                    <div class="calligraphy-box animate-fade-up">
                        <div class="ornament ornament-top"></div>
                        <h1 class="arabic-title">${content.title}</h1>
                        <div class="calligraphy-icon"><i class="${service.icon}"></i></div>
                        <p class="cal-desc">${content.shortDesc}</p>
                        <div class="svc-divider"></div>
                        <p class="cal-full">${content.fullDesc}</p>
                        <div class="ornament ornament-bottom"></div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- TEMPLATE 10: MALAYALAM TYPOGRAPHY FOCUS ---
    templateTypography(service, content, dir, font) {
        return `
            <div class="svc-layout typography" style="font-family: ${font}; direction: ${dir};">
                <div class="svc-container">
                    <div class="typo-grid">
                        <div class="typo-text">
                            <h1 class="big-typo animate-slide-right">${content.title}</h1>
                            <p class="typo-desc animate-slide-right delay-1">${content.shortDesc}</p>
                        </div>
                        <div class="typo-details animate-fade-up delay-2">
                            <div class="typo-icon"><i class="${service.icon}"></i></div>
                            <p>${content.fullDesc}</p>
                            <div class="typo-list">
                                ${content.features.map(f => `<div class="typo-item">${f}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// CSS Injection for Templates
const svcStyles = `
    .svc-layout { min-height: 80vh; color: #fff; overflow-x: hidden; }
    .svc-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; position: relative; }
    .svc-container.narrow { max-width: 800px; }
    .animate-fade-up { animation: svc-fade-up 0.8s ease-out forwards; opacity: 0; }
    .animate-slide-right { animation: svc-slide-right 0.8s ease-out forwards; opacity: 0; }
    .animate-slide-left { animation: svc-slide-left 0.8s ease-out forwards; opacity: 0; }
    .animate-float { animation: svc-float 4s ease-in-out infinite; }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    .delay-3 { animation-delay: 0.6s; }
    .delay-4 { animation-delay: 0.8s; }
    .delay-5 { animation-delay: 1.0s; }

    /* Corporate */
    .corporate .svc-hero { padding: 180px 0 120px; background-size: cover; background-position: center; position: relative; text-align: center; }
    .corporate .svc-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); }
    .corporate .svc-badge { font-size: 4rem; color: var(--primary-color); margin-bottom: 20px; }
    .corporate .svc-hero h1 { font-size: 3.5rem; margin-bottom: 15px; }
    .corporate .svc-subtitle { font-size: 1.3rem; color: #ccc; max-width: 700px; margin: 0 auto; }
    .corporate .svc-body { padding: 80px 0; }
    .corporate .svc-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 50px; }
    .corporate .svc-feature-card { background: rgba(255,255,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 15px; }
    .corporate .svc-feature-card i { font-size: 1.5rem; color: var(--secondary-color); }

    /* Creative */
    .creative { padding: 120px 0; }
    .creative-flex { display: flex; align-items: center; gap: 60px; }
    .creative-text { flex: 1; }
    .creative-visual { flex: 1; position: relative; }
    .creative .gradient-text { font-size: 4rem; font-weight: 800; background: linear-gradient(45deg, #00f3ff, #bc13fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .creative-highlight { background: rgba(255,255,255,0.03); border-left: 5px solid #00f3ff; padding: 25px; margin: 30px 0; border-radius: 0 20px 20px 0; display: flex; align-items: center; gap: 20px; }
    .creative-highlight i { font-size: 3rem; color: #00f3ff; }
    .creative .tag { display: inline-block; padding: 8px 18px; background: rgba(188, 19, 254, 0.2); border: 1px solid rgba(188, 19, 254, 0.4); border-radius: 50px; font-size: 0.9rem; margin: 5px; }
    .creative .svc-img { border-radius: 40px; transform: rotate(3deg); box-shadow: 20px 20px 60px rgba(0,0,0,0.5); width: 100%; position: relative; z-index: 2; }
    .creative .blob { position: absolute; width:120%; height:120%; top:-10%; left:-10%; background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%); border-radius: 50%; }

    /* Minimal */
    .minimal { padding: 150px 0; text-align: center; }
    .minimal-icon { font-size: 5rem; margin-bottom: 30px; letter-spacing: -2px; }
    .svc-divider { width: 60px; height: 3px; background: var(--primary-color); margin: 40px auto; }
    .minimal .svc-intro { font-size: 1.5rem; color: #ddd; font-weight: 300; line-height: 1.6; margin-bottom: 60px; }
    .minimal-img { border-radius: 20px; margin-bottom: 60px; max-height: 500px; object-fit: cover; }
    .svc-content-body { text-align: left; font-size: 1.15rem; line-height: 2; color: #aaa; }
    .minimal-list { margin-top: 40px; list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .minimal-list li { position: relative; padding-left: 25px; }
    .minimal-list li::before { content: '→'; position: absolute; left: 0; color: var(--primary-color); }

    /* Glass */
    .glass { padding: 150px 0; position: relative; background: #050505; }
    .glass .bg-blur { position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle at 10% 20%, #1a1a1a 0%, #000 100%); }
    .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.08); padding: 60px; border-radius: 40px; }
    .glass-flex { display: flex; align-items: center; gap: 40px; margin-bottom: 50px; }
    .glass-icon { width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 25px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; color: #fff; }
    .glass-features { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 40px; }
    .g-feature { padding: 12px 25px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; }

    /* Futuristic */
    .futuristic { padding: 150px 0; }
    .futuristic-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 80px; align-items: center; }
    .perspective-box { width: 300px; height: 300px; background: linear-gradient(135deg, #111 0%, #222 100%); border: 2px solid #00f3ff; border-radius: 50px; transform: rotateY(30deg) rotateX(10deg); display: flex; align-items: center; justify-content: center; font-size: 8rem; color: #00f3ff; box-shadow: 0 0 50px rgba(0, 243, 255, 0.3); }
    .glow-text { font-size: 4.5rem; text-transform: uppercase; letter-spacing: 5px; text-shadow: 0 0 20px rgba(255,255,255,0.5); }
    .f-stats { margin: 40px 0; }
    .stat-box { margin-bottom: 20px; }
    .stat-box .bar { width: 100%; height: 4px; background: rgba(255,255,255,0.1); position: relative; margin-top: 8px; }
    .stat-box .bar::after { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 70%; background: #00f3ff; box-shadow: 0 0 10px #00f3ff; }

    /* Video Hero */
    .video-container { position: relative; height: 80vh; overflow: hidden; display: flex; align-items: center; padding-top: 100px; }
    .bg-video { position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; z-index: 1; }
    .video-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(0deg, #000 0%, transparent 60%, rgba(0,0,0,0.4) 100%); z-index: 2; }
    .video-content { position: relative; z-index: 3; }
    .v-body { padding: 60px 0; font-size: 1.3rem; line-height: 1.8; color: #bbb; }

    /* Calligraphy */
    .calligraphy { padding: 100px 0; background: #0a0a0a; }
    .calligraphy-box { background: #111; border: 1px solid #c9a55c; padding: 80px 40px; border-radius: 4px; text-align: center; position: relative; max-width: 900px; margin: 0 auto; }
    .arabic-title { font-size: 4rem; color: #c9a55c; margin-bottom: 30px; font-weight: 400; }
    .ornament { width: 200px; height: 50px; margin: 0 auto; background-size: contain; background-repeat: no-repeat; opacity: 0.6; }
    .ornament-top { border-top: 2px solid #c9a55c; margin-bottom: 40px; }
    .ornament-bottom { border-bottom: 2px solid #c9a55c; margin-top: 40px; }
    .calligraphy-icon { font-size: 4rem; color: #c9a55c; opacity: 0.3; margin: 30px 0; }

    /* Typography */
    .typography { padding: 120px 0; }
    .typo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .big-typo { font-size: 6rem; line-height: 1; margin-bottom: 30px; font-weight: 1000; letter-spacing: -5px; }
    .typo-icon { font-size: 5rem; margin-bottom: 40px; color: var(--secondary-color); }
    .typo-desc { font-size: 1.8rem; color: #888; border-left: 4px solid #fff; padding-left: 30px; }

    @keyframes svc-fade-up {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes svc-slide-right {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes svc-slide-left {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes svc-float {
        0%, 100% { transform: translateY(0) rotateY(30deg); }
        50% { transform: translateY(-20px) rotateY(35deg); }
    }

    @media (max-width: 768px) {
        .creative-flex, .futuristic-grid, .typo-grid { flex-direction: column; grid-template-columns: 1fr; }
        .svc-container h1 { font-size: 2.5rem !important; }
        .glass-flex { flex-direction: column; text-align: center; }
        .perspective-box { width: 200px; height: 200px; font-size: 5rem; }
    }
`;

const styleEl = document.createElement('style');
styleEl.textContent = svcStyles;
document.head.appendChild(styleEl);

