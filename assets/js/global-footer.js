/**
 * ============================================
 * GLOBAL FOOTER - JavaScript
 * Dynamic footer injection and functionality
 * ============================================
 */

class GlobalFooter {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'global-footer',
            brandName: config.brandName || 'Your Brand',
            brandLogo: config.brandLogo || null,
            description: config.description || 'Your company description goes here.',
            socialLinks: config.socialLinks || [],
            columns: config.columns || [],
            contactInfo: config.contactInfo || {},
            bottomLinks: config.bottomLinks || [],
            showNewsletter: config.showNewsletter || false,
            copyrightText: config.copyrightText || `© ${new Date().getFullYear()} All rights reserved.`,
            ...config
        };

        this.init();
    }

    /**
     * Initialize footer
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * Render complete footer HTML
     */
    render() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`Footer container #${this.config.containerId} not found`);
            return;
        }

        container.innerHTML = `
      <footer class="global-footer" role="contentinfo">
        <div class="footer-container">
          <!-- Footer Grid -->
          <div class="footer-grid">
            <!-- Brand Column -->
            <div class="footer-brand">
              <div class="footer-logo">
                ${this.config.brandLogo ? `<img src="${this.config.brandLogo}" alt="${this.config.brandName}" class="footer-logo-icon">` : ''}
                <span>${this.config.brandName}</span>
              </div>
              <p class="footer-description">${this.config.description}</p>
              
              ${this.renderSocialLinks()}
              ${this.config.showNewsletter ? this.renderNewsletter() : ''}
            </div>

            <!-- Menu Columns -->
            ${this.renderColumns()}
          </div>

          <!-- Footer Bottom -->
          <div class="footer-bottom">
            <div class="footer-copyright">${this.config.copyrightText}</div>
            ${this.renderBottomLinks()}
          </div>
        </div>
      </footer>
    `;
    }

    /**
     * Render social media links
     */
    renderSocialLinks() {
        if (!this.config.socialLinks || this.config.socialLinks.length === 0) {
            return '';
        }

        return `
      <div class="footer-social">
        ${this.config.socialLinks.map(link => `
          <a href="${link.url}" 
             class="footer-social-link" 
             aria-label="${link.name}"
             target="_blank"
             rel="noopener noreferrer">
            <i class="${link.icon}"></i>
          </a>
        `).join('')}
      </div>
    `;
    }

    /**
     * Render newsletter subscription form
     */
    renderNewsletter() {
        return `
      <div class="footer-newsletter">
        <form class="footer-newsletter-form" id="newsletter-form">
          <input 
            type="email" 
            class="footer-newsletter-input" 
            placeholder="Enter your email"
            required
            aria-label="Email for newsletter">
          <button type="submit" class="footer-newsletter-button">
            Subscribe
          </button>
        </form>
      </div>
    `;
    }

    /**
     * Render footer columns
     */
    renderColumns() {
        return this.config.columns.map(column => `
      <div class="footer-column">
        <h3 class="footer-column-title">${column.title}</h3>
        ${column.type === 'menu' ? this.renderMenu(column.items) : ''}
        ${column.type === 'contact' ? this.renderContact(column.items) : ''}
      </div>
    `).join('');
    }

    /**
     * Render menu items
     */
    renderMenu(items) {
        return `
      <ul class="footer-menu">
        ${items.map(item => `
          <li class="footer-menu-item">
            <a href="${item.href}" class="footer-menu-link">
              ${item.icon ? `<i class="${item.icon}"></i>` : ''}
              <span>${item.label}</span>
              ${item.badge ? `<span class="footer-badge">${item.badge}</span>` : ''}
            </a>
          </li>
        `).join('')}
      </ul>
    `;
    }

    /**
     * Render contact information
     */
    renderContact(items) {
        return items.map(item => `
      <div class="footer-contact-item">
        <i class="${item.icon}"></i>
        <div>
          ${item.link ? `<a href="${item.link}">${item.text}</a>` : item.text}
        </div>
      </div>
    `).join('');
    }

    /**
     * Render bottom links
     */
    renderBottomLinks() {
        if (!this.config.bottomLinks || this.config.bottomLinks.length === 0) {
            return '';
        }

        return `
      <ul class="footer-bottom-links">
        ${this.config.bottomLinks.map(link => `
          <li>
            <a href="${link.href}" class="footer-bottom-link">${link.label}</a>
          </li>
        `).join('')}
      </ul>
    `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Newsletter form submission
        if (this.config.showNewsletter) {
            const form = document.getElementById('newsletter-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
            }
        }
    }

    /**
     * Handle newsletter form submission
     */
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const input = e.target.querySelector('input[type="email"]');
        const email = input.value;

        // Call custom handler if provided
        if (this.config.onNewsletterSubmit) {
            this.config.onNewsletterSubmit(email);
        } else {
            // Default behavior
            alert(`Thank you for subscribing with: ${email}`);
            input.value = '';
        }
    }

    /**
     * Update footer configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.render();
        this.bindEvents();
    }

    /**
     * Destroy footer
     */
    destroy() {
        const container = document.getElementById(this.config.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalFooter;
}

// Make available globally
window.GlobalFooter = GlobalFooter;
