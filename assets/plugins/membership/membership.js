/**
 * MEMBERSHIP PLUGIN (ARMember)
 * User roles, access control, and membership management
 */

window.Membership = {
    version: '1.0.0',
    currentUser: null,
    roles: {
        'guest': { label: 'Guest', level: 0 },
        'student': { label: 'Student', level: 1 },
        'teacher': { label: 'Teacher', level: 5 },
        'admin': { label: 'Administrator', level: 10 }
    },

    init() {
        console.log('👥 Membership initialized');
        this.loadUser();
        this.protectContent();
    },

    /**
     * Load simulated user session
     */
    loadUser() {
        const saved = localStorage.getItem('current_user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        } else {
            // Default to guest
            this.currentUser = { role: 'guest' };
        }
        console.log('Current User Role:', this.currentUser.role);
    },

    /**
     * Login User (Simulated)
     */
    login(role) {
        this.currentUser = {
            id: 'u_' + Date.now(),
            role: role,
            name: role.charAt(0).toUpperCase() + role.slice(1) + ' User'
        };
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        window.location.reload();
    },

    /**
     * Logout
     */
    logout() {
        localStorage.removeItem('current_user');
        window.location.reload();
    },

    /**
     * Check capability
     */
    can(capability) {
        if (!this.currentUser) return false;
        const userLevel = this.roles[this.currentUser.role]?.level || 0;

        switch (capability) {
            case 'manage_options': return userLevel >= 10;
            case 'edit_content': return userLevel >= 5;
            case 'view_pro_content': return userLevel >= 1;
            default: return false;
        }
    },

    /**
     * Protect content based on data-attributes
     * Usage: <div data-restrict-to="student">...</div>
     */
    protectContent() {
        const protectedElements = document.querySelectorAll('[data-restrict-to]');

        protectedElements.forEach(el => {
            const requiredRole = el.getAttribute('data-restrict-to');
            const requiredLevel = this.roles[requiredRole]?.level || 0;
            const currentLevel = this.roles[this.currentUser.role]?.level || 0;

            if (currentLevel < requiredLevel) {
                // Hide content and show message
                el.innerHTML = `
                    <div class="membership-locked">
                        <i class="ph-fill ph-lock-key"></i>
                        <h3>Content Locked</h3>
                        <p>This content is restricted to <strong>${this.roles[requiredRole].label}s</strong> only.</p>
                        <button onclick="window.Membership.showLoginModal()">Login to Access</button>
                    </div>
                `;
                el.classList.add('is-locked');
            }
        });
    },

    showLoginModal() {
        // Simple mock login modal
        const role = prompt("Mock Login System\n\nEnter role to simulate login:\n- student\n- teacher\n- admin", "student");
        if (role && this.roles[role]) {
            this.login(role);
        } else if (role) {
            alert("Invalid role!");
        }
    }
};

export default window.Membership;
