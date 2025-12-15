const ZKLib = require('node-zklib');
const logger = require('../utils/logger');

class DeviceService {
  constructor() {
    this.device = null;
    this.connected = false;
    this.deviceInfo = null;
    this.realtimeMode = false;
  }

  /**
   * Connect to ZKTeco device
   */
  async connect(ip = null, port = null, timeout = null) {
    try {
      if (this.connected && this.device) {
        logger.info('Device already connected');
        return { success: true, message: 'Already connected' };
      }

      const deviceIp = ip || process.env.DEVICE_IP;
      const devicePort = parseInt(port || process.env.DEVICE_PORT || 4370);
      const deviceTimeout = parseInt(timeout || process.env.DEVICE_TIMEOUT || 5000);

      if (!deviceIp) {
        throw new Error('Device IP is required');
      }

      logger.info(`Connecting to device at ${deviceIp}:${devicePort}...`);

      this.device = new ZKLib(deviceIp, devicePort, deviceTimeout, 4000);
      await this.device.createSocket();
      
      this.connected = true;
      this.deviceInfo = await this.device.getInfo();

      logger.info('Device connected successfully');
      return {
        success: true,
        message: 'Connected successfully',
        deviceInfo: this.deviceInfo
      };
    } catch (error) {
      this.connected = false;
      this.device = null;
      logger.error('Failed to connect to device:', error);
      throw error;
    }
  }

  /**
   * Disconnect from ZKTeco device
   */
  async disconnect() {
    try {
      if (!this.device || !this.connected) {
        return { success: true, message: 'Already disconnected' };
      }

      if (this.realtimeMode) {
        await this.device.disableDevice();
        this.realtimeMode = false;
      }

      await this.device.disconnect();
      this.connected = false;
      this.device = null;
      this.deviceInfo = null;

      logger.info('Device disconnected successfully');
      return { success: true, message: 'Disconnected successfully' };
    } catch (error) {
      logger.error('Failed to disconnect from device:', error);
      throw error;
    }
  }

  /**
   * Get device connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      realtimeMode: this.realtimeMode,
      deviceInfo: this.deviceInfo
    };
  }

  /**
   * Get device information
   */
  async getDeviceInfo() {
    try {
      this.ensureConnected();
      const info = await this.device.getInfo();
      this.deviceInfo = info;
      return info;
    } catch (error) {
      logger.error('Failed to get device info:', error);
      throw error;
    }
  }

  /**
   * Reboot the device
   */
  async reboot() {
    try {
      this.ensureConnected();
      await this.device.restartDevice();
      this.connected = false;
      this.device = null;
      logger.info('Device rebooting...');
      return { success: true, message: 'Device is rebooting' };
    } catch (error) {
      logger.error('Failed to reboot device:', error);
      throw error;
    }
  }

  /**
   * Get all users from device
   */
  async getUsers() {
    try {
      this.ensureConnected();
      const users = await this.device.getUsers();
      logger.info(`Retrieved ${users.data.length} users from device`);
      return users.data;
    } catch (error) {
      logger.error('Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Set user data (enroll user)
   */
  async setUser(uid, userid, name, password, role = 0, cardno = 0) {
    try {
      this.ensureConnected();
      
      await this.device.setUser(uid, userid, name, password, role, cardno);
      logger.info(`User enrolled: ${userid} - ${name}`);
      
      return {
        success: true,
        message: 'User enrolled successfully',
        user: { uid, userid, name, role, cardno }
      };
    } catch (error) {
      logger.error('Failed to enroll user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(uid) {
    try {
      this.ensureConnected();
      await this.device.deleteUser(uid);
      logger.info(`User deleted: UID ${uid}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Clear all users
   * Note: Uses clearAdminPrivilege() from node-zklib which clears all user data from device
   */
  async clearAllUsers() {
    try {
      this.ensureConnected();
      // Note: clearAdminPrivilege() actually clears all users from the device
      await this.device.clearAdminPrivilege();
      logger.info('All users cleared');
      return { success: true, message: 'All users cleared successfully' };
    } catch (error) {
      logger.error('Failed to clear all users:', error);
      throw error;
    }
  }

  /**
   * Get attendance logs
   */
  async getAttendance() {
    try {
      this.ensureConnected();
      const logs = await this.device.getAttendances();
      logger.info(`Retrieved ${logs.data.length} attendance records`);
      return logs.data;
    } catch (error) {
      logger.error('Failed to get attendance logs:', error);
      throw error;
    }
  }

  /**
   * Clear attendance logs
   */
  async clearAttendance() {
    try {
      this.ensureConnected();
      await this.device.clearAttendanceLog();
      logger.info('Attendance logs cleared');
      return { success: true, message: 'Attendance logs cleared successfully' };
    } catch (error) {
      logger.error('Failed to clear attendance logs:', error);
      throw error;
    }
  }

  /**
   * Enable real-time mode
   */
  async enableRealtimeMode() {
    try {
      this.ensureConnected();
      
      if (this.realtimeMode) {
        return { success: true, message: 'Real-time mode already active' };
      }

      await this.device.getRealTimeLogs((data) => {
        logger.info('Real-time log:', data);
        // This callback will be triggered when attendance is recorded
      });

      this.realtimeMode = true;
      logger.info('Real-time mode enabled');
      return { success: true, message: 'Real-time mode enabled' };
    } catch (error) {
      logger.error('Failed to enable real-time mode:', error);
      throw error;
    }
  }

  /**
   * Disable real-time mode
   */
  async disableRealtimeMode() {
    try {
      this.ensureConnected();
      
      if (!this.realtimeMode) {
        return { success: true, message: 'Real-time mode already inactive' };
      }

      await this.device.disableDevice();
      this.realtimeMode = false;
      logger.info('Real-time mode disabled');
      return { success: true, message: 'Real-time mode disabled' };
    } catch (error) {
      logger.error('Failed to disable real-time mode:', error);
      throw error;
    }
  }

  /**
   * Ensure device is connected
   */
  ensureConnected() {
    if (!this.connected || !this.device) {
      throw new Error('Device not connected. Please connect first.');
    }
  }
}

// Export singleton instance
module.exports = new DeviceService();
