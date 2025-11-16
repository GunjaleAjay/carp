const { db } = require('../database/connection');

/**
 * @class Dashboard
 * @description Dashboard model for user dashboard data operations
 */
class Dashboard {
  /**
   * Get user dashboard data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Dashboard data
   */
  static async getUserDashboard(userId) {
    // Detect database type (SQLite or MySQL/PostgreSQL)
    const dbType = db.client.config.client;
    const isSQLite = dbType === 'sqlite3';
    const isMySQL = dbType === 'mysql2';

    // Get overall statistics
    const stats = await db('trips')
      .where('user_id', userId)
      .select(
        db.raw('COUNT(*) as total_trips'),
        db.raw('SUM(distance_km) as total_distance'),
        db.raw('SUM(co2_emissions_kg) as total_co2'),
        db.raw('AVG(co2_emissions_kg) as avg_co2_per_trip'),
        db.raw('MIN(created_at) as first_trip'),
        db.raw('MAX(created_at) as last_trip')
      )
      .first();

    // Get monthly CO2 emissions for the last 12 months
    let monthlyEmissions;
    if (isSQLite) {
      // SQLite date formatting
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      monthlyEmissions = await db('trips')
        .where('user_id', userId)
        .where('created_at', '>=', oneYearAgo.toISOString())
        .select(
          db.raw("strftime('%Y-%m', created_at) as month"),
          db.raw('SUM(co2_emissions_kg) as co2_kg')
        )
        .groupBy('month')
        .orderBy('month');
    } else if (isMySQL) {
      // MySQL date formatting
      monthlyEmissions = await db('trips')
        .where('user_id', userId)
        .where('created_at', '>=', db.raw("NOW() - INTERVAL 12 MONTH"))
        .select(
          db.raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
          db.raw('SUM(co2_emissions_kg) as co2_kg')
        )
        .groupBy('month')
        .orderBy('month');
    } else {
      // PostgreSQL date formatting
      monthlyEmissions = await db('trips')
        .where('user_id', userId)
        .where('created_at', '>=', db.raw("NOW() - INTERVAL '12 months'"))
        .select(
          db.raw("to_char(created_at, 'YYYY-MM') as month"),
          db.raw('SUM(co2_emissions_kg) as co2_kg')
        )
        .groupBy('month')
        .orderBy('month');
    }

    // Get travel mode distribution
    const travelModeStats = await db('trips')
      .where('user_id', userId)
      .select('travel_mode')
      .count('* as count')
      .groupBy('travel_mode');

    // Get eco-friendly trips percentage
    const ecoTrips = await db('trips')
      .where('user_id', userId)
      .whereIn('travel_mode', ['walking', 'cycling', 'transit'])
      .count('* as count')
      .first();

    // Get recent trips
    const recentTrips = await db('trips')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(5);

    // Calculate eco-friendly percentage
    const ecoPercentage = stats.total_trips > 0
      ? Math.round((ecoTrips.count / stats.total_trips) * 100)
      : 0;

    return {
      stats: {
        ...stats,
        eco_friendly_percentage: ecoPercentage
      },
      monthly_emissions: monthlyEmissions,
      travel_mode_distribution: travelModeStats,
      recent_trips: recentTrips
    };
  }

  /**
   * Get carbon savings analysis for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Carbon savings data
   */
  static async getCarbonSavings(userId) {
    // Get all trips with eco-friendly travel modes
    const trips = await db('trips')
      .where('user_id', userId)
      .whereIn('travel_mode', ['walking', 'cycling', 'transit'])
      .select('*');

    let totalSavings = 0;
    const savingsBreakdown = {
      walking: 0,
      cycling: 0,
      transit: 0,
      electric: 0
    };

    trips.forEach(trip => {
      if (trip.travel_mode === 'walking' || trip.travel_mode === 'cycling') {
        // Estimate CO2 savings compared to driving
        const drivingEmissions = trip.distance_km * 0.12; // 120g CO2/km for average car
        totalSavings += drivingEmissions;
        savingsBreakdown[trip.travel_mode] += drivingEmissions;
      } else if (trip.travel_mode === 'transit') {
        // Transit typically emits 50-80% less than driving
        const drivingEmissions = trip.distance_km * 0.12;
        const transitSavings = drivingEmissions * 0.7; // 70% savings
        totalSavings += transitSavings;
        savingsBreakdown.transit += transitSavings;
      }
    });

    // Convert to kg
    totalSavings = totalSavings / 1000;
    Object.keys(savingsBreakdown).forEach(key => {
      savingsBreakdown[key] = savingsBreakdown[key] / 1000;
    });

    return {
      total_co2_saved_kg: Math.round(totalSavings * 100) / 100,
      savings_breakdown: savingsBreakdown,
      trips_analyzed: trips.length,
      equivalent_trees_planted: Math.round(totalSavings * 0.04) // 1 tree absorbs ~25kg CO2/year
    };
  }
}

module.exports = Dashboard;
