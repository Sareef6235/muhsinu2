/**
 * Auth Navigation Guard - REBUILT FOR LOCAL CMS
 * Controls visibility of admin-only elements based on local auth.
 */
import LocalAuth from './local-auth.js';

function updateAdminNavigation() {
    const isAdmin = LocalAuth.isAuthenticated();
    const adminElements = document.querySelectorAll('.admin-only');

    adminElements.forEach(el => {
        if (isAdmin) {
            el.style.display = 'block';
            el.classList.add('admin-active');
        } else {
            el.style.display = 'none';
            el.classList.remove('admin-active');
        }
    });

    // Handle nested flex/grid displays if needed
    const adminFlex = document.querySelectorAll('.admin-only-flex');
    adminFlex.forEach(el => {
        el.style.display = isAdmin ? 'flex' : 'none';
    });
}

// Run on load
document.addEventListener('DOMContentLoaded', updateAdminNavigation);

// Listen for local login/logout events
window.addEventListener('storage', (e) => {
    if (e.key === 'mhm_admin_session') {
        updateAdminNavigation();
    }
});

// Export for manual trigger
export default { updateAdminNavigation };
