const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  try {
    let messageMentions = [...message.mentions.users.values()] // Mentions in the message
    let toVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      toVoiceChannelName = names[0]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 1)
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    if (messageMentions.length < 1) messageMentions = await helper.findUserByUserName(message, args)
    check.forUserMentions(message, messageMentions)
    messageMentions = await check.ifMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = await check.ifUsersAlreadyInChannel(message, messageMentions, toVoiceChannel.id)
    check.ifChannelIsTextChannel(message, toVoiceChannel)
    const userIdsToMove = await messageMentions.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, toVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, toVoiceChannel.id, rabbitMqChannel)
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
