import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Role,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'rmove';

export const rmove: Command = {
  description: 'Moves all users inside one channel into another channel',
  name: commandName,
  options: [
    {
      description: 'Role to move to your channel',
      name: 'role-to-move',
      required: true,
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
  const roleToMove = interaction.options.getRole('role-to-move') as Role;

  const toVoiceChannel = interaction.guild?.voiceStates.cache
    .filter((user) => user.id === interaction.user.id)
    .first()?.channel as VoiceChannel;

  if (toVoiceChannel == null) {
    interaction.editReply({
      content: 'You need to join a voice channel before using this command',
    });
    return;
  }

  const usersToMove = roleToMove.members.filter(
    (guildMember) =>
      guildMember.id !== interaction.user.id &&
      utils.isGuildMemberConnectedToVoice(guildMember) &&
      utils.isGuildMemberAlreadyInCorrectChannel(guildMember, toVoiceChannel),
  );

  if (usersToMove.size === 0) {
    interaction.editReply({
      content: `No users inside with role ${roleToMove} inside any voice channel`,
    });
    return;
  }

  await utils.moveUsers({
    commandName,
    configurations: [
      {
        toVoiceChannel: toVoiceChannel,
        usersToMove: usersToMove.toJSON(),
      },
    ],
    interaction,
  });
}
