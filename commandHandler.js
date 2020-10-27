const move = require('./commands/move.js')
const cmove = require('./commands/cmove.js')
const gmove = require('./commands/gmove.js')
const fmove = require('./commands/fmove.js')
const rmove = require('./commands/rmove.js')
const tmove = require('./commands/tmove.js')
const ymove = require('./commands/ymove.js')
const zmove = require('./commands/zmove.js')
const change = require('./commands/changeMoveerAdmin.js')
const moveerMessage = require('./moveerMessage.js')

const handleCommand = (command, message, args, rabbitMqChannel) => {
  if (command === 'say') message.channel.send(args.join(' '))
  if (command === 'changema')
    message.channel.send(
      'This command has moved, it is now !addma <#channel>.\nReason for this is that we now allow multiple renamed moveeradmin channels.'
    )
  if (command === 'addma') change.moveerAdmin('add', message)
  if (command === 'removema') change.moveerAdmin('remove', message)
  if (command === 'move') move.move(args, message, rabbitMqChannel)
  if (command === 'gmove') gmove.move(args, message, rabbitMqChannel)
  if (command === 'cmove') cmove.move(args, message, rabbitMqChannel)
  if (command === 'fmove') fmove.move(args, message, rabbitMqChannel)
  if (command === 'rmove') rmove.move(args, message, rabbitMqChannel)
  if (command === 'tmove') tmove.move(args, message, rabbitMqChannel)
  if (command === 'ymove') ymove.move(args, message, rabbitMqChannel)
  if (command === 'zmove') zmove.move(args, message, rabbitMqChannel)
  if ((command === 'help' || command === 'commands') && !message.author.bot) {
    const gotEmbedPerms = message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
    args.length < 1
      ? moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_MESSAGE : moveerMessage.FALLBACK_HELP_MESSAGE)
      : moveerMessage.sendMessage(message, moveerMessage.handleHelpCommand(args[0], gotEmbedPerms))
  }
}

module.exports = {
  handleCommand,
}
