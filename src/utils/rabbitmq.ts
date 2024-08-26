import { Channel, connect, Message } from 'amqplib/callback_api';
import { Client, Guild, GuildMember, VoiceChannel } from 'discord.js';

import { logger, reportMoveerError } from '../utils/logger';

export interface MoveerRabbitMq {
  createConsumer(guildId: string): void;
  publishMoveMessage(params: PublishMessageParams): void;
}

interface RabbitMqMessage {
  guildId: string;
  userId: string;
  voiceChannelId: string;
}

interface PublishMessageParams {
  isPatreon: boolean;
  guildMember: GuildMember;
  guild: Guild;
  toVoiceChannel: VoiceChannel;
}

export class RabbitMq implements MoveerRabbitMq {
  private rabbitMqChannel: Channel;
  private client: Client;

  constructor(client: Client, rabbitMqChannel: Channel) {
    this.client = client;
    this.rabbitMqChannel = rabbitMqChannel;
  }

  public async publishMoveMessage(params: PublishMessageParams): Promise<void> {
    const { guildMember, guild, toVoiceChannel } = params;

    const rabbitMqMessage: RabbitMqMessage = {
      guildId: guild.id,
      userId: guildMember.id,
      voiceChannelId: toVoiceChannel.id,
    };

    // Fallback to 0 if unable to find shardId
    const shardId = this.client.shard?.ids[0].toString() ?? '0';

    // TODO - Patreon
    const queue = shardId;

    this.rabbitMqChannel.assertQueue(queue, {
      durable: true,
    });

    this.rabbitMqChannel.checkQueue(queue, (err, result) => {
      if (result.messageCount > 100) {
        reportMoveerError(`Queue ${queue} is getting full!!!!`);
      }
    });

    this.rabbitMqChannel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(rabbitMqMessage)),
      {
        persistent: true,
        expiration: '600000', // 10 minutes
      },
    );
    logger.info(rabbitMqMessage, `Published message to queue: ${queue}`);
  }

  public createConsumer(queue: string): void {
    logger.info(`Creating consumer on queue: ${queue}}`);
    this.rabbitMqChannel.assertQueue(queue, {
      durable: true,
    });
    this.rabbitMqChannel.consume(
      queue,
      async (msg: Message | null) => {
        if (msg == null) {
          return;
        }

        const rabbitMqMessage: RabbitMqMessage = JSON.parse(
          msg.content.toString(),
        );

        const { guildId, userId, voiceChannelId } = rabbitMqMessage;

        try {
          const guild = this.client.guilds.cache.get(guildId);

          if (guild == null) {
            logger.warn({ guildId }, 'Could not find guild');
            return;
          }

          const guildMember = guild.members.cache.get(userId);

          if (guildMember == null) {
            logger.warn({ guildId, guildMember }, 'Could not find guildMember');
            return;
          }

          await guildMember.voice.setChannel(voiceChannelId).catch((err) => {
            if (err.message === 'Target user is not connected to voice.') {
              logger.error(
                err,
                `(${this.client.shard?.ids}) - Failed to move ${userId} - User not connected to voice`,
              );
            } else {
              logger.error(err, 'Failed to move user');
              reportMoveerError(
                `(${this.client.shard?.ids}) - Failed to move ${userId}\n\n` +
                  (err as Error).stack,
              );
            }
          });
        } catch (err) {
          logger.error(err);
          reportMoveerError(
            'Got unknown error while moving user:\n\n' + (err as Error).stack,
          );
        }

        // ack everything since this is master
        this.rabbitMqChannel.ack(msg);
      },
      { noAck: false },
    );
  }
}

export async function makeRabbitMq(client: Client): Promise<RabbitMq> {
  const rabbitMqChannel: Channel = await new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    connect(process.env.rabbitMQConnection!, (error0, connection) => {
      if (error0) {
        logger.error(error0, 'Failed to connect to rabbitMq');
        reject(error0);
      }

      connection.createChannel((error1, channel) => {
        if (error1) {
          logger.error(error1, 'Failed to crate rabbitMqChannel');
          reject(error1);
        }

        channel.prefetch(1);

        resolve(channel);
      });
    });
  });

  return new RabbitMq(client, rabbitMqChannel);
}
