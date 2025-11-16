const express = require('express');
const { validateRequest } = require('../utils/validation');
const { userPreferencesSchema } = require('../utils/validation');
const UsersController = require('../controllers/usersController');

const router = express.Router();

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/preferences', UsersController.getPreferences);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avoid_tolls:
 *                 type: boolean
 *               avoid_highways:
 *                 type: boolean
 *               prefer_eco_routes:
 *                 type: boolean
 *               max_walking_distance_km:
 *                 type: number
 *               max_cycling_distance_km:
 *                 type: number
 *               default_travel_mode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', validateRequest(userPreferencesSchema), UsersController.updatePreferences);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/stats', UsersController.getStats);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: Get user activity log
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Activity log retrieved successfully
 */
router.get('/activity', UsersController.getActivityLog);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete('/account', UsersController.deleteAccount);

module.exports = router;