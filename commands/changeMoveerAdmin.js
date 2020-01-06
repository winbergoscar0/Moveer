const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')
const config = require('../config.js')

async function moveerAdmin (args, message) {
  try {
    const { Client } = require('pg')
    const client = new Client({
      connectionString: config.postgreSQLConnection
    })
    try {
      if (message.mentions.channels.size === 0) {
        moveerMessage.logger(message, 'Missing channel mention')
        moveerMessage.sendMessage(message, 'You need to specify what channel to use, by tagging it with #channelname')
        return
      }
      await client.connect()
      const searchForGuild = await helper.getMoveerAdminChannelFromDB(message, message.guild.id)
      helper.checkIfChannelTextExpectText(message)
      if (searchForGuild.rowCount > 0) {
        await client.query('UPDATE "guilds" SET "adminChannelId" = \'' + message.mentions.channels.first().id + '\' WHERE "guildId" = \'' + message.guild.id + '\'')
      }
      if (searchForGuild.rowCount === 0) {
        const query = {
          text: 'INSERT INTO "guilds" ("guildId", "adminChannelId") VALUES($1, $2)',
          values: [message.guild.id, message.mentions.channels.first().id]
        }
        await client.query(query)
      }
      await client.end()
      moveerMessage.logger(message, 'Added moveeradmin channel with name: ' + message.mentions.channels.first().name)
      moveerMessage.sendMessage(message, 'Admin commands now allowed to be sent inside <#' + message.mentions.channels.first().id + '>')
    } catch (err) {
      console.log(err)
      helper.reportMoveerError('DB-CHANGE', 'alert')
      throw {
        'logmessage': 'Error',
        'sendMessage': 'Moveer cannot communicate with it\'s database. Since this is a admin command please create a textchannel named moveeradmin and use that until my developer fixes this! He has been alerted but please poke him inside the support server! https://discord.gg/dTdH3gD'
      }
    }
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  moveerAdmin
}
