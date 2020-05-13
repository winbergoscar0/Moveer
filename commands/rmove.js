const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  try {
    let roleName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id) // Not channels, but role
      roleName = names[0]
    }
    check.ifAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    await check.ifTextChannelIsMoveerAdmin(message)
    check.ifMessageContainsMentions(message)
    check.argsLength(args, 1)
    let usersToMove = helper.getUsersByRole(message, roleName)
    usersToMove = check.ifUserInsideBlockedChannel(message, usersToMove)
    usersToMove = check.ifMentionsInsideVoiceChannel(message, usersToMove)
    usersToMove = check.ifUsersAlreadyInChannel(message, usersToMove, message.member.voiceChannelID)
    const userIdsToMove = await usersToMove.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await check.forMovePerms(message, userIdsToMove, authorVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) {
      helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID, rabbitMqChannel)
    } else {
      moveerMessage.logger(message, 'All users already in the correct voice channel')
      moveerMessage.sendMessage(message, 'All users already in the correct voice channel')
    }
  } catch (err) {
    if (!err.logMessage) {
      console.log(err)
      moveerMessage.reportMoveerError('Above alert was caused by:\n' + err.stack)
    }
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move,
}
