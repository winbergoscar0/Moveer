const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move (args, message) {
  let messageMentions = message.mentions.users.array() // Mentions in the message
  let fromVoiceChannel
  try {
    fromVoiceChannel = helper.getChannelByName(message, 'moveer')
    helper.checkIfAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    helper.checkIfSelfMention(message)
    if (message.channel.name.toLowerCase() !== 'moveeradmin') {
      const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, message.member.voiceChannelID)
      helper.checkIfVoiceChannelExist(message, fromVoiceChannel, 'Moveer')
      const fromVoiceChannelName = helper.getNameOfVoiceChannel(message, fromVoiceChannel.id)
      helper.checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName)
      helper.checkIfGuildHasTwoMoveerChannels(message)
      helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    }
    messageMentions = helper.checkIfMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = helper.checkIfUsersAlreadyInChannel(message, messageMentions, message.member.voiceChannelID)
    const userIdsToMove = messageMentions.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    helper.checkForMovePerms(message, userIdsToMove, authorVoiceChannel)
    helper.checkForConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
