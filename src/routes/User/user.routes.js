import express from 'express'
import { getAllUsers, getUserCalls } from '../../controllers/user/user.controller.js'
// const userController = require('../controllers/user.controller')
import authMiddleware from '../../middleware/auth.middleware.js'

const router = express.Router()
// router.post('/', authMiddleware, registerUser)
router.get('/',authMiddleware, getAllUsers)
router.get('/:id',authMiddleware, getUserCalls)

export default router







