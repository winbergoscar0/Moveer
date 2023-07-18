import { Client } from 'discord.js';

import { moveerCommands } from '../commands/index';
import { logger } from '../utils/logger';
import { MoveerRabbitMq } from '../utils/rabbitmq';

export const ready = (client: Client, rabbitMq: MoveerRabbitMq): void => {
  client.on('ready', async () => {
    if (!client.user || !client.application) {
      return;
    }

    await client.application.commands.set(moveerCommands);

    logger.info(
      `${client.user.username} is online - ShardId: (${client.shard?.ids})`,
    );

    const shardId = client.shard?.ids[0].toString() ?? '0';
    rabbitMq.createConsumer(shardId);
  });
};
