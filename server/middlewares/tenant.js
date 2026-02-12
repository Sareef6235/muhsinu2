/**
 * Tenant Isolation Middleware
 * Every request must have a tenant context.
 * This can be derived from the JWT (authenticated) 
 * or the domain/header (public requests).
 */
export const tenantContext = (req, res, next) => {
    // 1. Try to get tenant from JWT (for authenticated requests)
    let tenantId = req.user?.tenantId;

    // 2. If not in JWT, try to get from header or domain
    if (!tenantId) {
        tenantId = req.headers['x-tenant-id'] || req.hostname.split('.')[0];
    }

    if (!tenantId) {
        return res.status(400).json({ error: 'Missing tenant context' });
    }

    // Attach to request
    req.tenantId = tenantId;
    next();
};

/**
 * Scope Isolation Helper
 * Use this to wrap database queries to ensure tenant isolation.
 */
export const withTenant = (query, req) => {
    return { ...query, tenantId: req.tenantId };
};
