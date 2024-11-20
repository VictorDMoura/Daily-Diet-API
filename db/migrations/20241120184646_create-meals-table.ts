import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.date("date").notNullable();
    table.boolean("is_on_diet").defaultTo(false).notNullable();
    table.time("hour").notNullable();
    table.uuid("session_id").notNullable().references("id").inTable("users");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals");
}
