const moveerMessage = require('../moveerMessage.js')
const check = require('../helpers/check.js')
const helper = require('../helpers/helper.js')

async function kick(args, message) {
  try {
    // May need to be swapped order, for semantics
    let fromCategoryName = args[0]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args, message.author.id) // fromChannel and category name (channels to move to)
      fromCategoryName = names[0]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 1) // 2 since we use args.pop above to be able to use fnutthelper (only allows 2 args)
    check.ifMessageContainsMentions(message)

    const fromCategory = helper.getCategoryByName(message, fromCategoryName)
    const voiceChannelsInCategory = fromCategory.children.filter((channel) => channel.type === 'GUILD_VOICE').array()
    check.countOfChannelsFromCategory(message, voiceChannelsInCategory, fromCategoryName) // Check a voice channel is in this category

    const userIdsInCategory = await voiceChannelsInCategory.reduce(
      (res, elem) => res.concat(elem.members.map(({ id }) => id)),
      []
    )

    // No errors in the message, lets get moving!
    userIdsInCategory.length > 0
      ? helper.kickUsers(message, userIdsInCategory)
      : moveerMessage.logger(message, 'No members in category (' + fromCategoryName + ') to kick')

    check.checkifPatreonGuildRepeat(message)
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
