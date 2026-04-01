import express from 'express'
import { loginUser, loginAdmin, loginSuperAdmin } from '../../controllers/login.controller.js';
// import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router()


router.post('/user', loginUser)

router.post('/admin', loginAdmin)

router.post('/super-admin', loginSuperAdmin)


export default router