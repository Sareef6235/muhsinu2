const AppState = {
    user: {
        isLoggedIn: false,
        role: 'public'
    },
    results: {
        exams: [],
        totalStudents: 0
    },

    init() {
        console.log("AppState Initialized");
        this.checkSession();
    },

    checkSession() {
        // Compatibility with results.js LocalStorage key
        const isAdmin = localStorage.getItem("portal-admin") === "true";
        if (isAdmin) {
            this.user.isLoggedIn = true;
            this.user.role = 'admin';
        } else {
            this.user.isLoggedIn = false;
            this.user.role = 'public';
        }
    },

    login(username, password) {
        this.checkSession();
        return this.user.isLoggedIn;
    },

    logout() {
        localStorage.removeItem("portal-admin");
        this.user.isLoggedIn = false;
        this.user.role = 'public';
        window.location.reload();
    }
};

export default AppState;
