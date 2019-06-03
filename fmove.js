const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {


  let fromVoiceChannelName = args[0]
  let toVoiceChannelName = args[1]
  if ((new String(args).includes('"'))) {
    const names = helper.getChannelWithSpacesName(message, command, args)
    fromVoiceChannelName = names[0]
    toVoiceChannelName = names[1]
  }

  let fromVoiceChannel
  let toVoiceChannel
  try {
    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkIfMessageContainsMentions(message)
    helper.checkIfArgsTheSame(message, args)
    helper.checkArgsLength(args, 2)
    fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, toVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, fromVoiceChannel)
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