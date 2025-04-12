import Knex from 'knex';
import { Knex as typeKnex } from 'knex';

import { DatabaseGuild } from '../data-types/guild';
import { logger, reportMoveerError } from './logger';

interface InsertMoveLogParams {
  commandName: string;
  usersMoved: number;
  guildId: string | null;
}

export interface MoveerDatabase {
  getGuildInfo(guildId: string): Promise<DatabaseGuild | null>;
  migrate(): Promise<void>;
  insertMoveLog(log: Array<InsertMoveLogParams>): Promise<void>;

  insertNewGuild(guildId: string): Promise<void>;
}

export class MoveerDatabase implements MoveerDatabase {
  private database: typeKnex;

  constructor() {
    this.database = Knex({
      client: 'pg',
      connection: {},
      pool: { min: 0, max: 20 },
      migrations: {
        directory: __dirname + '/migrations',
      },
    });
  }

  public async migrate(): Promise<void> {
    logger.info('Running migration');
    await this.database.migrate.latest();
  }

  public async getGuildInfo(
    guildId: string,
  ): Promise<DatabaseGuild | null | undefined> {
    try {
      const result = await this.database('guilds')
        .select('*')
        .leftJoin('patreons', 'patreons.guild_id', 'guilds.id')
        .where('id', guildId)
        .first();

      if (result == null) {
        return null;
      }
    } catch (err) {
      reportMoveerError(
        'Error while getting guild info from storage\n\n' +
          (err as Error).stack,
      );
    }
  }

  public async insertMoveLog(log: Array<InsertMoveLogParams>): Promise<void> {
    const insertMap = log.map((item) => ({
      command: item.commandName,
      guild_id: item.guildId,
      moved_users: item.usersMoved,
    }));

    try {
      await this.database('logs').insert(insertMap);
    } catch (err) {
      // Sometimes a guild is not in the database, so we need to insert it first
      await this.insertNewGuild(log[0].guildId as string);
      await this.database('logs').insert(insertMap);
    }
  }

  public async insertNewGuild(guildId: string): Promise<void> {
    try {
      await this.database('guilds')
        .insert({
          id: guildId,
        })
        .onConflict()
        .ignore();
    } catch (err) {
      reportMoveerError(
        'Error while inserting new guild into storage\n\n' +
          (err as Error).stack,
      );
    }
  }
}
