const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  try {
    let messageMentions = [...message.mentions.users.values()] // Mentions in the message
    const fromVoiceChannel = helper.getChannelByName(message, 'moveer')
    const authorVoiceId = await helper.getUserVoiceChannelIdByUserId(message, message.author.id)
    check.ifAuthorInsideAVoiceChannel(message, authorVoiceId)
    const authorVoiceChannel = await helper.getChannelByName(message, authorVoiceId)
    check.argsLength(args, 1)
    check.forUserMentions(message, messageMentions)
    check.ifSelfMention(message)
    if ((await check.ifTextChannelIsMoveerAdmin(message, false)) === false) {
      check.ifVoiceChannelExist(message, fromVoiceChannel, 'Moveer')
      const fromVoiceChannelName = fromVoiceChannel.name
      check.ifVoiceChannelContainsMoveer(message, authorVoiceChannel.name)
      check.ifGuildHasTwoMoveerChannels(message)
      check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    }
    messageMentions = await check.ifMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = await check.ifUsersAlreadyInChannel(message, messageMentions, authorVoiceId)
    const userIdsToMove = await messageMentions.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, authorVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, authorVoiceId, rabbitMqChannel)
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
  move,
}
