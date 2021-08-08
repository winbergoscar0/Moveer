const moveerMessage = require('../moveerMessage.js')
const check = require('../helpers/check.js')
const helper = require('../helpers/helper.js')

async function move(args, message, rabbitMqChannel) {
  try {
    const amountInEachChannel = args.pop()
    let fromVoiceChannelName = args[0]
    let categoryName = args[1]
    if (args.join().includes('"')) {
      const names = await helper.getNameWithSpacesName(args, message.author.id) // fromChannel and category name (channels to move to)
      fromVoiceChannelName = names[0]
      categoryName = names[1]
    }

    await check.ifTextChannelIsMoveerAdmin(message)
    check.argsLength(args, 2) // 2 since we use args.pop above to be able to use fnutthelper (only allows 2 args)
    check.ifMessageContainsMentions(message)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    check.ifVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    const voiceChannelMembers = await fromVoiceChannel.members.filter(
      (mem) => !mem.roles.cache.some((rol) => rol.name === 'ymoveignore')
    )
    check.userAmountInChannel(message, voiceChannelMembers.size, amountInEachChannel, fromVoiceChannelName)
    const userIdsToMove = voiceChannelMembers.map(({ id }) => id)

    // check.ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) //Ignore during test

    const category = helper.getCategoryByName(message, categoryName)
    const voiceChannelsInCategory = category.children
      .filter((channel) => channel.type === 'GUILD_VOICE' && channel.members.size === 0)
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .array()
    check.countOfChannelsFromCategory(message, voiceChannelsInCategory, categoryName)

    const userIdsLength = userIdsToMove.length
    let voiceChannelCounter = 0
    for (let i = 0; i < userIdsLength; i++) {
      if (userIdsToMove.length === 0) break // All users moved correctly, break the loop
      check.ifCatergyHasRoomsAvailable(message, voiceChannelCounter, voiceChannelsInCategory, categoryName)
      check.userAmountInChannel(message, userIdsToMove.length, amountInEachChannel, fromVoiceChannelName)

      const randomUsersTomove = await helper.getRandomUsers(userIdsToMove, amountInEachChannel)
      await check.forMovePerms(message, userIdsToMove, voiceChannelsInCategory[voiceChannelCounter])
      await check.forConnectPerms(message, userIdsToMove, voiceChannelsInCategory[voiceChannelCounter])
      if (randomUsersTomove.length > 0)
        await helper.moveUsers(
          message,
          randomUsersTomove,
          voiceChannelsInCategory[voiceChannelCounter].id,
          rabbitMqChannel,
          'ymove'
        )
      for (let z = 0; z < randomUsersTomove.length; z++) {
        const index = await userIdsToMove.indexOf(randomUsersTomove[z])
        if (index > -1) await userIdsToMove.splice(index, 1)
      }
      voiceChannelCounter++
    }
    moveerMessage.logger(message, 'Moved ' + userIdsLength + (userIdsLength === 1 ? ' user' : ' users'))
    moveerMessage.sendMessage(
      message,
      'Moved ' + userIdsLength + (userIdsLength === 1 ? ' user' : ' users') + ' by request of <@' + message.author.id + '>'
    )
    check.checkifPatreonGuildRepeat(message)
  } catch (err) {
    if (!err.logMessage) {
      moveerMessage.reportMoveerError('Above alert was caused by:\n' + err.stack)
      console.log(err)
    }
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move,
}
