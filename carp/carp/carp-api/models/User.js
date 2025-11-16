const { db } = require('../database/connection');

/**
 * @class User
 * @description User model for database operations
 */
class User {
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  static async findById(id) {
    return await db('users').where('id', id).first();
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  static async findByEmail(email) {
    return await db('users').where('email', email).first();
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<number>} Inserted user ID
   */
  static async create(userData) {
    const [userId] = await db('users').insert(userData);
    return userId;
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async updateById(id, updateData) {
    await db('users').where('id', id).update(updateData);
    return await this.findById(id);
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteById(id) {
    const deletedRows = await db('users').where('id', id).del();
    return deletedRows > 0;
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users and pagination info
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search, status } = options;
    const offset = (page - 1) * limit;

    let query = db('users').select('*');

    if (search) {
      query = query.where(function() {
        this.where('first_name', 'like', `%${search}%`)
          .orWhere('last_name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`);
      });
    }

    if (status) {
      query = query.where('status', status);
    }

    const users = await query
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    const totalCount = await db('users').count('* as count').first();

    return {
      users,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    };
  }

  /**
   * Update user status
   * @param {number} id - User ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated user object
   */
  static async updateStatus(id, status) {
    return await this.updateById(id, { status, updated_at: db.fn.now() });
  }

  /**
   * Get user statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  static async getStats(userId) {
    const stats = await db('users')
      .leftJoin('trips', 'users.id', '=', 'trips.user_id')
      .leftJoin('vehicles', 'users.id', '=', 'vehicles.user_id')
      .where('users.id', userId)
      .select(
        'users.id',
        'users.first_name',
        'users.last_name',
        'users.created_at',
        db.raw('COUNT(DISTINCT trips.id) as total_trips'),
        db.raw('COUNT(DISTINCT vehicles.id) as total_vehicles'),
        db.raw('COALESCE(SUM(trips.distance_km), 0) as total_distance'),
        db.raw('COALESCE(SUM(trips.estimated_co2_kg), 0) as total_co2')
      )
      .groupBy('users.id')
      .first();

    return stats;
  }
}

module.exports = User;
