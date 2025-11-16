const { db } = require('../database/connection');

/**
 * @class Vehicle
 * @description Vehicle model for database operations
 */
class Vehicle {
  /**
   * Find vehicle by ID
   * @param {number} id - Vehicle ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Vehicle object
   */
  static async findById(id, userId = null) {
    let query = db('vehicles').where('id', id);
    
    if (userId) {
      query = query.where('user_id', userId);
    }
    
    return await query.first();
  }

  /**
   * Get all vehicles for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of vehicles
   */
  static async findByUserId(userId) {
    return await db('vehicles')
      .where('user_id', userId)
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');
  }

  /**
   * Create new vehicle
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise<number>} Inserted vehicle ID
   */
  static async create(vehicleData) {
    const [vehicleId] = await db('vehicles').insert(vehicleData);
    return vehicleId;
  }

  /**
   * Update vehicle by ID
   * @param {number} id - Vehicle ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated vehicle object
   */
  static async updateById(id, userId, updateData) {
    await db('vehicles')
      .where('id', id)
      .where('user_id', userId)
      .update(updateData);
    
    return await this.findById(id, userId);
  }

  /**
   * Delete vehicle by ID
   * @param {number} id - Vehicle ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} Success status
   */
  static async deleteById(id, userId) {
    const deletedRows = await db('vehicles')
      .where('id', id)
      .where('user_id', userId)
      .del();
    
    return deletedRows > 0;
  }

  /**
   * Set vehicle as default for user
   * @param {number} id - Vehicle ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated vehicle object
   */
  static async setDefault(id, userId) {
    // First, unset all other default vehicles for this user
    await db('vehicles')
      .where('user_id', userId)
      .update({ is_default: false });

    // Then set this vehicle as default
    await db('vehicles')
      .where('id', id)
      .where('user_id', userId)
      .update({ is_default: true });

    return await this.findById(id, userId);
  }

  /**
   * Get default vehicle for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Default vehicle object
   */
  static async getDefaultByUserId(userId) {
    return await db('vehicles')
      .where('user_id', userId)
      .where('is_default', true)
      .first();
  }

  /**
   * Calculate emissions for vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {number} distanceKm - Distance in kilometers
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Emission calculation result
   */
  static async calculateEmissions(vehicleId, distanceKm, userId) {
    const vehicle = await this.findById(vehicleId, userId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Get emission factor for vehicle type and fuel
    const emissionFactor = await db('emission_factors')
      .where('vehicle_type', vehicle.vehicle_type)
      .where('fuel_type', vehicle.fuel_type)
      .first();

    if (!emissionFactor) {
      throw new Error('Emission factor not found for vehicle type and fuel');
    }

    const emissions = {
      distance_km: distanceKm,
      emission_factor_g_per_km: emissionFactor.emission_factor_g_per_km,
      total_emissions_g: distanceKm * emissionFactor.emission_factor_g_per_km,
      total_emissions_kg: (distanceKm * emissionFactor.emission_factor_g_per_km) / 1000,
      vehicle_info: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vehicle_type: vehicle.vehicle_type,
        fuel_type: vehicle.fuel_type
      }
    };

    return emissions;
  }
}

module.exports = Vehicle;
