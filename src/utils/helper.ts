import {
  ChatInputCommandInteraction,
  GuildMember,
  Interaction,
  VoiceChannel,
} from 'discord.js';

import { MoveerDatabase } from './db';
import { logger, reportMoveerError } from './logger';
import { MoveerRabbitMq } from './rabbitmq';

interface MoveUsersParams {
  commandName: string;
  interaction: ChatInputCommandInteraction;
  configurations: Array<MoveUser>;
}

interface MoveUser {
  usersToMove: Array<GuildMember>;
  toVoiceChannel: VoiceChannel;
}

interface MoveerUtilsParams {
  database: MoveerDatabase;
  rabbitMq: MoveerRabbitMq;
}

export class MoveerHelper {
  database: MoveerDatabase;
  rabbitMq: MoveerRabbitMq;

  constructor(params: MoveerUtilsParams) {
    this.database = params.database;
    this.rabbitMq = params.rabbitMq;
  }

  async moveUsers(params: MoveUsersParams): Promise<void> {
    const { interaction, configurations, commandName } = params;

    let message = '';
    const errorMessages: Array<string> = [];
    let usersMoved = 0;
    let totalUsersMoved = 0;

    for (const { toVoiceChannel, usersToMove } of configurations) {
      for (const user of usersToMove) {
        const assert = assertHasMovingPermission(
          interaction,
          user,
          toVoiceChannel,
        );

        if (!assert.hasPermission) {
          if (assert.error) {
            errorMessages.push(assert.error);
          }

          continue;
        }

        this.rabbitMq.publishMoveMessage({
          guild: user.guild,
          guildMember: user,
          toVoiceChannel,
        });
        usersMoved++;
        totalUsersMoved++;
      }

      message += `Moved ${usersMoved} user${
        usersMoved > 1 ? 's' : ''
      } to ${toVoiceChannel}\n`;
      usersMoved = 0;
    }

    await interaction.editReply({
      content:
        message +
        '\n\n' +
        errorMessages
          .splice(0, 3)
          .map((errorMessage) => errorMessage)
          .join('\n\n'),
    });

    await logUsersMoved({
      commandName,
      db: this.database,
      interaction,
      message,
      usersMoved: totalUsersMoved,
    });
  }

  async isPatreonSubscriber(guildId: string | null): Promise<boolean> {
    if (guildId == null) {
      return false;
    }

    const guild = await this.database.getGuildInfo(guildId);

    return guild?.activePatreon === true ? true : false;
  }

  isGuildMemberConnectedToVoice(guildMember: GuildMember): boolean {
    return (
      guildMember.guild.voiceStates.cache
        .filter((user) => user.id === guildMember.id)
        .first()?.channelId != null
    );
  }

  isGuildMemberAlreadyInCorrectChannel(
    guildMember: GuildMember,
    toVoiceChannel: VoiceChannel,
  ): boolean {
    return (
      guildMember.guild.voiceStates.cache
        .filter((user) => user.id === guildMember.id)
        .first()?.channelId != toVoiceChannel.id
    );
  }
}

interface LogUsersMoved {
  db: MoveerDatabase;
  message: string;
  commandName: string;
  interaction: Interaction;
  usersMoved: number;
}

async function logUsersMoved(params: LogUsersMoved): Promise<void> {
  const { commandName, db, interaction, message, usersMoved } = params;

  const log = message.split('\n').filter((item) => item !== '');

  log.forEach((logItem) => {
    logger.info(
      {
        commandName,
      },
      logItem,
    );
  });

  if (usersMoved > 0) {
    await db.insertMoveLog(
      log.map(() => ({
        commandName,
        guildId: interaction.guildId,
        usersMoved,
      })),
    );
  }
}

/**
 *
 * @param {ChatInputCommandInteraction} interaction - The command interaction
 * @param {GuildMember} guildMember - The guildMember to be moved
 * @returns true if asserted successfully, otherwise false
 */
function assertHasMovingPermission(
  interaction: ChatInputCommandInteraction,
  guildMember: GuildMember,
  toVoiceChannel: VoiceChannel,
): { hasPermission: boolean; error?: string } {
  if (interaction.guild?.members.me == null) {
    logger.error({ interaction, guildMember }, 'Should never happen?');
    reportMoveerError('assertHasMovingPermission BROKEN!');
    return { hasPermission: false };
  }

  const userVoiceChannel = guildMember.guild.voiceStates.cache
    .filter((user) => user.id === guildMember.id)
    .first()?.channel;

  if (userVoiceChannel == null) {
    logger.warn(`User ${guildMember.id} is not connected to voice`);
    return {
      hasPermission: false,
    };
  }

  // Validate that we have access to the fromVoiceChannel
  const permissions = userVoiceChannel.permissionsFor(
    interaction.guild.members.me,
  );

  if (!permissions?.has('MoveMembers')) {
    return {
      hasPermission: false,
      error: `Could not move ${guildMember} - Moveer is missing MOVE permissions to - ${userVoiceChannel}`,
    };
  }

  if (!permissions?.has('Connect')) {
    return {
      hasPermission: false,
      error: `Could not move ${guildMember}. Moveer is missing CONNECT permissions to - ${userVoiceChannel}`,
    };
  }

  // Validate that we have access to the toVoiceChannel
  const moveerPerms = toVoiceChannel.permissionsFor(
    interaction.guild.members.me,
  );

  const userPerms = toVoiceChannel.permissionsFor(guildMember);

  if (!userPerms.has('ViewChannel') && !moveerPerms.has('ViewChannel')) {
    return {
      hasPermission: false,
      error: `Could not move ${guildMember}. Moveer is missing VIEW CHANNEL permissions to - ${toVoiceChannel}`,
    };
  }

  return { hasPermission: true };
}
