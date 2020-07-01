const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  if (args.length < 1 || check.valueEqNullorUndefinded(args) || args === []) {
    moveerMessage.logger(message, 'room identifier is missing')
    moveerMessage.sendMessage(message, moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER(message.author.id))
    return
  }

  try {
    let fromVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      fromVoiceChannelName = names[0]
    }
    if ((await check.ifTextChannelIsMoveerAdmin(message, false)) === false)
      fromVoiceChannelName = await helper.getGuildGroupNames(message, fromVoiceChannelName)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)

    check.ifAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, message.member.voiceChannelID)
    if ((await check.ifTextChannelIsMoveerAdmin(message, false)) === false) {
      check.ifVoiceChannelContainsMoveer(message, authorVoiceChannelName)
    }
    check.ifMessageContainsMentions(message)
    check.ifVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    check.ifChannelIsTextChannel(message, fromVoiceChannel)
    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await check.forMovePerms(message, userIdsToMove, authorVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID, rabbitMqChannel)
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
