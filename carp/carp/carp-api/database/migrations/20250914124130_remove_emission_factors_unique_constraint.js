/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // return knex.schema.alterTable('emission_factors', function(table) {
  //   table.dropUnique(['vehicle_type', 'fuel_type']);
  // });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // return knex.schema.alterTable('emission_factors', function(table) {
  //   table.unique(['vehicle_type', 'fuel_type']);
  // });
};
