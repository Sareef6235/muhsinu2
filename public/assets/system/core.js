/**
 * MHMV System Core
 * Acts as the kernel for the "WordPress-like" JS ecosystem.
 * Handles Plugin loading, Event Bus, and Global State.
 */

class SystemCore {
    constructor() {
        this.plugins = new Map();
        this.state = observable({
            user: null,
            lang: 'en',
            theme: 'dark',
            loading: false
        });
        this.events = new EventTarget();

        // Expose Global
        window.MHMV = this;
        console.log('🚀 MHMV System Core Initialized');
    }

    /**
     * Register a Plugin
     * @param {String} name - Plugin Name
     * @param {Object} instance - The initialized plugin class
     */
    registerPlugin(name, instance) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin ${name} is already registered.`);
            return;
        }
        this.plugins.set(name, instance);
        console.log(`✅ Plugin Loaded: ${name}`);

        // Auto-run init if available
        if (typeof instance.init === 'function') {
            try {
                instance.init(this);
            } catch (e) {
                console.error(`❌ Plugin Init Failed: ${name}`, e);
            }
        }
    }

    /**
     * Get a registered plugin
     * @param {String} name 
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }

    /**
     * Dispatch System Event
     * @param {String} name 
     * @param {Object} detail 
     */
    dispatch(name, detail = {}) {
        const event = new CustomEvent(name, { detail });
        this.events.dispatchEvent(event);
        // Also dispatch to window for external scripts
        window.dispatchEvent(new CustomEvent(`mhmv:${name}`, { detail }));
    }

    /**
     * Listen to System Event
     * @param {String} name 
     * @param {Function} callback 
     */
    on(name, callback) {
        this.events.addEventListener(name, (e) => callback(e.detail));
    }

    /**
     * Notification Toast (Global UI)
     */
    notify(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `sys-toast ${type}`;
        toast.innerText = message;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '20px', right: '20px',
            background: type === 'error' ? '#ff4444' : type === 'success' ? '#00C851' : '#33b5e5',
            color: '#fff', padding: '12px 24px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: '9999',
            animation: 'fadeInUp 0.3s ease'
        });
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Simple Proxy for reactive state
function observable(obj) {
    return new Proxy(obj, {
        set(target, prop, value) {
            target[prop] = value;
            window.MHMV?.dispatch('stateChanged', { prop, value });
            return true;
        }
    });
}

// Initialize immediately
new SystemCore();
