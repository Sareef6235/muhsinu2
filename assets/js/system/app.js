/**
 * Main Application Core
 * Initializes the system
 */

import { db } from './store.js';
import { router } from './router.js';

class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        console.log('App: Starting...');

        // 1. Initialize DB (Load JSON/LocalStorage)
        await db.init();

        // 2. Initialize Router
        // We will register routes in specific page modules, 
        // but we can register core ones here if needed.
        router.init();

        // 3. Global UI checks (Theme, etc)
        this.applyTheme();

        this.initialized = true;
        console.log('App: Started');
    }

    applyTheme() {
        const settings = db.get('settings');
        // Apply theme logic here if needed
        if (settings && settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
}

export const app = new App();

// Auto-start if imported in main script
// window.app = app;
// app.init(); 
