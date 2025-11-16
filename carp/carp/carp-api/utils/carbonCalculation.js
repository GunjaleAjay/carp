/**
 * Calculate CO2 emissions for a route
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicleType - Type of vehicle
 * @param {string} fuelType - Type of fuel
 * @param {Array} emissionFactors - Array of emission factors
 * @returns {number} CO2 emissions in kg
 */
const calculateCO2Emissions = (distanceKm, vehicleType, fuelType, emissionFactors) => {
  // Find the appropriate emission factor
  const factor = emissionFactors.find(
    ef => ef.vehicle_type === vehicleType && ef.fuel_type === fuelType && ef.is_active
  );

  if (!factor) {
    throw new Error(`No emission factor found for ${vehicleType} with ${fuelType}`);
  }

  let baseEmission = distanceKm * factor.emission_factor;

  return baseEmission / 1000; // Convert grams to kg
};



/**
 * Calculate eco score (1-10, higher is better)
 * @param {number} co2EmissionsKg - CO2 emissions in kg
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} travelMode - Travel mode
 * @returns {number} Eco score from 1-10
 */
const calculateEcoScore = (co2EmissionsKg, distanceKm, travelMode) => {
  // Base emissions per km for different modes
  const baseEmissionsPerKm = {
    walking: 0,
    cycling: 0,
    transit: 0.05, // kg CO2 per km
    driving: 0.12 // kg CO2 per km (average)
  };

  const expectedEmissions = (baseEmissionsPerKm[travelMode] || 0.12) * distanceKm;
  const actualEmissions = co2EmissionsKg;

  // Calculate score based on how much lower emissions are than expected
  if (actualEmissions === 0) return 10; // Perfect score for walking/cycling
  
  const ratio = expectedEmissions / actualEmissions;
  const score = Math.min(10, Math.max(1, ratio * 5)); // Scale to 1-10
  
  return Math.round(score * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate potential CO2 savings from eco-friendly alternatives
 * @param {number} originalEmissions - Original CO2 emissions
 * @param {number} alternativeEmissions - Alternative CO2 emissions
 * @returns {number} CO2 savings
 */
const calculateSavings = (originalEmissions, alternativeEmissions) => {
  return Math.max(0, originalEmissions - alternativeEmissions);
};

/**
 * Get emission factors for eco-friendly modes
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Travel mode
 * @returns {number} CO2 emissions
 */
const getEcoModeEmissions = (distanceKm, mode) => {
  const ecoEmissions = {
    walking: 0,
    cycling: 0,
    transit: distanceKm * 0.05, // 50g CO2 per km average for public transit
    carpool: distanceKm * 0.06 // Slightly higher than transit due to coordination
  };

  return ecoEmissions[mode] || 0;
};

module.exports = {
  calculateCO2Emissions,
  calculateEcoScore,
  calculateSavings,
  getEcoModeEmissions
};
