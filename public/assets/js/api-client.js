/**
 * api-client.js - Centralized API Service for ProPlatform SaaS
 */
window.ApiClient = {
    baseUrl: '/api',
    token: localStorage.getItem('saas_token'),

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error(data.error || 'Server Error');
            }

            return data;
        } catch (err) {
            console.error('[API Error]', err);
            throw err;
        }
    },

    async login(email, password, tenantId) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, tenantId })
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('saas_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout() {
        this.token = null;
        localStorage.removeItem('saas_token');
        localStorage.removeItem('user');
        window.location.reload();
    },

    getSites() {
        return this.request('/sites');
    },

    applyWhiteLabel() {
        return this.request('/features/white-label', { method: 'POST' });
    }
};
