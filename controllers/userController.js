const deviceService = require('../services/deviceService');
const logger = require('../utils/logger');

/**
 * Enroll a new user
 */
exports.enrollUser = async (req, res) => {
  try {
    const { uid, userid, name, password, role, cardno } = req.body;

    if (!uid || !userid || !name) {
      return res.status(400).json({
        success: false,
        message: 'uid, userid, and name are required'
      });
    }

    const result = await deviceService.setUser(
      parseInt(uid),
      userid,
      name,
      password || '',
      parseInt(role || 0),
      parseInt(cardno || 0)
    );

    res.json(result);
  } catch (error) {
    logger.error('User enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enroll user'
    });
  }
};

/**
 * Get all users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await deviceService.getUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users'
    });
  }
};

/**
 * Get a specific user
 */
exports.getUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const users = await deviceService.getUsers();
    const user = users.find(u => u.uid === parseInt(uid));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user'
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await deviceService.deleteUser(parseInt(uid));
    res.json(result);
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
};

/**
 * Clear all users
 */
exports.clearAllUsers = async (req, res) => {
  try {
    const result = await deviceService.clearAllUsers();
    res.json(result);
  } catch (error) {
    logger.error('Clear users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear all users'
    });
  }
};
