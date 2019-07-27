const Discord = require('discord.js')
const client = new Discord.Client()
const opts = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts)

// TOKEN
const config = require('./config.js')
const token = config.discordToken

const move = require('./move.js')
const cmove = require('./cmove.js')
const gmove = require('./gmove.js')
const fmove = require('./fmove.js')
const rmove = require('./rmove.js')
const moveerMessage = require('./moveerMessage.js')

if (config.discordBotListToken !== 'x') {
  // Only run if bot is public at discordbotlist.com
  const DBL = require('dblapi.js')
  const dbl = new DBL(config.discordBotListToken, client)
  dbl.on('posted', () => {
    log.info('Posted Server count to DBL. Member of (' + client.guilds.size + ') servers')
  })

  dbl.on('error', e => {
    log.warn(`DBL Error!:  ${e}`)
  })
}

client.on('ready', () => {
  log.info('Startup successful.')
})

client.on('guildCreate', (guild) => {
  const welcomeMessage = 'Hello and thanks for inviting me! If you need help or got any questions, please head over to the official Moveer discord at https://discord.gg/dTdH3gD\n'
  const supportMessage = 'I got multiple commands, but to get started with !move, please follow the guide below.\n 1. Create a voice channel and name it "Moveer".\n 2. Ask your friends to join "Moveer"\n 3. Join any voice channel except "Moveer"\n 4. Write `!move @friend1 @friend2`\n 5. Thats it! @friend1 & @friend2 should be moved to your voice channel.\n \nWe got more commands! Write !help to see them all.\nLets get Moving!'
  log.info('Joined server: ' + guild.name)
  let defaultChannel = ''
  guild.channels.forEach((channel) => {
    if (channel.type === 'text' && defaultChannel === '') {
      if (channel.permissionsFor(guild.me).has('SEND_MESSAGES') && channel.permissionsFor(guild.me).has('READ_MESSAGES')) {
        defaultChannel = channel
      }
    }
  })
  if (defaultChannel === '') {
    log.info('Failed to find defaultchannel, not sending welcome message.')
    return
  }
  defaultChannel.send(welcomeMessage + supportMessage)
})

client.on('guildDelete', (guild) => {
  log.info('Leaving server: ' + guild.name)
})

// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return
  if (message.author.bot && config.allowedGuilds.indexOf(message.guild.id) === -1) return
  if (message.channel.type !== 'text') return
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (command === 'move') move.move(args, message)
  if (command === 'gmove') gmove.move(args, message)
  if (command === 'cmove') cmove.move(args, message)
  if (command === 'fmove') fmove.move(args, message)
  if (command === 'rmove') rmove.move(args, message)
  if (command === 'help') {
    if (message.author.bot) return
    const gotEmbedPerms = message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
    if (args.length < 1) {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_MESSAGE : moveerMessage.FALLBACK_HELP_MESSAGE)
    } else if (args[0] === 'cmove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_CMOVE : moveerMessage.FALLBACK_HELP_CMOVE)
    } else if (args[0] === 'move') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_MOVE : moveerMessage.FALLBACK_HELP_MOVE)
    } else if (args[0] === 'gmove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_GMOVE : moveerMessage.FALLBACK_HELP_GMOVE)
    } else if (args[0] === 'fmove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_FMOVE : moveerMessage.FALLBACK_HELP_FMOVE)
    } else if (args[0] === 'rmove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_RMOVE : moveerMessage.FALLBACK_HELP_RMOVE)
    }
  }
})

client.login(token)
