const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  let messageMentions = message.mentions.users.array(); // Mentions in the message
  const toVoiceChannelName = args[0]
  let toVoiceChannel 

  try {
    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    messageMentions = helper.checkIfMentionsInsideVoiceChannel(message, command, messageMentions)
    messageMentions = helper.checkIfUsersAlreadyInChannel(message, command, messageMentions, toVoiceChannel.id)
  }
  catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  const userIdsToMove = messageMentions.map(({ id }) => id );
  if (userIdsToMove.length > 0) helper.moveUsers(message, command, userIdsToMove, toVoiceChannel.id)
}

module.exports = {
  move
}