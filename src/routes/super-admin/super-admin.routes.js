import express from 'express'
import { createOrganizationWithAdmin } from '../../controllers/super-admin/org-admin-addController.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-org',authMiddleware  ,createOrganizationWithAdmin)

export default router










