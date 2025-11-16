const express = require('express');
const { validateRequest } = require('../utils/validation');
const { emissionFactorSchema } = require('../utils/validation');
const AdminController = require('../controllers/adminController');

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 */
router.get('/dashboard', AdminController.getDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', AdminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
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
 *         description: User details retrieved successfully
 */
router.get('/users/:id', AdminController.getUser);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put('/users/:id/status', AdminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
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
 *         description: User deleted successfully
 */
router.delete('/users/:id', AdminController.deleteUser);

/**
 * @swagger
 * /api/admin/emission-factors:
 *   get:
 *     summary: Get all emission factors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emission factors retrieved successfully
 */
router.get('/emission-factors', AdminController.getEmissionFactors);

/**
 * @swagger
 * /api/admin/emission-factors:
 *   post:
 *     summary: Add new emission factor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_type
 *               - fuel_type
 *               - emission_factor_g_per_km
 *             properties:
 *               vehicle_type:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               emission_factor_g_per_km:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Emission factor added successfully
 */
router.post('/emission-factors', validateRequest(emissionFactorSchema), AdminController.addEmissionFactor);

/**
 * @swagger
 * /api/admin/emission-factors/{id}:
 *   put:
 *     summary: Update emission factor
 *     tags: [Admin]
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
 *               vehicle_type:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               emission_factor_g_per_km:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Emission factor updated successfully
 */
router.put('/emission-factors/:id', validateRequest(emissionFactorSchema), AdminController.updateEmissionFactor);

/**
 * @swagger
 * /api/admin/emission-factors/{id}:
 *   delete:
 *     summary: Delete emission factor
 *     tags: [Admin]
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
 *         description: Emission factor deleted successfully
 */
router.delete('/emission-factors/:id', AdminController.deleteEmissionFactor);

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get system logs
 *     tags: [Admin]
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
 *           default: 20
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warning, error]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 */
router.get('/logs', AdminController.getLogs);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 */
router.get('/stats', AdminController.getSystemStats);

/**
 * @swagger
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: 30d
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/analytics/users', AdminController.getUserAnalytics);

/**
 * @swagger
 * /api/admin/analytics/emissions:
 *   get:
 *     summary: Get emission analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: 30d
 *       - in: query
 *         name: vehicle_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emission analytics retrieved successfully
 */
router.get('/analytics/emissions', AdminController.getEmissionAnalytics);

/**
 * @swagger
 * /api/admin/export:
 *   get:
 *     summary: Export data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, trips, emissions, logs]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
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
 *         description: Data exported successfully
 */
router.get('/export', AdminController.exportData);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get system health
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 */
router.get('/health', AdminController.getSystemHealth);

module.exports = router;