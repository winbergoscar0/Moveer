const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function kick(args, message) {
  try {
    let messageMentions = [...message.mentions.users.values()] // Mentions in the message
    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 1)
    if (messageMentions.length < 1) messageMentions = await helper.findUserByUserName(message, args)
    check.forUserMentions(message, messageMentions)
    messageMentions = await check.ifMentionsInsideVoiceChannel(message, messageMentions)
    const userIdsToMove = await messageMentions.map(({ id }) => id)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.kickUsers(message, userIdsToMove)
  } catch (err) {
    if (!err.logMessage) {
      console.log(err)
      moveerMessage.reportMoveerError('Above alert was caused by:\n' + err.stack)
    }
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  kick,
}
