import { ChatInputCommandInteraction, Client, Interaction } from 'discord.js';

import { moveerCommands } from '../commands/index';
import { Command } from '../data-types/command';
import { MoveerHelper } from '../utils/helper';
import { logger, reportMoveerError } from '../utils/logger';

export const interactionCreate = (
  client: Client,
  utils: MoveerHelper,
): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction, utils);
    }
  });
};

const handleSlashCommand = async (
  interaction: ChatInputCommandInteraction,
  utils: MoveerHelper,
): Promise<void> => {
  const slashCommand = moveerCommands.find(
    (command: Command) => command.name === interaction.commandName,
  );

  if (!slashCommand) {
    interaction.followUp({ content: 'Unknown command' });
    reportMoveerError('Unknown slash command sent: ' + interaction.commandName);
    return;
  }

  await interaction.deferReply();

  try {
    await slashCommand.run(interaction, utils);
  } catch (err) {
    logger.error({ err }, 'Error while handling slash command');
    interaction.editReply({
      content:
        'An unknown error has occurred while handling the command. The developers have been notified',
    });
    reportMoveerError(
      'Unknown error has occurred while handling the command\n\n' +
        (err as Error).stack,
    );
  }
};
