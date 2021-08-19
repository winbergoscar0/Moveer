const { Client, Intents } = require('discord.js')

const intentFlags = Intents.FLAGS

const client = new Client({
  shardId: process.argv[1],
  shardCount: process.argv[2],
  intents: [
    intentFlags.GUILDS,
    intentFlags.GUILD_VOICE_STATES,
    intentFlags.GUILD_MESSAGES,
    intentFlags.GUILD_MESSAGE_REACTIONS,
    intentFlags.DIRECT_MESSAGES,
  ],
})

const log = require('./helpers/logger')
const amqp = require('amqplib/callback_api')

// TOKEN
const config = require('./config.js')
const token = config.discordToken
const database = require('./helpers/database.js')
const moveerMessage = require('./moveerMessage.js')
const { handleCommand } = require('./commandHandler.js')

// rabbitMQ
const rabbitMQConnection = process.env.rabbitMQConnection || config.rabbitMQConnection
let rabbitMqChannel

if (config.discordBotListToken !== 'x') {
  // Only run if bot is public at discordbotlist.com
  const DBL = require('dblapi.js')
  const dbl = new DBL(config.discordBotListToken, client)
  dbl.on('posted', () => {
    client.shard
      .fetchClientValues('guilds.cache.size')
      .then((results) => {
        console.log(
          `Posted Server count to DBL. Member of (${results.reduce((prev, guildCount) => prev + guildCount, 0)}) guilds`
        )
      })
      .catch(console.error)
  })

  dbl.on('error', (e) => {
    log.warn(`DBL Error!:  ${e}`)
  })
}

client.on('ready', async () => {
  log.info('Startup successful.')
  log.info('Running as user: ' + client.user.username + ' ShardId: (' + client.shard.ids + ')')
  amqp.connect(rabbitMQConnection, (error0, connection) => {
    if (error0) {
      moveerMessage.reportMoveerError('Unable to connect to rabbitMQ - @everyone')
      throw error0
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1
      }
      rabbitMqChannel = channel
      rabbitMqChannel.prefetch(1)
      //Create a consumer for each guild that I'm inside
      log.info(`Creating ${client.guilds.cache.size} consumers on shard ${client.shard.ids}`)
      client.guilds.cache.forEach((guild) => {
        createConsumer(guild.id, rabbitMqChannel)
      })
    })
  })
})

client.on('error', (err) => {
  console.log(err)
  moveerMessage.reportMoveerError('error\n' + err)
})

client.on('shardDisconnect', (err, id) => {
  console.log(err, id)
  moveerMessage.reportMoveerError(`shardDisconnect (${id})\n` + err)
})

client.on('shardError', (err, id) => {
  console.log(err, id)
  moveerMessage.reportMoveerError(`shardError (${id})\n` + err)
})

client.on('warn', (wrn) => {
  console.log(wrn)
})

client.on('guildCreate', async (guild) => {
  createConsumer(guild.id, rabbitMqChannel)
  log.info('Joined server: ' + guild.name)
  const guildInfo = await database.getGuildObject('noAlert', guild.id)
  if (guildInfo.rowCount !== 0) return
  database.insertGuildAfterWelcome(guild.id)
  const welcomeMessage =
    'Hello and thanks for inviting me! If you need help or got any questions, please head over to the official Moveer discord at https://discord.gg/dTdH3gD\n'
  const supportMessage =
    'I got multiple commands, but to get started try the !cmove command by following the guide below.\n1. Create a text channel and name it "moveeradmin".\n2. Ask your friends to join a voice channel.\n3. Inside the text channel "moveeradmin" write `!cmove <voicechannel name here> @yourfriendsname` -- The voice channel that you specify will be the one that they are moved to.\n4. Thats it! @yourfriend should have been moved now.\n \nI have got more commands for you to use! Write `!help` to see them all.\nLets get Moving!'
  let defaultChannel = ''
  guild.channels.cache.forEach((channel) => {
    if (
      channel.type === 'GUILD_TEXT' &&
      defaultChannel === '' &&
      channel.permissionsFor(guild.me).has('SEND_MESSAGES') &&
      channel.permissionsFor(guild.me).has('VIEW_CHANNEL')
    ) {
      defaultChannel = channel
    }
  })
  defaultChannel === ''
    ? log.info('Failed to find defaultchannel, not sending welcome message.')
    : defaultChannel.send(welcomeMessage + supportMessage)
})

