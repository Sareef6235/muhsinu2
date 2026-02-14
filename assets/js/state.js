/**
 * Antigravity Results System - Centralized State Object
 * Manages application-wide data, user sessions, and configurations.
 */

const AppState = {
    user: {
        role: 'public', // public, admin, staff
        isLoggedIn: false,
        name: null
    },
    navigation: {
        activePage: 'home',
        menuData: {
            headerMenu: [
                {
                    id: 'home', label: "Home", link: "/index.html", enabled: true, children: [
                        { id: 'home-classic', label: "Home (Classic)", link: "/home-classic.html", enabled: true },
                        { id: 'home-modern', label: "Home (Modern)", link: "/home-modern.html", enabled: true }
                    ]
                },
                { id: 'about', label: "About", link: "/pages/about/index.html", enabled: true, children: [] },
                {
                    id: 'exams', label: "Exams", link: "#", enabled: true, children: [
                        { id: 'check-results', label: "Check Results", link: "/pages/results/index.html", enabled: true },
                        { id: 'archive', label: "Archive", link: "/pages/results/archive.html", enabled: true }
                    ]
                },
                { id: 'news', label: "News", link: "/pages/news/index.html", enabled: true, children: [] },
                { id: 'booking', label: "Booking", link: "/pages/booking/index.html", enabled: true, children: [] },
                { id: 'services', label: "Services", link: "/pages/services/index.html", enabled: true, children: [] },
                { id: 'gallery', label: "Gallery", link: "/pages/gallery/index.html", enabled: true, children: [] },
                { id: 'contact', label: "Contact", link: "#contact", enabled: true, children: [] },
                { id: 'admin', label: "Admin Panel", link: "/admin.html", enabled: true, children: [] }
            ]
        }
    },
    results: {
        exams: [],
        totalStudents: 0,
        lastPublished: null,
        isOffline: false
    },

    // Core Functions
    init() {
        this.loadSession();
        console.log("AppState Initialized");
    },

    loadSession() {
        const savedSession = localStorage.getItem('mhm_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                this.user = { ...this.user, ...session };
            } catch (e) {
                console.error("Failed to parse session", e);
            }
        }
    },

    saveSession() {
        localStorage.setItem('mhm_session', JSON.stringify(this.user));
    },

    setRole(role, name = null) {
        this.user.role = role;
        this.user.isLoggedIn = true;
        this.user.name = name;
        this.saveSession();
    },

    logout() {
        this.user = { role: 'public', isLoggedIn: false, name: null };
        this.saveSession();
    }
};

export default AppState;
