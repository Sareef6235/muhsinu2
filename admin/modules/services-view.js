/**
 * Services Management Module
 * Handles List, Add, Edit, Delete for Services
 */

import { db } from '../../assets/js/system/store.js';
import { Utils } from '../../assets/js/system/utils.js';
import { MediaOptimizer } from '../../assets/js/system/media-optimizer.js';

export const ServicesView = {
    render(container) {
        container.innerHTML = `
            <div class="module-header" style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <h2>Services Management</h2>
                <button class="btn" id="btn-add-service">+ Add New Service</button>
            </div>
            <div id="services-list" class="grid-list">Loading...</div>
            
            <!-- Modal Container (Hidden by default) -->
            <div id="service-modal" class="modal hidden" style="position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:100;">
                <div class="modal-content" style="background:white; padding:2rem; width:500px; max-width:90%; border-radius:0.5rem;">
                    <h3 id="modal-title">Add Service</h3>
                    <form id="service-form" style="display:flex; flex-direction:column; gap:1rem;">
                        <input type="hidden" id="service-id">
                        
                        <div>
                            <label>Title</label>
                            <input type="text" id="service-title" required style="width:100%; padding:0.5rem;">
                        </div>

                        <div>
                            <label>Description</label>
                            <textarea id="service-desc" rows="3" required style="width:100%; padding:0.5rem;"></textarea>
                        </div>

                        <div>
                            <label>Category</label>
                            <select id="service-category" style="width:100%; padding:0.5rem;">
                                <option value="Creative">Creative</option>
                                <option value="Tech">Tech</option>
                                <option value="Business">Business</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>

                        <div>
                            <label>Icon / Image</label>
                            <input type="file" id="service-image" accept="image/*">
                            <div id="image-preview" style="margin-top:0.5rem; max-width:100px;"></div>
                            <input type="hidden" id="service-image-data">
                        </div>

                        <div style="display:flex; gap:1rem; margin-top:1rem;">
                            <button type="submit" class="btn">Save Service</button>
                            <button type="button" class="btn" style="background:#64748b;" id="btn-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.attachEvents(container);
        this.renderList();
    },

    attachEvents(container) {
        // Modal Toggles
        const modal = container.querySelector('#service-modal');
        const form = container.querySelector('#service-form');

        container.querySelector('#btn-add-service').onclick = () => {
            form.reset();
            document.getElementById('service-id').value = '';
            document.getElementById('modal-title').textContent = 'Add Service';
            document.getElementById('image-preview').innerHTML = '';
            modal.classList.remove('hidden'); // Uses global hidden class logic or inline style
            modal.style.display = 'flex';
        };

        container.querySelector('#btn-cancel').onclick = () => {
            modal.style.display = 'none';
        };

        // Image Handling
        container.querySelector('#service-image').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await MediaOptimizer.processImage(file);
                // Save Base64 to hidden input
                document.getElementById('service-image-data').value = result.url;

                // Preview
                document.getElementById('image-preview').innerHTML = `<img src="${result.url}" style="width:100px; height:auto; border-radius:4px;">`;

                if (result.compressed) {
                    alert(`Image compressed from ${(file.size / 1024).toFixed(1)}KB to ${(result.url.length / 1024 * 0.75).toFixed(1)}KB`); // Approx base64 size
                }
            } catch (err) {
                alert(err.message);
            }
        };

        // Form Submit
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveService();
            modal.style.display = 'none';
        };
    },

    renderList() {
        const list = document.getElementById('services-list');
        const services = db.get('services');

        if (services.length === 0) {
            list.innerHTML = '<p>No services found.</p>';
            return;
        }

        list.innerHTML = services.map(s => `
            <div class="service-card" style="background:white; padding:1rem; margin-bottom:0.5rem; border-radius:0.5rem; border:1px solid #e2e8f0; display:flex; align-items:center; gap:1rem;">
                <div style="width:50px; height:50px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
                    ${s.icon && s.icon.startsWith('data:')
                ? `<img src="${s.icon}" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:1.5rem;">🔹</span>`} 
                </div>
                <div style="flex:1;">
                    <h4 style="margin:0;">${s.title}</h4>
                    <p style="margin:0; font-size:0.85rem; color:#64748b;">${s.category}</p>
                </div>
                <div>
                     <button onclick="window.editService('${s.id}')" class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem;">Edit</button>
                     <button onclick="window.deleteService('${s.id}')" class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem; background:#fee2e2; color:#ef4444;">Del</button>
                </div>
            </div>
        `).join('');

        // Bind global handlers for the inline onclicks
        window.deleteService = (id) => {
            if (confirm('Are you sure?')) {
                db.delete('services', id);
                this.renderList();
            }
        };

        window.editService = (id) => {
            const s = db.getById('services', id);
            if (!s) return;

            document.getElementById('service-id').value = s.id;
            document.getElementById('service-title').value = s.title;
            document.getElementById('service-desc').value = s.description;
            document.getElementById('service-category').value = s.category;

            // Handle Image
            if (s.icon && s.icon.startsWith('data:')) {
                document.getElementById('service-image-data').value = s.icon;
                document.getElementById('image-preview').innerHTML = `<img src="${s.icon}" style="width:100px;">`;
            }

            document.getElementById('modal-title').textContent = 'Edit Service';
            document.getElementById('service-modal').style.display = 'flex';
        };
    },

    saveService() {
        const id = document.getElementById('service-id').value;
        const data = {
            title: document.getElementById('service-title').value,
            description: document.getElementById('service-desc').value,
            category: document.getElementById('service-category').value,
            icon: document.getElementById('service-image-data').value || 'palette' // Default icon fallback
        };

        if (id) {
            db.update('services', id, data);
        } else {
            data.id = Utils.generateId('svc');
            data.active = true;
            db.add('services', data);
        }

        this.renderList();
    }
};
