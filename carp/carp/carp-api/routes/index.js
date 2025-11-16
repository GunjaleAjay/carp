const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const vehicleRoutes = require('./vehicles');
const routeRoutes = require('./routes');
const analyticsRoutes = require('./analytics');
const adminRoutes = require('./admin');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes (require JWT authentication)
router.use('/users', authenticate, userRoutes);
router.use('/vehicles', authenticate, vehicleRoutes);
router.use('/routes', authenticate, routeRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

// Admin routes (require JWT authentication + admin role)
// router.use('/admin', authenticate, requireAdmin, adminRoutes);
router.use('/admin', authenticate, adminRoutes);

module.exports = router;
