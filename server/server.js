import { ROLES, PERMISSIONS } from '../shared/constants/roles.js';
import { PLANS } from './middlewares/plan.js';

// Middleware imports
import { authMiddleware, generateToken } from './middlewares/auth.js';
import { checkPermission, hasRole } from './middlewares/rbac.js';
import { tenantContext } from './middlewares/tenant.js';
import { checkFeature } from './middlewares/plan.js';

/**
 * server/server.js - Main Entry Point
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Serve static files (Client)
app.use(express.static(path.join(__dirname, '../client')));

// --- CORE SAAS API ROUTES ---

// 1. Health & System Status
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', version: '2.0.0-saas' });
});

// 2. Auth Routes
app.post('/api/auth/login', (req, res) => {
    // Simulated Login Logic
    const { email, password, tenantId } = req.body;

    // For demo: Mock user based on email
    let role = ROLES.VIEWER;
    let plan = PLANS.FREE;

    if (email.includes('admin')) { role = ROLES.PLATFORM_ADMIN; plan = PLANS.PRO; }
    if (email.includes('super')) { role = ROLES.SUPER_ADMIN; plan = PLANS.ENTERPRISE; }

    const token = generateToken({ id: 'u123', role, tenantId: tenantId || 't1', plan });
    res.json({ token, user: { email, role, tenantId, plan } });
});

// 3. Tenant Protected Routes (Using Gating Middlewares)
app.get('/api/sites',
    authMiddleware,
    tenantContext,
    checkPermission(PERMISSIONS.MANAGE_SITE),
    (req, res) => {
        res.json({
            tenant: req.tenantId,
            sites: [
                { id: 's1', name: 'Primary Course' },
                { id: 's2', name: 'Secondary Hub' }
            ]
        });
    }
);

// 4. Advanced Gated Feature Example
app.post('/api/features/white-label',
    authMiddleware,
    checkFeature('white_label'),
    (req, res) => {
        res.json({ success: true, message: 'White-labeling enabled for this session.' });
    }
);

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Export for Vercel
export default app;

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀 [ProPlatform SaaS] Online`);
        console.log(`📍 Port: ${PORT}\n`);
    });
}
