/* eslint-disable no-throw-literal */
const moveerMessage = require('../moveerMessage.js')
const check = require('../helpers/check.js')
const database = require('../helpers/database.js')

async function moveerAdmin(args, message) {
  try {
    if (message.mentions.channels.size === 0) {
      moveerMessage.logger(message, 'Missing channel mention')
      moveerMessage.sendMessage(message, moveerMessage.MESSAGE_MENTION_IS_NOT_TEXT(message.author.id))
      return
    }
    await check.ifTextChannelIsMoveerAdmin(message)
    const searchForGuild = await database.getGuildObject(message, message.guild.id)
    check.ifChannelTextExpectText(message)
    searchForGuild.rowCount > 0
      ? await database.updateMoveerAdminChannel(message)
      : await database.insertGuildMoveerAdminChannel(message)

    moveerMessage.logger(message, 'Added moveeradmin channel with name: ' + message.mentions.channels.first().name)
    moveerMessage.sendMessage(
      message,
      moveerMessage.MESSAGES_NOW_ALLOWED_IN_CHANNEL(message.author.id, message.mentions.channels.first().id)
    )
  } catch (err) {
    if (!err.logMessage) {
      moveerMessage.reportMoveerError('@everyone Unable to update or insert moveeradmin text channel to DB')
      moveerMessage.reportMoveerError('Above alert was caused by:\n' + err.stack)
      moveerMessage.logger(message, moveerMessage.DB_DOWN_WARNING)
      moveerMessage.sendMessage(message, moveerMessage.DB_DOWN_WARNING)
    } else {
      const searchForGuild = await database.getGuildObject(message, message.guild.id)
      console.log(searchForGuild.rows)
      moveerMessage.logger(message, err.logMessage)
      moveerMessage.sendMessage(
        message,
        err.sendMessage +
          (searchForGuild.rows[0].adminChannelId === '106679489135706112'
            ? '\n\nThe first time you use `!changema` you have to do it inside the default admin channel `#moveeradmin`.'
            : '')
      )
    }
  }
}

module.exports = {
  moveerAdmin,
}
