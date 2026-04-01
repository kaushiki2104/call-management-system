



import express from 'express'
// const callController = require('../controllers/call.controller')
import authMiddleware from '../../middleware/auth.middleware.js'
import { upload } from '../../middleware/upload.middleware.js'
import {createCall, getAllCalls, getCallStats} from '../../controllers/user/call.controller.js'
const router = express.Router()

// router.post('/',authMiddleware, createCall)
router.get('/',authMiddleware, getAllCalls)
router.get('/stats', authMiddleware, getCallStats)
router.post(
  '/',
  authMiddleware,
  upload.single('audio'),
  createCall
)
export default router