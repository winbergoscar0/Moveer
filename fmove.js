const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

async function move (args, message) {
  try {
    let fromVoiceChannelName = args[0]
    let toVoiceChannelName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getChannelWithSpacesName(args)
      fromVoiceChannelName = names[0]
      toVoiceChannelName = names[1]
    }

    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkIfMessageContainsMentions(message)
    helper.checkArgsLength(args, 2)
    helper.checkIfArgsTheSame(message, args)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    helper.checkIfChannelIsTextChannel(message, toVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, fromVoiceChannel)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    await helper.checkForMovePerms(message, userIdsToMove, toVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, userIdsToMove, toVoiceChannel.id)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
