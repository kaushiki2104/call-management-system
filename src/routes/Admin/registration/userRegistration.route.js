import express from 'express'
import { createUser } from '../../../controllers/admin/user-registration/registration.controller.js'


const router = express.Router();

router.post('/', createUser)



export default router








