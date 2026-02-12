import { ROLE_PERMISSIONS } from '../../shared/constants/roles.js';

/**
 * RBAC Middleware
 * Checks if the authenticated user has the required permission for the route.
 */
export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(403).json({ error: 'Access denied. No role assigned.' });
        }

        const permissions = ROLE_PERMISSIONS[userRole] || [];

        if (permissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({
            error: `Access denied. Permisson '${requiredPermission}' required.`
        });
    };
};

/**
 * Role Check Middleware
 * Explicitly checks for one of the allowed roles.
 */
export const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    };
};
