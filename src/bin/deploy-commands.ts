/* eslint-disable no-undef */

import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import { REST, Routes } from 'discord.js';

import { moveerCommands } from '../commands/index';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-undef
const token = process.env.BOT_TOKEN!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const clientId = process.env.BOT_CLIENT_ID!;

const commands = moveerCommands.map((command) => ({
  description: command.description,
  name: command.name,
  options: command.options,
}));

const rest = new REST({ version: '10' }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
