const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  const fromVoiceChannelName = args[0]
  const toVoiceChannelName = args[1]
  const fromVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === fromVoiceChannelName)
  const toVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === toVoiceChannelName)

  try {
    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 2)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    helper.checkIfArgsTheSame(message, args)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
  }
  catch (err) {
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  usersMoved = 0
  const groupMembersToMove = fromVoiceChannel.members.array()
  for (var i = 0; i < groupMembersToMove.length; i++) {
    guild.member(groupMembersToMove[i].user.id).setVoiceChannel(toVoiceChannel.id);
    usersMoved += 1
  }
  moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
  moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of' + ' <@' + message.author.id + '>'))
}

module.exports = {
  move
}