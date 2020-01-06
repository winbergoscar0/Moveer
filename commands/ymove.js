const moveerMessage = require('../moveerMessage.js')
const helper = require('../helper.js')

async function move (args, message, rabbitMqChannel) {
  try {
    const amountInEachChannel = args.pop()
    let fromVoiceChannelName = args[0]
    let categoryName = args[1]
    if (args.join().includes('"')) {
      const names = helper.getNameWithSpacesName(args) // fromChannel and category name (channels to move to)
      fromVoiceChannelName = names[0]
      categoryName = names[1]
    }

    await helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 2) // 2 since we use args.pop above to be able to use fnutthelper (only allows 2 args)
    helper.checkIfMessageContainsMentions(message)
    const fromVoiceChannel = helper.getChannelByName(message, fromVoiceChannelName)
    helper.checkIfVoiceChannelExist(message, fromVoiceChannel, fromVoiceChannelName)
    // helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) //Ignore during test

    const category = helper.getCategoryByName(message, categoryName)
    const voiceChannelsInCategory = category.children.filter(channel => channel.type === 'voice' && channel.members.size === 0).array()
    helper.checkCountOfChannelsFromCategory(message, voiceChannelsInCategory, categoryName)
    helper.checkUserAmountInChannel(message, fromVoiceChannel.members.size, amountInEachChannel, fromVoiceChannelName)

    const userIdsToMove = await fromVoiceChannel.members.map(({ id }) => id)
    const userIdsLength = userIdsToMove.length
    let voiceChannelCounter = 0
    for (let i = 0; i < userIdsLength; i++) {
      if (userIdsToMove.length === 0) break // All users moved correctly, break the loop
      helper.checkIfCatergyHasRoomsAvailable(message, voiceChannelCounter, voiceChannelsInCategory, categoryName)
      helper.checkUserAmountInChannel(message, userIdsToMove.length, amountInEachChannel, fromVoiceChannelName)

      const randomUsersTomove = await getRandomUsers(userIdsToMove, amountInEachChannel)
      await helper.checkForMovePerms(message, userIdsToMove, voiceChannelsInCategory[voiceChannelCounter])
      await helper.checkForConnectPerms(message, userIdsToMove, voiceChannelsInCategory[voiceChannelCounter])
      if (randomUsersTomove.length > 0) await helper.moveUsers(message, randomUsersTomove, voiceChannelsInCategory[voiceChannelCounter].id, rabbitMqChannel)
      for (let z = 0; z < randomUsersTomove.length; z++) {
        const index = await userIdsToMove.indexOf(randomUsersTomove[z])
        if (index > -1) await userIdsToMove.splice(index, 1)
      }
      voiceChannelCounter++
    }
  } catch (err) {
    if (!err.logMessage) console.log(err)
    moveerMessage.logger(message, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
  }
}

module.exports = {
  move
}

function getRandomUsers (userArray, amoutToGet) {
  const result = new Array(amoutToGet)
  let len = userArray.length
  const taken = new Array(len)
  while (amoutToGet--) {
    const x = Math.floor(Math.random() * len)
    result[amoutToGet] = userArray[x in taken ? taken[x] : x]
    taken[x] = --len in taken ? taken[len] : len
  }
  return result
}
