import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'ckick';

export const ckick: Command = {
  description: 'Disconnect a specific user from voice',
  name: commandName,
  options: [
    {
      description: 'User to disconnect',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],
  run: async (interaction: ChatInputCommandInteraction, utils: MoveerHelper) =>
    await runCommand(interaction, utils),
};

async function runCommand(
  interaction: ChatInputCommandInteraction,
  _utils: MoveerHelper,
): Promise<void> {
  const user = interaction.options.getMember('user') as GuildMember;

  if (user == null) {
    interaction.editReply({
      content: `Could not find a ${user} to disconnect from voice`,
    });
    return;
  }

  try {
    await user.voice.disconnect();
    interaction.editReply({ content: `Disconnect ${user} from voice` });
  } catch (err) {
    interaction.editReply({
      content: `Missing permission to disconnect ${user} from voice`,
    });
  }
}
