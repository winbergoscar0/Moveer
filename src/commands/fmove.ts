import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'fmove';

export const fmove: Command = {
  description: 'Moves all users inside one channel into another channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Voice channel to move users from',
      name: 'from-voice-channel',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Voice channel to move users to',
      name: 'to-voice-channel',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
  ],
  run: async (interaction: ChatInputCommandInteraction, utils: MoveerHelper) =>
    await runCommand(interaction, utils),
};

async function runCommand(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
): Promise<void> {
  const fromVoiceChannel = interaction.options.getChannel(
    'from-voice-channel',
  ) as VoiceChannel;

  const toVoiceChannel = interaction.options.getChannel(
    'to-voice-channel',
  ) as VoiceChannel;

  if (fromVoiceChannel.id === toVoiceChannel.id) {
    interaction.editReply({
      content: 'The from and to channel cannot be the same',
    });
    return;
  }

  const users = fromVoiceChannel.members;

  if (fromVoiceChannel == null || users.size === 0) {
    interaction.editReply({
      content: `No users inside ${fromVoiceChannel} `,
    });
    return;
  }

  await utils.moveUsers({
    commandName,
    configurations: [
      {
        toVoiceChannel,
        usersToMove: users.toJSON(),
      },
    ],
    interaction,
  });
}
