/**
 * Gallery & Menu Admin Logic
 * Handles media uploads and site-wide navigation settings
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check & Panel Visibility
    const checkAdmin = () => {
        const isAdmin = AdminAuth.isAuthenticated();
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
            // If it's the admin panel button, it should be flex if it has contents
            if (el.id === 'btn-admin-panel' && isAdmin) el.style.display = 'flex';
        });
        return isAdmin;
    };

    if (checkAdmin()) {
        renderUploadPanel();
        renderMenuSettings();
        setupAdminTriggers();
    }

    // 2. Render Media Upload Panel
    function renderUploadPanel() {
        const panel = document.getElementById('admin-upload-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="admin-card glass-panel" style="padding: 30px; border-radius: 20px; border: 1px solid var(--secondary-color);">
                <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="ph-bold ph-cloud-arrow-up"></i> Admin Media Upload
                </h2>
                <form id="upload-form" class="admin-form">
                    <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>Media Title</label>
                            <input type="text" id="media-title" placeholder="Enter title..." required>
                        </div>
                        <div class="form-group">
                            <label>Media Type</label>
                            <select id="media-type">
                                <option value="photo">Photo</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Description</label>
                            <textarea id="media-desc" placeholder="Enter description..." rows="2"></textarea>
                        </div>
                        <div class="form-group">
                            <label id="file-label">Select Photo</label>
                            <input type="file" id="media-file" accept="image/*" required>
                        </div>
                        <div class="form-group" id="poster-group" style="display: none;">
                            <label>Video Poster (Thumbnail)</label>
                            <input type="file" id="media-poster" accept="image/*">
                        </div>
                    </div>
                    
                    <div id="upload-preview" style="margin-top: 20px; display: none;">
                        <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 10px;">Preview:</p>
                        <img src="" id="img-preview" style="max-height: 200px; border-radius: 10px; border: 1px solid var(--glass-border);">
                    </div>

                    <div style="margin-top: 30px; display: flex; gap: 15px;">
                        <button type="submit" class="btn-save">
                            <i class="ph-bold ph-check"></i> Save to Gallery
                        </button>
                        <button type="reset" class="btn-cancel">Reset</button>
                    </div>
                </form>
            </div>
        `;

        // Handle file preview and type toggle
        const typeSelect = document.getElementById('media-type');
        const fileInput = document.getElementById('media-file');
        const posterGroup = document.getElementById('poster-group');
        const fileLabel = document.getElementById('file-label');
        const preview = document.getElementById('upload-preview');
        const imgPreview = document.getElementById('img-preview');

        typeSelect.onchange = () => {
            const isVideo = typeSelect.value === 'video';
            fileInput.accept = isVideo ? 'video/*' : 'image/*';
            fileLabel.innerText = isVideo ? 'Select Video' : 'Select Photo';
            posterGroup.style.display = isVideo ? 'block' : 'none';
        };

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && typeSelect.value === 'photo') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgPreview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        };

        // Handle Submission
        document.getElementById('upload-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="ph-bold ph-circle-notch ph-spin"></i> Processing...';
            btn.disabled = true;

            const mediaFile = document.getElementById('media-file').files[0];
            const posterFile = document.getElementById('media-poster').files[0];

            const item = {
                title: document.getElementById('media-title').value,
                type: document.getElementById('media-type').value,
                desc: document.getElementById('media-desc').value,
                timestamp: Date.now()
            };

            // Convert to Base64 (for local simulation)
            item.src = await fileToBase64(mediaFile);
            if (posterFile) item.poster = await fileToBase64(posterFile);
            else if (item.type === 'video') item.poster = 'assets/gallery/1920x1080-1.jpg'; // fallback

            await window.galleryDB.addMedia(item);

            alert('✅ Media uploaded successfully!');
            location.reload(); // Refresh to show new item and keep animation order
        };
    }

    // 3. Render Menu Settings Panel
    function renderMenuSettings() {
        const panel = document.getElementById('admin-menu-settings');
        if (!panel) return;

        panel.innerHTML = `
            <div class="admin-card glass-panel" style="padding: 30px; border-radius: 20px; border: 1px solid var(--primary-color); margin-top: 30px;">
                <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="ph-bold ph-list-numbers"></i> Menu Management
                </h2>
                <div id="menu-items-list" class="menu-editor-grid">
                    <!-- Loaded via logic -->
                </div>
                <div style="margin-top: 30px;">
                    <button id="save-menu-settings" class="btn-save">
                        <i class="ph-bold ph-floppy-disk"></i> Save Changes
                    </button>
                </div>
            </div>
        `;

        loadCurrentMenuSettings();
    }

    async function loadCurrentMenuSettings() {
        const navLinks = document.querySelectorAll('.nav-links > li');
        const container = document.getElementById('menu-items-list');
        if (!container) return;

        container.innerHTML = '';

        // Get saved settings or use defaults
        const savedSettings = await window.galleryDB.getSetting('menu_config') || {};

        navLinks.forEach((li, idx) => {
            const link = li.querySelector('a');
            if (!link) return;

            const label = link.innerText.trim() || 'Menu Item ' + (idx + 1);
            const id = 'menu-' + idx;
            const isVisible = savedSettings[id]?.visible !== false;

            const row = document.createElement('div');
            row.className = 'menu-setting-row';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '10px';
            row.style.borderBottom = '1px solid var(--glass-border)';

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="ph-bold ph-dots-six-vertical" style="color: #444; cursor: grab;"></i>
                    <span style="font-weight: 600;">${label}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <label class="switch">
                        <input type="checkbox" class="menu-visibility" data-item-id="${id}" ${isVisible ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <input type="text" class="menu-label-input" data-item-id="${id}" value="${label}" style="width: 120px; font-size: 0.8rem; padding: 5px;">
                </div>
            `;
            container.appendChild(row);
        });

        document.getElementById('save-menu-settings').onclick = async () => {
            const config = {};
            document.querySelectorAll('.menu-visibility').forEach(cb => {
                const id = cb.dataset.itemId;
                const label = document.querySelector(`.menu-label-input[data-item-id="${id}"]`).value;
                config[id] = { visible: cb.checked, label };
            });

            try {
                if (window.galleryDB) {
                    await window.galleryDB.saveSetting('menu_config', config);
                    // Instead of alert and full reload, we can just refresh the menu rows
                    // and potentially show a toast notification if a toast system exists.
                    // For now, we'll just refresh the rows.
                    alert('✅ Menu settings saved!'); // Keeping alert for now as no toast system is defined
                    loadCurrentMenuSettings(); // Refresh the menu rows
                }
            } catch (e) {
                console.error("Save menu config error:", e);
                alert('❌ Failed to save menu settings.'); // Keeping alert for now
            }
        };
    }

    // Helper: File to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function setupAdminTriggers() {
        // Toggle Admin Panel
        const btn = document.getElementById('btn-admin-panel');
        if (btn) {
            btn.onclick = () => {
                const upload = document.getElementById('admin-upload-panel');
                const menu = document.getElementById('admin-menu-settings');
                const isHidden = upload.style.display === 'none';
                upload.style.display = isHidden ? 'block' : 'none';
                menu.style.display = isHidden ? 'block' : 'none';

                if (isHidden) {
                    upload.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }
    }
});

// Styles for the admin forms
const style = document.createElement('style');
style.innerHTML = `
    .admin-form .form-group { margin-bottom: 15px; }
    .admin-form label { display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px; font-weight: 600; }
    .admin-form input, .admin-form select, .admin-form textarea {
        width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
        padding: 12px; border-radius: 10px; color: #fff; font-family: inherit;
    }
    .btn-save {
        background: var(--primary-gradient); color: #000; border: none; padding: 12px 25px;
        border-radius: 30px; font-weight: 700; cursor: pointer; transition: 0.3s;
        display: flex; align-items: center; gap: 8px;
    }
    .btn-save:hover { box-shadow: 0 0 20px rgba(0, 243, 255, 0.4); transform: translateY(-2px); }
    .btn-cancel { background: none; border: 1px solid var(--glass-border); color: #fff; padding: 12px 25px; border-radius: 30px; cursor: pointer; }

    /* Toggle Switch */
    .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary-color); }
    input:checked + .slider:before { transform: translateX(20px); }
`;
document.head.appendChild(style);
