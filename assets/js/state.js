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
    // Navigation & Pages
    navigation: {
        activePage: 'home',
        menuData: {
            headerMenu: [
                {
                    id: 'home', label: "Home", link: "/index.html", enabled: true, children: [
                        { id: 'home-portal', label: "Public Portal", link: "/index.html", enabled: true },
                        { id: 'home-classic', label: "Classic Layout", link: "/home-classic.html", enabled: true },
                        { id: 'home-modern', label: "Modern Layout", link: "/home-modern.html", enabled: true }
                    ]
                },
                {
                    id: 'portal', label: "Portal", link: "/pages/portal/index.html", enabled: true, children: [
                        { id: 'news', label: "News & Events", link: "/pages/news/index.html", enabled: true },
                        { id: 'gallery', label: "Gallery", link: "/pages/gallery/index.html", enabled: true },
                        { id: 'hn', label: "Hridaya Nilayam", link: "/hn/index.html", enabled: true },
                        { id: 'students', label: "Student Creations", link: "/pages/students/creations.html", enabled: true }
                    ]
                },
                { id: 'booking', label: "Booking", link: "/pages/booking/index.html", enabled: true, children: [] },
                { id: 'services', label: "Services", link: "/pages/services/index.html", enabled: true, children: [] },
                { id: 'contact', label: "Contact", link: "#contact", enabled: true, children: [] },
            ]
        },
        pages: [
            { path: '/index.html', title: 'Home' },
            { path: '/home-classic.html', title: 'Home (Classic)' },
            { path: '/home-modern.html', title: 'Home (Modern)' },
            { path: '/pages/about/index.html', title: 'About Us' },
            { path: '/pages/services/index.html', title: 'Services' },
            { path: '/pages/news/index.html', title: 'News & Events' },
            { path: '/pages/gallery/index.html', title: 'Gallery' },
            { path: '/pages/booking/index.html', title: 'Booking' },
            { path: '/pages/results/index.html', title: 'Results Portal' },
            { path: '/pages/results/archive.html', title: 'Exam Archive' },
            { path: '/pages/results/rules.html', title: 'Rules & Regulations' },
            { path: '/pages/students/creations.html', title: 'Student Creations' },
            { path: '/pages/students/creative.html', title: 'Creative Studio' },
            { path: '/hn/index.html', title: 'Hridaya Nilayam' },
            { path: '/hn/creations.html', title: 'HN Creations' },
            { path: '/hn/exam_result.html', title: 'HN Exam Results' },
            { path: '/pages/admin/index.html', title: 'Admin Login' },
            { path: '/pages/admin/dashboard.html', title: 'Admin Dashboard' }
        ]
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
