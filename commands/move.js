const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function move(args, message, rabbitMqChannel) {
  let messageMentions = message.mentions.users.array() // Mentions in the message
  let fromVoiceChannel
  try {
    fromVoiceChannel = helper.getChannelByName(message, 'moveer')
    check.ifAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    check.argsLength(args, 1)
    check.forUserMentions(message, messageMentions)
    check.ifSelfMention(message)
    if (message.channel.name.toLowerCase() !== 'moveeradmin') {
      const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, message.member.voiceChannelID)
      check.ifVoiceChannelExist(message, fromVoiceChannel, 'Moveer')
      const fromVoiceChannelName = helper.getNameOfVoiceChannel(message, fromVoiceChannel.id)
      check.ifVoiceChannelContainsMoveer(message, authorVoiceChannelName)
      check.ifGuildHasTwoMoveerChannels(message)
      check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    }
    messageMentions = check.ifMentionsInsideVoiceChannel(message, messageMentions)
    messageMentions = check.ifUsersAlreadyInChannel(message, messageMentions, message.member.voiceChannelID)
    const userIdsToMove = await messageMentions.map(({ id }) => id)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await check.forMovePerms(message, userIdsToMove, authorVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, message.member.voiceChannelID, rabbitMqChannel)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move,
}
