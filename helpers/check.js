/* eslint-disable no-throw-literal */
const moveerMessage = require('../moveerMessage.js')
const config = require('../config.js')
const database = require('./database.js')
const helper = require('./helper')

const valueEqNullorUndefinded = (value, operator = '==') => {
  switch (operator) {
    case '!=':
      // eslint-disable-next-line eqeqeq
      return value != null
    case '==':
      // eslint-disable-next-line eqeqeq
      return value == null
  }
}

function ifChannelTextExpectText(message) {
  if (message.mentions.channels.first().type !== 'GUILD_TEXT') {
    throw {
      logMessage: 'Mention is not type text',
      sendMessage: moveerMessage.MESSAGE_MENTION_IS_NOT_TEXT(message.author.id),
    }
  }
}

function ifUserInsideBlockedChannel(message, usersToMove) {
  usersToMove.forEach((user) => {
    if (config.blockedVoiceChannels.includes(user.voiceChannelId)) {
      moveerMessage.logger(message, 'One user in blocked voice channel')
      moveerMessage.sendMessage(message, moveerMessage.USER_INSIDE_BLOCKED_CHANNEL(user.user.id))
    }
  })
  return usersToMove.filter((user) => !config.blockedVoiceChannels.includes(user.voiceChannelId))
}

function ifVoiceChannelContainsMoveer(message, authorVoiceChannelName) {
  if (authorVoiceChannelName.toLowerCase().includes('moveer')) {
    throw {
      logMessage: 'User trying to move people into a moveer channel',
      sendMessage: moveerMessage.USER_INSIDE_MOVEER_VOICE_CHANNEL(message.author.id),
    }
  }
}

function ifGuildHasTwoMoveerChannels(message) {
  if (message.guild.channels.cache.filter((channel) => channel.name.toLowerCase() === 'moveer').size > 1) {
    throw {
      logMessage: 'User has two channels called moveer/Moveer',
      sendMessage: moveerMessage.SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS,
    }
  }
}

async function ifMentionsInsideVoiceChannel(message, messageMentions, sendErrorMsg = true) {
  const usersToRemoveFromMentions = []
  for (let i = 0; i < messageMentions.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, messageMentions[i].id)
    if (valueEqNullorUndefinded(userVoiceChannelId)) {
      moveerMessage.logger(message, 'Not moving ' + messageMentions[i].id + ', not in any voice channel!')
      if (sendErrorMsg)
        moveerMessage.sendMessage(message, moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL(messageMentions[i].id))
      usersToRemoveFromMentions.push(messageMentions[i].id)
    }
  }
  return messageMentions.filter((user) => !usersToRemoveFromMentions.includes(user.id))
}

async function ifUsersAlreadyInChannel(message, messageMentions, toVoiceChannelId) {
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const usersToRemoveFromMentions = []
  for (let i = 0; i < (await messageMentions.length); i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, messageMentions[i].id)
    if (userVoiceChannelId === toVoiceChannelId) {
      usersToRemoveFromMentions.push(messageMentions[i].id)
      if (command === 'rmove' || command === 'tmove') continue // Don't send already in channel alert on rmove and tmove
      moveerMessage.logger(message, 'Not moving user, ' + messageMentions[i].id + ' is already in ' + toVoiceChannelId)
      moveerMessage.sendMessage(message, moveerMessage.USER_ALREADY_IN_CHANNEL(messageMentions[i].id))
    }
  }
  return messageMentions.filter((user) => !usersToRemoveFromMentions.includes(user.id))
}

async function forConnectPerms(message, users, voiceChannel) {
  for (let i = 0; i < users.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, users[i])
    const userVoiceChannel = await helper.getUserVoiceChannelByVoiceChannelId(message, userVoiceChannelId)
    if (await !userVoiceChannel.memberPermissions(message.guild.me).has('CONNECT')) {
      throw {
        logMessage: 'Moveer is missing CONNECT permission',
        sendMessage: moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION(message.author.id, userVoiceChannel.name),
      }
    }
  }
  if (await !voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) {
    throw {
      logMessage: 'Moveer is missing CONNECT permission',
      sendMessage: moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION(message.author.id, voiceChannel.name),
    }
  }
}

