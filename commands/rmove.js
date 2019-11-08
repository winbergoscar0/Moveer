const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')

async function move (args, message) {
  try {
    let roleName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args) // Not channels, but role
      roleName = names[0]
    }
    helper.checkIfAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    await helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkIfMessageContainsMentions(message)
    helper.checkArgsLength(args, 1)
    let usersToMove = helper.getUsersByRole(message, roleName)
    usersToMove = helper.checkIfUserInsideBlockedChannel(message, usersToMove)
    usersToMove = helper.checkIfMentionsInsideVoiceChannel(message, usersToMove)
    usersToMove = helper.checkIfUsersAlreadyInChannel(message, usersToMove, message.member.voiceChannelID)
    const userIdsToMove = await usersToMove.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await helper.checkForMovePerms(message, userIdsToMove, authorVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) {
      helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID)
    } else {
      moveerMessage.logger(message, 'All users already in the correct voice channel')
      moveerMessage.sendMessage(message, 'All users already in the correct voice channel')
    }
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
