const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move (args, message, command) {
  let messageMentions = message.mentions.users.array() // Mentions in the message
  let toVoiceChannel

  try {
    let toVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getChannelWithSpacesName(message, command, args)
      toVoiceChannelName = names[0]
    }

    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    messageMentions = helper.checkIfMentionsInsideVoiceChannel(message, command, messageMentions)
    messageMentions = helper.checkIfUsersAlreadyInChannel(message, command, messageMentions, toVoiceChannel.id)
    helper.checkIfChannelIsTextChannel(message, toVoiceChannel)
    const userIdsToMove = messageMentions.map(({ id }) => id)
    helper.checkForMovePerms(message, userIdsToMove, toVoiceChannel)
    helper.checkForConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, command, userIdsToMove, toVoiceChannel.id)
  }
  catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }
}

module.exports = {
  move
}