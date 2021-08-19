/* eslint-disable no-throw-literal */
const moveerMessage = require('../moveerMessage.js')
const database = require('../helpers/database.js')

function getCategoryByName(message, categoryName) {
  let category = message.guild.channels.cache.find(
    (category) => category.id === categoryName && category.type === 'GUILD_CATEGORY'
  )
  if (category == null) {
    category = message.guild.channels.cache.find(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase() && category.type === 'GUILD_CATEGORY'
    )
  }
  if (category == null) {
    throw {
      logMessage: 'Cant find category with that name: ' + categoryName,
      sendMessage: 'No category found with the name: ' + categoryName + ' <@' + message.author.id + '>',
    }
  }
  return category
}

async function getNameOfVoiceChannel(message, authorId) {
  const voiceChannelId = await getUserVoiceChannelIdByUserId(message, authorId)
  const voiceChannelName = await message.guild.channels.cache.get(voiceChannelId).name
  return voiceChannelName
}

function getChannelByName(message, findByName) {
  let voiceChannel = message.guild.channels.cache.get(findByName)
  if (voiceChannel == null) {
    voiceChannel = message.guild.channels.cache
      .filter(
        (channel) =>
          (channel.type === 'GUILD_VOICE' || channel.type === 'GUILD_STAGE_VOICE') &&
          channel.name.toLowerCase() === findByName.toLowerCase()
      )
      .first()
  }
  return voiceChannel
}

function getUsersByRole(message, roleName) {
  const role = message.guild.roles.cache.find(
    (role) =>
      role.name.toLowerCase() === roleName.toLowerCase() ||
      role.id === roleName ||
      role.name === '@' + roleName.toLowerCase()
  )
  const voiceStateMembers = message.guild.voiceStates.cache.map((user) => user.id)
  if (role == null) {
    throw {
      logMessage: "Can't find role with the name: " + roleName,
      sendMessage: "Can't find role with the name: " + roleName,
    }
  }
  const usersToMove = role.members.filter((member) => voiceStateMembers.includes(member.id))
  return usersToMove
}

const getGuildGroupNames = async (message, name) => {
  const patreonGuildObject = await database.getPatreonGuildObject(message, message.guild.id)
  if (patreonGuildObject.rowCount > 0 && patreonGuildObject.rows[0].groupName != null) {
    return patreonGuildObject.rows[0].groupName + name
  }
  return 'gMoveer' + name
}

const findUserByUserName = async (message, usernames) => {
  if (!message.author.bot) return []
  const usersToFind = usernames.join('__').replace(/".*"/, '').split('__')
  usersToFind.shift()

  const foundUsers = []
  await usersToFind.forEach(async (username) => {
    const user = await message.guild.members.cache.find(
      (user) =>
        user.user.username.toLowerCase() === username.toLowerCase() ||
        (user.nickname && user.nickname.toLowerCase() === username.toLowerCase()) ||
        user.id === username
    )

    if (user) {
      foundUsers.push(user.user)
    } else {
      moveerMessage.logger(message, moveerMessage.NO_USER_FOUND_BY_SEARCH(message.author.id, username))
      moveerMessage.sendMessage(message, moveerMessage.NO_USER_FOUND_BY_SEARCH(message.author.id, username))
    }
  })
  if (foundUsers.length > 0) {
    return foundUsers
  }
  return []
}

const kickUsers = async (message, userIdsToKick) => {
  let usersKicked = 0
  await userIdsToKick.forEach(async (userId) => {
    const user = await message.guild.members.cache.find((user) => user.id === userId)
    if (user) {
      user.voice.disconnect().catch((err) => {
        console.log(err)
        moveerMessage.logger(message, 'FAILED to kick ' + userId + ' (User not found)')
      })
      usersKicked++
      moveerMessage.logger(message, 'Kicked ' + userId)
    } else {
      moveerMessage.logger(message, 'FAILED to kick ' + userId + ' (User not found)')
    }
  })

  await moveerMessage.sendMessage(
    message,
    '<@' + message.author.id + '> kicked ' + usersKicked + ' users from a voicechannel'
  )
}

