/**
 * Poster Templates Library
 * This file contains the base layouts and themes used to dynamically
 * generate 100+ professional templates for the Poster Builder.
 */

const BaseLayouts = [
    {
        id: 'classic',
        name: 'Classic Stack',
        html: `
            <div class="poster-template layout-classic" data-template="ID_PLACEHOLDER">
                <div class="section-header">
                    <h1 class="poster-title" data-editable="title">Your Title Here</h1>
                    <p class="poster-subtitle" data-editable="subtitle">Subtitle text</p>
                </div>
                <div class="poster-image" data-editable="image"></div>
                <div class="section-footer">
                    <p class="poster-date" data-editable="date">January 1, 2026</p>
                    <p class="poster-description" data-editable="description">Your description goes here. Add details about your event or announcement.</p>
                    <button class="poster-button" data-editable="button">Learn More</button>
                </div>
            </div>
        `,
        css: `
            .layout-classic { padding: 50px; text-align: center; display: flex; flex-direction: column; height: 100%; justify-content: space-between; position: relative; }
            .layout-classic .poster-title { font-size: 3rem; margin-bottom: 10px; font-weight: 800; }
            .layout-classic .poster-image { width: 100%; height: 280px; margin: 30px 0; border-radius: 15px; background-size: cover; background-position: center; }
            .layout-classic .poster-description { margin: 25px 0; font-size: 1.1rem; line-height: 1.6; }
        `
    },
    {
        id: 'hero',
        name: 'Hero Impact',
        html: `
            <div class="poster-template layout-hero" data-template="ID_PLACEHOLDER">
                <div class="poster-image" data-editable="image">
                    <div class="overlay">
                        <h1 class="poster-title" data-editable="title">Your Title Here</h1>
                        <p class="poster-subtitle" data-editable="subtitle">Subtitle text</p>
                    </div>
                </div>
                <div class="section-content">
                    <p class="poster-date" data-editable="date">January 1, 2026</p>
                    <p class="poster-description" data-editable="description">Your description goes here. Add details about your event or announcement.</p>
                    <button class="poster-button" data-editable="button">Learn More</button>
                </div>
            </div>
        `,
        css: `
            .layout-hero { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
            .layout-hero .poster-image { height: 380px; position: relative; background-size: cover; background-position: center; border-radius: 0 0 30px 30px; }
            .layout-hero .overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); text-align: left; }
            .layout-hero .overlay .poster-title { font-size: 2.8rem; color: #fff; margin: 0; }
            .layout-hero .overlay .poster-subtitle { font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-top: 5px; }
            .layout-hero .section-content { padding: 40px; flex-grow: 1; text-align: left; }
        `
    },
    {
        id: 'split',
        name: 'Split Vision',
        html: `
            <div class="poster-template layout-split" data-template="ID_PLACEHOLDER">
                <div class="side-media">
                    <div class="poster-image" data-editable="image"></div>
                </div>
                <div class="side-content">
                    <p class="poster-date" data-editable="date">January 1, 2026</p>
                    <h1 class="poster-title" data-editable="title">Your Title Here</h1>
                    <p class="poster-subtitle" data-editable="subtitle">Subtitle text</p>
                    <p class="poster-description" data-editable="description">Your description goes here. Add details about your event or announcement.</p>
                    <button class="poster-button" data-editable="button">Learn More</button>
                </div>
            </div>
        `,
        css: `
            .layout-split { display: flex; height: 100%; overflow: hidden; }
            .layout-split .side-media { width: 45%; }
            .layout-split .side-content { width: 55%; padding: 50px; display: flex; flex-direction: column; justify-content: center; text-align: left; }
            .layout-split .poster-image { width: 100%; height: 100%; background-size: cover; background-position: center; }
            .layout-split .poster-title { font-size: 2.5rem; margin: 15px 0; }
        `
    },
    {
        id: 'elegant',
        name: 'Elegant Focus',
        html: `
            <div class="poster-template layout-elegant" data-template="ID_PLACEHOLDER">
                <div class="decorative-border">
                    <p class="poster-date" data-editable="date">January 1, 2026</p>
                    <h1 class="poster-title" data-editable="title">Your Title Here</h1>
                    <div class="poster-divider"></div>
                    <p class="poster-subtitle" data-editable="subtitle">Subtitle text</p>
                    <div class="poster-image" data-editable="image"></div>
                    <p class="poster-description" data-editable="description">Your description goes here.</p>
                    <button class="poster-button" data-editable="button">Learn More</button>
                </div>
            </div>
        `,
        css: `
            .layout-elegant { padding: 40px; height: 100%; }
            .layout-elegant .decorative-border { border: 2px solid; padding: 40px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .layout-elegant .poster-title { font-size: 2.8rem; font-weight: 300; letter-spacing: 2px; }
            .layout-elegant .poster-divider { width: 80px; height: 2px; margin: 20px auto; background: currentColor; }
            .layout-elegant .poster-image { width: 150px; height: 150px; border-radius: 50%; border: 4px solid; margin: 25px 0; background-size: cover; background-position: center; }
        `
    },
    {
        id: 'dynamic',
        name: 'Dynamic Grid',
        html: `
            <div class="poster-template layout-dynamic" data-template="ID_PLACEHOLDER">
                <div class="top-row">
                    <h1 class="poster-title" data-editable="title">Your Title Here</h1>
                    <p class="poster-date" data-editable="date">January 1, 2026</p>
                </div>
                <div class="middle-row">
                    <div class="poster-image" data-editable="image"></div>
                    <div class="text-block">
                        <p class="poster-subtitle" data-editable="subtitle">Subtitle text</p>
                        <p class="poster-description" data-editable="description">Your description goes here.</p>
                    </div>
                </div>
                <div class="bottom-row">
                    <button class="poster-button" data-editable="button">Learn More</button>
                </div>
            </div>
        `,
        css: `
            .layout-dynamic { padding: 50px; display: flex; flex-direction: column; height: 100%; gap: 30px; }
            .layout-dynamic .top-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid; padding-bottom: 15px; }
            .layout-dynamic .middle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex-grow: 1; align-items: center; }
            .layout-dynamic .poster-image { height: 250px; border-radius: 12px; background-size: cover; background-position: center; }
            .layout-dynamic .poster-title { font-size: 2.2rem; margin: 0; text-align: left; }
        `
    }
];

