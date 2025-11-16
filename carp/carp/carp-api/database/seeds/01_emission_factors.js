exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('emission_factors').del();

  // Insert seed entries
  await knex('emission_factors').insert([
    // Cars - Gasoline
    { vehicle_type: 'car', fuel_type: 'gasoline', emission_factor: 120.0, description: 'Average gasoline car', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'car', fuel_type: 'gasoline', emission_factor: 150.0, description: 'Large gasoline car/SUV', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'car', fuel_type: 'gasoline', emission_factor: 100.0, description: 'Small gasoline car', source: 'EPA 2023', is_active: true },
    
    // Cars - Diesel
    { vehicle_type: 'car', fuel_type: 'diesel', emission_factor: 130.0, description: 'Average diesel car', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'car', fuel_type: 'diesel', emission_factor: 160.0, description: 'Large diesel car/SUV', source: 'EPA 2023', is_active: true },
    
    // Cars - Electric
    { vehicle_type: 'car', fuel_type: 'electric', emission_factor: 50.0, description: 'Electric car (grid average)', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'car', fuel_type: 'electric', emission_factor: 30.0, description: 'Electric car (renewable energy)', source: 'EPA 2023', is_active: true },
    
    // Cars - Hybrid
    { vehicle_type: 'car', fuel_type: 'hybrid', emission_factor: 80.0, description: 'Hybrid car', source: 'EPA 2023', is_active: true },
    
    // Motorcycles
    { vehicle_type: 'motorcycle', fuel_type: 'gasoline', emission_factor: 75.0, description: 'Average motorcycle', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'motorcycle', fuel_type: 'electric', emission_factor: 25.0, description: 'Electric motorcycle', source: 'EPA 2023', is_active: true },
    
    // Trucks
    { vehicle_type: 'truck', fuel_type: 'diesel', emission_factor: 250.0, description: 'Light truck', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'truck', fuel_type: 'diesel', emission_factor: 400.0, description: 'Heavy truck', source: 'EPA 2023', is_active: true },
    
    // Vans
    { vehicle_type: 'van', fuel_type: 'gasoline', emission_factor: 180.0, description: 'Gasoline van', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'van', fuel_type: 'diesel', emission_factor: 200.0, description: 'Diesel van', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'van', fuel_type: 'electric', emission_factor: 60.0, description: 'Electric van', source: 'EPA 2023', is_active: true },
    
    // Buses
    { vehicle_type: 'bus', fuel_type: 'diesel', emission_factor: 80.0, description: 'Diesel bus (per passenger)', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'bus', fuel_type: 'electric', emission_factor: 25.0, description: 'Electric bus (per passenger)', source: 'EPA 2023', is_active: true },
    
    // Alternative fuels
    { vehicle_type: 'car', fuel_type: 'lpg', emission_factor: 110.0, description: 'LPG car', source: 'EPA 2023', is_active: true },
    { vehicle_type: 'car', fuel_type: 'cng', emission_factor: 95.0, description: 'CNG car', source: 'EPA 2023', is_active: true }
  ]);
};
