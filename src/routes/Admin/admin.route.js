import express from 'express'
import authMiddleware from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/authorizeRole.middleware.js';

// other route import 
import dashboardRoute from '../Admin/dashboard/dashboard.route.js'
import registrationRoute from '../Admin/registration/userRegistration.route.js'
import organizationTreeRoute from './organization-tree/orgTree.route.js'
import callAnalyticRoute from './call-analytics/callAnalytics.route.js'

import {getAllUsers} from '../../controllers/sharedController/shared.controller.js'



const router = express.Router();

router.use(authMiddleware)

// other router 
router.use('/dashboard', authorizeRoles("ADMIN"), dashboardRoute)
router.use('/register-user', authorizeRoles("ADMIN"),registrationRoute );
router.use('/org-tree', authorizeRoles("ADMIN", "MANAGER"),organizationTreeRoute )
router.use('/call-analytics', authorizeRoles("ADMIN", "MANAGER"),callAnalyticRoute )

// api call 
router.use('/get-all-user',getAllUsers )

 
export default router

