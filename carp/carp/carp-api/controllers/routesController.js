const { RoutePlanning } = require('../models');

/**
 * @class RoutesController
 * @description Handles route planning and carbon calculation requests
 */
class RoutesController {
  /**
   * Plan carbon-aware route
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async planRoute(req, res, next) {
    try {
      const {
        origin,
        destination,
        vehicle_id,
        travel_mode,
        avoid_tolls,
        avoid_highways,
        prefer_eco_routes
      } = req.body;

      const userId = req.user.userId;

      const result = await RoutePlanning.planRoute({
        origin,
        destination,
        vehicle_id,
        travel_mode,
        avoid_tolls,
        avoid_highways,
        prefer_eco_routes,
        userId
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
   * Get route alternatives
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getRouteAlternatives(req, res, next) {
    try {
      const {
        origin,
        destination,
        vehicle_id,
        avoid_tolls,
        avoid_highways
      } = req.body;

      const userId = req.user.userId;

      const alternatives = await RoutePlanning.getRouteAlternatives({
        origin,
        destination,
        vehicle_id,
        avoid_tolls,
        avoid_highways,
        userId
      });

      res.json({
        success: true,
        data: { alternatives }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save route to history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async saveRoute(req, res, next) {
    try {
      const {
        origin_name,
        destination_name,
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng,
        route_data,
        vehicle_id,
        travel_mode,
        distance_km,
        duration_minutes,
        co2_emissions_kg,
        planned_date
      } = req.body;

      const userId = req.user.userId;

      const trip = await RoutePlanning.saveTrip(userId, {
        origin_name,
        destination_name,
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng,
        route_data,
        vehicle_id,
        travel_mode,
        distance_km,
        duration_minutes,
        co2_emissions_kg,
        planned_date
      });

      res.status(201).json({
        success: true,
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getRouteHistory(req, res, next) {
    try {
      const { page = 1, limit = 10, travel_mode, date_from, date_to } = req.query;
      const userId = req.user.userId;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        travel_mode,
        date_from,
        date_to
      };

      const result = await RoutePlanning.getRouteHistory(userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getRoute(req, res, next) {
    try {
      const trip = await RoutePlanning.getTripById(req.params.id, req.user.userId);
      res.json({
        success: true,
        data: { trip }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete route from history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteRoute(req, res, next) {
    try {
      await RoutePlanning.deleteTrip(req.params.id, req.user.userId);
      res.json({
        success: true,
        message: 'Route deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get eco-suggestions for a route
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getEcoSuggestions(req, res, next) {
    try {
      const { origin, destination, vehicle_id } = req.body;
      const userId = req.user.userId;

      const suggestions = await RoutePlanning.getEcoSuggestions({
        origin,
        destination,
        vehicle_id,
        userId
      });

      res.json({
        success: true,
        data: { suggestions }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get nearby eco-friendly options
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getNearbyEcoOptions(req, res, next) {
    try {
      const { lat, lng, radius = 1000 } = req.query;
      const userId = req.user.userId;

      const options = await RoutePlanning.getNearbyEcoOptions({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: parseInt(radius),
        userId
      });

      res.json({
        success: true,
        data: { eco_options: options }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoutesController;
