const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')

async function move (args, message, rabbitMqChannel) {
  if (args.length < 1 || args === undefined || args === null || args === []) {
    moveerMessage.logger(message, 'room identifier is missing')
    moveerMessage.sendMessage(message, moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + message.author.id + '>')
    return
  }

  try {
    let fromVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args)
      fromVoiceChannelName = names[0]
    }
    if (message.channel.name.toLowerCase() !== 'moveeradmin') fromVoiceChannelName = 'gMoveer' + fromVoiceChannelName
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)

    helper.checkIfAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, message.member.voiceChannelID)
    if (message.channel.name.toLowerCase() !== 'moveeradmin') {
      helper.checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName)
    }
    helper.checkIfMessageContainsMentions(message)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    helper.checkIfChannelIsTextChannel(message, fromVoiceChannel)
    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await helper.checkForMovePerms(message, userIdsToMove, authorVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID, rabbitMqChannel)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
