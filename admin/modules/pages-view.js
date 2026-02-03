/**
 * Pages / Content Management
 * Handles generic site content (About Us, Notices, etc.)
 * Uses 'settings' or a new 'content' collection
 */

import { db } from '../../assets/js/system/store.js';

export const PagesView = {
    render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2>Site Content & Sections</h2>
                <p>Manage dynamic text sections across the site.</p>
            </div>
            
            <div id="content-editor" style="max-width:800px; background:white; padding:2rem; border-radius:0.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <form id="pages-form">
                    
                    <div style="margin-bottom:2rem;">
                        <h3>About Section</h3>
                        <label style="display:block; margin-bottom:0.5rem;">Main Title</label>
                        <input type="text" id="cnt-about-title" style="width:100%; padding:0.5rem; margin-bottom:1rem; border:1px solid #cbd5e1; border-radius:0.25rem;">
                        
                        <label style="display:block; margin-bottom:0.5rem;">Description</label>
                        <textarea id="cnt-about-desc" rows="5" style="width:100%; padding:0.5rem; border:1px solid #cbd5e1; border-radius:0.25rem;"></textarea>
                    </div>

                    <div style="margin-bottom:2rem;">
                        <h3>Notices / News Ticker</h3>
                        <label style="display:block; margin-bottom:0.5rem;">Latest Announcement</label>
                        <input type="text" id="cnt-notice" style="width:100%; padding:0.5rem; border:1px solid #cbd5e1; border-radius:0.25rem;">
                    </div>

                     <div style="margin-bottom:2rem;">
                        <h3>Footer Info</h3>
                        <label style="display:block; margin-bottom:0.5rem;">Email</label>
                        <input type="text" id="cnt-email" style="width:100%; padding:0.5rem; margin-bottom:1rem; border:1px solid #cbd5e1; border-radius:0.25rem;">
                        
                         <label style="display:block; margin-bottom:0.5rem;">Phone</label>
                        <input type="text" id="cnt-phone" style="width:100%; padding:0.5rem; border:1px solid #cbd5e1; border-radius:0.25rem;">
                    </div>

                    <button type="submit" class="btn" style="padding:1rem 2rem;">Save Content</button>
                    <span id="save-msg" style="margin-left:1rem; color:green; display:none;">Saved!</span>
                </form>
            </div>
        `;

        this.attachEvents(container);
        this.loadData();
    },

    attachEvents(container) {
        container.querySelector('#pages-form').onsubmit = (e) => {
            e.preventDefault();
            this.saveData();
        };
    },

    loadData() {
        // We hijack 'settings' collection or create 'content' collection
        // Let's use 'settings' for simplicity as per plan
        const settings = db.get('settings') || {};

        document.getElementById('cnt-about-title').value = settings.aboutTitle || '';
        document.getElementById('cnt-about-desc').value = settings.aboutDesc || '';
        document.getElementById('cnt-notice').value = settings.notice || '';
        document.getElementById('cnt-email').value = settings.email || '';
        document.getElementById('cnt-phone').value = settings.phone || '';
    },

    saveData() {
        const data = {
            aboutTitle: document.getElementById('cnt-about-title').value,
            aboutDesc: document.getElementById('cnt-about-desc').value,
            notice: document.getElementById('cnt-notice').value,
            email: document.getElementById('cnt-email').value,
            phone: document.getElementById('cnt-phone').value,
            // Preserve other settings if any, but since db.get returns object/array...
            // Wait, db.get('settings') returns the object directly if we structured it that way?
            // In store.js, I initialized settings.json as OBJECT. 
            // BUT db.get() in store.js returns THIS.CACHE[key].
            // If settings.json is object, it returns object.
        };

        // Merge with existing
        const existing = db.get('settings') || {};
        const merged = { ...existing, ...data };

        // Update Store
        db.save('settings', merged);

        const msg = document.getElementById('save-msg');
        msg.style.display = 'inline';
        setTimeout(() => msg.style.display = 'none', 2000);
    }
};
