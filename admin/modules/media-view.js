/**
 * Media / Gallery Manager
 * Manage Gallery Images
 */

import { db } from '../../assets/js/system/store.js';
import { Utils } from '../../assets/js/system/utils.js';
import { MediaOptimizer } from '../../assets/js/system/media-optimizer.js';

export const MediaView = {
    render(container) {
        container.innerHTML = `
            <div class="module-header" style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <h2>Media Gallery</h2>
                <label class="btn" style="cursor:pointer;">
                    + Upload Image
                    <input type="file" id="gal-upload" accept="image/*" style="display:none;">
                </label>
            </div>
            
            <p id="upload-status" style="color:blue; display:none;">Compressing & Processing...</p>

            <div id="gallery-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:1rem;">
                Loading...
            </div>
        `;

        this.attachEvents(container);
        this.renderGallery();
    },

    attachEvents(container) {
        container.querySelector('#gal-upload').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const status = document.getElementById('upload-status');
            status.style.display = 'block';

            try {
                const res = await MediaOptimizer.processImage(file);

                // Add to Gallery Collection
                const item = {
                    id: Utils.generateId('img'),
                    url: res.url,
                    name: file.name,
                    date: new Date().toISOString()
                };

                // Check if 'gallery' collection exists, if not assume empty array logic in store will handle it?
                // Store.js init loads keys from DATA_SOURCES. 'gallery' is NOT in DATA_SOURCES.
                // We need to handle dynamic collections or add it.
                // Dynamic collection adding:
                let gallery = db.get('gallery');
                if (!Array.isArray(gallery)) gallery = [];

                gallery.unshift(item); // Add to top
                db.save('gallery', gallery);

                this.renderGallery();
                status.style.display = 'none';

                if (res.compressed) {
                    alert('Image compressed and added!');
                }

            } catch (err) {
                alert('Upload failed: ' + err.message);
                status.style.display = 'none';
            }
        };
    },

    renderGallery() {
        const list = document.getElementById('gallery-grid');
        let gallery = db.get('gallery');
        if (!Array.isArray(gallery)) gallery = [];

        if (gallery.length === 0) {
            list.innerHTML = '<p>No images in gallery.</p>';
            return;
        }

        list.innerHTML = gallery.map(img => `
            <div style="position:relative; border-radius:0.5rem; overflow:hidden; aspect-ratio:1;">
                <img src="${img.url}" style="width:100%; height:100%; object-fit:cover;">
                <button onclick="window.deleteImage('${img.id}')" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">&times;</button>
            </div>
        `).join('');

        window.deleteImage = (id) => {
            if (confirm('Delete this image?')) {
                let g = db.get('gallery');
                g = g.filter(i => i.id !== id);
                db.save('gallery', g);
                this.renderGallery();
            }
        };
    }
};
