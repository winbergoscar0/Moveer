import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('logs', (t) => {
    t.string('command').nullable();
    t.integer('moved_users').notNullable();
    t.string('guild_id').nullable();
    t.dateTime('moved_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('guilds', (t) => {
    t.string('id').notNullable();
    t.boolean('bot_msg_allowed').defaultTo(false);
    t.dateTime('joined_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('patreons', (t) => {
    t.string('guild_id').notNullable();
    t.string('user_id').notNullable();
    t.boolean('active').defaultTo(false);
    t.integer('tier').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('logs');
  await knex.schema.dropTable('guilds');
  await knex.schema.dropTable('patreons');
}
