import express from "express";
import cors from "cors";
import errorMiddleware from './middleware/error.middleware.js'


import userRoutes from './routes/User/user.routes.js';
import callRoutes from './routes/Call/call.routes.js'
import loginRoute from './routes/Authentication/login.route.js'
import AdminRoute from './routes/Admin/admin.route.js'
import SuperAdminRoute from './routes/super-admin/super-admin.routes.js'
import ManagerRoute from './routes/Manager/manager.route.js'

import os from 'os';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorMiddleware);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API working 🚀" });
});

app.use('/api/login', loginRoute)
app.use('/api/users', userRoutes)
app.use('/api/calls', callRoutes)

// Admin 
app.use('/api/admin', AdminRoute)

// manager 

app.use('/api/manager', ManagerRoute)

// super admin 
app.use('/api/super-admin', SuperAdminRoute)

const uploadPath = path.join(os.tmpdir(), 'callLogFile');
app.use('/callLogFile', express.static(uploadPath))

app.use((err, req, res, next) => {
  console.error(err)

  res.status(err.statusCode || 500).json({
    success: false,
    message: "Internal Server Error"
  })
})
export default app; 