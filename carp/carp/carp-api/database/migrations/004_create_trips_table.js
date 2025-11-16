exports.up = function(knex) {
  return knex.schema.createTable('trips', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('vehicle_id').unsigned();
    table.string('origin_name', 255).notNullable();
    table.string('destination_name', 255).notNullable();
    table.decimal('origin_lat', 10, 8).notNullable();
    table.decimal('origin_lng', 11, 8).notNullable();
    table.decimal('destination_lat', 10, 8).notNullable();
    table.decimal('destination_lng', 11, 8).notNullable();
    table.json('route_data').notNullable(); // Store Google Maps route data
    table.decimal('distance_km', 10, 2).notNullable();
    table.integer('duration_minutes').notNullable();
    table.decimal('co2_emissions_kg', 10, 4).notNullable();
    table.enum('travel_mode', ['driving', 'transit', 'walking', 'cycling']).notNullable();
    table.boolean('is_saved').defaultTo(false);
    table.timestamp('planned_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('SET NULL');
    table.index(['user_id', 'created_at']);
    table.index(['planned_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('trips');
};
