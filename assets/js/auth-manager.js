window.AuthManager = {

    currentUser: null,

    async login(username, password) {

        const ADMIN_USERNAME = "admin";
        const ADMIN_PASSWORD = "Admin@123"; // Demo only

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {

            this.currentUser = {
                id: 1,
                username: "admin",
                role: "admin"
            };

            localStorage.setItem("auth_session",
                JSON.stringify(this.currentUser)
            );

            return { success: true };
        }

        return { success: false, message: "Invalid username or password" };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem("auth_session");
    },

    restoreSession() {
        const saved = localStorage.getItem("auth_session");
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
            } catch (e) {
                console.error("Session parse error", e);
                localStorage.removeItem("auth_session");
            }
        }
    },

    isAdmin() {
        return this.currentUser && this.currentUser.role === "admin";
    },

    getUser() {
        return this.currentUser;
    }
};
