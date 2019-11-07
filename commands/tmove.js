const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')

async function move (args, message) {
  try {
    let toVoiceChannelName = args[0]
    let roleName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args)
      toVoiceChannelName = names[0]
      roleName = names[1]
    }

    await helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 1)
    helper.checkIfMessageContainsMentions(message)
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    let usersToMove = helper.getUsersByRole(message, roleName)
    usersToMove = helper.checkIfUserInsideBlockedChannel(message, usersToMove)
    usersToMove = helper.checkIfMentionsInsideVoiceChannel(message, usersToMove)
    usersToMove = helper.checkIfUsersAlreadyInChannel(message, usersToMove, toVoiceChannel.id)
    const userIdsToMove = await usersToMove.map(({ id }) => id)
    await helper.checkForMovePerms(message, userIdsToMove, toVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) {
      helper.moveUsers(message, userIdsToMove, toVoiceChannel.id)
    } else {
      moveerMessage.sendMessage(message, 'Everyone ' + moveerMessage.USER_ALREADY_IN_CHANNEL)
    }
  } catch (err) {
    console.log('throwing')
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
