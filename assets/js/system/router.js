/**
 * Router System
 * customized for ?page= logic (no server rewrite needed)
 */

export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Listen to history changes
        window.addEventListener('popstate', () => this.handleRoute());
    }

    // Register a route
    // handler: function(params) that returns specific logic or triggers render
    on(pageName, handler) {
        this.routes[pageName] = handler;
    }

    // Initialize routing
    init() {
        this.handleRoute();
    }

    // Get params from URL
    getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    // Navigate to a page
    navigate(page, params = {}) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);

        // Add other params
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        window.history.pushState({}, '', url);
        this.handleRoute();
    }

    // Handle current URL
    async handleRoute() {
        const params = this.getParams();
        const page = params.page || 'home'; // Default to home

        console.log(`Router: Navigating to [${page}]`, params);

        if (this.routes[page]) {
            this.currentRoute = page;
            await this.routes[page](params);
        } else if (this.routes['404']) {
            this.routes['404'](params);
        } else {
            console.warn(`No handler for page: ${page}`);
        }
    }
}

export const router = new Router();
