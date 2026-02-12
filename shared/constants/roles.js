export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    PLATFORM_ADMIN: 'platform_admin',
    RESELLER: 'reseller',
    CLIENT_ADMIN: 'client_admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
};

export const PERMISSIONS = {
    MANAGE_PLATFORM: 'manage_platform',
    MANAGE_TENANTS: 'manage_tenants',
    MANAGE_RESELLERS: 'manage_resellers',
    MANAGE_USERS: 'manage_users',
    MANAGE_SITE: 'manage_site',
    EDIT_CONTENT: 'edit_content',
    VIEW_ANALYTICS: 'view_analytics',
    ACCESS_BILLING: 'access_billing',
    WHITE_LABEL: 'white_label'
};

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
    [ROLES.PLATFORM_ADMIN]: [
        PERMISSIONS.MANAGE_TENANTS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.RESELLER]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_SITE,
        PERMISSIONS.WHITE_LABEL,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.CLIENT_ADMIN]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_SITE,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.EDITOR]: [
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.VIEWER]: [
        PERMISSIONS.VIEW_ANALYTICS
    ]
};