async function forMovePerms(message, users, voiceChannel) {
  for (let i = 0; i < users.length; i++) {
    const userVoiceChannelId = await helper.getUserVoiceChannelIdByUserId(message, users[i])
    const userVoiceChannel = await helper.getUserVoiceChannelByVoiceChannelId(message, userVoiceChannelId)
    if (await !userVoiceChannel.memberPermissions(message.guild.me).has('MOVE_MEMBERS')) {
      throw {
        logMessage: 'Moveer is missing Move Members permission',
        sendMessage: moveerMessage.MOVEER_MISSING_MOVE_PERMISSION(message.author.id, userVoiceChannel.name),
      }
    }
  }
  if (await !voiceChannel.memberPermissions(message.guild.me).has('MOVE_MEMBERS')) {
    throw {
      logMessage: 'Moveer is missing Move Members permission',
      sendMessage: moveerMessage.MOVEER_MISSING_MOVE_PERMISSION(message.author.id, voiceChannel.name),
    }
  }
}

function ifChannelIsTextChannel(message, channel) {
  if (channel.type === 'GUILD_TEXT') {
    throw {
      logMessage: 'User tried to move with textchannels',
      sendMessage: moveerMessage.USER_MOVED_WITH_TEXT_CHANNEL(channel.id),
    }
  }
}

function ifCatergyHasRoomsAvailable(message, voiceChannelCounter, voiceChannelsInCategory, categoryName) {
  if (voiceChannelCounter === voiceChannelsInCategory.length) {
    // Out of rooms to move people to.
    throw {
      logMessage: 'Category: ' + categoryName + ' is out of voice channels to move users to',
      sendMessage: moveerMessage.NO_EMTPY_VOICECHANNELS_IN_CATEGORY(message.author.id, categoryName),
    }
  }
}

function countOfChannelsFromCategory(message, CountOfChannelsFromCategory, categoryName) {
  if (CountOfChannelsFromCategory.length === 0) {
    throw {
      logMessage: 'Not enough voice channels in the category: ' + categoryName,
      sendMessage: moveerMessage.NOT_ENOUGH_VCHANNELS_IN_CATEGORY(message.author.id, categoryName),
    }
  }
}

function userAmountInChannel(message, amount, expectedAmount, fromVoiceChannelName) {
  if (amount < expectedAmount) {
    const m = moveerMessage.NOT_ENOUGH_USERS_IN_CHANNEL(message.author.id, fromVoiceChannelName, amount, expectedAmount)
    throw {
      logMessage: m,
      sendMessage: m,
    }
  }
}

function userAmountInCategory(message, amount, expectedAmount, fromCategoryName) {
  if (amount < expectedAmount) {
    const m = moveerMessage.NOT_ENOUGH_USERS_IN_CATEGORY(message.author.id, fromCategoryName, amount, expectedAmount)
    throw {
      logMessage: m,
      sendMessage: m,
    }
  }
}

function ifVoiceChannelExist(message, voiceChannel, channelName) {
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (valueEqNullorUndefinded(voiceChannel)) {
    throw {
      logMessage:
        'Cant find voiceChannel: ' +
        channelName +
        (message.content.slice(config.discordPrefix.length).trim().split(/ +/g).length > 3 ? ' - Sent fnutt helper' : ''),
      sendMessage:
        command === 'move'
          ? moveerMessage.NO_VOICE_CHANNEL_NAMED_X(channelName, message.author.id)
          : moveerMessage.NO_VOICE_CHANNEL_NAMED_X(channelName, message.author.id) +
            (message.content.slice(config.discordPrefix.length).trim().split(/ +/g).length > 3
              ? '\n' + moveerMessage.MIGHT_BE_MISSING_FNUTTS_WARNING
              : ''),
    }
  }
}

function argsLength(args, expectedLength) {
  if (args.length < expectedLength) {
    throw {
      logMessage: 'Missing one or more arguments.',
      sendMessage: moveerMessage.MISSING_ARGS_IN_MESSAGE,
    }
  }
}

