import { Client, Guild } from 'discord.js';

import { MoveerDatabase } from '../utils/db';
import { logger } from '../utils/logger';
import { MoveerRabbitMq } from '../utils/rabbitmq';

interface GuildCreateParms {
  client: Client;
  database: MoveerDatabase;
  rabbitMq: MoveerRabbitMq;
}

export const guildCreate = (params: GuildCreateParms): void => {
  const { client, database, rabbitMq } = params;

  client.on('guildCreate', async (guild: Guild) => {
    logger.info({ id: guild.id, name: guild.name }, 'Joined new guild');
    await database.insertNewGuild(guild.id);
    rabbitMq.createConsumer(guild.id);
  });
};
