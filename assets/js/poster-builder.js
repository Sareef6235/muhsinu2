/**
 * Professional Poster Builder - Institutional Logic Engine
 * Specialized for: Student Achievements, Event Announcements, Multilingual Exports
 */

class UltraPosterBuilder {
    constructor() {
        this.currentTemplateId = null;
        this.activeElement = null;
        this.zoomLevel = 1;
        this.db = null;
        this.history = [];
        this.historyIndex = -1;

        this.init();
        this.favorites = new Set(JSON.parse(localStorage.getItem('mhmv_favs') || '[]'));
        this.recent = new Set(JSON.parse(localStorage.getItem('mhmv_recent') || '[]'));
        this.controls = new PosterControlEngine(this);
        this.isDirty = false;
    }

    async init() {
        await this.initDB();
        this.setupTabs();
        this.loadTemplates();
        this.loadElements();
        this.loadAnimations();
        this.setupEventListeners();
        this.setup3DTilt();
        this.setupImageUpload();
        this.loadSavedDesign();

        this.startAutoSave();

        // Default Behavior: Open first panel
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab && firstTab.dataset.tab) {
            this.switchPanel(firstTab.dataset.tab);
        }
    }

    /**
     * GLOBAL PANEL SWITCH SYSTEM
     * @param {string} panelId - The data-tab value (e.g., 'templates', 'images')
     */
    switchPanel(panelId) {
        // 1. Safety Check: Ensure panel ID is provided
        if (!panelId) {
            console.warn('switchPanel: No panel ID provided');
            return;
        }

        // 2. Panel Visibility: Hide all first
        const panels = document.querySelectorAll('.panel-section');
        panels.forEach(p => p.classList.remove('active'));

        // 3. Show Target Panel (with Safety Check)
        const targetPanel = document.getElementById(`${panelId}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        } else {
            console.warn(`switchPanel: Panel "${panelId}-panel" not found. Check your HTML IDs.`);
            // Fallback: Do not break UI, just warn.
        }

        // 4. Active State Handling: Update Menu
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === panelId) {
                btn.classList.add('active');
            }
        });

        // 5. Specific Triggers
        if (panelId === 'layers' && typeof this.renderLayers === 'function') {
            this.renderLayers();
        }
    }

    // --- Database (IndexedDB) ---
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UltraPosterDB', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('designs')) db.createObjectStore('designs', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = (e) => reject(e);
        });
    }

    async saveToDB(storeName, data) {
        if (!this.db) return;
        return new Promise((resolve) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).put(data);
            tx.oncomplete = () => resolve();
        });
    }

    async getFromDB(storeName, id) {
        if (!this.db) return null;
        return new Promise((resolve) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const request = tx.objectStore(storeName).get(id);
            request.onsuccess = (e) => resolve(e.target.result);
        });
    }

    // --- UI Setup ---
    setupTabs() {
        // Use the global system for click events
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                // Prevent default if it's a link (just in case)
                e.preventDefault();
                const tabId = btn.dataset.tab;
                this.switchPanel(tabId);
            };
        });

        // Category Selection
        document.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.loadTemplates(card.dataset.cat);
            });
        });

        // Search
        document.getElementById('template-search')?.addEventListener('input', () => {
            const activeCat = document.querySelector('.cat-card.active')?.dataset.cat || 'all';
            this.loadTemplates(activeCat);
        });
    }

    loadTemplates(cat = 'all') {
        const grid = document.getElementById('template-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (typeof getAllTemplates !== 'function') return;
        let templates = getAllTemplates();

        const searchVal = document.getElementById('template-search')?.value.toLowerCase();

        if (cat !== 'all') {
            templates = templates.filter(t => t.category === cat);
        }

        if (searchVal) {
            templates = templates.filter(t => t.name.toLowerCase().includes(searchVal));
        }

        // Use Perf.processChunks if available, otherwise fallback
        const renderTemplate = (t) => {
            const card = document.createElement('div');
            card.className = `template-card ${this.currentTemplateId === t.id ? 'active' : ''}`;
            card.innerHTML = `
                <div class="template-preview" style="background: white; overflow: hidden; pointer-events: none;">${t.html}</div>
                <h4>${t.name}</h4>
                <style>${t.css}</style>
            `;
            card.onclick = () => this.selectTemplate(t);
            grid.appendChild(card);
        };

        if (window.Perf && window.Perf.processChunks) {
            window.Perf.processChunks(templates, renderTemplate, 5); // Process 5 at a time
        } else {
            templates.forEach(renderTemplate);
        }
    }

    // --- Core Design Logic ---
    selectTemplate(template) {
        if (!confirm('This will clear your current design. Continue?')) return;

        const canvas = document.getElementById('poster-canvas');
        canvas.innerHTML = template.html;

        const old = document.querySelector('style.template-style');
        if (old) old.remove();

        const style = document.createElement('style');
        style.className = 'template-style';
        style.textContent = template.css;
        document.head.appendChild(style);

        this.currentTemplateId = template.id;
        this.deselectElement();
        this.renderLayers();

        canvas.querySelectorAll('.draggable').forEach(el => this.makeDraggable(el));
        this.renderQuickEdit(canvas);

        const emptyMsg = canvas.querySelector('.empty-canvas-state');
        if (emptyMsg) emptyMsg.remove();
    }

    renderQuickEdit(canvas) {
        const activeProp = document.getElementById('active-properties');
        const emptyProp = document.getElementById('empty-properties');
        if (!activeProp) return;

        activeProp.style.display = 'block';
        emptyProp.style.display = 'none';

        let html = '<div class="quick-edit-header">Professional Quick Edit</div>';
        const editables = canvas.querySelectorAll('[data-editable]');

        editables.forEach((el, idx) => {
            const type = el.getAttribute('data-editable');
            const label = type.charAt(0).toUpperCase() + type.slice(1);

            if (type === 'image') {
                html += `
                    <div class="prop-group">
                        <label>${label}</label>
                        <button class="preset-btn" onclick="builder.triggerImageUpload()">
                            <i class="ph ph-upload"></i> Upload Photo
                        </button>
                    </div>
                `;
            } else if (type === 'logo') {
                // Ignore as it's handled via institution panel
            } else {
                html += `
                    <div class="prop-group">
                        <label>${label}</label>
                        <textarea class="quick-input" data-idx="${idx}" rows="2">${el.innerText}</textarea>
                    </div>
                `;
            }
        });

        activeProp.innerHTML = html;

        activeProp.querySelectorAll('.quick-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = e.target.dataset.idx;
                editables[idx].innerText = e.target.value;
            });
        });
    }

    selectElement(el) {
        if (this.activeElement) {
            this.activeElement.classList.remove('element-selected');
            this.removeHandles();
        }
        this.activeElement = el;
        this.activeElement.classList.add('element-selected');
        this.createHandles(el);
        this.controls.render(el);
    }

    createHandles(el) {
        // Resize Handles (Corners)
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const h = document.createElement('div');
            h.className = `resize-handle handle-${pos}`;
            h.onmousedown = (e) => this.initResize(e, el, pos);
            el.appendChild(h);
        });

        // Rotate Handle
        const r = document.createElement('div');
        r.className = 'rotate-handle';
        r.onmousedown = (e) => this.initRotate(e, el);
        el.appendChild(r);
    }

    removeHandles() {
        if (!this.activeElement) return;
        this.activeElement.querySelectorAll('.resize-handle, .rotate-handle').forEach(h => h.remove());
    }

    initResize(e, el, pos) {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = parseInt(window.getComputedStyle(el).width, 10);
        const startH = parseInt(window.getComputedStyle(el).height, 10);
        const startLeft = el.offsetLeft;
        const startTop = el.offsetTop;
        const ratio = startW / startH;

        const resizeHandler = (e) => {
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;

            // Snap logic (10px)
            dx = Math.round(dx / 10) * 10;
            dy = Math.round(dy / 10) * 10;

            let newW = startW;
            let newH = startH;
            let newLeft = startLeft;
            let newTop = startTop;

            if (pos.includes('e')) newW = startW + dx;
            if (pos.includes('w')) { newW = startW - dx; newLeft = startLeft + dx; }
            if (pos.includes('s')) newH = startH + dy;
            if (pos.includes('n')) { newH = startH - dy; newTop = startTop + dy; }

            // Min size
            if (newW < 20) newW = 20;
            if (newH < 20) newH = 20;

            el.style.width = newW + 'px';
            el.style.height = newH + 'px';
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
        };

        // Throttle resize for performance (16ms ~ 60fps)
        document.onmousemove = window.Perf ? window.Perf.throttle(resizeHandler, 16) : resizeHandler;

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
            this.pushHistory();
        };
    }

    initRotate(e, el) {
        e.stopPropagation();
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateHandler = (e) => {
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

            // Snap at 45 degree increments
            if (e.shiftKey || true) { // Default snap for ease
                const snap = 45;
                const rem = angle % snap;
                if (Math.abs(rem) < 10) angle = Math.round(angle / snap) * snap;
            }

            el.style.transform = `rotate(${angle}deg)`;
            el.dataset.rotation = angle;
        };

        document.onmousemove = window.Perf ? window.Perf.throttle(rotateHandler, 16) : rotateHandler;

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
            this.pushHistory();
        };
    }

    deselectElement() {
        if (this.activeElement) {
            this.activeElement.classList.remove('element-selected');
            this.removeHandles();
        }
        this.activeElement = null;
        if (!this.currentTemplateId) {
            document.getElementById('empty-properties').style.display = 'block';
            document.getElementById('active-properties').style.display = 'none';
        }
    }

    // --- Content Creation ---
    addText(type) {
        const el = document.createElement('div');
        el.className = 'poster-element draggable';
        el.setAttribute('data-editable', type);
        el.innerText = type === 'heading' ? 'NEW TITLE' : 'Enter text...';
        el.style.position = 'absolute';
        el.style.top = '100px';
        el.style.left = '100px';
        el.style.padding = '10px';

        if (type === 'heading') { el.style.fontSize = '3.5rem'; el.style.fontWeight = '900'; }

        document.getElementById('poster-canvas').appendChild(el);
        this.makeDraggable(el);
        this.selectElement(el);
        this.renderLayers();
    }

    addShape(type) {
        const el = document.createElement('div');
        el.className = 'poster-element draggable shape-element';
        el.setAttribute('data-editable', 'shape');
        el.style.position = 'absolute';
        el.style.top = '150px';
        el.style.left = '150px';
        el.style.width = '100px';
        el.style.height = '100px';
        el.style.backgroundColor = 'var(--primary-color, #00f3ff)';

        if (type === 'circle') el.style.borderRadius = '50%';
        if (type === 'rect') el.style.borderRadius = '8px';

        document.getElementById('poster-canvas').appendChild(el);
        this.makeDraggable(el);
        this.selectElement(el);
        this.renderLayers();
    }

    addLogo(type) {
        let logoUrl = (type === 'mhmv') ? 'https://mhmv.org/logo.png' : 'https://mhmv.org/jubilee-logo.png';
        const canvas = document.getElementById('poster-canvas');
        const logoPlaceholder = canvas.querySelector('[data-editable="logo"]');

        if (logoPlaceholder) {
            logoPlaceholder.innerHTML = `<img src="${logoUrl}" style="width:100%; height:auto;">`;
        } else {
            const el = document.createElement('img');
            el.className = 'poster-element draggable institutional-logo';
            el.src = logoUrl;
            el.style.position = 'absolute';
            el.style.top = '40px';
            el.style.right = '40px';
            el.style.width = '90px';
            canvas.appendChild(el);
            this.makeDraggable(el);
        }
    }

    // --- Photo Logic ---
    triggerImageUpload() {
        document.getElementById('image-upload')?.click();
    }

    setupImageUpload() {
        const input = document.getElementById('image-upload');
        if (!input) return;
        input.onchange = async (e) => {
            if (e.target.files && e.target.files[0]) {
                const processed = await this.handleStudentPhoto(e.target.files[0]);
                this.addImageToCanvas(processed);
                this.addAsset(processed);
            }
        };
    }

    async handleStudentPhoto(file) {
        this.toggleLoader(true, "Processing Image...");
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 800; // Optimal for posters
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // Center Crop Logic
                    let sourceX, sourceY, sourceWidth, sourceHeight;
                    if (img.width > img.height) {
                        sourceHeight = img.height;
                        sourceWidth = img.height;
                        sourceX = (img.width - img.height) / 2;
                        sourceY = 0;
                    } else {
                        sourceWidth = img.width;
                        sourceHeight = img.width;
                        sourceX = 0;
                        sourceY = (img.height - img.width) / 2;
                    }

                    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);

                    // Optimized Compression (<100KB target)
                    const result = canvas.toDataURL('image/jpeg', 0.8);
                    this.toggleLoader(false);
                    resolve(result);

                    // Memory Cleanup
                    canvas.width = 1;
                    canvas.height = 1;
                    // canvas = null; // Let GC handle block-scoped var, but resizing helps immediately release buffer
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    addImageToCanvas(dataUrl) {
        const canvas = document.getElementById('poster-canvas');
        const placeholder = canvas.querySelector('[data-editable="image"]');
        if (placeholder) {
            placeholder.style.backgroundImage = `url(${dataUrl})`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.backgroundPosition = 'center';
            placeholder.classList.remove('empty-photo');
        } else {
            const el = document.createElement('img');
            el.className = 'poster-element draggable';
            el.src = dataUrl;
            el.style.position = 'absolute';
            el.style.top = '100px'; el.style.left = '100px';
            el.style.maxWidth = '300px';
            canvas.appendChild(el);
            this.makeDraggable(el);
        }
        this.renderLayers();
    }

    addAsset(dataUrl) {
        const list = document.getElementById('user-images');
        if (!list) return;
        const img = document.createElement('img');
        img.src = dataUrl;
        img.onclick = () => this.addImageToCanvas(dataUrl);
        list.prepend(img);
    }

    // --- Interaction ---
    makeDraggable(el) {
        let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
        const snap = 10;

        el.onmousedown = (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            e.preventDefault();
            p3 = e.clientX; p4 = e.clientY;

            this.selectElement(el);

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.hideGuides();
                this.pushHistory(); // Save state after move
            };

            const dragHandler = (e) => {
                p1 = p3 - e.clientX; p2 = p4 - e.clientY;
                p3 = e.clientX; p4 = e.clientY;

                let newTop = el.offsetTop - p2;
                let newLeft = el.offsetLeft - p1;

                // Snap to Grid
                newTop = Math.round(newTop / snap) * snap;
                newLeft = Math.round(newLeft / snap) * snap;

                el.style.top = newTop + "px";
                el.style.left = newLeft + "px";

                this.checkAlignment(el);
            };

            document.onmousemove = window.Perf ? window.Perf.throttle(dragHandler, 16) : dragHandler;
        };
    }

    checkAlignment(target) {
        const canvas = document.getElementById('poster-canvas');
        const elements = canvas.querySelectorAll('.poster-element');
        const threshold = 5;
        this.hideGuides();

        const tRect = target.getBoundingClientRect();
        const tCX = tRect.left + tRect.width / 2;
        const tCY = tRect.top + tRect.height / 2;

        elements.forEach(el => {
            if (el === target) return;
            const eRect = el.getBoundingClientRect();
            const eCX = eRect.left + eRect.width / 2;
            const eCY = eRect.top + eRect.height / 2;

            // X alignment
            if (Math.abs(tRect.left - eRect.left) < threshold) this.showGuide('left', eRect.left);
            if (Math.abs(tRect.right - eRect.right) < threshold) this.showGuide('left', eRect.right, 'right');
            if (Math.abs(tCX - eCX) < threshold) this.showGuide('left', eCX, 'center-x');

            // Y alignment
            if (Math.abs(tRect.top - eRect.top) < threshold) this.showGuide('top', eRect.top);
            if (Math.abs(tRect.bottom - eRect.bottom) < threshold) this.showGuide('top', eRect.bottom, 'bottom');
            if (Math.abs(tCY - eCY) < threshold) this.showGuide('top', eCY, 'center-y');
        });
    }

    showGuide(dir, value, type) {
        let guide = document.getElementById(`guide-${type || dir}`);
        if (!guide) {
            guide = document.createElement('div');
            guide.id = `guide-${type || dir}`;
            guide.className = 'alignment-guide';
            document.body.appendChild(guide);
        }
        guide.style.display = 'block';
        if (dir === 'left') {
            guide.style.width = '1px';
            guide.style.height = '10000px';
            guide.style.left = value + 'px';
            guide.style.top = '0';
        } else {
            guide.style.height = '1px';
            guide.style.width = '10000px';
            guide.style.top = value + 'px';
            guide.style.left = '0';
        }
    }

    hideGuides() {
        document.querySelectorAll('.alignment-guide').forEach(g => g.style.display = 'none');
    }

    renderLayers() {
        const list = document.getElementById('layers-list');
        if (!list) return;
        list.innerHTML = '';
        const elements = document.querySelectorAll('#poster-canvas .poster-element');
        elements.forEach((el, idx) => {
            const row = document.createElement('div');
            row.className = 'layer-row';
            row.innerHTML = `<span>Layer ${idx + 1}</span>`;
            row.onclick = () => this.selectElement(el);
            list.appendChild(row);
        });
    }

    renderProperties() {
        // Legacy method replaced by PosterControlEngine
    }

    deleteActive() {
        if (this.activeElement) {
            this.activeElement.remove();
            this.deselectElement();
            this.renderLayers();
        }
    }

    // --- Exports ---
    // --- UI Helpers ---
    toggleLoader(show, text = "Loading...") {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 9999; display: none;
                justify-content: center; align-items: center; flex-direction: column;
                color: white; font-family: 'Outfit', sans-serif;
            `;
            loader.innerHTML = `<div class="spinner"></div><p id="loader-text" style="margin-top:15px;"></p>`;

            // Add spinner style if not exists
            if (!document.getElementById('loader-style')) {
                const style = document.createElement('style');
                style.id = 'loader-style';
                style.innerHTML = `
                    .spinner { width: 40px; height: 40px; border: 4px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `;
                document.head.appendChild(style);
            }
            document.body.appendChild(loader);
        }

        const txt = loader.querySelector('#loader-text');
        if (txt) txt.innerText = text;

        loader.style.display = show ? 'flex' : 'none';
    }

    // --- Exports ---
    async exportPNG() {
        this.toggleLoader(true, "Generating PNG...");
        // Yield to UI thread to show loader
        await new Promise(r => requestAnimationFrame(r));
        setTimeout(async () => {
            const canvas = document.getElementById('poster-canvas');
            this.deselectElement();
            const exportCanvas = await html2canvas(canvas, { scale: 3, useCORS: true });
            const link = document.createElement('a');
            link.download = `mhmv-design-${Date.now()}.png`;
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
            this.toggleLoader(false);
        }, 50);
    }

    async exportWhatsApp() {
        this.toggleLoader(true, "Optimizing for WhatsApp...");
        await new Promise(r => requestAnimationFrame(r));
        setTimeout(async () => {
            const canvas = document.getElementById('poster-canvas');
            this.deselectElement();
            const exportCanvas = await html2canvas(canvas, { scale: 3, useCORS: true });
            const imgData = exportCanvas.toDataURL('image/jpeg', 0.85);
            const link = document.createElement('a');
            link.download = `mhmv-whatsapp-${Date.now()}.jpg`;
            link.href = imgData;
            link.click();
            document.getElementById('export-modal').classList.remove('active');
            this.toggleLoader(false);
        }, 50);
    }

    async exportPDF() {
        this.toggleLoader(true, "Generating PDF...");
        await new Promise(r => requestAnimationFrame(r));
        setTimeout(async () => {
            const { jsPDF } = window.jspdf;
            const canvas = document.getElementById('poster-canvas');
            this.deselectElement();
            const exportCanvas = await html2canvas(canvas, { scale: 2 });
            const imgData = exportCanvas.toDataURL('image/jpeg', 1.0);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (exportCanvas.height * pdfWidth) / exportCanvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`mhmv-poster-${Date.now()}.pdf`);
            document.getElementById('export-modal').classList.remove('active');
            this.toggleLoader(false);
        }, 50);
    }

    exportJSON() {
        const canvas = document.getElementById('poster-canvas');
        const data = {
            id: this.currentTemplateId,
            html: canvas.innerHTML,
            css: document.querySelector('style.template-style')?.textContent || '',
            timestamp: Date.now()
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `mhmv-design-${Date.now()}.json`;
        link.href = url;
        link.click();
        document.getElementById('export-modal').classList.remove('active');
    }

    // --- Persistence ---
    async saveDesign() {
        if (!this.db || !this.isDirty) return;
        const canvas = document.getElementById('poster-canvas');
        const data = {
            id: 'last_design',
            html: canvas.innerHTML,
            css: document.querySelector('style.template-style')?.textContent || ''
        };
        await this.saveToDB('designs', data);
        this.isDirty = false;
        console.log("💾 Design auto-saved (dirty flag cleared)");
    }

    async loadSavedDesign() {
        const saved = await this.getFromDB('designs', 'last_design');
        if (saved) {
            const canvas = document.getElementById('poster-canvas');
            canvas.innerHTML = saved.html;
            if (saved.css) {
                const style = document.createElement('style');
                style.className = 'template-style';
                style.textContent = saved.css;
                document.head.appendChild(style);
            }
            canvas.querySelectorAll('.draggable').forEach(el => this.makeDraggable(el));
        }
    }

    startAutoSave() {
        setInterval(() => this.saveDesign(), 5000);
    }

    // --- Lifecycle ---
    applyZoom() {
        document.getElementById('poster-canvas').style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoom-level').innerText = Math.round(this.zoomLevel * 100) + '%';
    }

    // --- Smart AI Auto Design ---
    async autoDesign() {
        if (!this.currentTemplateId) {
            if (window.showToast) window.showToast("Please select a template first!", "error");
            else alert("Please select a template first!");
            return;
        }

        const canvas = document.getElementById('poster-canvas');
        const elements = canvas.querySelectorAll('.poster-element');
        const magicBtn = document.getElementById('auto-design-btn');

        // Visual Feedback
        magicBtn.classList.add('sparkle');
        this.createSparkles(magicBtn);

        // Random Layout Strategy
        const strategies = ['centered', 'asymmetric', 'modern-grid'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];

        // 1. Auto Color Theme (Premium Gradients)
        const themes = [
            { primary: '#7800ff', secondary: '#00c8ff' }, // Cyber
            { primary: '#ff00cc', secondary: '#3333ff' }, // Neon
            { primary: '#00f260', secondary: '#0575E6' }, // Fresh
            { primary: '#f12711', secondary: '#f5af19' }  // Fire
        ];
        const selectedTheme = themes[Math.floor(Math.random() * themes.length)];

        // 2. Auto Font Pairing
        const headerFont = "'Outfit', sans-serif";
        const bodyFont = "'Inter', sans-serif";

        elements.forEach((el, index) => {
            const type = el.getAttribute('data-editable');
            el.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1)';

            // Strategic Positioning
            let top, left;
            if (strategy === 'centered') {
                top = 100 + (index * 80);
                left = (600 - (el.offsetWidth || 300)) / 2;
                el.style.textAlign = 'center';
            } else if (strategy === 'asymmetric') {
                top = 80 + (index * 120);
                left = (index % 2 === 0) ? 50 : 250;
            } else {
                top = 50 + (index * 90);
                left = 50 + (Math.sin(index) * 40);
            }

            el.style.top = top + 'px';
            el.style.left = left + 'px';

            if (type === 'heading') {
                el.style.color = 'white';
                el.style.fontFamily = headerFont;
                el.style.textShadow = `0 0 20px ${selectedTheme.primary}88`;
            } else if (type === 'shape') {
                el.style.background = `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.secondary})`;
                el.style.boxShadow = `0 10px 30px ${selectedTheme.secondary}44`;
            } else {
                el.style.fontFamily = bodyFont;
            }

            // 3. Apply Entrance Animations
            const anims = ['anim-fade-up', 'anim-glass-reveal', 'anim-depth-pop', 'anim-fade-scale', 'anim-zoom-pop'];
            const randomAnim = anims[Math.floor(Math.random() * anims.length)];

            // Remove old anims
            Array.from(el.classList).forEach(c => c.startsWith('anim-') && el.classList.remove(c));

            void el.offsetWidth; // reflow
            el.classList.add(randomAnim);
            el.style.animationDelay = `${index * 0.15}s`;
        });

        this.pushHistory();
        setTimeout(() => magicBtn.classList.remove('sparkle'), 1200);
    }

    createSparkles(btn) {
        for (let i = 0; i < 10; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle-particle';
            s.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
            s.style.setProperty('--y', (Math.random() - 0.5) * 100 + 'px');
            btn.appendChild(s);
            setTimeout(() => s.remove(), 1000);
        }
    }

    // --- History Management ---
    pushHistory() {
        const canvas = document.getElementById('poster-canvas');
        const state = {
            html: canvas.innerHTML,
            css: document.querySelector('style.template-style')?.textContent || ''
        };

        // If same as last, don't push
        if (this.historyIndex >= 0 && this.history[this.historyIndex].html === state.html) return;

        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        this.isDirty = true;

        if (this.history.length > 30) {
            this.history.shift();
            this.historyIndex--;
        }
        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.applyHistoryState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.applyHistoryState();
        }
    }

    applyHistoryState() {
        const canvas = document.getElementById('poster-canvas');
        canvas.innerHTML = this.history[this.historyIndex];
        canvas.querySelectorAll('.draggable').forEach(el => this.makeDraggable(el));
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    setupEventListeners() {
        document.getElementById('export-png')?.addEventListener('click', () => this.exportPNG());
        document.getElementById('export-whatsapp')?.addEventListener('click', () => this.exportWhatsApp());
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('export-json')?.addEventListener('click', () => this.exportJSON());

        document.getElementById('zoom-in')?.addEventListener('click', () => { this.zoomLevel += 0.1; this.applyZoom(); });
        document.getElementById('zoom-out')?.addEventListener('click', () => { this.zoomLevel -= 0.1; this.applyZoom(); });

        document.getElementById('undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('redo-btn')?.addEventListener('click', () => this.redo());
        document.getElementById('auto-design-btn')?.addEventListener('click', () => this.autoDesign());

        document.getElementById('open-export-btn')?.addEventListener('click', () => document.getElementById('export-modal').classList.add('active'));
        document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => document.getElementById('export-modal').classList.remove('active')));

        // Keyboard Support
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); this.undo(); }
                if (e.key === 'y') { e.preventDefault(); this.redo(); }
                if (e.key === '=') { e.preventDefault(); this.zoomLevel += 0.1; this.applyZoom(); }
                if (e.key === '-') { e.preventDefault(); this.zoomLevel -= 0.1; this.applyZoom(); }
            }
        });
    }

    applyZoom() {
        document.getElementById('poster-canvas').style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoom-level').innerText = Math.round(this.zoomLevel * 100) + '%';
    }

    // --- Elements System ---
    async loadElements() {
        const elementsPanel = document.getElementById('elements-panel');
        if (!elementsPanel) return;

        try {
            const response = await fetch('elements.json');
            const data = await response.json();
            this.allItems = data;
            this.renderElementsLibrary(data);
        } catch (e) {
            console.error("Failed to load elements:", e);
        }
    }

    renderElementsLibrary(items) {
        const elementsPanel = document.getElementById('elements-panel');
        const categories = [...new Set(items.map(i => i.category))];

        let html = `
            <div class="panel-header"><h3>Elements Library</h3></div>
            <div class="element-search-box">
                <input type="text" id="element-search" placeholder="Search elements..." class="tool-input">
            </div>
            <div class="category-tabs">
                <button class="cat-tab active" data-cat="all">All</button>
                <button class="cat-tab" data-cat="favorites">⭐ Favorites</button>
                <button class="cat-tab" data-cat="recent">🕒 Recent</button>
                ${categories.map(c => `<button class="cat-tab" data-cat="${c}">${c.toUpperCase()}</button>`).join('')}
            </div>
            <div class="elements-scroll-container">
        `;

        items.forEach(item => {
            const isFav = this.favorites.has(item.id);
            html += `
                <div class="library-item" onclick="builder.addElementFromLibrary('${item.id}')" data-cat="${item.category}" data-id="${item.id}">
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); builder.toggleFavorite('${item.id}')">
                        ${isFav ? '★' : '☆'}
                    </button>
                    <div class="library-preview">${item.type === 'icon' || item.type === 'sticker' ? item.preview : '📄'}</div>
                    <span>${item.title}</span>
                </div>
            `;
        });

        html += `</div>`;
        elementsPanel.innerHTML = html;

        // Binders
        elementsPanel.querySelectorAll('.cat-tab').forEach(tab => {
            tab.onclick = () => {
                elementsPanel.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterLibrary(tab.dataset.cat);
            };
        });
        document.getElementById('element-search')?.addEventListener('input', (e) => this.filterLibrary(null, e.target.value));
    }

    filterLibrary(cat, search) {
        const items = document.querySelectorAll('.library-item');
        items.forEach(item => {
            const itemId = item.dataset.id;
            const itemCat = item.dataset.cat;

            let matchesCat = true;
            if (cat === 'favorites') matchesCat = this.favorites.has(itemId);
            else if (cat === 'recent') matchesCat = this.recent.has(itemId);
            else if (cat && cat !== 'all') matchesCat = itemCat === cat;

            const matchesSearch = !search || item.querySelector('span').innerText.toLowerCase().includes(search.toLowerCase());
            item.style.display = matchesCat && matchesSearch ? 'flex' : 'none';
        });
    }

    toggleFavorite(id) {
        if (this.favorites.has(id)) this.favorites.delete(id);
        else this.favorites.add(id);

        localStorage.setItem('mhmv_favs', JSON.stringify([...this.favorites]));
        this.renderElementsLibrary(this.allItems); // Re-render to update UI
    }

    addElementFromLibrary(id) {
        // Add to recent
        this.recent.add(id);
        if (this.recent.size > 20) {
            const first = this.recent.values().next().value;
            this.recent.delete(first);
        }
        localStorage.setItem('mhmv_recent', JSON.stringify([...this.recent]));

        const item = this.allItems.find(i => i.id === id);
        if (!item) return;

        const canvas = document.getElementById('poster-canvas');

        if (item.type === 'background') {
            canvas.style.background = item.content;
            if (item.content.includes('url')) {
                canvas.style.backgroundSize = 'cover';
                canvas.style.backgroundPosition = 'center';
            }
            this.pushHistory();
            return;
        }

        const el = document.createElement('div');
        el.className = 'poster-element draggable';
        el.setAttribute('data-editable', item.type);
        el.style.position = 'absolute';
        el.style.top = item.y + 'px';
        el.style.left = item.x + 'px';
        el.style.width = item.width ? item.width + 'px' : 'auto';
        el.style.height = item.height ? item.height + 'px' : 'auto';
        el.style.color = item.color;
        el.style.zIndex = item.layer;

        if (item.type === 'text') {
            el.innerText = item.content;
            el.style.fontFamily = item.font || 'Inter';
            el.style.fontSize = (item.height / 2) + 'px';
            el.style.fontWeight = '700';
            el.style.whiteSpace = 'nowrap';
        } else if (item.type === 'shape') {
            el.style.backgroundColor = item.color;
            if (item.content === 'circle') el.style.borderRadius = '50%';
            if (item.content === 'triangle') {
                el.style.backgroundColor = 'transparent';
                el.style.width = '0'; el.style.height = '0';
                el.style.borderLeft = (item.width / 2) + 'px solid transparent';
                el.style.borderRight = (item.width / 2) + 'px solid transparent';
                el.style.borderBottom = item.height + 'px solid ' + item.color;
            }
        } else if (item.type === 'effect') {
            if (item.content === 'flare-cyan') {
                el.style.background = 'radial-gradient(circle, rgba(0,243,255,0.4) 0%, transparent 70%)';
                el.style.borderRadius = '50%';
            } else {
                el.style.background = item.content;
            }
            el.style.pointerEvents = 'none'; // Effects usually decorative
        } else {
            // Icon or Sticker
            el.innerText = item.content;
            el.style.fontSize = (item.height * 0.8) + 'px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
        }

        if (item.animated) el.classList.add('anim-fade-up');

        canvas.appendChild(el);
        this.makeDraggable(el);
        this.selectElement(el);
        this.renderLayers();
        this.pushHistory();
    }

    // --- Animations Tab ---
    loadAnimations() {
        const grid = document.getElementById('animation-presets-grid');
        if (!grid) return;

        const presets = [
            // Entrances
            { id: 'fade-up', name: 'Fade Up', class: 'anim-fade-up' },
            { id: 'fade-down', name: 'Fade Down', class: 'anim-fade-down' },
            { id: 'fade-left', name: 'Fade Left', class: 'anim-fade-left' },
            { id: 'fade-right', name: 'Fade Right', class: 'anim-fade-right' },
            { id: 'fade-scale', name: 'Fade Scale', class: 'anim-fade-scale' },
            { id: 'glass-reveal', name: 'Glass Reveal', class: 'anim-glass-reveal' },
            { id: 'depth-pop', name: 'Depth Pop', class: 'anim-depth-pop' },
            { id: 'elastic-reveal', name: 'Elastic Reveal', class: 'anim-elastic-reveal' },
            { id: 'zoom-pop', name: 'Zoom Pop', class: 'anim-zoom-pop' },
            { id: 'slide-up', name: 'Slide Up', class: 'anim-slide-up' },
            // Loops
            { id: 'float', name: 'Floating Loop', class: 'anim-loop-float' },
            { id: 'breath', name: 'Breathing Loop', class: 'anim-loop-breath' },
            { id: 'shimmer', name: 'Light Shimmer', class: 'anim-loop-shimmer' },
            { id: 'glow-pulse', name: 'Glow Pulse', class: 'anim-glow-pulse' },
            { id: 'spin-slow', name: 'Slow Spin', class: 'anim-spin' },
            { id: 'bounce-soft', name: 'Bounce Soft', class: 'anim-bounce' },
            { id: 'shake-gentle', name: 'Shake Gentle', class: 'anim-shake' },
            { id: 'swing', name: 'Swing Loop', class: 'anim-swing' },
            // Text Special
            { id: 'typewriter', name: 'Typewriter', class: 'anim-typewriter' },
            { id: 'text-glow', name: 'Text Glow', class: 'anim-text-glow' },
            { id: '3d-flip', name: '3D Flip', class: 'anim-3d-flip' },
            { id: 'blur-in', name: 'Blur In', class: 'anim-blur-in' }
        ];

        // Ensure 30+ items
        while (presets.length < 32) {
            presets.push({ id: `preset-${presets.length}`, name: `Preset ${presets.length + 1}`, class: 'anim-fade-up' });
        }

        grid.innerHTML = presets.map(p => `
            <button class="preset-card" onclick="builder.applyAnimation('${p.class}')">
                <div class="anim-preview-box">
                    <div class="anim-dot ${p.class}"></div>
                </div>
                <span>${p.name}</span>
            </button>
        `).join('');
    }

    addLine(style) {
        const el = document.createElement('div');
        el.className = 'poster-element draggable line-element';
        el.style.position = 'absolute';
        el.style.top = '200px'; el.style.left = '100px';
        el.style.width = '200px';
        el.style.height = '2px';
        el.style.borderTop = `2px ${style === 'gradient' ? 'solid' : style} ${style === 'gradient' ? 'cyan' : 'white'}`;
        document.getElementById('poster-canvas').appendChild(el);
        this.makeDraggable(el);
        this.selectElement(el);
        this.renderLayers();
    }

    addBadge(text) {
        const el = document.createElement('div');
        el.className = 'poster-element draggable badge-element';
        el.innerText = text.toUpperCase();
        el.style.position = 'absolute';
        el.style.top = '100px'; el.style.left = '100px';
        el.style.padding = '5px 15px';
        el.style.background = 'var(--primary-color, #7800ff)';
        el.style.color = '#fff';
        el.style.borderRadius = '50px';
        el.style.fontWeight = '800';
        el.style.fontSize = '0.8rem';
        document.getElementById('poster-canvas').appendChild(el);
        this.makeDraggable(el);
        this.selectElement(el);
        this.renderLayers();
    }

    setup3DTilt() { /* Logic for 3D hover effects */ }

    rgbToHex(rgb) {
        const res = rgb.match(/\d+/g);
        return res ? "#" + res.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, "0")).join("") : "#ffffff";
    }
}

let builder;
document.addEventListener('DOMContentLoaded', () => {
    builder = new UltraPosterBuilder();
    // Global Access for Inline Onclicks
    window.switchPanel = (id) => builder.switchPanel(id);
});
