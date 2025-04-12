import {
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from 'discord.js';

import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';

const commandName = 'amove';

export const amove: Command = {
  description:
    'Move all users from all voice channels to your current voice channel',
  name: commandName,
  options: [],
  run: async (interaction: ChatInputCommandInteraction, utils: MoveerHelper) =>
    await runCommand(interaction, utils),
};

async function runCommand(
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
): Promise<void> {
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

  // Get all voice channels in the guild
  const voiceChannels = interaction.guild?.channels.cache.filter(
    (channel) => channel.isVoiceBased() && channel.id !== authorVoiceChannel.id,
  );

  if (voiceChannels == null || voiceChannels.size === 0) {
    interaction.editReply({
      content: 'No voice channels found in this server',
    });
    return;
  }

  // Get all users in voice channels
  const usersToMove: Array<GuildMember> = [];

  for (const [_, channel] of voiceChannels) {
    if (!channel.isVoiceBased()) {
      continue;
    }

    channel.members.forEach((member) => {
      usersToMove.push(member);
    });
  }

  if (usersToMove.length === 0) {
    interaction.editReply({
      content: 'No users found in any voice channels to move',
    });
    return;
  }

  await utils.moveUsers({
    commandName,
    configurations: [
      {
        toVoiceChannel: authorVoiceChannel as VoiceChannel,
        usersToMove: usersToMove,
      },
    ],
    interaction,
  });
}
