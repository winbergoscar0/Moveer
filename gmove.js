const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move (args, message) {
  if (args.length < 1 || args === undefined || args === null || args === []) {
    moveerMessage.logger(message, 'room identifier is missing')
    moveerMessage.sendMessage(message, moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + message.author.id + '>')
    return
  }

  try {
    let fromVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getChannelWithSpacesName(args)
      fromVoiceChannelName = names[0]
    }
    if (message.channel.name.toLowerCase() !== 'moveeradmin') fromVoiceChannelName = 'gMoveer' + fromVoiceChannelName
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)

    helper.checkIfAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, message.member.voiceChannelID)
    if (message.channel.name.toLowerCase() !== 'moveeradmin') {
      helper.checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName)
    }
    helper.checkIfMessageContainsMentions(message)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, fromVoiceChannel)
    const userIdsToMove = fromVoiceChannel.members.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    helper.checkForMovePerms(message, userIdsToMove, authorVoiceChannel)
    helper.checkForConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
