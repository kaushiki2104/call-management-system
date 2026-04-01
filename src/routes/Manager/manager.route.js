import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/authorizeRole.middleware.js';


import DashboardRoute from '../Manager/dashboard/manager.dashboardRoute.js'
import CallRoute from './call-analytics/manager.callAnalytics.route.js'

const router = express.Router();

router.use(authMiddleware, authorizeRoles("MANAGER"))

    router.use('/dashboard',DashboardRoute )
    router.use('/calls',CallRoute)





export default router