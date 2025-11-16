const { db } = require('../database/connection');
const { Dashboard } = require('../models');

/**
 * @class AnalyticsController
 * @description Handles analytics and dashboard requests
 */
class AnalyticsController {
  /**
   * Get user dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user.userId;
      const dashboardData = await Dashboard.getUserDashboard(userId);

      res.json({
        success: true,
        data: {
          dashboard: dashboardData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get emission statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getEmissionStats(req, res, next) {
    try {
      const { period = '30d', vehicle_id } = req.query;
      const userId = req.user.userId;

      // Detect database type
      const dbType = db.client.config.client;
      const isSQLite = dbType === 'sqlite3';
      const isMySQL = dbType === 'mysql2';

      let dateFilter;
      if (isSQLite) {
        const date = new Date();
        switch (period) {
          case '7d':
            date.setDate(date.getDate() - 7);
            break;
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
          case '90d':
            date.setDate(date.getDate() - 90);
            break;
          case '1y':
            date.setFullYear(date.getFullYear() - 1);
            break;
          default:
            date.setDate(date.getDate() - 30);
        }
        dateFilter = date.toISOString();
      } else if (isMySQL) {
        switch (period) {
          case '7d':
            dateFilter = db.raw("NOW() - INTERVAL 7 DAY");
            break;
          case '30d':
            dateFilter = db.raw("NOW() - INTERVAL 30 DAY");
            break;
          case '90d':
            dateFilter = db.raw("NOW() - INTERVAL 90 DAY");
            break;
          case '1y':
            dateFilter = db.raw("NOW() - INTERVAL 1 YEAR");
            break;
          default:
            dateFilter = db.raw("NOW() - INTERVAL 30 DAY");
        }
      } else {
        switch (period) {
          case '7d':
            dateFilter = db.raw("NOW() - INTERVAL '7 days'");
            break;
          case '30d':
            dateFilter = db.raw("NOW() - INTERVAL '30 days'");
            break;
          case '90d':
            dateFilter = db.raw("NOW() - INTERVAL '90 days'");
            break;
          case '1y':
            dateFilter = db.raw("NOW() - INTERVAL '1 year'");
            break;
          default:
            dateFilter = db.raw("NOW() - INTERVAL '30 days'");
        }
      }

      let query = db('trips')
        .where('user_id', userId)
        .where('created_at', '>=', dateFilter);

      if (vehicle_id) {
        query = query.where('vehicle_id', vehicle_id);
      }

      const stats = await query
        .clone()
        .select(
          db.raw('SUM(distance_km) as total_distance'),
          db.raw('SUM(co2_emissions_kg) as total_co2'),
          db.raw('AVG(co2_emissions_kg) as avg_co2_per_trip'),
          db.raw('MAX(co2_emissions_kg) as max_co2'),
          db.raw('MIN(co2_emissions_kg) as min_co2'),
          db.raw('COUNT(*) as trip_count')
        )
        .first();

      // Get daily emissions for the period
      let dailyEmissions;
      if (isSQLite) {
        dailyEmissions = await query
          .clone()
          .select(
            db.raw("date(created_at) as date"),
            db.raw('SUM(co2_emissions_kg) as co2_kg'),
            db.raw('COUNT(*) as trip_count')
          )
          .groupBy('date')
          .orderBy('date');
      } else if (isMySQL) {
        dailyEmissions = await query
          .clone()
          .select(
            db.raw('DATE(created_at) as date'),
            db.raw('SUM(co2_emissions_kg) as co2_kg'),
            db.raw('COUNT(*) as trip_count')
          )
          .groupBy('date')
          .orderBy('date');
      } else {
        dailyEmissions = await query
          .clone()
          .select(
            db.raw('date(created_at) as date'),
            db.raw('SUM(co2_emissions_kg) as co2_kg'),
            db.raw('COUNT(*) as trip_count')
          )
          .groupBy('date')
          .orderBy('date');
      }

      res.json({
        success: true,
        data: {
          period,
          stats,
          daily_emissions: dailyEmissions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get carbon savings analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getCarbonSavings(req, res, next) {
    try {
      const userId = req.user.userId;
      const carbonSavingsData = await Dashboard.getCarbonSavings(userId);

      res.json({
        success: true,
        data: carbonSavingsData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get leaderboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getLeaderboard(req, res, next) {
    try {
      const { type = 'eco_friendly', limit = 10 } = req.query;

      let leaderboard;

      if (type === 'eco_friendly') {
        // Users with highest percentage of eco-friendly trips
        leaderboard = await db('users')
          .join('trips', 'users.id', '=', 'trips.user_id')
          .select(
            'users.id',
            'users.first_name',
            'users.last_name',
            db.raw('COUNT(*) as total_trips'),
            db.raw("SUM(CASE WHEN travel_mode IN ('walking', 'cycling', 'transit') THEN 1 ELSE 0 END) as eco_trips")
          )
          .groupBy('users.id', 'users.first_name', 'users.last_name')
          .having('total_trips', '>=', 5) // Minimum 5 trips to be on leaderboard
          .orderByRaw('(eco_trips / total_trips) DESC')
          .limit(parseInt(limit));
      } else if (type === 'carbon_saved') {
        // Users who saved most CO2
        leaderboard = await db('users')
          .join('trips', 'users.id', '=', 'trips.user_id')
          .select(
            'users.id',
            'users.first_name',
            'users.last_name',
            db.raw("SUM(CASE WHEN travel_mode IN ('walking', 'cycling') THEN distance_km * 0.12 ELSE 0 END) as co2_saved")
          )
          .groupBy('users.id', 'users.first_name', 'users.last_name')
          .orderBy('co2_saved', 'desc')
          .limit(parseInt(limit));
      }

      res.json({
        success: true,
        data: {
          type,
          leaderboard
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trends analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getTrends(req, res, next) {
    try {
      const userId = req.user.userId;
      const { months = 6 } = req.query;

      // Detect database type
      const dbType = db.client.config.client;
      const isSQLite = dbType === 'sqlite3';
      const isMySQL = dbType === 'mysql2';

      // Calculate date filter
      const dateFilter = new Date();
      dateFilter.setMonth(dateFilter.getMonth() - parseInt(months));
      const dateFilterISO = dateFilter.toISOString();

      // Get monthly trends
      let monthlyTrends;
      if (isSQLite) {
        monthlyTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', dateFilterISO)
          .select(
            db.raw("strftime('%Y-%m', created_at) as month"),
            db.raw('SUM(co2_emissions_kg) as total_co2'),
            db.raw('SUM(distance_km) as total_distance'),
            db.raw('COUNT(*) as trip_count'),
            db.raw("SUM(CASE WHEN travel_mode IN ('walking', 'cycling', 'transit') THEN 1 ELSE 0 END) as eco_trips_count")
          )
          .groupBy('month')
          .orderBy('month');
      } else if (isMySQL) {
        monthlyTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', db.raw(`NOW() - INTERVAL ${parseInt(months)} MONTH`))
          .select(
            db.raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            db.raw('SUM(co2_emissions_kg) as total_co2'),
            db.raw('SUM(distance_km) as total_distance'),
            db.raw('COUNT(*) as trip_count'),
            db.raw("SUM(CASE WHEN travel_mode IN ('walking', 'cycling', 'transit') THEN 1 ELSE 0 END) as eco_trips_count")
          )
          .groupBy('month')
          .orderBy('month');
      } else {
        monthlyTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${parseInt(months)} months'`))
          .select(
            db.raw("to_char(created_at, 'YYYY-MM') as month"),
            db.raw('SUM(co2_emissions_kg) as total_co2'),
            db.raw('SUM(distance_km) as total_distance'),
            db.raw('COUNT(*) as trip_count'),
            db.raw("SUM(CASE WHEN travel_mode IN ('walking', 'cycling', 'transit') THEN 1 ELSE 0 END) as eco_trips_count")
          )
          .groupBy('month')
          .orderBy('month');
      }

      // Get travel mode trends
      let travelModeTrends;
      if (isSQLite) {
        travelModeTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', dateFilterISO)
          .select(
            'travel_mode',
            db.raw("strftime('%Y-%m', created_at) as month"),
            db.raw('COUNT(*) as count')
          )
          .groupBy('travel_mode', 'month')
          .orderBy('month');
      } else if (isMySQL) {
        travelModeTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', db.raw(`NOW() - INTERVAL ${parseInt(months)} MONTH`))
          .select(
            'travel_mode',
            db.raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            db.raw('COUNT(*) as count')
          )
          .groupBy('travel_mode', 'month')
          .orderBy('month');
      } else {
        travelModeTrends = await db('trips')
          .where('user_id', userId)
          .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${parseInt(months)} months'`))
          .select(
            'travel_mode',
            db.raw("to_char(created_at, 'YYYY-MM') as month"),
            db.raw('COUNT(*) as count')
          )
          .groupBy('travel_mode', 'month')
          .orderBy('month');
      }

      res.json({
        success: true,
        data: {
          monthly_trends: monthlyTrends,
          travel_mode_trends: travelModeTrends
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
