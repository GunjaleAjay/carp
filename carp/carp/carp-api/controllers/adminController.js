const { AdminService } = require('../services/adminService_new');

/**
 * @class AdminController
 * @description Handles admin-related requests
 */
class AdminController {
  /**
   * Get admin dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getDashboard(req, res, next) {
    try {
      const dashboardData = await AdminService.getDashboardData();
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const result = await AdminService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getUser(req, res, next) {
    try {
      const user = await AdminService.getUserById(req.params.id);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await AdminService.updateUserStatus(req.params.id, status);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteUser(req, res, next) {
    try {
      await AdminService.deleteUser(req.params.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all emission factors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getEmissionFactors(req, res, next) {
    try {
      const emissionFactors = await AdminService.getEmissionFactors();
      res.json({
        success: true,
        data: { emission_factors: emissionFactors }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add new emission factor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async addEmissionFactor(req, res, next) {
    try {
      const emissionFactor = await AdminService.addEmissionFactor(req.body);
      res.status(201).json({
        success: true,
        data: { emission_factor: emissionFactor }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update emission factor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updateEmissionFactor(req, res, next) {
    try {
      const emissionFactor = await AdminService.updateEmissionFactor(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: { emission_factor: emissionFactor }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete emission factor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteEmissionFactor(req, res, next) {
    try {
      await AdminService.deleteEmissionFactor(req.params.id);
      res.json({
        success: true,
        message: 'Emission factor deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, level, action, user_id } = req.query;
      const result = await AdminService.getLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        level,
        action,
        user_id
      });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getSystemStats(req, res, next) {
    try {
      const stats = await AdminService.getSystemStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getUserAnalytics(req, res, next) {
    try {
      const { period = '30d', group_by = 'day' } = req.query;
      const analytics = await AdminService.getUserAnalytics({
        period,
        group_by
      });
      res.json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get emission analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getEmissionAnalytics(req, res, next) {
    try {
      const { period = '30d', vehicle_type } = req.query;
      const analytics = await AdminService.getEmissionAnalytics({
        period,
        vehicle_type
      });
      res.json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async exportData(req, res, next) {
    try {
      const { type, format = 'json', date_from, date_to } = req.query;
      const exportData = await AdminService.exportData({
        type,
        format,
        date_from,
        date_to
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
        res.send(exportData);
      } else {
        res.json({
          success: true,
          data: exportData
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system health
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getSystemHealth(req, res, next) {
    try {
      const health = await AdminService.getSystemHealth();
      res.json({
        success: true,
        data: { health }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
