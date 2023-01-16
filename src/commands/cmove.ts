import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'cmove';

export const cmove: Command = {
  description: 'Move users to a voice channel',
  name: commandName,
  options: [
    {
      channel_types: [ChannelType.GuildStageVoice, ChannelType.GuildVoice],
      description: 'Voice channel to move users to',
      name: 'to-voice-channel',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      description: 'User to move',
      name: 'user-1',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      description: 'User to move',
      name: 'user-2',
      type: ApplicationCommandOptionType.User,
    },
    {
      description: 'User to move',
      name: 'user-3',
      type: ApplicationCommandOptionType.User,
    },
    {
      description: 'User to move',
      name: 'users-4',
      type: ApplicationCommandOptionType.User,
    },
    {
      description: 'User to move',
      name: 'users-5',
      type: ApplicationCommandOptionType.User,
    },
    {
      description: 'User to move',
      name: 'users-6',
      type: ApplicationCommandOptionType.User,
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
  ) as VoiceChannel;

  const users = parseUsersToMove(interaction, utils, toVoiceChannel);

  if (users.length === 0) {
    interaction.editReply({
      content: 'None of this users is inside any voice channels',
    });
    return;
  }

  await utils.moveUsers({
    commandName,
    configurations: [
      {
        toVoiceChannel,
        usersToMove: users,
      },
    ],
    interaction,
  });
}

function parseUsersToMove(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
  toVoiceChannel: VoiceChannel,
): Array<GuildMember> {
  // Filter to only get options handling users
  const options = interaction.options.data.filter((option) =>
    option.name.includes('user'),
  );

  // For each option, get the member by the option name (USER-1, USER-2)
  const users = options.map(
    (option) => interaction.options.getMember(option.name) as GuildMember,
  );

  return users.filter(
    (user) =>
      utils.isGuildMemberConnectedToVoice(user) &&
      utils.isGuildMemberAlreadyInCorrectChannel(user, toVoiceChannel),
  );
}
