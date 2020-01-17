const Discord = require('discord.js')
const client = new Discord.Client()
const opts = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts)
const amqp = require('amqplib/callback_api')

// TOKEN
const config = require('./config.js')
const token = config.discordToken

const move = require('./commands/move.js')
const cmove = require('./commands/cmove.js')
const gmove = require('./commands/gmove.js')
const fmove = require('./commands/fmove.js')
const rmove = require('./commands/rmove.js')
const tmove = require('./commands/tmove.js')
const ymove = require('./commands/ymove.js')
const avmove = require('./commands/av.js')
const moveerMessage = require('./moveerMessage.js')
const change = require('./commands/changeMoveerAdmin.js')

// rabbitMQ
const rabbitMQConnection = process.env.rabbitMQConnection || config.rabbitMQConnection
let rabbitMqChannel

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
  log.info('Running as user: ' + client.user.username)
  amqp.connect(rabbitMQConnection, (error0, connection) => {
    if (error0) {
      throw error0
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1
      }
      rabbitMqChannel = channel

      // Create a consumer for each guild that I'm inside
      client.guilds.forEach(guild => {
        createConsumer(guild.id, rabbitMqChannel)
      })
    })
  })
})

client.on('guildCreate', (guild) => {
  createConsumer(guild.id, rabbitMqChannel)
  const welcomeMessage = 'Hello and thanks for inviting me! If you need help or got any questions, please head over to the official Moveer discord at https://discord.gg/dTdH3gD\n'
  const supportMessage = 'I got multiple commands, but to get started with !cmove, please follow the guide below.\n 1. Create a text channel and name it "moveeradmin" (Or use !changema #<textChannelName> to change it).\n 2. Ask your friends to join a voice channel X\n 3. Inside the textchannel "moveeradmin" write !cmove <voicechannelY> @yourfriendsname\n4. Thats it! @yourfriend should be moved from X to voice channel Y.\n \nWe got more commands! Write !help to see them all.\nLets get Moving!'
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

client.on('rateLimit', (limit) => {
  log.info('RATELIMITED')
  log.info(limit)
})

// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return
  if (message.author.bot && config.allowedGuilds.indexOf(message.guild.id) === -1) return
  if (message.channel.type !== 'text') return
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (command === 'changema') change.moveerAdmin(args, message)
  if (command === 'move') move.move(args, message, rabbitMqChannel)
  if (command === 'gmove') gmove.move(args, message, rabbitMqChannel)
  if (command === 'cmove') cmove.move(args, message, rabbitMqChannel)
  if (command === 'fmove') fmove.move(args, message, rabbitMqChannel)
  if (command === 'rmove') rmove.move(args, message, rabbitMqChannel)
  if (command === 'tmove') tmove.move(args, message, rabbitMqChannel)
  if (command === 'ymove') ymove.move(args, message, rabbitMqChannel)
  if (command === 'av') avmove.move(args, message, rabbitMqChannel)
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
    } else if (args[0] === 'tmove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_TMOVE : moveerMessage.FALLBACK_HELP_TMOVE)
    } else if (args[0] === 'ymove') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_YMOVE : moveerMessage.FALLBACK_HELP_YMOVE)
    } else if (args[0] === 'changema') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_CHANGEMA : moveerMessage.FALLBACK_HELP_CHANGEMA)
    } else if (args[0] === 'av') {
      moveerMessage.sendMessage(message, gotEmbedPerms ? moveerMessage.HELP_AVMOVE : moveerMessage.FALLBACK_HELP_AVMOVE)
    }
  }
})

client.login(token)

function createConsumer (queue, rabbitMqChannel) {
  log.info('Creating consumer for guild: ' + queue)
  rabbitMqChannel.assertQueue(queue, {
    durable: true
  })
  rabbitMqChannel.consume(queue, (msg) => {
    const jsonMsg = JSON.parse(msg.content.toString())
    log.info('Moving ' + jsonMsg.userId + ' to voiceChannel: ' + jsonMsg.voiceChannelId + ' inside guild: ' + jsonMsg.guildId)
    client.guilds.get(jsonMsg.guildId).member(jsonMsg.userId).setVoiceChannel(jsonMsg.voiceChannelId)
      .catch(err => {
        if (err.message !== 'Target user is not connected to voice.') {
          log.error(err)
          log.info('Got above error when moving people...')
          moveerMessage.reportMoveerError('MOVE', err.message)
        }
        log.warn(jsonMsg.userName + ' left voice before getting moved')
      })
  }, { noAck: true })
}
