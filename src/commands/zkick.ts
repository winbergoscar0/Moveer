import {
  ApplicationCommandOptionType,
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'zkick';

export const zkick: Command = {
  description: 'Disconnect everyone in a specific category from voice',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildCategory],
      description: 'Category to kick users from',
      name: 'category',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
  ],
  run: async (interaction: ChatInputCommandInteraction, utils: MoveerHelper) =>
    await runCommand(interaction, utils),
};

async function runCommand(
  interaction: ChatInputCommandInteraction,
  _utils: MoveerHelper,
): Promise<void> {
  const category = interaction.options.getChannel(
    'category',
    true,
  ) as CategoryChannel;

  const usersToKick = category.members.toJSON();

  for (const user of usersToKick) {
    try {
      await user.voice.disconnect();
      interaction.editReply({ content: `Kicked ${user}` });
    } catch (err) {
      interaction.editReply({
        content: `Missing permission to kick ${user}`,
      });
    }
  }
}
