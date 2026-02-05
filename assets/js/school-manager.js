const SchoolManager = (() => {
    const storageKey = "schools";
    const activeKey = "activeSchoolId";

    // Helper: generate unique ID
    const generateId = () => 'sch_' + Date.now().toString() + Math.floor(Math.random() * 1000);

    // Load schools from localStorage
    const loadSchools = () => {
        try {
            let schools = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return schools;
        } catch (e) {
            console.error("SchoolManager: Error loading schools", e);
            return [];
        }
    };

    // Save schools to localStorage
    const saveSchools = (schools) => {
        localStorage.setItem(storageKey, JSON.stringify(schools));
    };

    /**
     * Ensure a valid active school is always set
     * Priority: 1) Stored active ID, 2) First available school, 3) Auto-create default
     */
    const ensureActiveSchool = () => {
        let schools = loadSchools();

        // If no schools exist, create a default one
        if (schools.length === 0) {
            const defaultSchool = {
                id: 'default',
                name: "Default School",
                code: "DEFAULT",
                address: "",
                active: true,
                createdAt: new Date().toISOString()
            };
            schools = [defaultSchool];
            saveSchools(schools);
        }

        // Get current active ID
        let activeId = localStorage.getItem(activeKey);

        // If no active ID or invalid ID, use first school
        if (!activeId || !schools.find(s => s.id === activeId)) {
            activeId = schools[0].id;
            localStorage.setItem(activeKey, activeId);
            console.log(`🏫 SchoolManager: Auto-selected school [${activeId}]`);
        }

        return activeId;
    };

    // Get active school ID with safe fallback
    const getActiveSchoolId = () => {
        return ensureActiveSchool();
    };

    // Set active school ID
    const setActiveSchoolId = (id) => {
        localStorage.setItem(activeKey, id);

        // Dispatch event on window for global compatibility with other managers
        window.dispatchEvent(new CustomEvent("schoolChanged", { detail: { id } }));

        // Backward compatibility
        window.dispatchEvent(new CustomEvent("school-changed", { detail: { schoolId: id } }));

        updateDashboardContext();
    };

    /**
     * Dashboard Integration: Update UI elements that depend on school context
     */
    const updateDashboardContext = () => {
        const schools = loadSchools();
        const activeId = getActiveSchoolId();
        const active = schools.find(s => s.id === activeId);

        if (!active) return;

        // Update dashboard title or top bar school name if elements exist
        const displayEl = document.getElementById('active-school-display');
        if (displayEl) displayEl.textContent = active.name;

        // Populate any school selection dropdowns in the UI
        const selectors = document.querySelectorAll('.school-selector');
        selectors.forEach(select => {
            select.innerHTML = schools.map(s => `<option value="${s.id}" ${s.id === activeId ? 'selected' : ''}>${s.name}</option>`).join('');
        });
    };

    // Render schools grid
    const render = () => {
        const grid = document.getElementById("schools-grid");
        const schools = loadSchools();

        if (!grid) return;

        if (schools.length === 0) {
            grid.innerHTML = `<div style="text-align:center; width:100%; padding:40px; color:#666;">No schools found.</div>`;
            return;
        }

        const activeId = getActiveSchoolId(); // Now guaranteed to return a valid ID

        grid.innerHTML = schools
            .map(school => {
                const isActive = school.id === activeId;
                const activeBadge = isActive ? `<span class="status-badge approved">Active</span>` : "";
                const canDelete = schools.length > 1 && !isActive;

                return `
                <div class="school-card glass-card" style="padding:15px; border:1px solid ${isActive ? 'var(--primary-color)' : '#333'}; position:relative; display:flex; flex-direction:column; gap:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <strong>${school.name}</strong>
                        ${activeBadge}
                    </div>
                    <span style="font-size:0.85rem; color:#888; font-family:monospace;">${school.code}</span>
                    <span style="font-size:0.9rem; color:#666;">${school.address || 'No address set'}</span>
                    <div style="margin-top:10px; display:flex; gap:5px;">
                        ${!isActive ? `<button class="btn btn-mini btn-secondary" onclick="SchoolManager.switchSchool('${school.id}')">Switch</button>` : ""}
                        ${canDelete ? `<button class="btn btn-mini btn-danger" onclick="SchoolManager.deleteSchool('${school.id}')">Delete</button>` : ""}
                    </div>
                </div>
                `;
            })
            .join("");
    };

    // Toggle add modal
    const toggleAddForm = () => {
        const modal = document.getElementById("school-add-modal");
        if (!modal) return;
        modal.style.display = modal.style.display === "none" ? "flex" : "none";

        if (modal.style.display === "flex") {
            document.getElementById("school-name-input").value = "";
            document.getElementById("school-code-input").value = "";
            document.getElementById("school-address-input").value = "";
            document.getElementById("school-name-input").focus();
        }
    };

    // Save new school
    const saveSchool = (btn) => {
        const name = document.getElementById("school-name-input").value.trim();
        const code = document.getElementById("school-code-input").value.trim().toUpperCase();
        const address = document.getElementById("school-address-input").value.trim();

        if (!name || !code) {
            alert("School Name and Code are required.");
            return;
        }

        let schools = loadSchools();
        if (schools.find(s => s.code.toLowerCase() === code.toLowerCase())) {
            alert("A school with this code already exists.");
            return;
        }

        const newSchool = {
            id: generateId(),
            name,
            code,
            address,
            active: false,
            createdAt: new Date().toISOString()
        };

        schools.push(newSchool);
        saveSchools(schools);
        toggleAddForm();
        render();
    };

    // Switch active school
    const switchSchool = (id) => {
        const schools = loadSchools();
        if (!schools.find(s => s.id === id)) return;
        setActiveSchoolId(id);
        render();
    };

    // Delete school
    const deleteSchool = (id) => {
        let schools = loadSchools();
        if (schools.length <= 1) {
            alert("Cannot delete the only school.");
            return;
        }
        const activeId = getActiveSchoolId();
        if (id === activeId) {
            alert("Cannot delete the active school. Switch first.");
            return;
        }
        if (!confirm("Are you sure you want to delete this school?")) return;

        schools = schools.filter(s => s.id !== id);
        saveSchools(schools);
        render();
    };

    // Initialize
    const init = () => {
        let schools = loadSchools();
        if (!schools || schools.length === 0) {
            // Create default school if none
            const defaultSchool = {
                id: 'default',
                name: "Default School",
                code: "DEFAULT",
                address: "",
                active: true,
                createdAt: new Date().toISOString()
            };
            schools = [defaultSchool];
            saveSchools(schools);
        }

        const activeId = getActiveSchoolId() || schools[0].id;
        if (!getActiveSchoolId()) {
            localStorage.setItem(activeKey, activeId);
        }

        render();
        updateDashboardContext();
    };

    return {
        init,
        toggleAddForm,
        saveSchool,
        switchSchool,
        deleteSchool,
        getAll: loadSchools,
        getActiveId: getActiveSchoolId,
        getActiveSchool: getActiveSchoolId,
        renderManagementGrid: render
    };
})();

// Initialize on page load
if (typeof window !== 'undefined') {
    window.SchoolManager = SchoolManager;
    document.addEventListener("DOMContentLoaded", () => {
        SchoolManager.init();
    });
}

if (typeof module !== 'undefined') {
    module.exports = SchoolManager;
}