function ifArgsTheSame(message, args) {
  if (args[0].toLowerCase() === args[1].toLowerCase()) {
    throw {
      logMessage: 'Same voice channel name',
      sendMessage: moveerMessage.VOICE_CHANNEL_NAMES_THE_SAME(message.author.id),
    }
  }
}

function ifUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) {
  if (fromVoiceChannel === null) return
  if (fromVoiceChannel.members.size < 1) {
    throw {
      logMessage: 'No users inside the channel: ' + fromVoiceChannelName,
      sendMessage: moveerMessage.NO_USERS_INSIDE_ROOM(fromVoiceChannelName, message.author.id),
    }
  }
}

async function ifTextChannelIsMoveerAdmin(message, throwError = true) {
  if (message.channel.name.toLowerCase() !== 'moveeradmin') {
    const searchForGuild = await database.getGuildObject(message, message.guild.id)
    if (searchForGuild.rowCount > 0 && searchForGuild.rows[0].adminChannelId.split(',').includes(message.channel.id)) {
      // console.log('all green')
    } else {
      // console.log('throwing')
      if (!throwError) return throwError
      throw {
        logMessage: 'Command made outside moveeradmin',
        sendMessage: moveerMessage.ADMINCOMMAND_OUTSIDE_MOVEERADMIN(message.author.id),
      }
    }
  }
}

function forUserMentions(message, messageMentions) {
  if (messageMentions.length < 1) {
    throw {
      logMessage: '@Mention is missing',
      sendMessage: moveerMessage.MESSAGE_MISSING_MENTION(message.author.id),
    }
  }
}

function ifMessageContainsMentions(message) {
  if (message.mentions.users.size > 0) {
    throw {
      logMessage: 'User tried to mention while moving groups',
      sendMessage: moveerMessage.MOVE_MESSAGE_CONTAINS_MENTIONS(message.author.id),
    }
  }
}

function ifSelfMention(message) {
  if (message.mentions.users.has(message.author.id)) {
    throw {
      logMessage: 'User trying to move himself',
      sendMessage: moveerMessage.USER_MOVING_SELF(message.author.id),
    }
  }
}

function ifAuthorInsideAVoiceChannel(message, userVoiceRoomID) {
  if (valueEqNullorUndefinded(userVoiceRoomID)) {
    throw {
      logMessage: 'User tried to move people without being inside a voice room',
      sendMessage: moveerMessage.USER_NOT_IN_ANY_VOICE_CHANNEL(message.author.id),
    }
  }
}

const checkifPatreonGuildRepeat = async (message) => {
  // Check for patreon stuff
  if (message.author.bot) return
  const guildInfo = await database.getPatreonGuildObject(message, message.guild.id)
  if (guildInfo.rowCount === 0) return
  if (guildInfo.rows[0].enabled === '0' || guildInfo.rows[0].repeatEnabled === 0) return
  if (
    message.reactions.cache.size > 0 &&
    message.reactions.cache.first().users.cache.filter((u) => ['564773724520185856', '400724460203802624'].includes(u.id))
      .size > 0
  )
    return
  message.react('🔂').catch((e) => moveerMessage.logger(message, e.message + ' to react to message'))
  // End check for patreon stuff
}

module.exports = {
  checkifPatreonGuildRepeat,
  ifAuthorInsideAVoiceChannel,
  ifSelfMention,
  ifMessageContainsMentions,
  forUserMentions,
  ifTextChannelIsMoveerAdmin,
  ifUsersInsideVoiceChannel,
  ifArgsTheSame,
  ifChannelTextExpectText,
  ifUserInsideBlockedChannel,
  ifVoiceChannelContainsMoveer,
  ifGuildHasTwoMoveerChannels,
  ifMentionsInsideVoiceChannel,
  argsLength,
  ifVoiceChannelExist,
  userAmountInChannel,
  userAmountInCategory,
  countOfChannelsFromCategory,
  ifCatergyHasRoomsAvailable,
  ifChannelIsTextChannel,
  ifUsersAlreadyInChannel,
  forConnectPerms,
  forMovePerms,
  valueEqNullorUndefinded,
}
