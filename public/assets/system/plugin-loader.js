/**
 * PLUGIN LOADER SYSTEM
 * WordPress-style plugin architecture for modular functionality
 * 
 * Features:
 * - Auto-scan /plugins directory
 * - Dynamic CSS/JS injection
 * - Dependency resolution
 * - Enable/disable plugins
 * - Plugin lifecycle management
 */

class PluginLoader {
    constructor() {
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.loadedScripts = new Set();
        this.loadedStyles = new Set();

        // Load saved plugin states from localStorage
        const savedState = localStorage.getItem('plugin_states');
        if (savedState) {
            try {
                const states = JSON.parse(savedState);
                this.activePlugins = new Set(states.active || []);
            } catch (e) {
                console.warn('Failed to load plugin states:', e);
            }
        }
    }

    /**
     * Register a plugin from its manifest
     */
    async register(pluginPath, manifest) {
        if (!manifest.name) {
            throw new Error(`Invalid plugin manifest at ${pluginPath}`);
        }

        const plugin = {
            id: manifest.name.toLowerCase().replace(/\s+/g, '-'),
            name: manifest.name,
            version: manifest.version || '1.0.0',
            description: manifest.description || '',
            author: manifest.author || '',
            path: pluginPath,
            main: manifest.main || 'index.js',
            styles: manifest.styles || [],
            dependencies: manifest.dependencies || [],
            admin: manifest.admin !== false, // Default true
            autoload: manifest.autoload !== false, // Default true
            hooks: manifest.hooks || {},
            settings: manifest.settings || {},
            manifest: manifest,
            loaded: false,
            active: this.activePlugins.has(manifest.name)
        };

        this.plugins.set(plugin.id, plugin);
        console.log(`✅ Registered plugin: ${plugin.name} v${plugin.version}`);

        return plugin;
    }

