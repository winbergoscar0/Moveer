import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';

import { MoveerHelper } from '../utils/helper';

export interface Command extends ChatInputApplicationCommandData {
  run: (
    interaction: ChatInputCommandInteraction,
    utils: MoveerHelper,
  ) => Promise<void>;
}
