import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'move';

export const move: Command = {
  description: 'Move users to your voice channel',
  name: commandName,
  options: [
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
  const users = parseUsersToMove(interaction, utils);

  const author = interaction.member as GuildMember;

  const authorVoiceChannel = author.guild.voiceStates.cache
    .filter((user) => user.id === author.id)
    .first()?.channel;

  if (authorVoiceChannel == null) {
    interaction.editReply({
      content: 'You need to join a voice channel before using this command',
    });
    return;
  }

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
        toVoiceChannel: authorVoiceChannel as VoiceChannel,
        usersToMove: users,
      },
    ],
    interaction,
  });
}

function parseUsersToMove(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
): Array<GuildMember> {
  // For each option, get the member by the option name (USER-1, USER-2)
  const users = interaction.options.data.map(
    (option) => interaction.options.getMember(option.name) as GuildMember,
  );

  return users.filter((user) => utils.isGuildMemberConnectedToVoice(user));
}
