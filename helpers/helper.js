/* eslint-disable no-throw-literal */
const moveerMessage = require('../moveerMessage.js')
const config = require('../config.js')
const database = require('../helpers/database.js')
const check = require('../helpers/check.js')

function getCategoryByName(message, categoryName) {
  let category = message.guild.channels.find((category) => category.id === categoryName && category.type === 'category')
  if (category === null) {
    category = message.guild.channels.find(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase() && category.type === 'category'
    )
  }
  if (check.valueEqNullorUndefinded(category)) {
    throw {
      logMessage: 'Cant find category with that name: ' + categoryName,
      sendMessage: 'No category found with the name: ' + categoryName + ' <@' + message.author.id + '>',
    }
  }
  return category
}

function getNameOfVoiceChannel(message, voiceChannelId) {
  return message.guild.channels.get(voiceChannelId).name
}

function getChannelByName(message, findByName) {
  let voiceChannel = message.guild.channels.find((channel) => channel.id === findByName)
  if (voiceChannel === null) {
    voiceChannel = message.guild.channels.find(
      (channel) => channel.name.toLowerCase() === findByName.toLowerCase() && channel.type === 'voice'
    )
  }
  return voiceChannel
}

function getUsersByRole(message, roleName) {
  const role = message.guild.roles.find((role) => role.name.toLowerCase() === roleName.toLowerCase())
  if (check.valueEqNullorUndefinded(role)) {
    throw {
      logMessage: "Can't find role with the name: " + roleName,
      sendMessage: "Can't find role with the name: " + roleName,
    }
  }
  const usersToMove = role.members
  return usersToMove
}

const findUserByUserName = async (message, username) => {
  if (!message.author.bot) return []
  const user = await message.guild.members.find(
    (user) =>
      user.user.username.toLowerCase() === username.toLowerCase() ||
      (user.nickname && user.nickname.toLowerCase() === username.toLowerCase())
  )
  if (user != null) return [user.user]

  throw {
    logMessage: '(BOT CMOVE) - Username not found',
    sendMessage: moveerMessage.NO_USER_FOUND_BY_SEARCH(message.author.id, username),
  }
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
    (usersMoved === 1 ? ' user' : ' users') +
    (ShouldISendRLMessage ? ' - Sent RL message about announcment' : '')
  )
  moveerMessage.sendMessage(
    message,
    'Moved ' +
    usersMoved +
    (usersMoved === 1 ? ' user' : ' users') +
    ' by request of <@' +
    message.author.id +
    '>' +
    (ShouldISendRLMessage ? moveerMessage.TAKE_A_WHILE_RL_MESSAGE : '')
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
  moveerMessage.logger(
    message,
    'Sent message - User: ' +
    messageToRabbitMQ.userId +
    ' toChannel: ' +
    messageToRabbitMQ.voiceChannelId +
    ' in guild: ' +
    messageToRabbitMQ.guildId
  )
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

module.exports = {
  getNameOfVoiceChannel,
  moveUsers,
  getChannelByName,
  getNameWithSpacesName,
  getUsersByRole,
  getRandomUsers,
  getCategoryByName,
  findUserByUserName,
}
