const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function count (args, message) {
  let toVoiceChannel
  try {
    let toVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      toVoiceChannelName = names[0]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 1)
    toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)

    moveerMessage.sendMessage(
      message,
      moveerMessage.MEMBER_COUNT_IN_VOICE_CHANNEL(message.author.id, toVoiceChannel.name, toVoiceChannel.members.size))
    moveerMessage.logger(message, moveerMessage.MEMBER_COUNT_IN_VOICE_CHANNEL(message.author.username, toVoiceChannel.name, toVoiceChannel.members.size))
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
  count,
}
