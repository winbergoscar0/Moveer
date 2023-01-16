import {
  ApplicationCommandOptionType,
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'ymove';

export const ymove: Command = {
  description: 'Spreads users into multiple channels inside a category',
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
      channel_types: [ChannelType.GuildCategory],
      description: 'Category to move users into',
      name: 'to-category',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'How many users to move into each channel',
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
  const fromVoiceChannel = interaction.options.getChannel(
    'from-voice-channel',
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

  const users = fromVoiceChannel.members.filter(
    (user) => !user.roles.cache.some((role) => role.name === 'ymoveignore'),
  );

  if (users.size < usersInEachChannel) {
    interaction.editReply({
      content: `Not enough users inside ${fromVoiceChannel}`,
    });
    return;
  }

  if (fromVoiceChannel == null || users.size === 0) {
    interaction.editReply({
      content: `No users inside ${fromVoiceChannel} `,
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

  // Check ff theres enough space for all users to be moved
  if (
    voiceChannelsInCategory.length === 0 ||
    voiceChannelsInCategory.length / (users.size / usersInEachChannel) < 1
  ) {
    interaction.editReply({
      content: `Not enough voice channels in the category ${category}`,
    });
    return;
  }

  const configs = [];

  let usersLeft = users;
  let index = 0;

  do {
    const batch = usersLeft.random(usersInEachChannel);

    if (batch == null || batch.length < usersInEachChannel) {
      return;
    }

    usersLeft = usersLeft.filter((ul) => !batch.includes(ul));

    configs.push({
      toVoiceChannel: voiceChannelsInCategory[index] as VoiceChannel,
      usersToMove: batch,
    });

    index++;
  } while (usersLeft.size >= usersInEachChannel);

  await utils.moveUsers({
    commandName,
    configurations: configs,
    interaction,
  });
}
