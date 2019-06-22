const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move (args, message, command) {
  try {
    let fromVoiceChannelName = args[0]
    let toVoiceChannelName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getChannelWithSpacesName(message, command, args)
      fromVoiceChannelName = names[0]
      toVoiceChannelName = names[1]
    }

    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkIfMessageContainsMentions(message)
    helper.checkIfArgsTheSame(message, args)
    helper.checkArgsLength(args, 2)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    helper.checkIfChannelIsTextChannel(message, toVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, fromVoiceChannel)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    const userIdsToMove = fromVoiceChannel.members.map(({ id }) => id)
    helper.checkForMovePerms(message, userIdsToMove, toVoiceChannel)
    helper.checkForConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, command, userIdsToMove, toVoiceChannel.id)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
