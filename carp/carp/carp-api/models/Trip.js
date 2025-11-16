const { db } = require('../database/connection');

/**
 * @class Trip
 * @description Trip model for database operations
 */
class Trip {
  /**
   * Find trip by ID
   * @param {number} id - Trip ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Trip object
   */
  static async findById(id, userId = null) {
    let query = db('trips').where('id', id);
    
    if (userId) {
      query = query.where('user_id', userId);
    }
    
    return await query.first();
  }

  /**
   * Get trips for a user with pagination and filters
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Trips and pagination info
   */
  static async findByUserId(userId, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      travel_mode, 
      date_from, 
      date_to 
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db('trips')
      .leftJoin('vehicles', 'trips.vehicle_id', '=', 'vehicles.id')
      .where('trips.user_id', userId)
      .select(
        'trips.*',
        'vehicles.make',
        'vehicles.model',
        'vehicles.vehicle_type',
        'vehicles.fuel_type'
      );

    if (travel_mode) {
      query = query.where('trips.travel_mode', travel_mode);
    }

    if (date_from) {
      query = query.where('trips.created_at', '>=', date_from);
    }

    if (date_to) {
      query = query.where('trips.created_at', '<=', date_to);
    }

    const trips = await query
      .orderBy('trips.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('trips')
      .where('user_id', userId)
      .count('* as count')
      .first();

    return {
      trips,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    };
  }

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise<number>} Inserted trip ID
   */
  static async create(tripData) {
    const [tripId] = await db('trips').insert(tripData);
    return tripId;
  }

  /**
   * Update trip by ID
   * @param {number} id - Trip ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated trip object
   */
  static async updateById(id, userId, updateData) {
    await db('trips')
      .where('id', id)
      .where('user_id', userId)
      .update(updateData);
    
    return await this.findById(id, userId);
  }

  /**
   * Delete trip by ID
   * @param {number} id - Trip ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} Success status
   */
  static async deleteById(id, userId) {
    const deletedRows = await db('trips')
      .where('id', id)
      .where('user_id', userId)
      .del();
    
    return deletedRows > 0;
  }

  /**
   * Get user trip statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Trip statistics
   */
  static async getUserStats(userId) {
    const stats = await db('trips')
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

    return stats;
  }

  /**
   * Get monthly emissions for user
   * @param {number} userId - User ID
   * @param {number} months - Number of months to look back
   * @returns {Promise<Array>} Monthly emissions data
   */
  static async getMonthlyEmissions(userId, months = 12) {
    return await db('trips')
      .where('user_id', userId)
      .where('created_at', '>=', db.raw(`DATE_SUB(NOW(), INTERVAL ${months} MONTH)`))
      .select(
        db.raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
        db.raw('SUM(estimated_co2_kg) as co2_kg'),
        db.raw('SUM(distance_km) as total_distance'),
        db.raw('COUNT(*) as trip_count')
      )
      .groupBy('month')
      .orderBy('month');
  }

  /**
   * Get travel mode distribution for user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Travel mode statistics
   */
  static async getTravelModeStats(userId) {
    return await db('trips')
      .where('user_id', userId)
      .select('travel_mode')
      .count('* as count')
      .groupBy('travel_mode');
  }

  /**
   * Get recent trips for user
   * @param {number} userId - User ID
   * @param {number} limit - Number of trips to return
   * @returns {Promise<Array>} Recent trips
   */
  static async getRecentTrips(userId, limit = 5) {
    return await db('trips')
      .leftJoin('vehicles', 'trips.vehicle_id', '=', 'vehicles.id')
      .where('trips.user_id', userId)
      .select(
        'trips.*',
        'vehicles.make',
        'vehicles.model'
      )
      .orderBy('trips.created_at', 'desc')
      .limit(limit);
  }

  /**
   * Get eco-friendly trips count for user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count of eco-friendly trips
   */
  static async getEcoFriendlyTripsCount(userId) {
    const result = await db('trips')
      .where('user_id', userId)
      .where('travel_mode', 'in', ['walking', 'cycling', 'transit'])
      .count('* as count')
      .first();

    return result.count;
  }
}

module.exports = Trip;
