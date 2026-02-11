/**
 * SiteSettings Manager
 * Handles Header, Footer, and Navigation customization with Live Preview.
 * Persistence: localStorage ("siteSettings")
 */
window.SiteSettings = (function () {
    const STORAGE_KEY = "siteSettings";

    let state = {
        header: {
            title: "Admin Panel",
            tagline: "Static Site Management",
            logo: "../../assets/img/logo.png",
            bgColor: "#ffffff",
            textColor: "#333333",
            isSticky: false,
            showLogo: true
        },
        menu: [
            { id: 1, label: "Home", link: "index.html", enabled: true },
            { id: 2, label: "About", link: "about.html", enabled: true },
            { id: 3, label: "Contact", link: "contact.html", enabled: true }
        ],
        footer: {
            address: "123 Street View, City, Country",
            phone: "+1234567890",
            email: "info@example.com",
            copyright: "&copy; 2026 Admin Panel. All Rights Reserved.",
            bgColor: "#222222",
            textColor: "#ffffff",
            social: {
                facebook: "#",
                instagram: "#",
                youtube: "#"
            },
            showSocial: true
        }
    };

    function init() {
        console.log("⚙️ SiteSettings: Initializing...");
        load();
        renderMenuList();
        updatePreview();
        syncInputs();
    }

    /* ==============================
       STORAGE OPERATIONS
       ============================== */
    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                console.log("✅ SiteSettings: Loaded from Storage");
            } catch (e) {
                console.error("❌ SiteSettings: Error loading data", e);
            }
        }
    }

    function save() {
        // Collect latest menu state (since it's dynamic)
        state.menu = collectMenuData();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        alert("Settings Saved Successfully ✅");
        console.log("💾 SiteSettings: Saved to Storage", state);
    }

    function resetDefaults() {
        if (!confirm("Are you sure you want to reset all settings to defaults?")) return;
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }

    /* ==============================
       UI & PREVIEW LOGIC
       ============================== */
    function switchTab(tabId, btn) {
        document.querySelectorAll('.ss-tab-content').forEach(t => t.style.display = 'none');
        document.getElementById(`ss-tab-${tabId}`).style.display = 'block';

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    function updatePreview() {
        // Collect values from inputs
        state.header.title = document.getElementById('ss-site-title').value;
        state.header.tagline = document.getElementById('ss-site-tagline').value;
        state.header.bgColor = document.getElementById('ss-header-bg').value;
        state.header.textColor = document.getElementById('ss-header-text').value;
        state.header.isSticky = document.getElementById('ss-header-sticky').checked;
        state.header.showLogo = document.getElementById('ss-header-showlogo').checked;

        state.footer.address = document.getElementById('ss-footer-address').value;
        state.footer.phone = document.getElementById('ss-footer-phone').value;
        state.footer.email = document.getElementById('ss-footer-email').value;
        state.footer.copyright = document.getElementById('ss-footer-copy').value;
        state.footer.bgColor = document.getElementById('ss-footer-bg').value;
        state.footer.textColor = document.getElementById('ss-footer-text').value;

        // Apply Header Preview
        const pHeader = document.getElementById('p-header');
        pHeader.style.background = state.header.bgColor;
        pHeader.style.color = state.header.textColor;
        pHeader.style.position = state.header.isSticky ? 'sticky' : 'relative';
        pHeader.style.top = '0';
        pHeader.style.zIndex = '100';

        document.getElementById('p-title').textContent = state.header.title || "Site Title";
        document.getElementById('p-tagline').textContent = state.header.tagline || "Site Tagline";

        const pLogo = document.getElementById('p-logo');
        pLogo.src = state.header.logo;
        pLogo.style.display = state.header.showLogo ? 'block' : 'none';

        // Apply Menu Preview
        const pNav = document.getElementById('p-nav');
        const activeItems = (state.menu || []).filter(item => item.enabled);
        pNav.innerHTML = activeItems.map(item => `<span>${item.label}</span>`).join('');

        // Apply Footer Preview
        const pFooter = document.getElementById('p-footer');
        pFooter.style.background = state.footer.bgColor;
        pFooter.style.color = state.footer.textColor;

        document.getElementById('p-address').textContent = state.footer.address || "";
        document.getElementById('p-contact').textContent = `${state.footer.phone} | ${state.footer.email}`;
        document.getElementById('p-copy').innerHTML = state.footer.copyright || "";
    }

    function syncInputs() {
        document.getElementById('ss-site-title').value = state.header.title;
        document.getElementById('ss-site-tagline').value = state.header.tagline;
        document.getElementById('ss-header-bg').value = state.header.bgColor;
        document.getElementById('ss-header-text').value = state.header.textColor;
        document.getElementById('ss-header-sticky').checked = state.header.isSticky;
        document.getElementById('ss-header-showlogo').checked = state.header.showLogo;

        document.getElementById('ss-footer-address').value = state.footer.address;
        document.getElementById('ss-footer-phone').value = state.footer.phone;
        document.getElementById('ss-footer-email').value = state.footer.email;
        document.getElementById('ss-footer-copy').value = state.footer.copyright;
        document.getElementById('ss-footer-bg').value = state.footer.bgColor;
        document.getElementById('ss-footer-text').value = state.footer.textColor;
    }

    /* ==============================
       MENU MANAGER
       ============================== */
    function renderMenuList() {
        const list = document.getElementById('ss-menu-list');
        if (!list) return;

        list.innerHTML = state.menu.map((item, idx) => `
            <div class="menu-item-row" data-id="${item.id}" style="display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                <i class="ph ph-dots-six-vertical" style="cursor: move; opacity: 0.5;"></i>
                <input type="text" class="form-input m-label" value="${item.label}" placeholder="Label" oninput="SiteSettings.updatePreview()">
                <input type="text" class="form-input m-link" value="${item.link}" placeholder="Link" oninput="SiteSettings.updatePreview()">
                <label style="cursor: pointer;">
                    <input type="checkbox" class="m-enabled" ${item.enabled ? 'checked' : ''} onchange="SiteSettings.updatePreview()">
                </label>
                <button class="btn btn-mini btn-danger" onclick="SiteSettings.removeMenuItem(${idx})" style="padding: 5px 10px;"><i class="ph ph-trash"></i></button>
            </div>
        `).join('');
    }

    function addMenuItem() {
        const newItem = {
            id: Date.now(),
            label: "New Page",
            link: "#",
            enabled: true
        };
        state.menu.push(newItem);
        renderMenuList();
        updatePreview();
    }

    function removeMenuItem(idx) {
        state.menu.splice(idx, 1);
        renderMenuList();
        updatePreview();
    }

    function collectMenuData() {
        const rows = document.querySelectorAll('.menu-item-row');
        return Array.from(rows).map(row => ({
            id: row.dataset.id,
            label: row.querySelector('.m-label').value,
            link: row.querySelector('.m-link').value,
            enabled: row.querySelector('.m-enabled').checked
        }));
    }

    /* ==============================
       MEDIA HANDLING
       ============================== */
    function handleLogoUpload(input) {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            alert("File too large. Max size 3MB.");
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            state.header.logo = e.target.result;
            updatePreview();
            console.log("📷 SiteSettings: Logo updated");
        };
        reader.readAsDataURL(file);
    }

    return {
        init,
        save,
        resetDefaults,
        switchTab,
        updatePreview,
        handleLogoUpload,
        addMenuItem,
        removeMenuItem
    };
})();
