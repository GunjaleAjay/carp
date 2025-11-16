exports.up = function(knex) {
  return knex.schema.createTable('admin_logs', function(table) {
    table.increments('id').primary();
    table.integer('admin_id').unsigned().notNullable();
    table.enum('action', ['user_created', 'user_updated', 'user_deleted', 'user_suspended', 'emission_factor_created', 'emission_factor_updated', 'emission_factor_deleted', 'system_config_updated']).notNullable();
    table.string('target_type', 50); // 'user', 'emission_factor', 'system'
    table.integer('target_id'); // ID of the target record
    table.json('old_data'); // Previous state
    table.json('new_data'); // New state
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('admin_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['admin_id', 'created_at']);
    table.index(['action', 'created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('admin_logs');
};
