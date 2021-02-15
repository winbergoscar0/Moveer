const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')

async function kick(args, message) {
  try {
    let fromVoiceChannelName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      fromVoiceChannelName = names[0]
    }
    await check.ifTextChannelIsMoveerAdmin(message)
    check.ifMessageContainsMentions(message)
    check.argsLength(args, 1)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)

    check.ifVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)

    check.ifChannelIsTextChannel(message, fromVoiceChannel)
    check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    const userIdsToKick = await fromVoiceChannel.members.map(({ id }) => id)

    // No errors in the message, lets get kicking!
    helper.kickUsers(message, userIdsToKick)

    // Check for patreon stuff
    check.checkifPatreonGuildRepeat(message)
    // End check for patreon stuff
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
  kick,
}
