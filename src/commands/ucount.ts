import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'ucount';

export const ucount: Command = {
  description: 'Count amount of users inside one channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Voice channel count users from',
      name: 'voice-channel',
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
  const voiceChannel = interaction.options.getChannel(
    'voice-channel',
  ) as VoiceChannel;

  const userCount = voiceChannel.members.size;

  interaction.editReply({
    content: `${userCount} users inside ${voiceChannel}`,
  });
}
