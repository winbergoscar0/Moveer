const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

async function move (args, message) {
  let messageMentions = message.mentions.users.array() // Mentions in the message
  let toVoiceChannel

  try {
    let toVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args)
      toVoiceChannelName = names[0]
    }

    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    messageMentions = helper.checkIfMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = helper.checkIfUsersAlreadyInChannel(message, messageMentions, toVoiceChannel.id)
    helper.checkIfChannelIsTextChannel(message, toVoiceChannel)
    const userIdsToMove = await messageMentions.map(({ id }) => id)
    await helper.checkForMovePerms(message, userIdsToMove, toVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, toVoiceChannel.id)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