const BaseThemes = [
    { id: 'cyber', name: 'Cyberpunk', bg: '#000000', text: '#00f3ff', accent: '#ff00ff', font: 'Poppins', extra: 'text-transform: uppercase; text-shadow: 0 0 10px #00f3ff;' },
    { id: 'forest', name: 'Forest Deep', bg: '#1b4332', text: '#d8f3dc', accent: '#40916c', font: 'Inter', extra: 'border-radius: 4px;' },
    { id: 'royal', name: 'Royal Gold', bg: '#1a1a1a', text: '#d4af37', accent: '#d4af37', font: 'Playfair Display', extra: 'letter-spacing: 1px;' },
    { id: 'startup', name: 'Modern Startup', bg: '#ffffff', text: '#1e293b', accent: '#6366f1', font: 'Inter', extra: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);' },
    { id: 'sunset', name: 'Tropical Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff', accent: '#ffcc33', font: 'Montserrat', extra: 'font-weight: 700;' },
    { id: 'midnight', name: 'Midnight', bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8', font: 'Inter', extra: '' },
    { id: 'vintage', name: 'Vintage Paper', bg: '#f4ecd8', text: '#5d4037', accent: '#8d6e63', font: 'Georgia', extra: 'border: 1px solid #d7ccc8;' },
    { id: 'neon-purple', name: 'Neon Purple', bg: '#120428', text: '#e0b0ff', accent: '#bf00ff', font: 'Poppins', extra: 'text-shadow: 0 0 5px #bf00ff;' },
    { id: 'industrial', name: 'Industrial', bg: '#374151', text: '#f3f4f6', accent: '#fbbf24', font: 'Roboto', extra: 'text-transform: uppercase;' },
    { id: 'bubblegum', name: 'Bubblegum', bg: '#fdf2f8', text: '#db2777', accent: '#f472b6', font: 'Poppins', extra: '' }
];

const categories = ['minimal', 'bold', 'gradient', 'professional', 'creative', 'event'];

/**
 * Generates 100+ templates by combining layouts and themes with variations
 */
function generateTemplates() {
    const templates = [];
    let counter = 1;

    // Combine 10 Themes with 10 Variations of each layout (~100 templates)
    for (let t = 0; t < BaseThemes.length; t++) {
        for (let l = 0; l < BaseLayouts.length; l++) {
            // Variation 1: Default
            templates.push(createTemplate(counter++, BaseLayouts[l], BaseThemes[t]));

            // Variation 2: Inverted/Modified
            const invertedTheme = { ...BaseThemes[t], bg: BaseThemes[t].text, text: BaseThemes[t].bg, name: BaseThemes[t].name + ' Contrast' };
            templates.push(createTemplate(counter++, BaseLayouts[l], invertedTheme));
        }
    }
    return templates;
}

function createTemplate(idNum, layout, theme) {
    const id = `template-${idNum}`;
    const category = categories[idNum % categories.length];

    // Inject theme styles into layout CSS
    let themedCss = layout.css.replace(/\.layout-[a-z]+/g, `[data-template="${id}"]`);

    // Build final CSS
    const finalCss = `
        [data-template="${id}"] {
            background: ${theme.bg};
            color: ${theme.text};
            font-family: '${theme.font}', sans-serif;
            ${theme.extra}
        }
        [data-template="${id}"] .poster-title { color: ${theme.text}; }
        [data-template="${id}"] .poster-subtitle { color: ${theme.text}; opacity: 0.8; }
        [data-template="${id}"] .poster-description { color: ${theme.text}; opacity: 0.9; }
        [data-template="${id}"] .poster-date { color: ${theme.accent}; font-weight: bold; }
        [data-template="${id}"] .poster-button { background: ${theme.accent}; color: ${theme.bg.includes('gradient') || theme.bg.length > 7 ? '#fff' : theme.bg}; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-weight: bold; }
        ${themedCss}
    `;

    return {
        id: id,
        name: `${theme.name} ${layout.name}`,
        category: category,
        html: layout.html.replace('ID_PLACEHOLDER', id),
        css: finalCss
    };
}

// Generate the templates once
const GeneratedTemplates = generateTemplates();

function getAllTemplates() {
    return GeneratedTemplates;
}

function getTemplatesByCategory(category) {
    if (category === 'all') return GeneratedTemplates;
    return GeneratedTemplates.filter(t => t.category === category);
}

function getTemplateById(id) {
    return GeneratedTemplates.find(template => template.id === id);
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getAllTemplates, getTemplatesByCategory, getTemplateById };
}
