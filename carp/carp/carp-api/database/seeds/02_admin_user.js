const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Insert admin user
  await knex('users').insert([
    {
      email: 'admin@carbonplanner.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true
    }
  ]);
};