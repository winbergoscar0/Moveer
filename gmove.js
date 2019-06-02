const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  if (args.length < 1 || args === undefined || args === null || args === []) {
    moveerMessage.logger(message, command, 'room identifier is missing')
    moveerMessage.sendMessage(message, (moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + message.author.id + '>'))
    return
  }
  const authorVoiceChannelId = message.member.voiceChannelID; // ID of the authors voice room
  const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, authorVoiceChannelId)
  const fromVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === (message.channel.name.toLowerCase() !== 'moveeradmin'
    ? 'gmoveer' + args[0].toLowerCase()
    : args[0].toLowerCase()))
  const fromVoiceChannelName = message.channel.name.toLowerCase() !== 'moveeradmin'
    ? 'gMoveer' + args[0].toLowerCase()
    : args[0].toLowerCase()

  try {
    if (message.channel.name.toLowerCase() !== 'moveeradmin') {
      helper.checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName)
    }
    helper.checkIfMessageContainsMentions(message)
    helper.checkIfAuthorInsideAVoiceChannel(message, authorVoiceChannelId)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkForMovePerms(message)
    helper.checkForConnectPerms(message)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
  }
  catch (err) {
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  helper.moveUsers(message, command, fromVoiceChannel.members.array(), authorVoiceChannelId)
}

module.exports = {
  move
}