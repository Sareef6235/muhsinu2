/**
 * ============================================================================
 * PAGE BUILDER ENGINE
 * ============================================================================
 * Handles section-based page construction and editing.
 * Supports Hero, Gallery, Text, Video, Contact Form, etc.
 * 
 * @namespace window.PageBuilder
 * ============================================================================
 */

(function () {
    'use strict';

    const SECTION_TEMPLATES = {
        hero: (data) => `
            <section class="section-hero glassmorphism" style="background: ${data.bg || 'var(--brand-primary)'}">
                <div class="hero-content text-center py-5">
                    <h1 class="display-3 fw-bold text-white">${data.title || 'Dynamic Hero Title'}</h1>
                    <p class="lead text-white-50">${data.subtitle || 'Your dynamic subtitle goes here.'}</p>
                    <div class="hero-btns mt-4">
                        <a href="${data.btnLink || '#'}" class="btn btn-lg btn-light rounded-pill px-4">${data.btnText || 'Get Started'}</a>
                    </div>
                </div>
            </section>
        `,
        gallery: (data) => `
            <section class="section-gallery py-5">
                <div class="container">
                    <h2 class="text-center mb-4">${data.title || 'Our Gallery'}</h2>
                    <div class="row g-4">
                        ${(data.images || []).map(img => `
                            <div class="col-md-4">
                                <div class="gallery-card rounded-4 overflow-hidden shadow-sm border">
                                    <img src="${img}" class="img-fluid w-100" style="height: 250px; object-fit: cover;">
                                </div>
                            </div>
                        `).join('') || '<p class="text-center w-100">No images yet.</p>'}
                    </div>
                </div>
            </section>
        `,
        text: (data) => `
            <section class="section-text py-5">
                <div class="container">
                    <div class="max-w-800 mx-auto">
                        <h2 class="mb-3">${data.title || ''}</h2>
                        <div class="content text-secondary">${data.body || 'Type your content here...'}</div>
                    </div>
                </div>
            </section>
        `,
        form: (data) => `
            <section class="section-form py-5 glass-card mx-auto" style="max-width: 600px;">
                <div class="container">
                    <h3 class="text-center mb-4">${data.title || 'Contact Us'}</h3>
                    <form onsubmit="return false;">
                        <div class="mb-3">
                            <input type="text" class="form-control rounded-pill" placeholder="Your Name">
                        </div>
                        <div class="mb-3">
                            <input type="email" class="form-control rounded-pill" placeholder="Your Email">
                        </div>
                        <div class="mb-3">
                            <textarea class="form-control rounded-4" rows="4" placeholder="Message"></textarea>
                        </div>
                        <button class="btn btn-primary w-100 rounded-pill py-2">${data.btnText || 'Send Message'}</button>
                    </form>
                </div>
            </section>
        `
    };

    const PageBuilder = {
        _sections: [], // State of current page sections

        init() {
            this.load();
        },

        load() {
            // Placeholder: Load from SiteEngine state or LocalStorage
            this._sections = [];
        },

        addSection(type, data = {}) {
            if (SECTION_TEMPLATES[type]) {
                const id = 'sec_' + Date.now();
                this._sections.push({ id, type, data });
                return id;
            }
            return null;
        },

        removeSection(id) {
            this._sections = this._sections.filter(s => s.id !== id);
        },

        reorderSections(newOrderIds) {
            const reordered = [];
            newOrderIds.forEach(id => {
                const section = this._sections.find(s => s.id === id);
                if (section) reordered.push(section);
            });
            this._sections = reordered;
        },

        updateSection(id, data) {
            const section = this._sections.find(s => s.id === id);
            if (section) {
                section.data = { ...section.data, ...data };
            }
        },

        getSection(id) {
            return this._sections.find(s => s.id === id);
        },

        render(container, isEditor = false) {
            if (!container) return;

            const html = this._sections.map(sec => {
                const template = SECTION_TEMPLATES[sec.type];
                let content = template(sec.data);

                if (isEditor) {
                    content = `
                        <div class="section-item mb-4" data-id="${sec.id}">
                            ${content}
                            <div class="section-actions rounded-pill p-2 glass-card">
                                <button class="btn btn-sm btn-light rounded-circle" onclick="editSection('${sec.id}')" title="Edit">
                                    <i class="bi bi-pencil-fill"></i>
                                </button>
                                <button class="btn btn-sm btn-light rounded-circle" onclick="duplicateSection('${sec.id}')" title="Duplicate">
                                    <i class="bi bi-copy"></i>
                                </button>
                                <button class="btn btn-sm btn-danger rounded-circle text-white" onclick="removeSection('${sec.id}')" title="Delete">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    // Re-add the wrapper for non-editor mode to maintain data-id for potential future use
                    content = `<div class="builder-section-wrapper" data-id="${sec.id}">${content}</div>`;
                }
                return content;
            }).join('');

            container.innerHTML = html || `<div class="text-center py-5 text-secondary"><p>Empty Page. Add sections to begin.</p></div>`;
        },

        export() {
            return JSON.stringify(this._sections);
        },

        import(json) {
            try {
                const data = JSON.parse(json);
                if (Array.isArray(data)) {
                    this._sections = data;
                    return true;
                }
            } catch (e) {
                console.error("Import failed:", e);
            }
            return false;
        },

        getSections() {
            return this._sections;
        },

        getTemplates() {
            return Object.keys(SECTION_TEMPLATES);
        }
    };

    // Global Exposure
    window.PageBuilder = PageBuilder;

})();
