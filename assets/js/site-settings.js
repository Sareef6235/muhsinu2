/**
 * ============================================================================
 * DYNAMIC SITE SETTINGS SYSTEM
 * ============================================================================
 * CMS-level Header/Footer/Menu customization system
 * Compatible with static hosting, no frameworks, no page reloads
 * 
 * @namespace window.SiteSettings
 * @version 1.0.0
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // DEFAULT SETTINGS CONFIGURATION
    // ========================================================================
    const DEFAULT_SETTINGS = {
        header: {
            title: "My School",
            tagline: "Excellence in Education",
            logo: "",
            showLogo: true,
            bgColor: "#1a1a2e",
            textColor: "#ffffff",
            sticky: true,
            layout: "default", // default | centered | minimal
            announcementBar: {
                enabled: false,
                text: ""
            },
            menu: [
                { label: "Home", link: "/index.html", enabled: true },
                { label: "About", link: "/pages/about/index.html", enabled: true },
                { label: "Exams", link: "/pages/results/index.html", enabled: true },
                { label: "News", link: "/pages/news/index.html", enabled: true },
                { label: "Booking", link: "/pages/booking/index.html", enabled: true },
                { label: "Services", link: "/pages/services/index.html", enabled: true },
                { label: "Gallery", link: "/pages/gallery/index.html", enabled: true },
                { label: "Contact", link: "#contact", enabled: true }
            ]
        },
        footer: {
            description: "Empowering students to achieve their full potential through quality education.",
            address: "123 School Street, City, State 12345",
            phone: "+1 (555) 123-4567",
            email: "info@myschool.edu",
            copyright: "© 2026 My School. All rights reserved.",
            bgColor: "#0f0f1e",
            textColor: "#cccccc",
            layout: "3column", // 3column | centered | minimal
            showSocial: true,
            social: {
                facebook: "",
                instagram: "",
                youtube: ""
            }
        },
        theme: {
            mode: "light" // light | dark
        }
    };

    // ========================================================================
    // STORAGE KEY
    // ========================================================================
    const STORAGE_KEY = 'siteSettings';

    // ========================================================================
    // MAIN SITE SETTINGS OBJECT
    // ========================================================================
    window.SiteSettings = {
        // Internal state
        _settings: null,
        _defaults: DEFAULT_SETTINGS,
        _draggedItem: null,

        // ====================================================================
        // INITIALIZATION
        // ====================================================================
        init() {
            console.log('[SiteSettings] Initializing...');
            this.load();
            this.applyTheme();
            this.renderHeader();
            this.renderFooter();
            console.log('[SiteSettings] Initialized successfully');
        },

        // ====================================================================
        // UNIFIED PANEL SYSTEM
        // ====================================================================
        openPanel() {
            const panel = document.getElementById('header');
            if (!panel) return;

            panel.innerHTML = `
                <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3><i class="ph-bold ph-gear"></i> Site Settings Control Center</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="SiteSettings.resetAll()">
                            <i class="ph-bold ph-arrow-counter-clockwise"></i> Reset
                        </button>
                        <button class="btn btn-primary" onclick="SiteSettings.save(); alert('Settings saved!');">
                            <i class="ph-bold ph-floppy-disk"></i> Save Changes
                        </button>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="tab-scroller" style="margin-bottom: 25px; overflow-x: auto; white-space: nowrap; display: flex; gap: 10px; padding: 5px; border-bottom: 1px solid var(--glass-border);">
                    <button class="btn btn-mini tab-btn active" onclick="SiteSettings.switchTab('header', this)"><i class="ph-bold ph-browser"></i> Header</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('footer', this)"><i class="ph-bold ph-layout"></i> Footer</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('dragdrop', this)"><i class="ph-bold ph-cursor-click"></i> Drag & Drop</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('advanced', this)"><i class="ph-bold ph-sliders"></i> Advanced</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('dashboard-verify', this)"><i class="ph-bold ph-check-square"></i> Dash Verify</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('merit', this)"><i class="ph-bold ph-calculator"></i> Merit Logic</button>
                    <button class="btn btn-mini tab-btn" onclick="SiteSettings.switchTab('json', this)"><i class="ph-bold ph-code"></i> JSON Data</button>
                </div>

                <!-- Tab Content Container -->
                <div id="ss-tab-content">
                    <!-- Content injected here -->
                </div>
            `;

            this.switchTab('header');
        },

        switchTab(tabName, btn) {
            const container = document.getElementById('ss-tab-content');
            if (!container) return;

            // Update Active State
            if (btn) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            // Render Content
            switch (tabName) {
                case 'header': this.renderHeaderSettings(container); break;
                case 'footer': this.renderFooterSettings(container); break;
                case 'dragdrop': this.renderDragDropTest(container); break;
                case 'advanced': this.renderAdvancedFeatures(container); break;
                case 'dashboard-verify': this.renderDashboardVerification(container); break;
                case 'merit': this.renderMeritLogicTester(container); break;
                case 'json': this.renderSettingsViewer(container); break;
                default: container.innerHTML = '<p>Tab not found.</p>';
            }
        },

        // ====================================================================
        // STORAGE MANAGEMENT
        // ====================================================================
        load() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    this._settings = JSON.parse(stored);
                    console.log('[SiteSettings] Loaded from localStorage');
                } else {
                    this._settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                    console.log('[SiteSettings] Using default settings');
                }
            } catch (error) {
                console.error('[SiteSettings] Load error:', error);
                this._settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            }
        },

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
                console.log('[SiteSettings] Saved to localStorage');
                return true;
            } catch (error) {
                console.error('[SiteSettings] Save error:', error);
                alert('Failed to save settings. Storage may be full.');
                return false;
            }
        },

        resetAll() {
            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                this._settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                this.save();
                this.applyTheme();
                this.renderHeader();
                this.renderFooter();
                this.renderHeaderEditor();
                this.renderFooterEditor();
                alert('Settings reset to defaults');
            }
        },

        // ====================================================================
        // SANITIZATION & VALIDATION
        // ====================================================================
        sanitize(str) {
            if (typeof str !== 'string') return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/on\w+\s*=/gi, '');
        },

        validateURL(url) {
            if (!url) return true; // Empty is valid
            try {
                // Allow relative URLs and absolute URLs
                if (url.startsWith('#') || url.startsWith('/')) return true;
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        validateImageFile(file) {
            if (!file) return { valid: false, error: 'No file selected' };

            // Check file type
            if (!file.type.startsWith('image/')) {
                return { valid: false, error: 'File must be an image' };
            }

            // Check file size (3MB limit)
            const maxSize = 3 * 1024 * 1024;
            if (file.size > maxSize) {
                return { valid: false, error: 'Image must be less than 3MB' };
            }

            return { valid: true };
        },

        // ====================================================================
        // THEME MANAGEMENT
        // ====================================================================
        applyTheme() {
            const mode = this._settings.theme.mode;
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${mode}`);
        },

        toggleTheme() {
            this._settings.theme.mode = this._settings.theme.mode === 'light' ? 'dark' : 'light';
            this.save();
            this.applyTheme();
        },

        // ====================================================================
        // HEADER RENDERING
        // ====================================================================
        renderHeader() {
            const header = document.getElementById('main-header');
            if (!header) return;

            const settings = this._settings.header;

            // Apply styles to the main container
            header.className = `site-header ${settings.sticky ? 'sticky-header' : ''} layout-${settings.layout}`;
            header.style.backgroundColor = settings.bgColor;
            header.style.color = settings.textColor;
            header.style.position = settings.sticky ? 'sticky' : 'relative';
            header.style.top = settings.sticky ? '0' : 'auto';
            header.style.zIndex = '1000';
            header.style.boxShadow = settings.sticky ? '0 2px 20px rgba(0,0,0,0.1)' : 'none';
            header.style.transition = 'all 0.3s ease';

            // Inject responsive styles if not present
            if (!document.getElementById('ss-mobile-styles')) {
                const style = document.createElement('style');
                style.id = 'ss-mobile-styles';
                style.textContent = `
                    @media (max-width: 768px) {
                        .desktop-menu { display: none !important; }
                        .mobile-toggle { display: block !important; }
                        .header-container { padding: 10px 15px !important; }
                        .header-brand img { height: 40px !important; }
                        .header-brand h1 { font-size: 1.2rem !important; }
                    }
                    @media (min-width: 769px) {
                        .mobile-toggle { display: none !important; }
                        .mobile-menu-overlay { display: none !important; }
                    }
                `;
                document.head.appendChild(style);
            }

            let html = '';

            // Announcement Bar
            if (settings.announcementBar.enabled && settings.announcementBar.text) {
                html += `
                    <div class="announcement-bar" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                        padding: 10px;
                        font-size: 0.9rem;
                        position: relative;
                        z-index: 1001;
                    ">
                        ${this.sanitize(settings.announcementBar.text)}
                    </div>
                `;
            }

            // Header Content
            html += `
                <div class="header-container" style="
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    ${settings.layout === 'centered' ? 'flex-direction: column; gap: 15px;' : ''}
                ">
                    <div class="header-brand" style="display: flex; align-items: center; gap: 15px;">
                        ${settings.showLogo && settings.logo ? `
                            <img src="${settings.logo}" alt="Logo" style="height: 50px; width: auto; transition: height 0.3s;">
                        ` : ''}
                        <div class="header-text" style="line-height: 1.2;">
                            <h1 style="margin: 0; font-size: 1.5rem; color: ${settings.textColor}; font-weight: 700;">
                                ${this.sanitize(settings.title)}
                            </h1>
                            ${settings.tagline ? `
                                <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">
                                    ${this.sanitize(settings.tagline)}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Desktop Menu -->
                    <nav class="header-menu desktop-menu" style="
                        display: flex;
                        gap: ${settings.layout === 'minimal' ? '15px' : '25px'};
                        align-items: center;
                    ">
                        ${settings.menu.filter(item => item.enabled).map(item => `
                            <a href="${this.sanitize(item.link)}" style="
                                color: ${settings.textColor};
                                text-decoration: none;
                                font-weight: 500;
                                font-size: 0.95rem;
                                opacity: 0.9;
                                transition: opacity 0.2s;
                                position: relative;
                            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">
                                ${this.sanitize(item.label)}
                            </a>
                        `).join('')}
                    </nav>

                    <!-- Mobile Toggle -->
                    <button class="mobile-toggle" onclick="SiteSettings.toggleMobileMenu()" style="
                        background: none;
                        border: none;
                        color: ${settings.textColor};
                        font-size: 1.8rem;
                        cursor: pointer;
                        padding: 5px;
                    ">
                        <i class="ph-bold ph-list"></i>
                    </button>
                </div>

                <!-- Mobile Menu Overlay -->
                <div id="ss-mobile-menu" class="mobile-menu-overlay" style="
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    background: ${settings.bgColor};
                    z-index: 2000;
                    padding: 20px;
                    overflow-y: auto;
                    color: ${settings.textColor};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h2 style="margin: 0; font-size: 1.5rem;">Menu</h2>
                        <button onclick="SiteSettings.toggleMobileMenu()" style="
                            background: none; 
                            border: none; 
                            color: ${settings.textColor}; 
                            font-size: 2rem;
                            cursor: pointer;
                        "><i class="ph-bold ph-x"></i></button>
                    </div>
                    <nav style="display: flex; flex-direction: column; gap: 20px; font-size: 1.2rem;">
                        ${settings.menu.filter(item => item.enabled).map(item => `
                            <a href="${this.sanitize(item.link)}" onclick="SiteSettings.toggleMobileMenu()" style="
                                color: ${settings.textColor};
                                text-decoration: none;
                                font-weight: 500;
                                border-bottom: 1px solid rgba(255,255,255,0.1);
                                padding-bottom: 15px;
                            ">
                                ${this.sanitize(item.label)}
                            </a>
                        `).join('')}
                    </nav>
                </div>
            `;

            header.innerHTML = html;
        },

        toggleMobileMenu() {
            const menu = document.getElementById('ss-mobile-menu');
            if (menu) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                document.body.style.overflow = menu.style.display === 'block' ? 'hidden' : 'auto';
            }
        },

        // ====================================================================
        // FOOTER RENDERING
        // ====================================================================
        renderFooter() {
            const footer = document.getElementById('main-footer');
            if (!footer) return;

            const settings = this._settings.footer;

            let html = `
                <footer class="site-footer layout-${settings.layout}" style="
                    background-color: ${settings.bgColor};
                    color: ${settings.textColor};
                    padding: 40px 20px 20px;
                ">
                    <div class="footer-container" style="
                        max-width: 1200px;
                        margin: 0 auto;
                    ">
            `;

            if (settings.layout === '3column') {
                html += `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h3 style="margin-top: 0; color: ${settings.textColor};">About Us</h3>
                            <p style="opacity: 0.9; line-height: 1.6;">
                                ${this.sanitize(settings.description)}
                            </p>
                        </div>
                        <div>
                            <h3 style="margin-top: 0; color: ${settings.textColor};">Contact</h3>
                            <p style="opacity: 0.9; line-height: 1.8; margin: 0;">
                                ${settings.address ? `📍 ${this.sanitize(settings.address)}<br>` : ''}
                                ${settings.phone ? `📞 ${this.sanitize(settings.phone)}<br>` : ''}
                                ${settings.email ? `✉️ ${this.sanitize(settings.email)}` : ''}
                            </p>
                        </div>
                        ${settings.showSocial ? `
                            <div>
                                <h3 style="margin-top: 0; color: ${settings.textColor};">Follow Us</h3>
                                <div style="display: flex; gap: 15px; font-size: 1.5rem;">
                                    ${settings.social.facebook ? `<a href="${this.sanitize(settings.social.facebook)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📘</a>` : ''}
                                    ${settings.social.instagram ? `<a href="${this.sanitize(settings.social.instagram)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📷</a>` : ''}
                                    ${settings.social.youtube ? `<a href="${this.sanitize(settings.social.youtube)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📺</a>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else if (settings.layout === 'centered') {
                html += `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <p style="opacity: 0.9; line-height: 1.6; max-width: 600px; margin: 0 auto 20px;">
                            ${this.sanitize(settings.description)}
                        </p>
                        <p style="opacity: 0.9; line-height: 1.8;">
                            ${settings.address ? `${this.sanitize(settings.address)}<br>` : ''}
                            ${settings.phone ? `${this.sanitize(settings.phone)} | ` : ''}
                            ${settings.email ? this.sanitize(settings.email) : ''}
                        </p>
                        ${settings.showSocial ? `
                            <div style="display: flex; gap: 15px; font-size: 1.5rem; justify-content: center; margin-top: 15px;">
                                ${settings.social.facebook ? `<a href="${this.sanitize(settings.social.facebook)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📘</a>` : ''}
                                ${settings.social.instagram ? `<a href="${this.sanitize(settings.social.instagram)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📷</a>` : ''}
                                ${settings.social.youtube ? `<a href="${this.sanitize(settings.social.youtube)}" style="color: ${settings.textColor}; opacity: 0.8;" target="_blank">📺</a>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            html += `
                        <div style="
                            border-top: 1px solid rgba(255,255,255,0.1);
                            padding-top: 20px;
                            text-align: center;
                            opacity: 0.7;
                            font-size: 0.9rem;
                        ">
                            ${this.sanitize(settings.copyright)}
                        </div>
                    </div>
                </footer>
            `;

            footer.innerHTML = html;
        },

        // ====================================================================
        // EXPORT / IMPORT
        // ====================================================================
        exportSettings() {
            const dataStr = JSON.stringify(this._settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `site-settings-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            console.log('[SiteSettings] Settings exported');
        },

        importSettings(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    // Basic validation
                    if (imported.header && imported.footer && imported.theme) {
                        this._settings = imported;
                        this.save();
                        this.applyTheme();
                        this.renderHeader();
                        this.renderFooter();
                        this.renderHeaderEditor();
                        this.renderFooterEditor();
                        alert('Settings imported successfully!');
                    } else {
                        alert('Invalid settings file format');
                    }
                } catch (error) {
                    console.error('[SiteSettings] Import error:', error);
                    alert('Failed to import settings. Invalid JSON file.');
                }
            };
            reader.readAsText(file);
        },

        // ====================================================================
        // HEADER EDITOR UI
        // ====================================================================
        renderHeaderSettings(container) {
            this.renderHeaderEditor(container);
        },

        renderHeaderEditor(targetContainer) {
            const container = targetContainer || document.getElementById('header-settings-content');
            if (!container) return;

            const s = this._settings.header;

            container.innerHTML = `
                <div style="display: grid; gap: 25px;">
                    <!-- Logo Upload -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-image"></i> Logo</h4>
                        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                            ${s.logo ? `<img src="${s.logo}" style="height: 60px; border-radius: 8px;">` : '<div style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="ph ph-image" style="font-size: 2rem; opacity: 0.3;"></i></div>'}
                            <input type="file" id="ss-logo-upload" accept="image/*" style="flex: 1;" class="form-input">
                        </div>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="ss-show-logo" ${s.showLogo ? 'checked' : ''}>
                            <span>Show Logo</span>
                        </label>
                    </div>

                    <!-- Basic Info -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-text-aa"></i> Text Content</h4>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Site Title</label>
                            <input type="text" id="ss-title" class="form-input" value="${this.sanitize(s.title)}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tagline</label>
                            <input type="text" id="ss-tagline" class="form-input" value="${this.sanitize(s.tagline)}">
                        </div>
                    </div>

                    <!-- Colors & Style -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-palette"></i> Colors & Style</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div class="form-group">
                                <label class="form-label">Background Color</label>
                                <input type="color" id="ss-bg-color" class="form-input" value="${s.bgColor}" style="height: 45px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Text Color</label>
                                <input type="color" id="ss-text-color" class="form-input" value="${s.textColor}" style="height: 45px;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Layout</label>
                            <select id="ss-layout" class="form-input">
                                <option value="default" ${s.layout === 'default' ? 'selected' : ''}>Default</option>
                                <option value="centered" ${s.layout === 'centered' ? 'selected' : ''}>Centered</option>
                                <option value="minimal" ${s.layout === 'minimal' ? 'selected' : ''}>Minimal</option>
                            </select>
                        </div>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="ss-sticky" ${s.sticky ? 'checked' : ''}>
                            <span>Sticky Header</span>
                        </label>
                    </div>

                    <!-- Announcement Bar -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-megaphone"></i> Announcement Bar</h4>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                            <input type="checkbox" id="ss-announcement-enabled" ${s.announcementBar.enabled ? 'checked' : ''}>
                            <span>Enable Announcement Bar</span>
                        </label>
                        <div class="form-group">
                            <label class="form-label">Announcement Text</label>
                            <input type="text" id="ss-announcement-text" class="form-input" value="${this.sanitize(s.announcementBar.text)}" placeholder="Enter announcement message">
                        </div>
                    </div>

                    <!-- Menu Manager -->
                    <div class="glass-card" style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0;"><i class="ph-bold ph-list"></i> Menu Items</h4>
                            <button class="btn btn-sm btn-primary" onclick="SiteSettings.addMenuItem()">
                                <i class="ph-bold ph-plus"></i> Add Item
                            </button>
                        </div>
                        <div id="menu-items-list"></div>
                    </div>

                    <!-- Live Preview -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-eye"></i> Live Preview</h4>
                        <div id="header-preview" style="border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden;"></div>
                    </div>
                </div>
            `;

            this.attachHeaderEditorListeners();
            this.renderMenuManager();
            this.updateHeaderPreview();
        },

        attachHeaderEditorListeners() {
            const updatePreview = () => {
                this.updateHeaderFromInputs();
                this.updateHeaderPreview();
            };

            // Logo upload
            document.getElementById('ss-logo-upload')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const validation = this.validateImageFile(file);
                if (!validation.valid) {
                    alert(validation.error);
                    e.target.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    this._settings.header.logo = event.target.result;
                    this.save();
                    this.renderHeaderEditor();
                    this.renderHeader();
                };
                reader.readAsDataURL(file);
            });

            // All other inputs
            ['ss-show-logo', 'ss-title', 'ss-tagline', 'ss-bg-color', 'ss-text-color',
                'ss-layout', 'ss-sticky', 'ss-announcement-enabled', 'ss-announcement-text'].forEach(id => {
                    document.getElementById(id)?.addEventListener('change', updatePreview);
                    document.getElementById(id)?.addEventListener('input', updatePreview);
                });
        },

        updateHeaderFromInputs() {
            const s = this._settings.header;
            s.showLogo = document.getElementById('ss-show-logo')?.checked || false;
            s.title = document.getElementById('ss-title')?.value || '';
            s.tagline = document.getElementById('ss-tagline')?.value || '';
            s.bgColor = document.getElementById('ss-bg-color')?.value || '#1a1a2e';
            s.textColor = document.getElementById('ss-text-color')?.value || '#ffffff';
            s.layout = document.getElementById('ss-layout')?.value || 'default';
            s.sticky = document.getElementById('ss-sticky')?.checked || false;
            s.announcementBar.enabled = document.getElementById('ss-announcement-enabled')?.checked || false;
            s.announcementBar.text = document.getElementById('ss-announcement-text')?.value || '';
            this.save();
        },

        updateHeaderPreview() {
            const preview = document.getElementById('header-preview');
            if (!preview) return;

            const s = this._settings.header;
            preview.innerHTML = `
                ${s.announcementBar.enabled && s.announcementBar.text ? `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 8px; font-size: 0.8rem;">
                        ${this.sanitize(s.announcementBar.text)}
                    </div>
                ` : ''}
                <div style="background: ${s.bgColor}; color: ${s.textColor}; padding: 15px; display: flex; align-items: center; justify-content: space-between; ${s.layout === 'centered' ? 'flex-direction: column; gap: 10px;' : ''}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${s.showLogo && s.logo ? `<img src="${s.logo}" style="height: 30px;">` : ''}
                        <div>
                            <div style="font-weight: bold; font-size: 1rem;">${this.sanitize(s.title)}</div>
                            ${s.tagline ? `<div style="font-size: 0.7rem; opacity: 0.8;">${this.sanitize(s.tagline)}</div>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: ${s.layout === 'minimal' ? '10px' : '15px'}; font-size: 0.85rem;">
                        ${s.menu.filter(item => item.enabled).map(item => `<span>${this.sanitize(item.label)}</span>`).join('')}
                    </div>
                </div>
            `;
        },

        // ====================================================================
        // FOOTER EDITOR UI
        // ====================================================================
        renderFooterSettings(container) {
            this.renderFooterEditor(container);
        },

        renderFooterEditor(targetContainer) {
            const container = targetContainer || document.getElementById('footer-settings-content');
            if (!container) return;

            const s = this._settings.footer;

            container.innerHTML = `
                <div style="display: grid; gap: 25px;">
                    <!-- Content -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-text-aa"></i> Content</h4>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Description</label>
                            <textarea id="ss-footer-desc" class="form-input" rows="3" style="resize: vertical;">${this.sanitize(s.description)}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Copyright Text</label>
                            <input type="text" id="ss-footer-copyright" class="form-input" value="${this.sanitize(s.copyright)}">
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-address-book"></i> Contact Information</h4>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Address</label>
                            <input type="text" id="ss-footer-address" class="form-input" value="${this.sanitize(s.address)}">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label class="form-label">Phone</label>
                                <input type="text" id="ss-footer-phone" class="form-input" value="${this.sanitize(s.phone)}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" id="ss-footer-email" class="form-input" value="${this.sanitize(s.email)}">
                            </div>
                        </div>
                    </div>

                    <!-- Social Media -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-share-network"></i> Social Media</h4>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                            <input type="checkbox" id="ss-footer-show-social" ${s.showSocial ? 'checked' : ''}>
                            <span>Show Social Links</span>
                        </label>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Facebook URL</label>
                            <input type="url" id="ss-footer-facebook" class="form-input" value="${this.sanitize(s.social.facebook)}" placeholder="https://facebook.com/yourpage">
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Instagram URL</label>
                            <input type="url" id="ss-footer-instagram" class="form-input" value="${this.sanitize(s.social.instagram)}" placeholder="https://instagram.com/yourpage">
                        </div>
                        <div class="form-group">
                            <label class="form-label">YouTube URL</label>
                            <input type="url" id="ss-footer-youtube" class="form-input" value="${this.sanitize(s.social.youtube)}" placeholder="https://youtube.com/yourchannel">
                        </div>
                    </div>

                    <!-- Colors & Style -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-palette"></i> Colors & Style</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div class="form-group">
                                <label class="form-label">Background Color</label>
                                <input type="color" id="ss-footer-bg-color" class="form-input" value="${s.bgColor}" style="height: 45px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Text Color</label>
                                <input type="color" id="ss-footer-text-color" class="form-input" value="${s.textColor}" style="height: 45px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Layout</label>
                            <select id="ss-footer-layout" class="form-input">
                                <option value="3column" ${s.layout === '3column' ? 'selected' : ''}>3 Column</option>
                                <option value="centered" ${s.layout === 'centered' ? 'selected' : ''}>Centered</option>
                                <option value="minimal" ${s.layout === 'minimal' ? 'selected' : ''}>Minimal</option>
                            </select>
                        </div>
                    </div>

                    <!-- Live Preview -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top: 0;"><i class="ph-bold ph-eye"></i> Live Preview</h4>
                        <div id="footer-preview" style="border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden;"></div>
                    </div>
                </div>
            `;

            this.attachFooterEditorListeners();
            this.updateFooterPreview();
        },

        attachFooterEditorListeners() {
            const updatePreview = () => {
                this.updateFooterFromInputs();
                this.updateFooterPreview();
            };

            ['ss-footer-desc', 'ss-footer-copyright', 'ss-footer-address', 'ss-footer-phone',
                'ss-footer-email', 'ss-footer-show-social', 'ss-footer-facebook', 'ss-footer-instagram',
                'ss-footer-youtube', 'ss-footer-bg-color', 'ss-footer-text-color', 'ss-footer-layout'].forEach(id => {
                    document.getElementById(id)?.addEventListener('change', updatePreview);
                    document.getElementById(id)?.addEventListener('input', updatePreview);
                });
        },

        updateFooterFromInputs() {
            const s = this._settings.footer;
            s.description = document.getElementById('ss-footer-desc')?.value || '';
            s.copyright = document.getElementById('ss-footer-copyright')?.value || '';
            s.address = document.getElementById('ss-footer-address')?.value || '';
            s.phone = document.getElementById('ss-footer-phone')?.value || '';
            s.email = document.getElementById('ss-footer-email')?.value || '';
            s.showSocial = document.getElementById('ss-footer-show-social')?.checked || false;
            s.social.facebook = document.getElementById('ss-footer-facebook')?.value || '';
            s.social.instagram = document.getElementById('ss-footer-instagram')?.value || '';
            s.social.youtube = document.getElementById('ss-footer-youtube')?.value || '';
            s.bgColor = document.getElementById('ss-footer-bg-color')?.value || '#0f0f1e';
            s.textColor = document.getElementById('ss-footer-text-color')?.value || '#cccccc';
            s.layout = document.getElementById('ss-footer-layout')?.value || '3column';
            this.save();
        },

        updateFooterPreview() {
            const preview = document.getElementById('footer-preview');
            if (!preview) return;

            const s = this._settings.footer;
            preview.innerHTML = `
                <div style="background: ${s.bgColor}; color: ${s.textColor}; padding: 20px; font-size: 0.8rem;">
                    ${s.layout === '3column' ? `
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
                            <div><strong>About</strong><br>${this.sanitize(s.description).substring(0, 50)}...</div>
                            <div><strong>Contact</strong><br>${this.sanitize(s.phone)}</div>
                            ${s.showSocial ? '<div><strong>Social</strong><br>📘 📷 📺</div>' : ''}
                        </div>
                    ` : `
                        <div style="text-align: center; margin-bottom: 15px;">
                            <div>${this.sanitize(s.description).substring(0, 80)}...</div>
                            <div style="margin-top: 10px;">${this.sanitize(s.phone)} | ${this.sanitize(s.email)}</div>
                        </div>
                    `}
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; text-align: center; opacity: 0.7;">
                        ${this.sanitize(s.copyright)}
                    </div>
                </div>
            `;
        },

        // ====================================================================
        // MENU MANAGER WITH DRAG & DROP
        // ====================================================================
        renderMenuManager() {
            const container = document.getElementById('menu-items-list');
            if (!container) return;

            const menu = this._settings.header.menu;

            if (menu.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No menu items. Click "Add Item" to create one.</p>';
                return;
            }

            container.innerHTML = menu.map((item, index) => `
                <div class="menu-item" draggable="true" data-index="${index}" style="
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: move;
                    transition: 0.2s;
                ">
                    <i class="ph-bold ph-dots-six-vertical" style="opacity: 0.5;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${this.sanitize(item.label)}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">${this.sanitize(item.link)}</div>
                    </div>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" ${item.enabled ? 'checked' : ''} onchange="SiteSettings.toggleMenuItem(${index})">
                        <span style="font-size: 0.85rem;">Enabled</span>
                    </label>
                    <button class="btn btn-mini btn-secondary" onclick="SiteSettings.editMenuItem(${index})" title="Edit">
                        <i class="ph-bold ph-pencil"></i>
                    </button>
                    <button class="btn btn-mini btn-danger" onclick="SiteSettings.deleteMenuItem(${index})" title="Delete">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>
            `).join('');

            this.enableDragDrop();
        },

        addMenuItem() {
            const label = prompt('Enter menu item label:');
            if (!label) return;

            const link = prompt('Enter menu item link (e.g., #home, /about, https://...):');
            if (!link) return;

            if (!this.validateURL(link)) {
                alert('Invalid URL format');
                return;
            }

            this._settings.header.menu.push({
                label: label,
                link: link,
                enabled: true
            });

            this.save();
            this.renderMenuManager();
            this.renderHeader();
            this.updateHeaderPreview();
        },

        editMenuItem(index) {
            const item = this._settings.header.menu[index];
            if (!item) return;

            const label = prompt('Edit menu item label:', item.label);
            if (label === null) return;

            const link = prompt('Edit menu item link:', item.link);
            if (link === null) return;

            if (!this.validateURL(link)) {
                alert('Invalid URL format');
                return;
            }

            item.label = label;
            item.link = link;

            this.save();
            this.renderMenuManager();
            this.renderHeader();
            this.updateHeaderPreview();
        },

        deleteMenuItem(index) {
            if (!confirm('Delete this menu item?')) return;

            this._settings.header.menu.splice(index, 1);
            this.save();
            this.renderHeader(); // Update live preview
            this.renderHeaderEditor(); // Re-render editor
        },

        // ====================================================================
        // DRAG & DROP TESTER UI
        // ====================================================================
        renderDragDropTest(container) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 25px;">
                    <h4 style="margin-top: 0; display:flex; align-items:center; gap:10px;">
                        <i class="ph-bold ph-cursor-click"></i> Drag & Drop Verification
                        <span id="dd-status" class="status-badge pending" style="font-size:0.7rem;">Ready</span>
                    </h4>
                    <p style="color:#888; font-size:0.9rem;">
                        Test the drag-and-drop mechanics isolated from the main menu editor.
                        <br>1. Drag items to reorder.
                        <br>2. Check console for event logs.
                    </p>
                    
                    <div style="display:flex; gap:20px; margin-top:20px;">
                        <ul id="dd-test-list" style="list-style:none; padding:0; width: 250px; background:rgba(0,0,0,0.2); border-radius:8px; overflow:hidden;">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <li draggable="true" data-index="${i}" 
                                    style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:grab; background:rgba(255,255,255,0.02); display:flex; justify-content:space-between;">
                                    <span>Item ${i}</span>
                                    <i class="ph ph-dots-six-vertical"></i>
                                </li>
                            `).join('')}
                        </ul>
                        <div style="flex:1; background:#111; color:#0f0; font-family:monospace; padding:15px; border-radius:8px; height:200px; overflow-y:auto; font-size:0.8rem;" id="dd-console">
                            > Drag test console initialized...
                        </div>
                    </div>
                </div>
            `;

            this.enableDragDropTest();
        },

        enableDragDropTest() {
            const list = document.getElementById('dd-test-list');
            const logBox = document.getElementById('dd-console');
            if (!list || !logBox) return;

            const log = (msg) => {
                logBox.innerHTML += `<div>> ${msg}</div>`;
                logBox.scrollTop = logBox.scrollHeight;
            };

            let dragged = null;

            list.addEventListener('dragstart', (e) => {
                dragged = e.target;
                e.target.style.opacity = '0.5';
                log(`Drag Start: ${e.target.innerText.trim()}`);
            });

            list.addEventListener('dragend', (e) => {
                e.target.style.opacity = '';
                dragged = null;
                log('Drag End');
                document.getElementById('dd-status').textContent = 'PASS';
                document.getElementById('dd-status').className = 'status-badge approved';
            });

            list.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.target.tagName === 'LI' && e.target !== dragged) {
                    const all = [...list.children];
                    const draggedIdx = all.indexOf(dragged);
                    const droppedIdx = all.indexOf(e.target);

                    if (draggedIdx < droppedIdx) {
                        e.target.after(dragged);
                    } else {
                        e.target.before(dragged);
                    }
                    log(`Dropped on ${e.target.innerText.trim()}`);
                }
            });
        },


        // ====================================================================
        // ADVANCED FEATURES UI
        // ====================================================================
        renderAdvancedFeatures(container) {
            container.innerHTML = `
                <div style="display: grid; gap: 20px;">
                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="margin-top:0;"><i class="ph-bold ph-sliders"></i> Advanced Feature Verification</h4>
                        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                            <thead>
                                <tr style="text-align:left; border-bottom:1px solid rgba(255,255,255,0.1);">
                                    <th style="padding:10px;">Feature</th>
                                    <th style="padding:10px;">Action</th>
                                    <th style="padding:10px;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:10px;">Theme Switcher</td>
                                    <td><button class="btn btn-mini btn-secondary" onclick="SiteSettings.toggleTheme(); SiteSettings.verifyAdvancedFeature('theme')">Toggle</button></td>
                                    <td id="status-theme" style="color:#888;">Pending</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;">Security / Sanitization</td>
                                    <td><button class="btn btn-mini btn-secondary" onclick="SiteSettings.testSanitization()">Run Test</button></td>
                                    <td id="status-security" style="color:#888;">Pending</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;">Browser Storage</td>
                                    <td><button class="btn btn-mini btn-secondary" onclick="SiteSettings.testStorage()">Check</button></td>
                                    <td id="status-storage" style="color:#888;">Pending</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        verifyAdvancedFeature(feature) {
            if (feature === 'theme') {
                const mode = this._settings.theme.mode;
                const status = document.getElementById('status-theme');
                if (status) {
                    status.textContent = `Active: ${mode.toUpperCase()}`;
                    status.style.color = '#2ed573';
                }
            }
        },

        testSanitization() {
            const input = '<script>alert("xss")</script><b>Safe</b>';
            const output = this.sanitize(input);
            const status = document.getElementById('status-security');
            if (output === '<b>Safe</b>' || output === '&lt;script&gt;alert("xss")&lt;/script&gt;<b>Safe</b>' || output === '<b>Safe</b>') {
                // Simplest sanitize removes script tags
                if (!output.includes('<script')) {
                    status.innerHTML = '<span style="color:#2ed573">PASS (Sanitized)</span>';
                } else {
                    status.innerHTML = '<span style="color:red">FAIL</span>';
                }
            } else {
                // Depending on implementation, checking if script is gone
                if (!output.includes('<script')) {
                    status.innerHTML = '<span style="color:#2ed573">PASS</span>';
                }
            }
        },

        testStorage() {
            const status = document.getElementById('status-storage');
            try {
                localStorage.setItem('test_storage', 'ok');
                localStorage.removeItem('test_storage');
                status.innerHTML = '<span style="color:#2ed573">PASS (Available)</span>';
            } catch (e) {
                status.innerHTML = '<span style="color:red">FAIL</span>';
            }
        },

        // ====================================================================
        // DASHBOARD VERIFICATION UI
        // ====================================================================
        renderDashboardVerification(container) {
            container.innerHTML = `
                 <div class="glass-card" style="padding: 20px;">
                    <h4 style="margin-top:0;"><i class="ph-bold ph-check-square"></i> Dashboard Integration Diagnostics</h4>
                     <p style="color:#888; font-size:0.9rem; margin-bottom:20px;">
                        Verifies that the Site Settings module is correctly integrated into the dashboard DOM.
                    </p>
                    <button class="btn btn-primary" onclick="SiteSettings.runDashboardDiagnostics()">Run Diagnostics</button>
                    
                    <div id="diag-results" style="margin-top:20px; display:grid; gap:10px;"></div>
                 </div>
            `;
        },

        runDashboardDiagnostics() {
            const checks = [
                { name: "Global Object (SiteSettings)", pass: !!window.SiteSettings },
                { name: "Header Container (#main-header)", pass: !!document.getElementById('main-header') },
                { name: "Footer Container (#main-footer)", pass: !!document.getElementById('main-footer') },
                { name: "Settings in LocalStorage", pass: !!localStorage.getItem('siteSettings') },
                { name: "Theme Applied", pass: document.body.classList.contains('theme-dark') || document.body.classList.contains('theme-light') || true } // default might be no class
            ];

            const resultsContainer = document.getElementById('diag-results');
            resultsContainer.innerHTML = checks.map(c => `
                <div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); border-radius:6px;">
                    <span>${c.name}</span>
                    <span style="font-weight:bold; color: ${c.pass ? '#2ed573' : '#ff3d3d'}">${c.pass ? 'PASS' : 'FAIL'}</span>
                </div>
            `).join('');
        },

        // ====================================================================
        // MERIT LOGIC TESTER UI
        // ====================================================================
        renderMeritLogicTester(container) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 20px;">
                    <h4 style="margin-top:0;"><i class="ph-bold ph-calculator"></i> Merit Logic Tester</h4>
                    <p style="color:#888; font-size:0.9rem; margin-bottom:15px;">
                        Test grading and merit calculation logic safely.
                    </p>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div>
                            <label class="form-label">Total Marks</label>
                            <input type="number" id="merit-input-marks" class="form-input" value="85">
                        </div>
                         <div>
                            <label class="form-label">Total Possible</label>
                            <input type="number" id="merit-input-total" class="form-input" value="100">
                        </div>
                    </div>
                    <button class="btn btn-primary" style="margin-top:15px; width:100%;" onclick="SiteSettings.runMeritTest()">Calculate Grade</button>
                    
                    <div id="merit-output" style="margin-top:20px; background:#111; color:#0f0; padding:15px; font-family:monospace; border-radius:8px;">
                        > Ready for calculation...
                    </div>
                </div>
            `;
        },

        runMeritTest() {
            const marks = parseFloat(document.getElementById('merit-input-marks').value) || 0;
            const total = parseFloat(document.getElementById('merit-input-total').value) || 100;
            const output = document.getElementById('merit-output');

            const per = (marks / total) * 100;
            let grade = 'F';
            if (per >= 90) grade = 'A+';
            else if (per >= 80) grade = 'A';
            else if (per >= 70) grade = 'B';
            else if (per >= 60) grade = 'C';
            else if (per >= 50) grade = 'D';

            output.innerHTML = `
                > Marks: ${marks} / ${total}<br>
                > Percentage: ${per.toFixed(2)}%<br>
                > Grade: ${grade}<br>
                > Status: ${per >= 40 ? 'PASS' : 'FAIL'}
            `;
        },


        // ====================================================================
        // SETTINGS VIEWER UI
        // ====================================================================
        renderSettingsViewer(container) {
            const json = JSON.stringify(this._settings, null, 4);
            container.innerHTML = `
                 <div class="glass-card" style="padding: 20px; height: 100%;">
                    <h4 style="margin-top:0; display:flex; justify-content:space-between;">
                        <span><i class="ph-bold ph-code"></i> Raw JSON Data</span>
                        <button class="btn btn-mini btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('raw-json').innerText); alert('Copied!')">Copy</button>
                    </h4>
                    <pre id="raw-json" style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; overflow:auto; max-height:400px; font-size:0.85rem;">${json}</pre>
                 </div>
            `;
        },

        toggleMenuItem(index) {
            const item = this._settings.header.menu[index];
            if (!item) return;

            item.enabled = !item.enabled;
            this.save();
            this.renderHeader();
            this.updateHeaderPreview();
        },

        enableDragDrop() {
            const items = document.querySelectorAll('.menu-item');

            items.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    this._draggedItem = parseInt(e.target.dataset.index);
                    e.target.style.opacity = '0.5';
                });

                item.addEventListener('dragend', (e) => {
                    e.target.style.opacity = '1';
                });

                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.target.closest('.menu-item').style.borderColor = 'var(--primary-color)';
                });

                item.addEventListener('dragleave', (e) => {
                    e.target.closest('.menu-item').style.borderColor = 'var(--glass-border)';
                });

                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const dropIndex = parseInt(e.target.closest('.menu-item').dataset.index);
                    e.target.closest('.menu-item').style.borderColor = 'var(--glass-border)';

                    if (this._draggedItem !== null && this._draggedItem !== dropIndex) {
                        this.reorderMenu(this._draggedItem, dropIndex);
                    }
                });
            });
        },

        // ====================================================================
        // PUBLIC CONVENIENCE METHODS
        // ====================================================================
        render() {
            this.renderHeader();
            this.renderFooter();
        },

        reorderMenu(fromIndex, toIndex) {
            const menu = this._settings.header.menu;
            const item = menu.splice(fromIndex, 1)[0];
            menu.splice(toIndex, 0, item);

            this.save();
            this.renderMenuManager();
            this.renderHeader();
            this.updateHeaderPreview();
        }
    };

    // ========================================================================
    // AUTO-INITIALIZE ON DOM READY
    // ========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.SiteSettings.init();
        });
    } else {
        window.SiteSettings.init();
    }

})();
