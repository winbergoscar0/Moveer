const moveerMessage = require('../moveerMessage.js')
const helper = require('../helpers/helper.js')
const check = require('../helpers/check.js')
const database = require('../helpers/database')

async function move(args, message, rabbitMqChannel) {
  try {
    let fromVoiceChannelName = args[0]
    let toVoiceChannelName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id)
      fromVoiceChannelName = names[0]
      toVoiceChannelName = names[1]
    }
    await check.ifTextChannelIsMoveerAdmin(message)
    check.ifMessageContainsMentions(message)
    check.argsLength(args, 2)
    check.ifArgsTheSame(message, args)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    const toVoiceChannel = helper.getChannelByName(message, toVoiceChannelName)
    check.ifVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
    check.ifChannelIsTextChannel(message, toVoiceChannel)
    check.ifChannelIsTextChannel(message, fromVoiceChannel)
    check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    await check.forMovePerms(message, userIdsToMove, toVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    helper.moveUsers(message, userIdsToMove, toVoiceChannel.id, rabbitMqChannel)

    // Check for patreon stuff
    const guildInfo = await database.getPatreonGuildObject(message, message.guild.id)
    if (guildInfo.rowCount === 0) return
    if (guildInfo.rows[0].enabled === '0' || guildInfo.rows[0].repeatEnabled === 0) return
    if (
      message.reactions.cache.size > 0 &&
      message.reactions.cache.first().users.cache.filter((u) => ['564773724520185856', '400724460203802624'].includes(u.id))
        .size > 0
    )
      return
    message.react('🔂')
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
  move,
}