    /**
     * Load plugin assets (CSS/JS)
     */
    async loadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }

        if (plugin.loaded) {
            console.log(`Plugin ${plugin.name} already loaded`);
            return;
        }

        // Check dependencies
        for (const dep of plugin.dependencies) {
            const depId = dep.toLowerCase().replace(/\s+/g, '-');
            if (!this.plugins.has(depId)) {
                throw new Error(`Missing dependency: ${dep} for ${plugin.name}`);
            }
            if (!this.plugins.get(depId).loaded) {
                await this.loadPlugin(depId);
            }
        }

        // Load CSS files
        for (const styleFile of plugin.styles) {
            const stylePath = `${plugin.path}/${styleFile}`;
            if (!this.loadedStyles.has(stylePath)) {
                await this.injectCSS(stylePath);
                this.loadedStyles.add(stylePath);
            }
        }

        // Load main JS file
        const scriptPath = `${plugin.path}/${plugin.main}`;
        if (!this.loadedScripts.has(scriptPath)) {
            await this.injectScript(scriptPath);
            this.loadedScripts.add(scriptPath);
        }

        plugin.loaded = true;
        console.log(`✅ Loaded plugin: ${plugin.name}`);

        // Trigger init hook
        if (plugin.hooks.init) {
            this.triggerHook(pluginId, 'init');
        }
    }

    /**
     * Activate a plugin
     */
    async activate(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }

        if (plugin.active) {
            console.log(`Plugin ${plugin.name} already active`);
            return;
        }

        // Load if not loaded
        if (!plugin.loaded) {
            await this.loadPlugin(pluginId);
        }

        plugin.active = true;
        this.activePlugins.add(plugin.name);
        this.saveState();

        // Trigger activate hook
        if (plugin.hooks.activate) {
            this.triggerHook(pluginId, 'activate');
        }

        console.log(`✅ Activated plugin: ${plugin.name}`);
        this.dispatchEvent('plugin:activated', { plugin });
    }

    /**
     * Deactivate a plugin
     */
    deactivate(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }

        if (!plugin.active) {
            console.log(`Plugin ${plugin.name} already inactive`);
            return;
        }

        plugin.active = false;
        this.activePlugins.delete(plugin.name);
        this.saveState();

        // Trigger deactivate hook
        if (plugin.hooks.deactivate) {
            this.triggerHook(pluginId, 'deactivate');
        }

        console.log(`⚠️ Deactivated plugin: ${plugin.name}`);
        this.dispatchEvent('plugin:deactivated', { plugin });
    }

    /**
     * Inject CSS file
     */
    injectCSS(path) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
            document.head.appendChild(link);
        });
    }

    /**
     * Inject JS file
     */
    injectScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = path;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${path}`));
            document.body.appendChild(script);
        });
    }

    /**
     * Trigger plugin hook
     */
    triggerHook(pluginId, hookName, data = {}) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || !plugin.hooks[hookName]) return;

        try {
            if (typeof window[plugin.hooks[hookName]] === 'function') {
                window[plugin.hooks[hookName]](data);
            }
        } catch (e) {
            console.error(`Error in ${plugin.name} hook ${hookName}:`, e);
        }
    }

    /**
     * Save plugin states to localStorage
     */
    saveState() {
        const state = {
            active: Array.from(this.activePlugins)
        };
        localStorage.setItem('plugin_states', JSON.stringify(state));
    }

    /**
     * Get all plugins
     */
    getAll() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get active plugins
     */
    getActive() {
        return this.getAll().filter(p => p.active);
    }

    /**
     * Get plugin by ID
     */
    get(pluginId) {
        return this.plugins.get(pluginId);
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    /**
     * Auto-load plugins on init
     */
    async autoLoad() {
        const autoLoadPlugins = this.getAll().filter(p => p.autoload && p.active);

        for (const plugin of autoLoadPlugins) {
            try {
                await this.loadPlugin(plugin.id);
            } catch (e) {
                console.error(`Failed to auto-load ${plugin.name}:`, e);
            }
        }
    }
}

// Global instance
window.PluginManager = new PluginLoader();

// Auto-register plugins from manifest
(async function initPlugins() {
    console.log('🔌 Initializing Plugin System...');

    // Plugin registry - manually defined for now (can be auto-scanned with backend)
    const pluginRegistry = [
        { path: '/plugins/jet-engine', manifest: '/plugins/jet-engine/plugin.json' },
        { path: '/plugins/elementor-pro', manifest: '/plugins/elementor-pro/plugin.json' },
        { path: '/plugins/woocommerce', manifest: '/plugins/woocommerce/plugin.json' },
        { path: '/plugins/membership', manifest: '/plugins/membership/plugin.json' },
        { path: '/plugins/acf', manifest: '/plugins/acf/plugin.json' },
        { path: '/plugins/wpml', manifest: '/plugins/wpml/plugin.json' },
        { path: '/plugins/forminator', manifest: '/plugins/forminator/plugin.json' },
        { path: '/plugins/slider-revolution', manifest: '/plugins/slider-revolution/plugin.json' },
        { path: '/plugins/spectra', manifest: '/plugins/spectra/plugin.json' },
        { path: '/plugins/booking', manifest: '/plugins/booking/plugin.json' },
        { path: '/plugins/optinmonster', manifest: '/plugins/optinmonster/plugin.json' },
        { path: '/plugins/ivory-search', manifest: '/plugins/ivory-search/plugin.json' },
        { path: '/plugins/wordfence', manifest: '/plugins/wordfence/plugin.json' },
        { path: '/plugins/jetpack', manifest: '/plugins/jetpack/plugin.json' },
        { path: '/plugins/cookieyes', manifest: '/plugins/cookieyes/plugin.json' },
        { path: '/plugins/updraftplus', manifest: '/plugins/updraftplus/plugin.json' }
    ];

    // Register all plugins
    for (const { path, manifest } of pluginRegistry) {
        try {
            const response = await fetch(manifest);
            if (response.ok) {
                const manifestData = await response.json();
                await window.PluginManager.register(path, manifestData);
            }
        } catch (e) {
            // Plugin not found - skip silently
            console.log(`Plugin not found: ${path}`);
        }
    }

    // Auto-load active plugins
    await window.PluginManager.autoLoad();

    console.log(`✅ Plugin System Ready - ${window.PluginManager.getActive().length} active plugins`);
})();

export default PluginLoader;
