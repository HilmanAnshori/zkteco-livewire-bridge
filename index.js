const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const deviceController = require('./controllers/deviceController');
const userController = require('./controllers/userController');
const attendanceController = require('./controllers/attendanceController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Key middleware for security
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

// Apply API key authentication to all routes
app.use('/api', apiKeyAuth);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ZKTeco Bridge Server is running',
    timestamp: new Date().toISOString()
  });
});

// Device routes
app.post('/api/device/connect', deviceController.connect);
app.post('/api/device/disconnect', deviceController.disconnect);
app.get('/api/device/status', deviceController.getStatus);
app.get('/api/device/info', deviceController.getDeviceInfo);
app.post('/api/device/reboot', deviceController.reboot);

// User management routes
app.post('/api/users/enroll', userController.enrollUser);
app.get('/api/users', userController.getUsers);
app.get('/api/users/:uid', userController.getUser);
app.delete('/api/users/:uid', userController.deleteUser);
app.delete('/api/users', userController.clearAllUsers);

// Attendance routes
app.get('/api/attendance', attendanceController.getAttendance);
app.delete('/api/attendance', attendanceController.clearAttendance);
app.post('/api/attendance/realtime/start', attendanceController.startRealtime);
app.post('/api/attendance/realtime/stop', attendanceController.stopRealtime);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, HOST, () => {
  logger.info(`ZKTeco Bridge Server running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
