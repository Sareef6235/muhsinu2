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

        apply() {
            const body = document.body;
            body.classList.remove('theme-light', 'theme-dark');
            body.classList.add(`theme-${this.state.mode}`);
            body.setAttribute('data-theme', this.state.mode);

            // Dispatch event for components to react
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: this.state }));
        }
    };

    // Global Exposure
    window.ThemeEngine = ThemeEngine;

})();
