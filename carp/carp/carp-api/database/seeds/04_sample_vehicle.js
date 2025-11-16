exports.seed = async function(knex) {
  // Check if vehicles already exist
  const existingVehicles = await knex('vehicles').count('id as count').first();
  if (existingVehicles.count > 0) {
    console.log('Sample vehicles already exist, skipping...');
    return;
  }

  // Get the admin user ID
  const adminUser = await knex('users').where('email', 'admin@carbonplanner.com').first();
  if (!adminUser) {
    console.log('Admin user not found, skipping sample vehicle...');
    return;
  }

  // Sample vehicle data
  const sampleVehicle = {
    user_id: adminUser.id,
    name: 'Toyota Camry 2020',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vehicle_type: 'car',
    fuel_type: 'gasoline',
    fuel_efficiency: 12.0, // km per liter
    engine_size: 2.5, // liters
    transmission: 'automatic',
    is_default: true,
    is_active: true
  };

  // Insert sample vehicle
  await knex('vehicles').insert(sampleVehicle);
  console.log('Inserted sample vehicle');
};
