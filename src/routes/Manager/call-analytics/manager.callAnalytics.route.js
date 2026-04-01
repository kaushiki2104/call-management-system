import express from 'express'
import { getManagerCalls } from '../../../controllers/manager/call-analytics/manager.callAnalyticController.js';

const router = express.Router();

router.get('/', getManagerCalls)



export default router



