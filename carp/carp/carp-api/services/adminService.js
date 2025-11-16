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
        emission_factor_g_per_km: emissionFactorData.emission_factor_g_per_km,
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

      const allowedFields = ['emission_factor_g_per_km', 'description', 'is_active'];
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
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  static async getSystemStats() {
    try {
      const stats = await db('users')
        .select(
          db.raw('COUNT(*) as total_users'),
          db.raw('COUNT(CASE WHEN is_active = true THEN 1 END) as active_users'),
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
   * Get admin logs
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Admin logs and total count
   */
  static async getAdminLogs(options = {}) {
    try {
      let query = db('admin_logs').select('*');
      let countQuery = db('admin_logs').count('id as count');

      // Apply filters
      if (options.adminId) {
        query = query.where('admin_id', options.adminId);
        countQuery = countQuery.where('admin_id', options.adminId);
      }

      if (options.action) {
        query = query.where('action', options.action);
        countQuery = countQuery.where('action', options.action);
      }

      if (options.startDate) {
        query = query.where('created_at', '>=', options.startDate);
        countQuery = countQuery.where('created_at', '>=', options.startDate);
      }

      if (options.endDate) {
        query = query.where('created_at', '<=', options.endDate);
        countQuery = countQuery.where('created_at', '<=', options.endDate);
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
   * Log admin action
   * @param {number} adminId - Admin ID
   * @param {string} action - Action performed
   * @param {string} targetType - Target type
   * @param {number} targetId - Target ID
   * @param {Object} oldData - Old data
   * @param {Object} newData - New data
   */
  static async logAdminAction(adminId, action, targetType, targetId, oldData, newData) {
    try {
      await db('admin_logs').insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        old_data: oldData ? JSON.stringify(oldData) : null,
        new_data: newData ? JSON.stringify(newData) : null
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw error here as logging is not critical
    }
  }
}

module.exports = { AdminService };
