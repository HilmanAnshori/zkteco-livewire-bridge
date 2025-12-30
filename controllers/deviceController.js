const deviceService = require('../services/deviceService');
const logger = require('../utils/logger');

/**
 * Connect to device
 */
exports.connect = async (req, res) => {
  try {
    const { ip, port, timeout } = req.body;
    const result = await deviceService.connect(ip, port, timeout);
    res.json(result);
  } catch (error) {
    logger.error('Device connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to device'
    });
  }
};

/**
 * Disconnect from device
 */
exports.disconnect = async (req, res) => {
  try {
    const result = await deviceService.disconnect();
    res.json(result);
  } catch (error) {
    logger.error('Device disconnection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to disconnect from device'
    });
  }
};

/**
 * Get device status
 */
exports.getStatus = (req, res) => {
  try {
    const status = deviceService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get device status'
    });
  }
};

/**
 * Get device information
 */
exports.getDeviceInfo = async (req, res) => {
  try {
    const info = await deviceService.getDeviceInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('Get device info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get device information'
    });
  }
};

/**
 * Reboot device
 */
exports.reboot = async (req, res) => {
  try {
    const result = await deviceService.reboot();
    res.json(result);
  } catch (error) {
    logger.error('Device reboot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reboot device'
    });
  }
};
