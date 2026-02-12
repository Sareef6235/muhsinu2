/**
 * ============================================================================
 * THEME ENGINE
 * ============================================================================
 * Manages Light/Dark modes and Custom Theme presets.
 * 
 * @namespace window.ThemeEngine
 * ============================================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = "saas_theme_pref";

    const ThemeEngine = {
        state: {
            mode: 'light', // light | dark
            activeTheme: 'default'
        },

        init() {
            console.log("🎨 ThemeEngine: Initializing...");
            this.load();
            this.apply();
        },

        load() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.state = JSON.parse(saved);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.state.mode = 'dark';
            }
        },

        save() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        },

        setMode(mode) {
            this.state.mode = mode;
            this.save();
            this.apply();
        },

        toggleMode() {
            this.setMode(this.state.mode === 'light' ? 'dark' : 'light');
        },

        apply(mode = this.state.mode, brand = null) {
            const root = document.documentElement;
            const body = document.body;

            this.state.mode = mode;
            body.classList.remove('theme-light', 'theme-dark');
            body.classList.add(`theme-${mode}`);
            body.setAttribute('data-theme', mode);

            // Apply Brand Colors
            if (brand) {
                if (brand.primaryColor) {
                    root.style.setProperty('--primary-color', brand.primaryColor);
                    // Generate a faint version for backgrounds
                    root.style.setProperty('--primary-color-faint', brand.primaryColor + '15');
                }
                if (brand.name) {
                    root.style.setProperty('--brand-name', `"${brand.name}"`);
                }
            }

            // Dispatch event for components to react
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { ...this.state, brand } }));
        }
    };

    // Global Exposure
    window.ThemeEngine = ThemeEngine;

})();
