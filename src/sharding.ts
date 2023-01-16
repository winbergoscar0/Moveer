import { ShardingManager } from 'discord.js';

import { logger } from './utils/logger';

export class ShardBot {
  static start(): void {
    const manager = new ShardingManager('./build/bot.js', {
      token: process.env.BOT_TOKEN,
    });

    manager.on('shardCreate', (shard) => {
      logger.info(`Launched shard ${shard.id}`);
    });

    manager.spawn();
  }
}
ShardBot.start();
