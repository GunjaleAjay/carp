const Joi = require('joi');

/**
 * Validation schemas for request validation
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const vehicleSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  make: Joi.string().max(100),
  model: Joi.string().max(100),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  vehicle_type: Joi.string().valid('car', 'motorcycle', 'truck', 'bus', 'van').required(),
  fuel_type: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'),
  engine_size: Joi.number().positive(),
  transmission: Joi.string().valid('manual', 'automatic', 'cvt'),
  is_default: Joi.boolean()
}).unknown(true);

const routeRequestSchema = Joi.object({
  origin: Joi.string().min(3).max(255).required(),
  destination: Joi.string().min(3).max(255).required(),
  vehicle_id: Joi.number().integer().positive(),
  travel_mode: Joi.string().valid('driving', 'transit', 'walking', 'cycling'),
  avoid_tolls: Joi.boolean(),
  avoid_highways: Joi.boolean()
});

const routePlanSchema = routeRequestSchema;

const routeSaveSchema = Joi.object({
  origin_name: Joi.string().min(3).max(255).required(),
  destination_name: Joi.string().min(3).max(255).required(),
  origin_lat: Joi.number().required(),
  origin_lng: Joi.number().required(),
  destination_lat: Joi.number().required(),
  destination_lng: Joi.number().required(),
  route_data: Joi.object().required(),
  vehicle_id: Joi.number().integer().positive(),
  travel_mode: Joi.string().valid('driving', 'transit', 'walking', 'cycling').required(),
  distance_km: Joi.number().positive().required(),
  duration_minutes: Joi.number().positive().required(),
  co2_emissions_kg: Joi.number().min(0).required(),
  planned_date: Joi.date().iso()
});

const userPreferencesSchema = Joi.object({
  avoid_tolls: Joi.boolean(),
  avoid_highways: Joi.boolean(),
  prefer_eco_routes: Joi.boolean(),
  max_walking_distance_km: Joi.number().positive().max(50),
  max_cycling_distance_km: Joi.number().positive().max(100),
  default_travel_mode: Joi.string().valid('driving', 'transit', 'walking', 'cycling'),
  notification_settings: Joi.object()
});

const emissionFactorSchema = Joi.object({
  vehicle_type: Joi.string().valid('car', 'motorcycle', 'truck', 'bus', 'van').required(),
  fuel_type: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng').required(),
  emission_factor: Joi.number().positive().required(),
  description: Joi.string().max(255),
  source: Joi.string().max(255)
});

/**
 * Validate request middleware
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  vehicleSchema,
  routeRequestSchema,
  routePlanSchema,
  routeSaveSchema,
  userPreferencesSchema,
  emissionFactorSchema,
  validateRequest
};
