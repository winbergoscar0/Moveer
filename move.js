const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  let messageMentions = message.mentions.users.array(); // Mentions in the message
  const fromVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === 'moveer')
  try {
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
    helper.checkForMovePerms(message)
    helper.checkForConnectPerms(message)
    messageMentions = helper.checkIfMentionsInsideVoiceChannel(message, command, messageMentions)
    messageMentions = helper.checkIfUsersAlreadyInChannel(message, command, messageMentions, message.member.voiceChannelID)
  }
  catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  const userIdsToMove = messageMentions.map(({ id }) => id );
  if (messageMentions.length > 0) helper.moveUsers(message, command, userIdsToMove, message.member.voiceChannelID)
}

module.exports = {
  move
};