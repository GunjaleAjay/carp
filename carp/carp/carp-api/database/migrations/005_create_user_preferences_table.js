exports.up = function(knex) {
  return knex.schema.createTable('user_preferences', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.boolean('avoid_tolls').defaultTo(false);
    table.boolean('avoid_highways').defaultTo(false);
    table.boolean('prefer_eco_routes').defaultTo(true);
    table.decimal('max_walking_distance_km', 5, 2).defaultTo(2.0);
    table.decimal('max_cycling_distance_km', 5, 2).defaultTo(10.0);
    table.enum('default_travel_mode', ['driving', 'transit', 'walking', 'cycling']).defaultTo('driving');
    table.json('notification_settings');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_preferences');
};
