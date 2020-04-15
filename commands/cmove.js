const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  let messageMentions = message.mentions.users.array() // Mentions in the message
  let toVoiceChannel

  try {
    let toVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      toVoiceChannelName = names[0]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 1)
    check.forUserMentions(message, messageMentions)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    messageMentions = check.ifMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = check.ifUsersAlreadyInChannel(message, messageMentions, toVoiceChannel.id)
    check.ifChannelIsTextChannel(message, toVoiceChannel)
    const userIdsToMove = await messageMentions.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, toVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, toVoiceChannel.id, rabbitMqChannel)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move,
}
