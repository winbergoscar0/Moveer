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
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  helper.moveUsers(message, command, fromVoiceChannel.members.array(), toVoiceChannel.id)
}

module.exports = {
  move
}