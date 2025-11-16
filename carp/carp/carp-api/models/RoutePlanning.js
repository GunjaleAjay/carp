const { db } = require('../database/connection');
const { RoutingService } = require('../services/routingService');
const { VehicleService } = require('../services/vehicleService');
const { calculateCO2Emissions, calculateEcoScore, getEcoModeEmissions } = require('../utils/carbonCalculation');
const { createError } = require('../middleware/errorHandler');

/**
 * @class RoutePlanning
 * @description Route planning model for carbon-aware route planning operations
 */
class RoutePlanning {
  /**
   * Plan carbon-aware route
   * @param {Object} params - Route planning parameters
   * @returns {Promise<Object>} Route planning result
   */
  static async planRoute(params) {
    try {
      const {
        origin,
        destination,
        vehicle_id,
        travel_mode,
        avoid_tolls,
        avoid_highways,
        prefer_eco_routes,
        userId
      } = params;

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      // Get vehicle for emission calculation
      let vehicle = null;
      if (vehicle_id) {
        vehicle = await VehicleService.getVehicleById(vehicle_id, userId);
      } else {
        vehicle = await VehicleService.getDefaultVehicle(userId);
      }

      if (!vehicle && travel_mode !== 'walking' && travel_mode !== 'cycling' && travel_mode !== 'transit') {
        throw createError('No vehicle found. Please add a vehicle or select a non-driving travel mode.', 400);
      }

      // Get emission factors
      const emissionFactors = await this.getEmissionFactors();

      // Get route options from Routing Service (OSRM)
      // Always get multiple travel modes and alternatives for driving
      // This ensures users see all possible route options
      const routeOptions = await RoutingService.getMultipleRouteOptions(
        origin,
        destination,
        {
          travelMode: null, // null means get all travel modes (driving, walking, cycling, transit)
          alternatives: true // Always get alternative routes for driving
        }
      );

      // Calculate emissions and eco scores for each route
      const enrichedRoutes = [];
      let totalCO2Saved = 0;

      for (const route of routeOptions) {
        let co2Emissions = 0;

        if (route.travel_mode === 'driving' && vehicle) {
          // Calculate emissions for driving
          co2Emissions = calculateCO2Emissions(
            route.distance_km,
            vehicle.vehicle_type,
            vehicle.fuel_type || 'gasoline',
            emissionFactors
          );
        } else {
          // Use eco mode emissions
          co2Emissions = getEcoModeEmissions(route.distance_km, route.travel_mode);
        }

        const ecoScore = calculateEcoScore(co2Emissions, route.distance_km, route.travel_mode);

        enrichedRoutes.push({
          ...route,
          co2_emissions_kg: co2Emissions,
          eco_score: ecoScore
        });

        // Calculate total CO2 savings (compared to driving)
        if (route.travel_mode !== 'driving') {
          const drivingRoute = enrichedRoutes.find(r => r.travel_mode === 'driving');
          if (drivingRoute) {
            totalCO2Saved += Math.max(0, drivingRoute.co2_emissions_kg - co2Emissions);
          }
        }
      }

      // Generate eco suggestions
      const drivingRoute = enrichedRoutes.find(r => r.travel_mode === 'driving');
      const ecoSuggestions = drivingRoute ?
        await RoutingService.generateEcoSuggestions(
          origin,
          destination,
          drivingRoute,
          preferences
        ) : [];

      return {
        origin,
        destination,
        routes: enrichedRoutes.sort((a, b) => a.eco_score - b.eco_score).reverse(), // Sort by eco score (highest first)
        eco_suggestions: ecoSuggestions,
        total_co2_saved_kg: totalCO2Saved
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get route alternatives with emissions and eco scores
   * @param {Object} params - Route parameters
   * @returns {Promise<Object>} Route alternatives with emissions data
   */
  static async getRouteAlternatives(params) {
    try {
      const {
        origin,
        destination,
        vehicle_id,
        travel_mode,
        avoid_tolls,
        avoid_highways,
        userId
      } = params;

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      // Get vehicle for emission calculation
      let vehicle = null;
      if (vehicle_id) {
        vehicle = await VehicleService.getVehicleById(vehicle_id, userId);
      } else {
        vehicle = await VehicleService.getDefaultVehicle(userId);
      }

      // Get emission factors
      const emissionFactors = await this.getEmissionFactors();

      // Get route options from Routing Service (OSRM)
      const routeOptions = await RoutingService.getMultipleRouteOptions(
        origin,
        destination,
        {
          travelMode: travel_mode || preferences.default_travel_mode,
          alternatives: true
        }
      );

      // Calculate emissions and eco scores for each route
      const alternatives = [];

      for (const route of routeOptions) {
        let co2Emissions = 0;

        if (route.travel_mode === 'driving' && vehicle) {
          // Calculate emissions for driving
          co2Emissions = calculateCO2Emissions(
            route.distance_km,
            vehicle.vehicle_type,
            vehicle.fuel_type || 'gasoline',
            emissionFactors
          );
        } else {
          // Use eco mode emissions
          co2Emissions = getEcoModeEmissions(route.distance_km, route.travel_mode);
        }

        const ecoScore = calculateEcoScore(co2Emissions, route.distance_km, route.travel_mode);

        alternatives.push({
          ...route,
          co2_emissions_kg: co2Emissions,
          eco_score: ecoScore
        });
      }

      return {
        origin,
        destination,
        alternatives: alternatives.sort((a, b) => a.eco_score - b.eco_score).reverse() // Sort by eco score (highest first)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get route history with pagination and filters
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Route history with pagination
   */
  static async getRouteHistory(userId, options = {}) {
    try {
      let query = db('trips')
        .where('user_id', userId)
        .where('is_saved', true);

      let countQuery = db('trips')
        .where('user_id', userId)
        .where('is_saved', true)
        .count('id as count');

      // Apply filters
      if (options.travel_mode) {
        query = query.where('travel_mode', options.travel_mode);
        countQuery = countQuery.where('travel_mode', options.travel_mode);
      }

      if (options.date_from) {
        query = query.where('created_at', '>=', options.date_from);
        countQuery = countQuery.where('created_at', '>=', options.date_from);
      }

      if (options.date_to) {
        query = query.where('created_at', '<=', options.date_to);
        countQuery = countQuery.where('created_at', '<=', options.date_to);
      }

      // Get total count
      const totalResult = await countQuery.first();
      const total = totalResult?.count || 0;

      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      query = query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const trips = await query;

      // Parse route_data JSON strings
      const parsedTrips = trips.map(trip => ({
        ...trip,
        route_data: typeof trip.route_data === 'string' ? JSON.parse(trip.route_data) : trip.route_data
      }));

      return {
        trips: parsedTrips,
        total_count: total,
        pagination: {
          page,
          limit,
          total_pages: Math.ceil(total / limit),
          has_next: page * limit < total,
          has_prev: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save a trip
   * @param {number} userId - User ID
   * @param {Object} tripData - Trip data
   * @returns {Promise<Object>} Saved trip
   */
  static async saveTrip(userId, tripData) {
    try {
      const [tripId] = await db('trips').insert({
        user_id: userId,
        vehicle_id: tripData.vehicle_id,
        origin_name: tripData.origin_name,
        destination_name: tripData.destination_name,
        origin_lat: tripData.origin_lat,
        origin_lng: tripData.origin_lng,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        route_data: JSON.stringify(tripData.route_data),
        distance_km: tripData.distance_km,
        duration_minutes: tripData.duration_minutes,
        co2_emissions_kg: tripData.co2_emissions_kg,
        travel_mode: tripData.travel_mode,
        is_saved: true,
        planned_date: tripData.planned_date ? new Date(tripData.planned_date) : null
      });

      const trip = await this.getTripById(tripId, userId);
      if (!trip) {
        throw createError('Failed to save trip', 500);
      }

      return trip;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get trip by ID
   * @param {number} tripId - Trip ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Trip object or null
   */
  static async getTripById(tripId, userId) {
    try {
      const trip = await db('trips')
        .where('id', tripId)
        .where('user_id', userId)
        .first();

      if (!trip) {
        return null;
      }

      // Parse route_data JSON string
      return {
        ...trip,
        route_data: typeof trip.route_data === 'string' ? JSON.parse(trip.route_data) : trip.route_data
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete saved trip
   * @param {number} tripId - Trip ID
   * @param {number} userId - User ID
   */
  static async deleteTrip(tripId, userId) {
    try {
      const result = await db('trips')
        .where('id', tripId)
        .where('user_id', userId)
        .del();

      if (result === 0) {
        throw createError('Trip not found', 404);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get eco suggestions for a route
   * @param {Object} params - Route parameters
   * @returns {Promise<Object>} Eco suggestions
   */
  static async getEcoSuggestions(params) {
    try {
      const {
        origin,
        destination,
        vehicle_id,
        userId
      } = params;

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      // Get vehicle for emission calculation
      let vehicle = null;
      if (vehicle_id) {
        vehicle = await VehicleService.getVehicleById(vehicle_id, userId);
      } else {
        vehicle = await VehicleService.getDefaultVehicle(userId);
      }

      // Get emission factors
      const emissionFactors = await this.getEmissionFactors();

      // Get driving route for comparison
      const drivingRoute = await RoutingService.getRoute(origin, destination, 'driving');

      if (!drivingRoute) {
        throw createError('Unable to find driving route for comparison', 400);
      }

      // Calculate emissions for driving route
      let drivingEmissions = 0;
      if (vehicle) {
        drivingEmissions = calculateCO2Emissions(
          drivingRoute.distance_km,
          vehicle.vehicle_type,
          vehicle.fuel_type || 'gasoline',
          emissionFactors
        );
      }

      // Generate eco suggestions
      const suggestions = await RoutingService.generateEcoSuggestions(
        origin,
        destination,
        { ...drivingRoute, co2_emissions_kg: drivingEmissions },
        preferences
      );

      return {
        origin,
        destination,
        driving_route: {
          ...drivingRoute,
          co2_emissions_kg: drivingEmissions
        },
        eco_suggestions: suggestions
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get nearby eco options (EV stations, public transit)
   * @param {Object} params - Location parameters
   * @returns {Promise<Object>} Nearby eco options
   */
  static async getNearbyEcoOptions(params) {
    try {
      const {
        latitude,
        longitude,
        radius = 1000,
        userId
      } = params;

      // Note: Nearby eco options (EV stations, transit) require Google Maps Places API
      // For now, return empty array. This can be implemented with Google Maps API key.
      const enrichedOptions = [];

      return {
        location: { lat: latitude, lng: longitude },
        radius,
        eco_options: enrichedOptions,
        message: 'Nearby eco options require Google Maps Places API. Please configure GOOGLE_MAPS_API_KEY to enable this feature.'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user preferences
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User preferences
   */
  static async getUserPreferences(userId) {
    try {
      const preferences = await db('user_preferences')
        .where('user_id', userId)
        .first();

      return preferences || {
        avoid_tolls: false,
        avoid_highways: false,
        prefer_eco_routes: true,
        max_walking_distance_km: 2.0,
        max_cycling_distance_km: 10.0,
        default_travel_mode: 'driving'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get emission factors
   * @returns {Promise<Array>} Array of emission factors
   */
  static async getEmissionFactors() {
    try {
      const factors = await db('emission_factors')
        .where('is_active', true);

      return factors;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoutePlanning;
