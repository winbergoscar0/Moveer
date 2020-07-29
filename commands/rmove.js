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
    if (message.mentions.roles.size > 0) roleName = message.mentions.roles.first().name
    const authorVoiceId = await helper.getUserVoiceChannelIdByUserId(message, message.author.id)
    check.ifAuthorInsideAVoiceChannel(message, authorVoiceId)
    const authorVoiceChannel = await helper.getChannelByName(message, authorVoiceId)
    await check.ifTextChannelIsMoveerAdmin(message)
    check.ifMessageContainsMentions(message)
    check.argsLength(args, 1)
    let usersToMove = helper.getUsersByRole(message, roleName)
    usersToMove = await check.ifUserInsideBlockedChannel(message, usersToMove)
    usersToMove = await check.ifMentionsInsideVoiceChannel(
      message,
      usersToMove.filter((user) => user.id !== message.author.id).array(),
      false
    )
    usersToMove = await check.ifUsersAlreadyInChannel(message, usersToMove, authorVoiceId)
    const userIdsToMove = await usersToMove.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, authorVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) {
      helper.moveUsers(message, userIdsToMove, authorVoiceId, rabbitMqChannel)
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
