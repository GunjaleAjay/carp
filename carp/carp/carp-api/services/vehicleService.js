const { db } = require('../database/connection');
const { createError } = require('../middleware/errorHandler');

/**
 * Vehicle service for managing user vehicles
 */
class VehicleService {
  /**
   * Get all vehicles for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of vehicles
   */
  static async getUserVehicles(userId) {
    try {
      const vehicles = await db('vehicles')
        .where('user_id', userId)
        .where('is_active', true)
        .orderBy('is_default', 'desc')
        .orderBy('created_at', 'desc');

      // Calculate co2_per_km for each vehicle
      const vehiclesWithCo2 = await Promise.all(vehicles.map(async (vehicle) => {
        try {
          const emissionFactor = await db('emission_factors')
            .where('vehicle_type', vehicle.vehicle_type)
            .where('fuel_type', vehicle.fuel_type || 'gasoline')
            .where('is_active', true)
            .first();

          // Calculate CO2 per km (convert from g/km to kg/km)
          const co2PerKm = emissionFactor 
            ? (emissionFactor.emission_factor / 1000) 
            : 0.12; // Default fallback value

          return {
            ...vehicle,
            co2_per_km: co2PerKm
          };
        } catch (error) {
          // If emission factor not found, use default
          return {
            ...vehicle,
            co2_per_km: 0.12 // Default fallback value
          };
        }
      }));

      return vehiclesWithCo2;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   * @param {number} vehicleId - Vehicle ID
   * @param {number} userId - User ID (optional)
   * @returns {Promise<Object|null>} Vehicle object or null
   */
  static async getVehicleById(vehicleId, userId) {
    try {
      let query = db('vehicles').where('id', vehicleId);
      
      if (userId) {
        query = query.where('user_id', userId);
      }

      const vehicle = await query.first();
      if (!vehicle) {
        return null;
      }

      // Calculate co2_per_km
      try {
        const emissionFactor = await db('emission_factors')
          .where('vehicle_type', vehicle.vehicle_type)
          .where('fuel_type', vehicle.fuel_type || 'gasoline')
          .where('is_active', true)
          .first();

        const co2PerKm = emissionFactor 
          ? (emissionFactor.emission_factor / 1000) 
          : 0.12; // Default fallback value

        return {
          ...vehicle,
          co2_per_km: co2PerKm
        };
      } catch (error) {
        // If emission factor not found, use default
        return {
          ...vehicle,
          co2_per_km: 0.12 // Default fallback value
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a new vehicle
   * @param {number} userId - User ID
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise<Object>} Created vehicle
   */
  static async addVehicle(userId, vehicleData) {
    try {
      // Validate required fields
      if (!vehicleData.vehicle_type) {
        throw createError('Vehicle type is required', 400);
      }
      if (!vehicleData.fuel_type) {
        throw createError('Fuel type is required', 400);
      }

      // Generate name if not provided
      const name = vehicleData.name || `${vehicleData.make || ''} ${vehicleData.model || ''}`.trim() || 'My Vehicle';

      // If this is set as default, unset other default vehicles
      if (vehicleData.is_default) {
        await db('vehicles')
          .where('user_id', userId)
          .update({ is_default: false });
      }

      const [vehicleId] = await db('vehicles').insert({
        user_id: userId,
        name: name,
        make: vehicleData.make || null,
        model: vehicleData.model || null,
        year: vehicleData.year || null,
        vehicle_type: vehicleData.vehicle_type,
        fuel_type: vehicleData.fuel_type,
        engine_size: vehicleData.engine_size || null,
        transmission: vehicleData.transmission || null,
        is_default: vehicleData.is_default || false,
        is_active: true
      });

      const vehicle = await this.getVehicleById(vehicleId, userId);
      if (!vehicle) {
        throw createError('Failed to create vehicle', 500);
      }

      // Calculate and add co2_per_km
      try {
        const emissionFactor = await db('emission_factors')
          .where('vehicle_type', vehicle.vehicle_type)
          .where('fuel_type', vehicle.fuel_type || 'gasoline')
          .where('is_active', true)
          .first();

        const co2PerKm = emissionFactor 
          ? (emissionFactor.emission_factor / 1000) 
          : 0.12; // Default fallback value

        return {
          ...vehicle,
          co2_per_km: co2PerKm
        };
      } catch (error) {
        // If emission factor not found, use default
        return {
          ...vehicle,
          co2_per_km: 0.12 // Default fallback value
        };
      }
    } catch (error) {
      // Re-throw with better error message
      if (error.statusCode) {
        throw error;
      }
      if (error.message && error.message.includes('foreign key')) {
        throw createError('Invalid user ID', 400);
      }
      if (error.message && error.message.includes('duplicate')) {
        throw createError('Vehicle already exists', 400);
      }
      throw createError(error.message || 'Failed to add vehicle', 500);
    }
  }

  /**
   * Update vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated vehicle
   */
  static async updateVehicle(vehicleId, userId, updateData) {
    try {
      // Check if vehicle belongs to user
      const existingVehicle = await this.getVehicleById(vehicleId, userId);
      if (!existingVehicle) {
        throw createError('Vehicle not found', 404);
      }

      // If setting as default, unset other default vehicles
      if (updateData.is_default) {
        await db('vehicles')
          .where('user_id', userId)
          .where('id', '!=', vehicleId)
          .update({ is_default: false });
      }

      const allowedFields = [
        'name', 'make', 'model', 'year', 'vehicle_type', 'fuel_type',
        'engine_size', 'transmission', 'is_default'
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      // Regenerate name if make or model is being updated and name is not explicitly provided
      if ((filteredData.make !== undefined || filteredData.model !== undefined) && updateData.name === undefined) {
        const newMake = filteredData.make !== undefined ? filteredData.make : existingVehicle.make;
        const newModel = filteredData.model !== undefined ? filteredData.model : existingVehicle.model;
        filteredData.name = `${newMake || ''} ${newModel || ''}`.trim();
      }

      if (Object.keys(filteredData).length === 0) {
        throw createError('No valid fields to update', 400);
      }

      filteredData.updated_at = new Date();

      await db('vehicles')
        .where('id', vehicleId)
        .where('user_id', userId)
        .update(filteredData);

      const updatedVehicle = await this.getVehicleById(vehicleId, userId);
      if (!updatedVehicle) {
        throw createError('Vehicle not found', 404);
      }

      return updatedVehicle;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete vehicle (soft delete)
   * @param {number} vehicleId - Vehicle ID
   * @param {number} userId - User ID
   */
  static async deleteVehicle(vehicleId, userId) {
    try {
      // Check if vehicle belongs to user
      const vehicle = await this.getVehicleById(vehicleId, userId);
      if (!vehicle) {
        throw createError('Vehicle not found', 404);
      }

      // If this was the default vehicle, set another one as default
      if (vehicle.is_default) {
        const otherVehicles = await db('vehicles')
          .where('user_id', userId)
          .where('id', '!=', vehicleId)
          .where('is_active', true)
          .limit(1);

        if (otherVehicles.length > 0) {
          await db('vehicles')
            .where('id', otherVehicles[0].id)
            .update({ is_default: true });
        }
      }

      // Soft delete the vehicle
      await db('vehicles')
        .where('id', vehicleId)
        .where('user_id', userId)
        .update({
          is_active: false,
          updated_at: new Date()
        });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set vehicle as default
   * @param {number} vehicleId - Vehicle ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated vehicle
   */
  static async setDefaultVehicle(vehicleId, userId) {
    try {
      // Check if vehicle belongs to user
      const vehicle = await this.getVehicleById(vehicleId, userId);
      if (!vehicle) {
        throw createError('Vehicle not found', 404);
      }

      // Unset all other default vehicles
      await db('vehicles')
        .where('user_id', userId)
        .update({ is_default: false });

      // Set this vehicle as default
      await db('vehicles')
        .where('id', vehicleId)
        .where('user_id', userId)
        .update({
          is_default: true,
          updated_at: new Date()
        });

      const updatedVehicle = await this.getVehicleById(vehicleId, userId);
      if (!updatedVehicle) {
        throw createError('Vehicle not found', 404);
      }

      return updatedVehicle;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default vehicle for user
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Default vehicle or null
   */
  static async getDefaultVehicle(userId) {
    try {
      const vehicle = await db('vehicles')
        .where('user_id', userId)
        .where('is_default', true)
        .where('is_active', true)
        .first();

      return vehicle || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get vehicle statistics for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Vehicle statistics
   */
  static async getVehicleStats(userId) {
    try {
      const stats = await db('vehicles')
        .where('user_id', userId)
        .where('is_active', true)
        .count('id as total_vehicles')
        .first();

      const vehiclesByType = await db('vehicles')
        .where('user_id', userId)
        .where('is_active', true)
        .select('vehicle_type')
        .count('id as count')
        .groupBy('vehicle_type');

      const vehiclesByFuel = await db('vehicles')
        .where('user_id', userId)
        .where('is_active', true)
        .select('fuel_type')
        .count('id as count')
        .groupBy('fuel_type');

      return {
        total_vehicles: stats?.total_vehicles || 0,
        by_type: vehiclesByType,
        by_fuel: vehiclesByFuel
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { VehicleService };
