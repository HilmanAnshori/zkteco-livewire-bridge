const deviceService = require('../services/deviceService');
const logger = require('../utils/logger');

/**
 * Get attendance logs
 */
exports.getAttendance = async (req, res) => {
  try {
    const logs = await deviceService.getAttendance();
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    logger.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get attendance logs'
    });
  }
};

/**
 * Clear attendance logs
 */
exports.clearAttendance = async (req, res) => {
  try {
    const result = await deviceService.clearAttendance();
    res.json(result);
  } catch (error) {
    logger.error('Clear attendance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear attendance logs'
    });
  }
};

/**
 * Start real-time attendance monitoring
 */
exports.startRealtime = async (req, res) => {
  try {
    const result = await deviceService.enableRealtimeMode();
    res.json(result);
  } catch (error) {
    logger.error('Start realtime error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start real-time mode'
    });
  }
};

/**
 * Stop real-time attendance monitoring
 */
exports.stopRealtime = async (req, res) => {
  try {
    const result = await deviceService.disableRealtimeMode();
    res.json(result);
  } catch (error) {
    logger.error('Stop realtime error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to stop real-time mode'
    });
  }
};
