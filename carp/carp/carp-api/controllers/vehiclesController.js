const { VehicleService } = require('../services/vehicleService');

/**
 * @class VehiclesController
 * @description Handles vehicle-related requests
 */
class VehiclesController {
  /**
   * Get all user vehicles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getVehicles(req, res, next) {
    try {
      const vehicles = await VehicleService.getUserVehicles(req.user.userId);
      res.json({
        success: true,
        data: { vehicles }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vehicle by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getVehicle(req, res, next) {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id, req.user.userId);
      res.json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add new vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async addVehicle(req, res, next) {
    try {
      const vehicle = await VehicleService.addVehicle(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updateVehicle(req, res, next) {
    try {
      const vehicle = await VehicleService.updateVehicle(
        req.params.id,
        req.user.userId,
        req.body
      );
      res.json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteVehicle(req, res, next) {
    try {
      await VehicleService.deleteVehicle(req.params.id, req.user.userId);
      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set default vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async setDefaultVehicle(req, res, next) {
    try {
      await VehicleService.setDefaultVehicle(req.params.id, req.user.userId);
      res.json({
        success: true,
        message: 'Default vehicle updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vehicle emission factors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getEmissionFactors(req, res, next) {
    try {
      const factors = await VehicleService.getEmissionFactors();
      res.json({
        success: true,
        data: { emission_factors: factors }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate emissions for a specific route and vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async calculateEmissions(req, res, next) {
    try {
      const { distance_km, vehicle_id } = req.body;
      const emissions = await VehicleService.calculateEmissions(
        distance_km,
        vehicle_id,
        req.user.userId
      );
      res.json({
        success: true,
        data: { emissions }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VehiclesController;
