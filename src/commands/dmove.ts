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

const commandName = 'dmove';

export const dmove: Command = {
  description:
    'Spreads users into multiple channels inside a category x from each voice channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'First Voice channel to move users from',
      name: 'from-voice-channel-1',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Second Voice channel to move users from',
      name: 'from-voice-channel-2',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildCategory],
      description: 'Category to move users into',
      name: 'to-category',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description:
        'How many users to move from each channel (2 equals 2 from each channel, in total 4)',
      name: 'users-in-each-channel',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (interaction: ChatInputCommandInteraction, utils: MoveerHelper) =>
    await runCommand(interaction, utils),
};

async function runCommand(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
): Promise<void> {
  // Parse options
  const fromVoiceChannelOne = interaction.options.getChannel(
    'from-voice-channel-1',
    true,
  ) as VoiceChannel;

  const fromVoiceChannelTwo = interaction.options.getChannel(
    'from-voice-channel-2',
    true,
  ) as VoiceChannel;

  const category = interaction.options.getChannel(
    'to-category',
    true,
  ) as CategoryChannel;

  const usersInEachChannel = interaction.options.getInteger(
    'users-in-each-channel',
    true,
  );
  // End Parse options

  const ignoreFilter = (user: GuildMember): boolean =>
    !user.roles.cache.some((role) => role.name === 'ymoveignore');

  const usersOne = fromVoiceChannelOne.members.filter(ignoreFilter);
  const usersTwo = fromVoiceChannelTwo.members.filter(ignoreFilter);

  if (usersOne.size < usersInEachChannel) {
    interaction.editReply({
      content: `Not enough users inside ${usersOne}`,
    });
    return;
  }

  if (usersTwo.size < usersInEachChannel) {
    interaction.editReply({
      content: `Not enough users inside ${usersTwo}`,
    });
    return;
  }

  if (fromVoiceChannelOne == null || usersOne.size === 0) {
    interaction.editReply({
      content: `No users inside ${fromVoiceChannelOne} `,
    });
    return;
  }

  if (fromVoiceChannelTwo == null || usersTwo.size === 0) {
    interaction.editReply({
      content: `No users inside ${fromVoiceChannelTwo} `,
    });
    return;
  }

  const voiceChannelsInCategory = [
    ...category.children.cache
      .filter(
        (channel) =>
          (channel.type === ChannelType.GuildVoice ||
            channel.type === ChannelType.GuildStageVoice) &&
          channel.members.size === 0,
      )
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .values(),
  ];

  // Check if theres enough space for all users to be moved
  if (
    voiceChannelsInCategory.length === 0 ||
    voiceChannelsInCategory.length / (usersOne.size / usersInEachChannel) < 1
  ) {
    interaction.editReply({
      content: `Not enough voice channels in the category ${category}`,
    });
    return;
  }

  const configs = [];

  let usersLeftInChannelOne = usersOne;
  let usersLeftInChannelTwo = usersTwo;
  let index = 0;

  do {
    const batchFromChannelOne =
      usersLeftInChannelOne.random(usersInEachChannel);
    const batchFromChannelTwo =
      usersLeftInChannelTwo.random(usersInEachChannel);

    if (
      batchFromChannelOne == null ||
      batchFromChannelTwo == null ||
      batchFromChannelOne.length < usersInEachChannel ||
      batchFromChannelTwo.length < usersInEachChannel
    ) {
      return;
    }

    usersLeftInChannelOne = usersLeftInChannelOne.filter(
      (ul) => !batchFromChannelOne.includes(ul),
    );
    usersLeftInChannelTwo = usersLeftInChannelTwo.filter(
      (ul) => !batchFromChannelTwo.includes(ul),
    );

    configs.push({
      toVoiceChannel: voiceChannelsInCategory[index] as VoiceChannel,
      usersToMove: [...batchFromChannelOne, ...batchFromChannelTwo],
    });

    index++;
  } while (usersLeftInChannelOne.size >= usersInEachChannel);

  await utils.moveUsers({
    commandName,
    configurations: configs,
    interaction,
  });
}
