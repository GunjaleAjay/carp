exports.seed = async function(knex) {
  // Check if trips already exist
  const existingTrips = await knex('trips').count('id as count').first();
  if (existingTrips.count > 0) {
    console.log('Sample trips already exist, skipping...');
    return;
  }

  // Get the admin user ID
  const adminUser = await knex('users').where('email', 'admin@carbonplanner.com').first();
  if (!adminUser) {
    console.log('Admin user not found, skipping sample trips...');
    return;
  }

  // Get a vehicle for the admin user
  const vehicle = await knex('vehicles').where('user_id', adminUser.id).first();
  if (!vehicle) {
    console.log('No vehicle found for admin user, skipping sample trips...');
    return;
  }

  // Sample trip data
  const sampleTrips = [
    {
      user_id: adminUser.id,
      vehicle_id: vehicle.id,
      origin_name: 'New York, NY',
      destination_name: 'Boston, MA',
      origin_lat: 40.7128,
      origin_lng: -74.0060,
      destination_lat: 42.3601,
      destination_lng: -71.0589,
      route_data: JSON.stringify({
        legs: [{
          steps: [
            { instructions: 'Head north on Broadway toward Fulton St', html_instructions: 'Head <b>north</b> on <b>Broadway</b> toward <b>Fulton St</b>' },
            { instructions: 'Turn right onto I-95 N', html_instructions: 'Turn <b>right</b> onto <b>I-95 N</b>' }
          ]
        }]
      }),
      distance_km: 306.5,
      duration_minutes: 285,
      co2_emissions_kg: 45.2,
      travel_mode: 'driving',
      is_saved: true,
      planned_date: new Date('2024-01-15'),
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z')
    },
    {
      user_id: adminUser.id,
      vehicle_id: vehicle.id,
      origin_name: 'Boston, MA',
      destination_name: 'Providence, RI',
      origin_lat: 42.3601,
      origin_lng: -71.0589,
      destination_lat: 41.8240,
      destination_lng: -71.4128,
      route_data: JSON.stringify({
        legs: [{
          steps: [
            { instructions: 'Head south on I-95 S', html_instructions: 'Head <b>south</b> on <b>I-95 S</b>' }
          ]
        }]
      }),
      distance_km: 77.2,
      duration_minutes: 75,
      co2_emissions_kg: 11.4,
      travel_mode: 'driving',
      is_saved: true,
      planned_date: new Date('2024-01-20'),
      created_at: new Date('2024-01-20T14:30:00Z'),
      updated_at: new Date('2024-01-20T14:30:00Z')
    },
    {
      user_id: adminUser.id,
      vehicle_id: null,
      origin_name: 'Providence, RI',
      destination_name: 'Newport, RI',
      origin_lat: 41.8240,
      origin_lng: -71.4128,
      destination_lat: 41.4901,
      destination_lng: -71.3128,
      route_data: JSON.stringify({
        legs: [{
          steps: [
            { instructions: 'Walk along Thames St', html_instructions: 'Walk along <b>Thames St</b>' }
          ]
        }]
      }),
      distance_km: 35.8,
      duration_minutes: 428,
      co2_emissions_kg: 0,
      travel_mode: 'walking',
      is_saved: true,
      planned_date: new Date('2024-01-25'),
      created_at: new Date('2024-01-25T09:15:00Z'),
      updated_at: new Date('2024-01-25T09:15:00Z')
    },
    {
      user_id: adminUser.id,
      vehicle_id: null,
      origin_name: 'Newport, RI',
      destination_name: 'Providence, RI',
      origin_lat: 41.4901,
      origin_lng: -71.3128,
      destination_lat: 41.8240,
      destination_lng: -71.4128,
      route_data: JSON.stringify({
        legs: [{
          steps: [
            { instructions: 'Take bus route 60', html_instructions: 'Take <b>bus route 60</b>' }
          ]
        }]
      }),
      distance_km: 35.8,
      duration_minutes: 65,
      co2_emissions_kg: 1.8,
      travel_mode: 'transit',
      is_saved: true,
      planned_date: new Date('2024-02-01'),
      created_at: new Date('2024-02-01T16:45:00Z'),
      updated_at: new Date('2024-02-01T16:45:00Z')
    },
    {
      user_id: adminUser.id,
      vehicle_id: null,
      origin_name: 'Providence, RI',
      destination_name: 'Warwick, RI',
      origin_lat: 41.8240,
      origin_lng: -71.4128,
      destination_lat: 41.7001,
      destination_lng: -71.4162,
      route_data: JSON.stringify({
        legs: [{
          steps: [
            { instructions: 'Cycle along Post Rd', html_instructions: 'Cycle along <b>Post Rd</b>' }
          ]
        }]
      }),
      distance_km: 13.2,
      duration_minutes: 35,
      co2_emissions_kg: 0,
      travel_mode: 'cycling',
      is_saved: true,
      planned_date: new Date('2024-02-05'),
      created_at: new Date('2024-02-05T11:20:00Z'),
      updated_at: new Date('2024-02-05T11:20:00Z')
    }
  ];

  // Insert sample trips
  await knex('trips').insert(sampleTrips);
  console.log(`Inserted ${sampleTrips.length} sample trips`);
};
