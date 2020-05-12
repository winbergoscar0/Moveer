const moveerMessage = require('../moveerMessage.js')
const check = require('../helpers/check.js')
const helper = require('../helpers/helper.js')

async function move(args, message, rabbitMqChannel) {
  try {
    // May need to be swapped order, for semantics
    let fromCategoryName = args[0]
    let voiceChannelName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id) // fromChannel and category name (channels to move to)
      fromCategoryName = names[0]
      voiceChannelName = names[1]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 2) // 2 since we use args.pop above to be able to use fnutthelper (only allows 2 args)
    check.ifMessageContainsMentions(message)
    const toVoiceChannel = helper.getChannelByName(message, voiceChannelName)
    check.ifVoiceChannelExist(message, toVoiceChannel, voiceChannelName)

    const fromCategory = helper.getCategoryByName(message, fromCategoryName)
    const voiceChannelsInCategory = fromCategory.children
      .filter((channel) => channel.type === 'voice')
      .array()
    check.countOfChannelsFromCategory(message, voiceChannelsInCategory, fromCategoryName) // Check a voice channel is in this category

    const userIdsToMove = await fromCategory.children.reduce((res, elem) => res.concat(elem.members.map(({ id }) => id)), [])
    const userIdsLength = userIdsToMove.length
    await check.forMovePerms(message, userIdsToMove, toVoiceChannel)
    await check.forConnectPerms(message, userIdsToMove, toVoiceChannel)

    // No errors in the message, lets get moving!
    if (userIdsToMove.length > 0) {
      helper.moveUsers(message, userIdsToMove, toVoiceChannel, rabbitMqChannel)
      moveerMessage.logger(message, 'Moved ' + userIdsLength + (userIdsLength === 1 ? ' user' : ' users'))
      moveerMessage.sendMessage(
        message,
        'Moved ' + userIdsLength + (userIdsLength === 1 ? ' user' : ' users') + ' by request of <@' + message.author.id + '>'
      )
    } else {
      moveerMessage.logger(message, 'All users already in the correct voice channel')
      moveerMessage.sendMessage(message, 'All users already in the correct voice channel')
    }
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move,
}
