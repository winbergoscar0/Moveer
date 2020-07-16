const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  try {
    let toVoiceChannelName = args[0]
    let roleName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      toVoiceChannelName = names[0]
      roleName = names[1]
    }
    if (message.mentions.roles.size > 0) roleName = message.mentions.roles.first().name
    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 2)
    check.ifMessageContainsMentions(message)
    const toVoiceChannel = await helper.getChannelByName(message, toVoiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    let usersToMove = helper.getUsersByRole(message, roleName)
    usersToMove = await check.ifUserInsideBlockedChannel(message, usersToMove)
    usersToMove = await check.ifMentionsInsideVoiceChannel(message, usersToMove.array())
    usersToMove = await check.ifUsersAlreadyInChannel(message, usersToMove, toVoiceChannel.id)
    const userIdsToMove = await usersToMove.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, toVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    userIdsToMove.length > 0
      ? helper.moveUsers(message, userIdsToMove, toVoiceChannel.id, rabbitMqChannel)
      : moveerMessage.sendMessage(message, moveerMessage.USER_ALREADY_IN_CHANNEL('Everyone'))
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
