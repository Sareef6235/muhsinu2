/**
 * Reusable Site Header
 * Wraps the NavigationSystem in a Web Component.
 */

import { NavigationSystem } from '../site-nav.js';

export class SiteHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // 1. Create the Container
        // We use the ID "main-header" because NavigationSystem expects it and CSS targets it.
        this.innerHTML = `<header class="site-header" id="main-header"></header>`;

        // 2. Delegate Rendering to NavigationSystem
        const headerEl = this.querySelector('#main-header');
        NavigationSystem.render(headerEl);
    }
}

customElements.define('site-header', SiteHeader);