client.on('guildDelete', (guild) => {
  log.info('Leaving server: ' + guild.name)
})

client.on('rateLimit', (limit) => {
  log.info('RATELIMITED')
  log.info(limit)
})

client.on('raw', async (packet) => {
  const ignoreUsers = ['564773724520185856', '400724460203802624']
  if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return // only check added reactions
  if (ignoreUsers.includes(packet.d.user_id)) return
  if (packet.d.emoji.name !== '🔂') return
  const guildInfo = await database.getPatreonGuildObject('noAlert', packet.d.guild_id)
  if (guildInfo.rowCount === 0) return
  if (guildInfo.rows[0].enabled === '0' || guildInfo.rows[0].repeatEnabled === 0) return

  const channel = client.channels.cache.get(packet.d.channel_id)
  channel.messages
    .fetch(packet.d.message_id)
    .then((message) => {
      message.reactions.cache
        .first()
        .users.remove(packet.d.user_id)
        .catch((e) => moveerMessage.logger(message, e.message + ' to remove reaction from message'))
      const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
      const command = args.shift().toLowerCase()
      if (!['fmove', 'tmove', 'zmove', 'ymove', 'ucount'].includes(command)) return
      log.info('Resending message since react was added and succesfull. React done by: ' + packet.d.user_id)
      channel.send(
        `Resending message [${message.content}] since react was added and successfull. React done by: <@${packet.d.user_id}>`
      )
      client.emit('messageCreate', message)
    })
    .catch((err) => console.log(err))
})

// Listen for messages
client.on('messageCreate', async (message) => {
  if (!/[^A-Za-z 0-9]/g.test(message.content.charAt(0))) return
  if (message.channel.type !== 'GUILD_TEXT') return
  let guildData = await database.getGuildObject('welcome', message.guild.id)
  guildData = guildData?.rows?.length > 0 ? guildData.rows[0] : null
  if (!message.content.startsWith(guildData?.prefix || config.discordPrefix)) return
  if (message.author.bot && guildData?.allowed === 0) return
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  handleCommand(command, message, args, rabbitMqChannel)
})

client.login(token)

function createConsumer(queue, rabbitMqChannel) {
  rabbitMqChannel.assertQueue(queue, {
    durable: true,
  })
  rabbitMqChannel.consume(
    queue,
    async (msg) => {
      const jsonMsg = JSON.parse(msg.content.toString())

      try {
        await client.guilds.cache
          .get(jsonMsg.guildId)
          .members.cache.get(jsonMsg.userId)
          .voice.setChannel(jsonMsg.voiceChannelId)
          .catch((t) => {
            if (t.message === 'Target user is not connected to voice.') {
              log.warn('(' + client.shard.ids + ') Failure in moving: ' + jsonMsg.userId + ' - User not connected to voice')
            } else {
              log.error('(' + client.shard.ids + ') Failure in moving: ' + jsonMsg.userId + ' - Reason below')
              log.info(t)
              moveerMessage.reportMoveerError(t.message + '\n\n' + msg.content.toString())
            }
          })
        await rabbitMqChannel.ack(msg) // ack everything since this is master
      } catch (err) {
        console.log(err)
        moveerMessage.reportMoveerError('Alert was caused by:\n' + err.stack)
        await rabbitMqChannel.ack(msg) // ack everything since this is master
      }
    },
    { noAck: false }
  )
}
