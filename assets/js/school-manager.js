/**
 * school-manager.js
 * Multi-School Logic & Data Management
 */
import StorageManager from './storage-manager.js';

export const SchoolManager = {
    KEYS: {
        SCHOOLS: 'school_list',
        ACTIVE: StorageManager.ACTIVE_SCHOOL_KEY
    },

    init() {
        console.log('🏢 School Engine Initializing...');
        this.renderSwitcher();
    },

    getAll() {
        return StorageManager.getGlobal(this.KEYS.SCHOOLS, []);
    },

    save(schoolData) {
        const schools = this.getAll();
        const id = schoolData.id || `sch_${Date.now()}`;

        const newSchool = {
            id,
            name: schoolData.name || 'Unnamed Institution',
            code: schoolData.code || 'SCH',
            logo: schoolData.logo || '', // Base64 or URL
            address: schoolData.address || '',
            active: schoolData.active !== undefined ? schoolData.active : true,
            updatedAt: new Date().toISOString()
        };

        const idx = schools.findIndex(s => s.id === id);
        if (idx !== -1) schools[idx] = { ...schools[idx], ...newSchool };
        else schools.push(newSchool);

        StorageManager.setGlobal(this.KEYS.SCHOOLS, schools);
        this.renderSwitcher();
        return newSchool;
    },

    delete(id) {
        if (this.getActive()?.id === id) {
            alert("Cannot delete the currently active school. Please switch to another school first.");
            return;
        }

        if (confirm("Are you sure? This will hide the school profile from the switcher.\n(Note: Results data is preserved safely in storage)")) {
            const schools = this.getAll().filter(s => s.id !== id);
            StorageManager.setGlobal(this.KEYS.SCHOOLS, schools);
            this.renderSwitcher();
        }
    },

    getActive() {
        return StorageManager.getGlobal(this.KEYS.ACTIVE, null);
    },

    switchSchool(id) {
        const school = this.getAll().find(s => s.id === id);
        // id === 'default' will result in school = undefined, which is correct for Legacy fallback
        StorageManager.setGlobal(this.KEYS.ACTIVE, school || null);
        location.reload();
    },

    renderSwitcher() {
        const selector = document.getElementById('active-school-selector');
        if (!selector) return;

        const schools = this.getAll();
        const active = this.getActive();

        let html = `<option value="default" ${!active ? 'selected' : ''}>Legacy System (Default)</option>`;
        schools.forEach(s => {
            html += `<option value="${s.id}" ${active?.id === s.id ? 'selected' : ''}>${s.name}</option>`;
        });
        selector.innerHTML = html;

        // Also update the Management Grid if we are on the schools panel
        this.renderManagementGrid();
    },

    // --- ADMIN UI METHODS ---

    toggleAddForm() {
        const modal = document.getElementById('school-add-modal');
        if (!modal) return;

        if (modal.style.display === 'none') {
            modal.style.display = 'flex'; // Modal overlay needs flex to center
            document.getElementById('school-name-input').focus();
        } else {
            modal.style.display = 'none';
        }
    },

    saveSchool(btn) {
        const name = document.getElementById('school-name-input').value.trim();
        const code = document.getElementById('school-code-input').value.trim();
        const address = document.getElementById('school-address-input').value.trim();

        if (!name) return alert("School Name is required");

        if (window.uiLock) window.uiLock(btn, true);

        try {
            this.save({ name, code, address });
            this.toggleAddForm();
            alert("School Profile Created Successfully!");
        } catch (e) {
            console.error(e);
            alert("Error saving school.");
        } finally {
            if (window.uiLock) window.uiLock(btn, false);
        }
    },

    renderManagementGrid() {
        const grid = document.getElementById('schools-grid');
        if (!grid) return;

        const schools = this.getAll();
        const active = this.getActive();

        if (schools.length === 0) {
            grid.innerHTML = '<div style="text-align: center; width: 100%; padding: 40px; color: #666;">No schools found. Add one to get started.</div>';
            return;
        }

        grid.innerHTML = schools.map(s => `
            <div class="glass-card" style="padding: 20px; border: 1px solid ${active?.id === s.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}; position: relative;">
                ${active?.id === s.id ? '<div style="position:absolute; top:10px; right:10px; background:var(--primary-color); color:#000; font-size:0.7rem; padding:2px 8px; border-radius:4px; font-weight:bold;">ACTIVE</div>' : ''}
                
                <h3 style="color: #fff; margin-bottom: 5px;">${s.name}</h3>
                <div style="font-size: 0.9rem; color: var(--primary-color); margin-bottom: 15px;">${s.code}</div>
                <p style="color: #888; font-size: 0.9rem; margin-bottom: 20px;"><i class="ph-bold ph-map-pin"></i> ${s.address || 'No Address'}</p>
                
                <div style="display: flex; gap: 10px;">
                    ${active?.id !== s.id ? `<button class="btn btn-sm btn-secondary" onclick="SchoolManager.switchSchool('${s.id}')">Switch To</button>` : '<button class="btn btn-sm" disabled style="opacity:0.5; border:1px solid #555; color:#aaa;">In Use</button>'}
                    <button class="btn btn-sm btn-danger" onclick="SchoolManager.delete('${s.id}')"><i class="ph-bold ph-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
};

window.SchoolManager = SchoolManager;
export default SchoolManager;
