const express = require('express');
const { validateRequest } = require('../utils/validation');
const { routePlanSchema, routeSaveSchema } = require('../utils/validation');
const RoutesController = require('../controllers/routesController');

const router = express.Router();

/**
 * @swagger
 * /api/routes/plan:
 *   post:
 *     summary: Plan carbon-aware route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - vehicle_id
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               vehicle_id:
 *                 type: integer
 *               travel_mode:
 *                 type: string
 *               avoid_tolls:
 *                 type: boolean
 *               avoid_highways:
 *                 type: boolean
 *               prefer_eco_routes:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Route planned successfully
 */
router.post('/plan', validateRequest(routePlanSchema), RoutesController.planRoute);

/**
 * @swagger
 * /api/routes/alternatives:
 *   post:
 *     summary: Get route alternatives
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - vehicle_id
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               vehicle_id:
 *                 type: integer
 *               avoid_tolls:
 *                 type: boolean
 *               avoid_highways:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Route alternatives retrieved successfully
 */
router.post('/alternatives', RoutesController.getRouteAlternatives);

/**
 * @swagger
 * /api/routes/save:
 *   post:
 *     summary: Save route to history
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - route_data
 *               - vehicle_id
 *               - travel_mode
 *               - distance_km
 *               - duration_minutes
 *               - estimated_co2_kg
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               route_data:
 *                 type: object
 *               vehicle_id:
 *                 type: integer
 *               travel_mode:
 *                 type: string
 *               distance_km:
 *                 type: number
 *               duration_minutes:
 *                 type: number
 *               estimated_co2_kg:
 *                 type: number
 *               eco_rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Route saved successfully
 */
router.post('/save', validateRequest(routeSaveSchema), RoutesController.saveRoute);

/**
 * @swagger
 * /api/routes/history:
 *   get:
 *     summary: Get route history
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: travel_mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Route history retrieved successfully
 */
router.get('/history', RoutesController.getRouteHistory);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Routes]
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
 *         description: Route details retrieved successfully
 */
router.get('/:id', RoutesController.getRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: Delete route from history
 *     tags: [Routes]
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
 *         description: Route deleted successfully
 */
router.delete('/:id', RoutesController.deleteRoute);

/**
 * @swagger
 * /api/routes/eco-suggestions:
 *   post:
 *     summary: Get eco-friendly suggestions for route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - vehicle_id
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               vehicle_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Eco-suggestions retrieved successfully
 */
router.post('/eco-suggestions', RoutesController.getEcoSuggestions);

/**
 * @swagger
 * /api/routes/nearby-eco:
 *   get:
 *     summary: Get nearby eco-friendly options
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 1000
 *     responses:
 *       200:
 *         description: Nearby eco-friendly options retrieved successfully
 */
router.get('/nearby-eco', RoutesController.getNearbyEcoOptions);

module.exports = router;