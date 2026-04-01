
import express from 'express'
import { getAllUsers, getAdminDashboard } from '../../../controllers/admin/dashboard/dashboard.controller.js';
const router = express.Router();


router.get('/', getAdminDashboard)








export default router











