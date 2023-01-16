import {
  ApplicationCommandOptionType,
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'zmove';

export const zmove: Command = {
  description: 'Move users inside a category into a specific channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildCategory],
      description: 'Category to move users from',
      name: 'category',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Channel to move users into',
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
  const toVoiceChannel = interaction.options.getChannel(
    'to-voice-channel',
    true,
  ) as VoiceChannel;

  const category = interaction.options.getChannel(
    'category',
    true,
  ) as CategoryChannel;

  const voiceChannelsInCategory = [
    ...category.children.cache
      .filter(
        (channel) =>
          channel.type === ChannelType.GuildVoice ||
          channel.type === ChannelType.GuildStageVoice,
      )
      .values(),
  ];

  const usersToMove: Array<GuildMember> = await voiceChannelsInCategory.reduce(
    (res: Array<GuildMember>, elem) =>
      elem.id !== toVoiceChannel.id
        ? res.concat(elem.members.map((member) => member))
        : res,
    [],
  );

  await utils.moveUsers({
    commandName,
    configurations: [{ toVoiceChannel, usersToMove }],
    interaction,
  });
}
