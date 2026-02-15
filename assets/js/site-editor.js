/**
 * SiteEditor Manager & Renderer
 * Centralized system for Header, Footer, and Menu management.
 * Controls both the Admin Editor UI and the Public Rendering.
 */
window.SiteEditor = (function () {
    const STORAGE_KEY = "siteSettings";

    let state = {
        header: {
            title: "MIFTHAHUL HUDA",
            tagline: "Madrasa & Educational Center",
            logo: "../../assets/img/logo.png",
            bgColor: "#ffffff",
            textColor: "#333333",
            sticky: true,
            showLogo: true,
            menu: [
                { id: 1, label: "Home", link: "index.html", enabled: true },
                { id: 2, label: "About", link: "about.html", enabled: true },
                { id: 3, label: "Results", link: "pages/results/index.html", enabled: true },
                { id: 4, label: "Contact", link: "#contact", enabled: true }
            ]
        },
        footer: {
            description: "Providing quality religious and modern education for the community since years.",
            address: "123 Madrasa Road, City, Kerala, India",
            phone: "+91 6235 989 198",
            email: "info@mifthahulhuda.com",
            copyright: "&copy; 2026 Mifthahul Huda Madrasa. All Rights Reserved.",
            bgColor: "#1a1a1a",
            textColor: "#ffffff",
            social: {
                facebook: "#",
                instagram: "#",
                youtube: "#"
            },
            showSocial: true
        }
    };

    function init(isEditor = false) {
        console.log("🛠️ SiteEditor: Initializing...");
        load();

        if (isEditor) {
            setupEditor();
        } else {
            render();
        }
    }

    /* ==============================
       DATA PERSISTENCE
       ============================== */
    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deep merge or specific assignment to handle structure updates
                state = {
                    header: { ...state.header, ...parsed.header },
                    footer: { ...state.footer, ...parsed.footer }
                };
                console.log("✅ SiteEditor: Data Loaded");
            } catch (e) {
                console.error("❌ SiteEditor: Load Error", e);
            }
        }
    }

    function save() {
        if (typeof collectEditorData === 'function') {
            collectEditorData();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        alert("Settings Saved Successfully ✅");
        location.reload(); // Reload to apply across all components
    }

    function reset() {
        if (!confirm("Reset all site settings to defaults?")) return;
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }

    /* ==============================
       RENDERING ENGINE (Public)
       ============================== */
    function render() {
        renderHeader();
        renderFooter();
        console.log("🎨 SiteEditor: Rendering Complete");
    }

    function renderHeader() {
        const headerEl = document.getElementById('main-header') || document.querySelector('header');
        if (!headerEl) return;

        const { header } = state;
        const activeMenu = (header.menu || []).filter(m => m.enabled);

        // Dynamic Styles
        headerEl.style.backgroundColor = header.bgColor;
        headerEl.style.color = header.textColor;
        if (header.sticky) {
            headerEl.classList.add('sticky-header');
        }

        headerEl.innerHTML = `
            <div class="container nav-wrapper" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
                <a href="index.html" class="logo-area" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
                    ${header.showLogo ? `<img src="${header.logo}" alt="Logo" style="height: 45px; border-radius: 8px;">` : ''}
                    <div>
                        <div style="font-weight: 700; font-size: 1.2rem; line-height: 1;">${sanitize(header.title)}</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;">${sanitize(header.tagline)}</div>
                    </div>
                </a>
                
                <nav class="desktop-nav">
                    <ul style="display: flex; list-style: none; gap: 25px; margin: 0; padding: 0;">
                        ${activeMenu.map(m => `
                            <li><a href="${m.link}" style="text-decoration: none; color: inherit; font-weight: 500; transition: 0.3s;">${sanitize(m.label)}</a></li>
                        `).join('')}
                    </ul>
                </nav>

                <button class="mobile-toggle" style="display: none; background: none; border: none; font-size: 1.5rem; color: inherit; cursor: pointer;">
                    <i class="ph ph-list"></i>
                </button>
            </div>
        `;
    }

    function renderFooter() {
        const footerEl = document.getElementById('main-footer') || document.querySelector('footer');
        if (!footerEl) return;

        const { footer } = state;

        footerEl.style.backgroundColor = footer.bgColor;
        footerEl.style.color = footer.textColor;
        footerEl.style.padding = "60px 0 30px";

        footerEl.innerHTML = `
            <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px;">
                <div class="footer-info">
                    <h3 style="margin-bottom: 20px; font-size: 1.5rem;">${sanitize(state.header.title)}</h3>
                    <p style="opacity: 0.8; line-height: 1.6;">${sanitize(footer.description)}</p>
                    <div class="social-links" style="margin-top: 25px; display: ${footer.showSocial ? 'flex' : 'none'}; gap: 15px;">
                        <a href="${footer.social.facebook}" style="font-size: 1.4rem; color: inherit;"><i class="ph-fill ph-facebook-logo"></i></a>
                        <a href="${footer.social.instagram}" style="font-size: 1.4rem; color: inherit;"><i class="ph-fill ph-instagram-logo"></i></a>
                        <a href="${footer.social.youtube}" style="font-size: 1.4rem; color: inherit;"><i class="ph-fill ph-youtube-logo"></i></a>
                    </div>
                </div>
                
                <div class="footer-contact">
                    <h4 style="margin-bottom: 20px;">Contact Us</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; opacity: 0.8;">
                        <li style="display: flex; gap: 10px;"><i class="ph ph-map-pin"></i> ${sanitize(footer.address)}</li>
                        <li style="display: flex; gap: 10px;"><i class="ph ph-phone"></i> ${sanitize(footer.phone)}</li>
                        <li style="display: flex; gap: 10px;"><i class="ph ph-envelope"></i> ${sanitize(footer.email)}</li>
                    </ul>
                </div>
            </div>
            <div class="container" style="margin-top: 50px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 0.9rem; opacity: 0.6;">
                ${footer.copyright}
            </div>
        `;
    }

    /* ==============================
       EDITOR LOGIC (Admin)
       ============================== */
    function setupEditor() {
        console.log("⚙️ SiteEditor: Setup Editor Mode");
        syncInputs();
        renderMenuList();
        updatePreview();
    }

    function syncInputs() {
        // Safe check for elements existence
        const map = {
            'ss-site-title': state.header.title,
            'ss-site-tagline': state.header.tagline,
            'ss-header-bg': state.header.bgColor,
            'ss-header-text': state.header.textColor,
            'ss-header-sticky': state.header.sticky,
            'ss-header-showlogo': state.header.showLogo,
            'ss-footer-desc': state.footer.description,
            'ss-footer-address': state.footer.address,
            'ss-footer-phone': state.footer.phone,
            'ss-footer-email': state.footer.email,
            'ss-footer-copy': state.footer.copyright,
            'ss-footer-bg': state.footer.bgColor,
            'ss-footer-text': state.footer.textColor,
            'ss-social-fb': state.footer.social.facebook,
            'ss-social-ig': state.footer.social.instagram,
            'ss-social-yt': state.footer.social.youtube
        };

        for (const [id, val] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (el.type === 'checkbox') el.checked = val;
            else el.value = val;
        }
    }

    function collectEditorData() {
        state.header.title = document.getElementById('ss-site-title').value;
        state.header.tagline = document.getElementById('ss-site-tagline').value;
        state.header.bgColor = document.getElementById('ss-header-bg').value;
        state.header.textColor = document.getElementById('ss-header-text').value;
        state.header.sticky = document.getElementById('ss-header-sticky').checked;
        state.header.showLogo = document.getElementById('ss-header-showlogo').checked;

        state.footer.description = document.getElementById('ss-footer-desc').value;
        state.footer.address = document.getElementById('ss-footer-address').value;
        state.footer.phone = document.getElementById('ss-footer-phone').value;
        state.footer.email = document.getElementById('ss-footer-email').value;
        state.footer.copyright = document.getElementById('ss-footer-copy').value;
        state.footer.bgColor = document.getElementById('ss-footer-bg').value;
        state.footer.textColor = document.getElementById('ss-footer-text').value;

        state.footer.social.facebook = document.getElementById('ss-social-fb').value;
        state.footer.social.instagram = document.getElementById('ss-social-ig').value;
        state.footer.social.youtube = document.getElementById('ss-social-yt').value;

        state.header.menu = collectMenuData();
    }

    function renderMenuList() {
        const list = document.getElementById('ss-menu-list');
        if (!list) return;

        list.innerHTML = state.header.menu.map((item, idx) => `
            <div class="menu-item-row" data-id="${item.id}" style="display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                <i class="ph ph-dots-six-vertical" style="opacity: 0.5;"></i>
                <input type="text" class="form-input m-label" value="${item.label}" placeholder="Label" oninput="SiteEditor.updatePreview()" style="flex: 2;">
                <input type="text" class="form-input m-link" value="${item.link}" placeholder="Link" oninput="SiteEditor.updatePreview()" style="flex: 3;">
                <label style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" class="m-enabled" ${item.enabled ? 'checked' : ''} onchange="SiteEditor.updatePreview()">
                    <span style="font-size: 0.8rem;">Hide</span>
                </label>
                <button class="btn btn-mini btn-danger" onclick="SiteEditor.removeMenuItem(${idx})" style="padding: 5px 10px;"><i class="ph ph-trash"></i></button>
            </div>
        `).join('');
    }

    function addMenuItem() {
        state.header.menu.push({ id: Date.now(), label: "New Link", link: "#", enabled: true });
        renderMenuList();
        updatePreview();
    }

    function removeMenuItem(idx) {
        state.header.menu.splice(idx, 1);
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

    function updatePreview() {
        // Temporary update state for preview without saving
        collectEditorData();

        // Apply to Admin Preview Elements
        const pHeader = document.getElementById('p-header');
        if (pHeader) {
            pHeader.style.background = state.header.bgColor;
            pHeader.style.color = state.header.textColor;
            document.getElementById('p-title').textContent = state.header.title;
            document.getElementById('p-tagline').textContent = state.header.tagline;
            const pLogo = document.getElementById('p-logo');
            pLogo.src = state.header.logo;
            pLogo.style.display = state.header.showLogo ? 'block' : 'none';

            const pNav = document.getElementById('p-nav');
            const activeItems = (state.header.menu || []).filter(item => item.enabled);
            pNav.innerHTML = activeItems.map(item => `<span>${item.label}</span>`).join('');
        }

        const pFooter = document.getElementById('p-footer');
        if (pFooter) {
            pFooter.style.background = state.footer.bgColor;
            pFooter.style.color = state.footer.textColor;
            document.getElementById('p-address').textContent = state.footer.address;
            document.getElementById('p-contact').textContent = `${state.footer.phone} | ${state.footer.email}`;
            document.getElementById('p-copy').innerHTML = state.footer.copyright;
        }
    }

    function handleLogoUpload(input) {
        const file = input.files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert("Please upload a valid image file.");
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            alert("File size exceeds 3MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            state.header.logo = e.target.result;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }

    /* ==============================
       UTILITIES
       ============================== */
    function sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        init,
        save,
        reset,
        updatePreview,
        handleLogoUpload,
        addMenuItem,
        removeMenuItem,
        // Legacy support mapping
        switchTab: (id, btn) => {
            document.querySelectorAll('.ss-tab-content').forEach(t => t.style.display = 'none');
            document.getElementById(`ss-tab-${id}`).style.display = 'block';
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    };
})();
