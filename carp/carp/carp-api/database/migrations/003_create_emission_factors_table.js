exports.up = function(knex) {
  return knex.schema.createTable('emission_factors', function(table) {
    table.increments('id').primary();
    table.enum('vehicle_type', ['car', 'motorcycle', 'truck', 'bus', 'van']).notNullable();
    table.enum('fuel_type', ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']).notNullable();
    table.decimal('emission_factor', 8, 4).notNullable(); // g CO2 per km
    table.string('description', 255);
    table.string('source', 255);
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    // Removed unique constraint to allow multiple emission factors per vehicle_type + fuel_type combination
    // This allows for different factors based on vehicle size, efficiency, etc.
    table.index(['vehicle_type', 'fuel_type', 'is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('emission_factors');
};
