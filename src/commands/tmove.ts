import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'tmove';

export const tmove: Command = {
  description: 'Moves all users with a specific role into one channel',
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
      description: 'Role to move',
      name: 'role-1',
      required: true,
      type: ApplicationCommandOptionType.Role,
    },
    {
      description: 'Role to move',
      name: 'role-2',
      type: ApplicationCommandOptionType.Role,
    },
    {
      description: 'Role to move',
      name: 'role-3',
      type: ApplicationCommandOptionType.Role,
    },
    {
      description: 'Role to move',
      name: 'role-4',
      type: ApplicationCommandOptionType.Role,
    },
    {
      description: 'Role to move',
      name: 'role-5',
      type: ApplicationCommandOptionType.Role,
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

  const users = parseRolesToMove(interaction, utils, toVoiceChannel);

  if (users.length === 0) {
    interaction.editReply({
      content: 'No role with users inside any voice channels',
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

function parseRolesToMove(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
  toVoiceChannel: VoiceChannel,
): Array<GuildMember> {
  const options = interaction.options.data.filter((option) =>
    option.name.includes('role'),
  );

  const roles = options.map(
    (option) => interaction.options.getRole(option.name) as Role,
  );

  const users = roles.map((role) =>
    role.members
      .toJSON()
      .filter(
        (user) =>
          utils.isGuildMemberConnectedToVoice(user) &&
          utils.isGuildMemberAlreadyInCorrectChannel(user, toVoiceChannel),
      ),
  );

  return users.flat();
}
