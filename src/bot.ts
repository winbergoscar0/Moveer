import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import AutoPoster from 'topgg-autoposter';

import { guildCreate, interactionCreate, ready } from './events/index';
import { MoveerDatabase } from './utils/db';
import { MoveerHelper } from './utils/helper';
import { logger } from './utils/logger';
import { makeRabbitMq } from './utils/rabbitmq';

const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  dotenv.config({ path: '.env.local' });
}

const intentFlags = GatewayIntentBits;

const setup = async (): Promise<void> => {
  const discordClient = new Client({
    intents: [
      intentFlags.Guilds,
      intentFlags.GuildVoiceStates,
      intentFlags.GuildMessages,
      intentFlags.GuildMessageReactions,
      intentFlags.DirectMessages,
    ],
  });

  // Only post stats while running in production
  if (isProd) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const autoPoster = AutoPoster(process.env.TOP_GG_TOKEN!, discordClient);

    autoPoster.on('posted', () => {
      logger.info('Posted stats to Top.gg!');
    });
  }

  const rabbitMq = await makeRabbitMq(discordClient);
  const database = new MoveerDatabase();
  const utils = new MoveerHelper({ database, rabbitMq });

  await database.migrate();

  // Setup events
  ready(discordClient, rabbitMq);
  interactionCreate(discordClient, utils);
  guildCreate({ client: discordClient, database, rabbitMq });

  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }

  await discordClient.login(process.env.BOT_TOKEN);
};

setup();
