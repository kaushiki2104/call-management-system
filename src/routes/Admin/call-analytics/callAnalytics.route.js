
import express from 'express';
import { getCallAnalytics, getCallsPerLeader, getCallsPerManager, getCallsPerUser } from '../../../controllers/admin/call-analytics/callAnalyticsController.js';


const router = express.Router();

router.get('/', getCallAnalytics) // ?level = user | manager | leader

 

export default router





