const express = require('express');
const { validateRequest } = require('../utils/validation');
const { vehicleSchema } = require('../utils/validation');
const VehiclesController = require('../controllers/vehiclesController');

const router = express.Router();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get user's vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's vehicles
 */
router.get('/', VehiclesController.getVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle details
 */
router.get('/:id', VehiclesController.getVehicle);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Add new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - vehicle_type
 *               - fuel_type
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               vehicle_type:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               efficiency_km_per_liter:
 *                 type: number
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Vehicle added successfully
 */
router.post('/', validateRequest(vehicleSchema), VehiclesController.addVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               vehicle_type:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               efficiency_km_per_liter:
 *                 type: number
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 */
router.put('/:id', validateRequest(vehicleSchema), VehiclesController.updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 */
router.delete('/:id', VehiclesController.deleteVehicle);

/**
 * @swagger
 * /api/vehicles/{id}/default:
 *   post:
 *     summary: Set vehicle as default
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default vehicle updated successfully
 */
router.post('/:id/default', VehiclesController.setDefaultVehicle);

/**
 * @swagger
 * /api/vehicles/emission-factors:
 *   get:
 *     summary: Get emission factors
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emission factors retrieved successfully
 */
router.get('/emission-factors', VehiclesController.getEmissionFactors);

/**
 * @swagger
 * /api/vehicles/calculate-emissions:
 *   post:
 *     summary: Calculate emissions for route
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - distance_km
 *               - vehicle_id
 *             properties:
 *               distance_km:
 *                 type: number
 *               vehicle_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Emissions calculated successfully
 */
router.post('/calculate-emissions', VehiclesController.calculateEmissions);

module.exports = router;