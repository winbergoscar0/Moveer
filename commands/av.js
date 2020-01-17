/* eslint-disable no-throw-literal */
const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')

async function move (args, message, rabbitMqChannel) {
  try {
    const channelId = args[0]
    if (message.channel.name.toLowerCase() !== 'av-numbers' && message.channel.name.toLowerCase() !== 'av-verified') return
    let toVoiceChannelName = channelId
    const userIdsToMove = [message.author.id]
    if (parseInt(toVoiceChannelName) <= 500) {
      toVoiceChannelName = 'AV ' + channelId
    } else if (toVoiceChannelName === 'l' || toVoiceChannelName === 'lobby' || toVoiceChannelName === 'q' || toVoiceChannelName === 'queue') {
      toVoiceChannelName = 'Lobby'
    } else {
      toVoiceChannelName = channelId + ' is not allowed.'
    }
    // Final checks
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    helper.checkIfAuthorInsideAVoiceChannel(message, message.member.voiceChannelID)
    const authorVoiceChannel = helper.getChannelByName(message, message.member.voiceChannelID)
    await helper.checkForMovePerms(message, userIdsToMove, authorVoiceChannel)
    await helper.checkForConnectPerms(message, userIdsToMove, authorVoiceChannel)

    // No errors in the message, // Publish to rabbitMQ
    if (userIdsToMove.length > 0) helper.moveUsers(message, userIdsToMove, toVoiceChannel.id, rabbitMqChannel)
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}
