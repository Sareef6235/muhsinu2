export const PLANS = {
    FREE: 'free',
    PRO: 'pro',
    AGENCY: 'agency',
    ENTERPRISE: 'enterprise'
};

export const PLAN_LIMITS = {
    [PLANS.FREE]: {
        maxSites: 1,
        maxUsers: 2,
        storageGb: 0.5,
        features: ['basic_builder']
    },
    [PLANS.PRO]: {
        maxSites: 5,
        maxUsers: 10,
        storageGb: 5,
        features: ['basic_builder', 'advanced_settings', 'analytics']
    },
    [PLANS.AGENCY]: {
        maxSites: 20,
        maxUsers: 50,
        storageGb: 20,
        features: ['basic_builder', 'advanced_settings', 'analytics', 'multi_site', 'custom_domain']
    },
    [PLANS.ENTERPRISE]: {
        maxSites: 100,
        maxUsers: 500,
        storageGb: 200,
        features: ['basic_builder', 'advanced_settings', 'analytics', 'multi_site', 'custom_domain', 'white_label', 'api_access']
    }
};

/**
 * Plan Gating Middleware
 */
export const checkFeature = (feature) => {
    return (req, res, next) => {
        const plan = req.user?.plan || PLANS.FREE;
        const allowedFeatures = PLAN_LIMITS[plan].features;

        if (allowedFeatures.includes(feature)) {
            return next();
        }

        return res.status(403).json({
            error: `Upgrade required. Feature '${feature}' not available on ${plan.toUpperCase()} plan.`
        });
    };
};
