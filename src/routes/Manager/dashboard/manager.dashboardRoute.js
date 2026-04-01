import express from 'express';

import { getManagerDashboard } from '../../../controllers/manager/dashboard/manager.dashboardController.js';

const router= express.Router();

router.get('/', getManagerDashboard )




export default router;

