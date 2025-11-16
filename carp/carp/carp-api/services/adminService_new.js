const { db } = require('../database/connection');
const { createError } = require('../middleware/errorHandler');

/**
 * Admin service for system administration
 */
class AdminService {
  /**
   * Get admin dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  static async getDashboardData() {
    try {
      // Get user statistics
      const userStats = await db('users')
        .select(
          db.raw('COUNT(*) as total_users'),
          db.raw('COUNT(CASE WHEN status = "active" THEN 1 END) as active_users'),
          db.raw('COUNT(CASE WHEN role = "admin" THEN 1 END) as admin_users'),
          db.raw('COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d')
        )
        .first();

      // Get vehicle statistics
      const vehicleStats = await db('vehicles')
        .where('is_active', true)
        .select(
          db.raw('COUNT(*) as total_vehicles'),
          db.raw('COUNT(CASE WHEN vehicle_type = "car" THEN 1 END) as cars'),
          db.raw('COUNT(CASE WHEN vehicle_type = "motorcycle" THEN 1 END) as motorcycles'),
          db.raw('COUNT(CASE WHEN fuel_type = "electric" THEN 1 END) as electric_vehicles')
        )
        .first();

      // Get trip statistics
      const tripStats = await db('trips')
        .where('is_saved', true)
        .select(
          db.raw('COUNT(*) as total_trips'),
          db.raw('SUM(distance_km) as total_distance_km'),
          db.raw('SUM(co2_emissions_kg) as total_co2_emitted_kg'),
          db.raw('SUM(co2_saved_kg) as total_co2_saved_kg'),
          db.raw('COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as trips_30d')
        )
        .first();

      // Get recent activity
      const recentUsers = await db('users')
        .select('id', 'first_name', 'last_name', 'email', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(5);

      const recentTrips = await db('trips')
        .select('id', 'distance_km', 'co2_emissions_kg', 'co2_saved_kg', 'created_at')
        .where('is_saved', true)
        .orderBy('created_at', 'desc')
        .limit(5);

      return {
        users: userStats,
        vehicles: vehicleStats,
        trips: tripStats,
        recent_users: recentUsers,
        recent_trips: recentTrips
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users and total count
   */
  static async getUsers(options = {}) {
    try {
      let query = db('users').select('*');
      let countQuery = db('users').count('id as count');

      // Apply filters
      if (options.search) {
        const searchTerm = `%${options.search}%`;
        query = query.where(function() {
          this.where('email', 'like', searchTerm)
            .orWhere('first_name', 'like', searchTerm)
            .orWhere('last_name', 'like', searchTerm);
        });
        countQuery = countQuery.where(function() {
          this.where('email', 'like', searchTerm)
            .orWhere('first_name', 'like', searchTerm)
            .orWhere('last_name', 'like', searchTerm);
        });
      }

      if (options.status) {
        query = query.where('status', options.status);
        countQuery = countQuery.where('status', options.status);
      }

      // Get total count
      const totalResult = await countQuery.first();
      const total = totalResult?.count || 0;

      // Apply pagination and ordering
      query = query
        .orderBy('created_at', 'desc')
        .limit(options.limit || 20)
        .offset(options.offset || 0);

      const users = await query;

      return { users, total };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID (admin view)
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async getUserById(userId) {
    try {
      const user = await db('users').where('id', userId).first();
      return user || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user status
   * @param {number} userId - User ID
   * @param {string} status - User status
   * @returns {Promise<Object>} Updated user
   */
  static async updateUserStatus(userId, status) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      const oldData = { status: user.status };
      const newData = { status, updated_at: new Date() };

      await db('users').where('id', userId).update(newData);

      const updatedUser = await this.getUserById(userId);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} userId - User ID
   */
  static async deleteUser(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Soft delete - deactivate user and related data
      await db.transaction(async (trx) => {
        // Deactivate user
        await trx('users').where('id', userId).update({ status: 'inactive', updated_at: new Date() });

        // Deactivate user's vehicles
        await trx('vehicles').where('user_id', userId).update({ is_active: false, updated_at: new Date() });

        // Mark trips as not saved
        await trx('trips').where('user_id', userId).update({ is_saved: false, updated_at: new Date() });
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all emission factors
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of emission factors
   */
  static async getEmissionFactors(options = {}) {
    try {
      let query = db('emission_factors').select('*');

      if (options.vehicleType) {
        query = query.where('vehicle_type', options.vehicleType);
      }

      if (options.fuelType) {
        query = query.where('fuel_type', options.fuelType);
      }

      if (options.isActive !== undefined) {
        query = query.where('is_active', options.isActive);
      }

      return await query.orderBy('vehicle_type').orderBy('fuel_type');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add emission factor
   * @param {Object} emissionFactorData - Emission factor data
   * @returns {Promise<Object>} Created emission factor
   */
  static async addEmissionFactor(emissionFactorData) {
    try {
      // Check if combination already exists
      const existing = await db('emission_factors')
        .where('vehicle_type', emissionFactorData.vehicle_type)
        .where('fuel_type', emissionFactorData.fuel_type)
        .first();

      if (existing) {
        throw createError('Emission factor for this vehicle type and fuel type already exists', 400);
      }

      const [factorId] = await db('emission_factors').insert({
        vehicle_type: emissionFactorData.vehicle_type,
        fuel_type: emissionFactorData.fuel_type,
        emission_factor_kg_per_liter: emissionFactorData.emission_factor_kg_per_liter,
        description: emissionFactorData.description,
        is_active: emissionFactorData.is_active !== false,
        created_at: new Date(),
        updated_at: new Date()
      });

      const factor = await db('emission_factors').where('id', factorId).first();
      if (!factor) {
        throw createError('Failed to create emission factor', 500);
      }

      return factor;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update emission factor
   * @param {number} factorId - Emission factor ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated emission factor
   */
  static async updateEmissionFactor(factorId, updateData) {
    try {
      const existingFactor = await db('emission_factors').where('id', factorId).first();
      if (!existingFactor) {
        throw createError('Emission factor not found', 404);
      }

      const allowedFields = ['vehicle_type', 'fuel_type', 'emission_factor_kg_per_liter', 'description', 'is_active'];
      const filteredData = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw createError('No valid fields to update', 400);
      }

      filteredData.updated_at = new Date();

      await db('emission_factors').where('id', factorId).update(filteredData);

      const updatedFactor = await db('emission_factors').where('id', factorId).first();
      if (!updatedFactor) {
        throw createError('Emission factor not found', 404);
      }

      return updatedFactor;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete emission factor
   * @param {number} factorId - Emission factor ID
   */
  static async deleteEmissionFactor(factorId) {
    try {
      const factor = await db('emission_factors').where('id', factorId).first();
      if (!factor) {
        throw createError('Emission factor not found', 404);
      }

      // Soft delete - deactivate instead of hard delete
      await db('emission_factors').where('id', factorId).update({
        is_active: false,
        updated_at: new Date()
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get system logs
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Admin logs and total count
   */
  static async getLogs(options = {}) {
    try {
      let query = db('admin_logs').select('*');
      let countQuery = db('admin_logs').count('id as count');

      // Apply filters
      if (options.level) {
        query = query.where('level', options.level);
        countQuery = countQuery.where('level', options.level);
      }

      if (options.action) {
        query = query.where('action', options.action);
        countQuery = countQuery.where('action', options.action);
      }

      if (options.user_id) {
        query = query.where('admin_id', options.user_id);
        countQuery = countQuery.where('admin_id', options.user_id);
      }

      // Apply search filter
      if (options.search) {
        const searchTerm = `%${options.search}%`;
        query = query.where(function() {
          this.where('message', 'like', searchTerm)
            .orWhere('action', 'like', searchTerm)
            .orWhere('admin_id', 'like', searchTerm);
        });
        countQuery = countQuery.where(function() {
          this.where('message', 'like', searchTerm)
            .orWhere('action', 'like', searchTerm)
            .orWhere('admin_id', 'like', searchTerm);
        });
      }

      // Get total count
      const totalResult = await countQuery.first();
      const total = totalResult?.count || 0;

      // Apply pagination and ordering
      query = query
        .orderBy('created_at', 'desc')
        .limit(options.limit || 50)
        .offset(options.offset || 0);

      const logs = await query;

      return { logs, total };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  static async getSystemStats() {
    try {
      const stats = await db('users')
        .select(
          db.raw('COUNT(*) as total_users'),
          db.raw('COUNT(CASE WHEN status = "active" THEN 1 END) as active_users'),
          db.raw('COUNT(CASE WHEN role = "admin" THEN 1 END) as admin_users'),
          db.raw('COUNT(CASE WHEN role = "user" THEN 1 END) as regular_users')
        )
        .first();

      const vehicleStats = await db('vehicles')
        .where('is_active', true)
        .select(
          db.raw('COUNT(*) as total_vehicles'),
          db.raw('COUNT(CASE WHEN vehicle_type = "car" THEN 1 END) as cars'),
          db.raw('COUNT(CASE WHEN vehicle_type = "motorcycle" THEN 1 END) as motorcycles'),
          db.raw('COUNT(CASE WHEN fuel_type = "electric" THEN 1 END) as electric_vehicles')
        )
        .first();

      const tripStats = await db('trips')
        .where('is_saved', true)
        .select(
          db.raw('COUNT(*) as total_trips'),
          db.raw('SUM(distance_km) as total_distance_km'),
          db.raw('SUM(co2_emissions_kg) as total_co2_emitted_kg'),
          db.raw('AVG(co2_emissions_kg) as avg_co2_per_trip_kg')
        )
        .first();

      const recentTrips = await db('trips')
        .where('is_saved', true)
        .orderBy('created_at', 'desc')
        .limit(10);

      return {
        users: stats,
        vehicles: vehicleStats,
        trips: tripStats,
        recent_trips: recentTrips
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User analytics
   */
  static async getUserAnalytics(options = {}) {
    try {
      const { period = '30d', group_by = 'day' } = options;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      if (period === '7d') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(endDate.getDate() - 90);
      } else if (period === '1y') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      let groupByFormat;
      if (group_by === 'day') {
        groupByFormat = 'DATE(created_at)';
      } else if (group_by === 'week') {
        groupByFormat = 'YEARWEEK(created_at)';
      } else if (group_by === 'month') {
        groupByFormat = 'DATE_FORMAT(created_at, "%Y-%m")';
      }

      const userRegistrations = await db('users')
        .select(db.raw(`${groupByFormat} as period`))
        .count('id as count')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .groupBy('period')
        .orderBy('period');

      const activeUsers = await db('trips')
        .select(db.raw(`${groupByFormat} as period`))
        .countDistinct('user_id as count')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .where('is_saved', true)
        .groupBy('period')
        .orderBy('period');

      return {
        user_registrations: userRegistrations,
        active_users: activeUsers,
        period,
        group_by
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get emission analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Emission analytics
   */
  static async getEmissionAnalytics(options = {}) {
    try {
      const { period = '30d', vehicle_type } = options;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      if (period === '7d') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(endDate.getDate() - 90);
      } else if (period === '1y') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      let query = db('trips')
        .select(
          'vehicle_type',
          db.raw('SUM(co2_emissions_kg) as total_emissions'),
          db.raw('SUM(co2_saved_kg) as total_saved'),
          db.raw('AVG(co2_emissions_kg) as avg_emissions'),
          db.raw('COUNT(*) as trip_count')
        )
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .where('is_saved', true);

      if (vehicle_type) {
        query = query.where('vehicle_type', vehicle_type);
      }

      const emissionsByVehicle = await query
        .groupBy('vehicle_type')
        .orderBy('total_emissions', 'desc');

      const totalEmissions = await db('trips')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .where('is_saved', true)
        .sum('co2_emissions_kg as total')
        .first();

      const totalSaved = await db('trips')
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .where('is_saved', true)
        .sum('co2_saved_kg as total')
        .first();

      return {
        emissions_by_vehicle: emissionsByVehicle,
        total_emissions: totalEmissions?.total || 0,
        total_saved: totalSaved?.total || 0,
        period,
        vehicle_type
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data
   * @param {Object} options - Export options
   * @returns {Promise<Object|String>} Export data
   */
  static async exportData(options = {}) {
    try {
      const { type, format = 'json', date_from, date_to } = options;

      let query;
      let data = [];

      switch (type) {
        case 'users':
          query = db('users').select('id', 'first_name', 'last_name', 'email', 'role', 'status', 'created_at');
          break;
        case 'trips':
          query = db('trips').select('*').where('is_saved', true);
          break;
        case 'emissions':
          query = db('trips').select('id', 'user_id', 'vehicle_type', 'distance_km', 'co2_emissions_kg', 'co2_saved_kg', 'created_at').where('is_saved', true);
          break;
        case 'logs':
          query = db('admin_logs').select('*');
          break;
        default:
          throw createError('Invalid export type', 400);
      }

      // Apply date filters if provided
      if (date_from) {
        query = query.where('created_at', '>=', date_from);
      }
      if (date_to) {
        query = query.where('created_at', '<=', date_to);
      }

      data = await query.orderBy('created_at', 'desc');

      if (format === 'csv') {
        // Convert to CSV format
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        return csvRows.join('\n');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get system health
   * @returns {Promise<Object>} System health data
   */
  static async getSystemHealth() {
    try {
      // Check database connectivity
      const dbHealth = await db.raw('SELECT 1 as health_check');

      // Get system metrics
      const userCount = await db('users').count('id as count').first();
      const tripCount = await db('trips').count('id as count').first();
      const vehicleCount = await db('vehicles').count('id as count').first();

      // Check for recent errors in logs
      const recentErrors = await db('admin_logs')
        .where('level', 'error')
        .where('created_at', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        .count('id as count')
        .first();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: dbHealth ? 'connected' : 'disconnected',
          user_count: userCount?.count || 0,
          trip_count: tripCount?.count || 0,
          vehicle_count: vehicleCount?.count || 0
        },
        system: {
          recent_errors: recentErrors?.count || 0,
          uptime: process.uptime()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = { AdminService };
