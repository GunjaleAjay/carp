const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', AnalyticsController.getDashboard);

/**
 * @swagger
 * /api/analytics/emissions:
 *   get:
 *     summary: Get emission statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *       - in: query
 *         name: vehicle_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Emission statistics retrieved successfully
 */
router.get('/emissions', AnalyticsController.getEmissionStats);

/**
 * @swagger
 * /api/analytics/carbon-savings:
 *   get:
 *     summary: Get carbon savings analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carbon savings analysis retrieved successfully
 */
router.get('/carbon-savings', AnalyticsController.getCarbonSavings);

/**
 * @swagger
 * /api/analytics/leaderboard:
 *   get:
 *     summary: Get leaderboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [eco_friendly, carbon_saved]
 *           default: eco_friendly
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Leaderboard data retrieved successfully
 */
router.get('/leaderboard', AnalyticsController.getLeaderboard);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get trends analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Trends analysis retrieved successfully
 */
router.get('/trends', AnalyticsController.getTrends);

module.exports = router;