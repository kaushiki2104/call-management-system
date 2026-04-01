


import express from 'express'
import { getOrganizationTree } from '../../../controllers/admin/org-tree/orgTreeController.js';
const router = express.Router();

router.get('/',getOrganizationTree )

export default router


