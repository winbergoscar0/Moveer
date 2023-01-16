import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'fkick';

export const fkick: Command = {
  description: 'Disconnect all users inside one channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Voice channel to disconnect users from',
      name: 'from-voice-channel',
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
    'from-voice-channel',
  ) as VoiceChannel;

  for (const user of voiceChannel.members.values()) {
    try {
      await user.voice.disconnect();
      interaction.editReply({ content: `Disconnected ${user} from voice` });
    } catch (err) {
      interaction.editReply({
        content: `Missing permission to disconnect ${user} from voice`,
      });
    }
  }
}
