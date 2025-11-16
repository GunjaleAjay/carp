const { db } = require('../database/connection');

/**
 * @class UsersController
 * @description Handles user-related requests
 */
class UsersController {
  /**
   * Get user preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getPreferences(req, res, next) {
    try {
      const preferences = await db('user_preferences')
        .where('user_id', req.user.userId)
        .first();

      if (!preferences) {
        // Create default preferences if none exist
        const [prefId] = await db('user_preferences').insert({
          user_id: req.user.userId,
          avoid_tolls: false,
          avoid_highways: false,
          prefer_eco_routes: true,
          max_walking_distance_km: 2.0,
          max_cycling_distance_km: 10.0,
          default_travel_mode: 'driving'
        });

        const newPreferences = await db('user_preferences')
          .where('id', prefId)
          .first();

        return res.json({
          success: true,
          data: { preferences: newPreferences }
        });
      }

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updatePreferences(req, res, next) {
    try {
      const {
        avoid_tolls,
        avoid_highways,
        prefer_eco_routes,
        max_walking_distance_km,
        max_cycling_distance_km,
        default_travel_mode
      } = req.body;

      // Check if preferences exist
      const existingPreferences = await db('user_preferences')
        .where('user_id', req.user.userId)
        .first();

      if (existingPreferences) {
        // Update existing preferences
        await db('user_preferences')
          .where('user_id', req.user.userId)
          .update({
            avoid_tolls,
            avoid_highways,
            prefer_eco_routes,
            max_walking_distance_km,
            max_cycling_distance_km,
            default_travel_mode,
            updated_at: db.fn.now()
          });
      } else {
        // Create new preferences
        await db('user_preferences').insert({
          user_id: req.user.userId,
          avoid_tolls,
          avoid_highways,
          prefer_eco_routes,
          max_walking_distance_km,
          max_cycling_distance_km,
          default_travel_mode
        });
      }

      // Fetch updated preferences
      const preferences = await db('user_preferences')
        .where('user_id', req.user.userId)
        .first();

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.userId;

      // Get trip statistics
      const tripStats = await db('trips')
        .where('user_id', userId)
        .select(
          db.raw('COUNT(*) as total_trips'),
          db.raw('SUM(distance_km) as total_distance'),
          db.raw('SUM(estimated_co2_kg) as total_co2'),
          db.raw('AVG(estimated_co2_kg) as avg_co2_per_trip'),
          db.raw('MIN(created_at) as first_trip'),
          db.raw('MAX(created_at) as last_trip')
        )
        .first();

      // Get vehicle count
      const vehicleCount = await db('vehicles')
        .where('user_id', userId)
        .count('* as count')
        .first();

      // Get eco-friendly trip count
      const ecoTrips = await db('trips')
        .where('user_id', userId)
        .where('travel_mode', 'in', ['walking', 'cycling', 'transit'])
        .count('* as count')
        .first();

      res.json({
        success: true,
        data: {
          stats: {
            ...tripStats,
            vehicle_count: vehicleCount.count,
            eco_friendly_trips: ecoTrips.count,
            eco_friendly_percentage: tripStats.total_trips > 0 
              ? Math.round((ecoTrips.count / tripStats.total_trips) * 100) 
              : 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user activity log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getActivityLog(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get recent trips
      const trips = await db('trips')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCount = await db('trips')
        .where('user_id', userId)
        .count('* as count')
        .first();

      res.json({
        success: true,
        data: {
          trips,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.userId;

      // Start transaction
      await db.transaction(async (trx) => {
        // Delete user's trips
        await trx('trips').where('user_id', userId).del();
        
        // Delete user's vehicles
        await trx('vehicles').where('user_id', userId).del();
        
        // Delete user's preferences
        await trx('user_preferences').where('user_id', userId).del();
        
        // Delete user account
        await trx('users').where('id', userId).del();
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
