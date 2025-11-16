exports.up = function(knex) {
  return knex.schema.createTable('vehicles', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('name', 100).notNullable();
    table.string('make', 100);
    table.string('model', 100);
    table.integer('year');
    table.enum('vehicle_type', ['car', 'motorcycle', 'truck', 'bus', 'van']).notNullable();
    table.enum('fuel_type', ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']);
    table.decimal('fuel_efficiency', 8, 2); // km per liter or km per kWh
    table.decimal('engine_size', 8, 2); // liters or kWh
    table.enum('transmission', ['manual', 'automatic', 'cvt']);
    table.boolean('is_default').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['user_id', 'is_default']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('vehicles');
};