async function moveUsers(message, usersToMove, toVoiceChannelId, rabbitMqChannel, command) {
  let usersMoved = 0
  usersToMove.forEach((user) => {
    PublishToRabbitMq(message, user, toVoiceChannelId, rabbitMqChannel)
    usersMoved++
  })
  if (command === 'ymove') return
  const guildObject = await database.getGuildObject(message, message.guild.id)
  const ShouldISendRLMessage =
    (usersMoved > 15 && guildObject.rowCount > 0 && guildObject.rows[0].sentRLMessage === '0') ||
    (usersMoved > 15 && guildObject.rowCount === 0)
  moveerMessage.logger(
    message,
    'Moved ' +
      usersMoved +
      (usersMoved === 1 ? 'user' : 'users') +
      (ShouldISendRLMessage ? ' - Sent RL message about announcment' : '')
  )
  moveerMessage.sendMessage(
    message,
    `Move successful, ${usersMoved} ${usersMoved === 1 ? 'user' : 'users'} moved. ${
      ShouldISendRLMessage ? moveerMessage.TAKE_A_WHILE_RL_MESSAGE : ''
    }`
  )
  if (ShouldISendRLMessage) database.updateSentRateLimitMessage(message, message.guild.id)
  database.addSuccessfulMove(message, usersMoved)
}

async function PublishToRabbitMq(message, userToMove, toVoiceChannelId, rabbitMqChannel) {
  const messageToRabbitMQ = {
    userId: userToMove,
    voiceChannelId: toVoiceChannelId,
    guildId: message.guild.id,
  }
  const queue = message.guild.id
  rabbitMqChannel.assertQueue(queue, {
    durable: true,
  })

  rabbitMqChannel.sendToQueue(queue, Buffer.from(JSON.stringify(messageToRabbitMQ)), {
    persistent: true,
  })
}

function getNameWithSpacesName(args, authorId) {
  const string = args.join()
  let fnuttCounter = string[0] === '"' ? 0 : 2
  let testFrom = ''
  let testTo = ''
  let fromVoiceChannelName
  let toVoiceChannelName

  for (let i = string[0] === '"' ? 0 : args[0].length; i < string.length; i++) {
    if (string[i] === '"') {
      fnuttCounter += 1
      continue
    }
    if (fnuttCounter === 2 && string[i] === ',') continue
    if (fnuttCounter < 2) testFrom += string[i] === ',' ? ' ' : string[i]
    if (fnuttCounter > 1) testTo += string[i] === ',' ? ' ' : string[i]
  }

  if (fnuttCounter ? !(fnuttCounter % 2) : void 0) {
    fromVoiceChannelName = string[0] === '"' ? testFrom : args[0]
    toVoiceChannelName = testTo
  } else {
    throw {
      logMessage: moveerMessage.MISSING_FNUTTS_IN_ARGS(authorId),
      sendMessage: moveerMessage.MISSING_FNUTTS_IN_ARGS(authorId),
    }
  }
  return [fromVoiceChannelName, toVoiceChannelName]
}

function getRandomUsers(userArray, amoutToGet) {
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

async function getUserVoiceChannelIdByUserId(message, userId) {
  const user = await message.guild.members.fetch(userId)
  try {
    const userVoiceChannelId = await user.guild.voiceStates.cache.filter((user) => user.id === userId).first().channelId
    return userVoiceChannelId
  } catch (err) {
    return null
  }
}

async function getUserVoiceChannelByVoiceChannelId(message, channelId) {
  return await message.guild.channels.cache.get(channelId)
}

module.exports = {
  getNameOfVoiceChannel,
  moveUsers,
  getChannelByName,
  getNameWithSpacesName,
  getUsersByRole,
  getRandomUsers,
  getCategoryByName,
  findUserByUserName,
  getGuildGroupNames,
  getUserVoiceChannelIdByUserId,
  getUserVoiceChannelByVoiceChannelId,
  kickUsers,
}
