import { WebhookClient } from 'discord.js';
import pino from 'pino';

export const logger = pino({
  level: 'info',
  name: 'Moveer',
  redact: {
    paths: ['pid', 'hostname'],
    remove: true,
  },
});

export function reportMoveerError(message: string): void {
  const hook = new WebhookClient({
    id: process.env.discordHookIdentifier!,
    token: process.env.discordHookToken!,
  });
  hook.send('@everyone\n\n ' + message);
}
