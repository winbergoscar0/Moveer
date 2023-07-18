import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guilds', (t) => {
    t.string('id').alter().primary();
    t.dropColumn('bot_msg_allowed');
  });

  await knex.schema.alterTable('logs', (t) => {
    t.string('guild_id').alter().references('guilds.id');
  });

  await knex.schema.alterTable('patreons', (t) => {
    t.string('guild_id').alter().references('guilds.id');
  });
}

export async function down(): Promise<void> {
  throw new Error('Not reversible');
}
