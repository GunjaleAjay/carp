const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/connection');
const { createError } = require('../middleware/errorHandler');

/**
 * Authentication service for user management
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and token
   */
  static async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await db('users').where('email', userData.email).first();
      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const [userId] = await db('users').insert({
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'user',
        is_active: true
      });

      // Create default user preferences
      await db('user_preferences').insert({
        user_id: userId,
        avoid_tolls: false,
        avoid_highways: false,
        prefer_eco_routes: true,
        max_walking_distance_km: 2.0,
        max_cycling_distance_km: 10.0,
        default_travel_mode: 'driving'
      });

      // Get the created user
      const user = await this.getUserById(userId);
      if (!user) {
        throw createError('Failed to create user', 500);
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User and token
   */
  static async login(credentials) {
    console.log('credentials:', credentials);
    try {
      // Find user by email
      const user = await db('users').where('email', credentials.email).first();
      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Check if user is active
      if (!user.is_active) {
        throw createError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async getUserById(id) {
    try {
      const user = await db('users').where('id', id).first();
      return user || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async getUserByEmail(email) {
    try {
      const user = await db('users').where('email', email).first();
      return user || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  static async updateProfile(userId, updateData) {
    try {
      const allowedFields = ['first_name', 'last_name'];
      const filteredData = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw createError('No valid fields to update', 400);
      }

      filteredData.updated_at = new Date();

      await db('users').where('id', userId).update(filteredData);
      
      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw createError('User not found', 404);
      }

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users')
        .where('id', userId)
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date()
        });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   */
  static sanitizeUser(user) {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = { AuthService };
