const moveerMessage = require('./moveerMessage.js')

function checkIfVoiceChannelExist(message, voiceChannel, channelName) {
  if (voiceChannel === null || voiceChannel.members == undefined) throw {
    'logMessage': 'Cant find voiceChannel: ' + channelName,
    'sendMessage': moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name: "' + channelName + '" <@' + message.author.id + '>'
  }
}

function checkArgsLength(args, expectedLength) {
  if (args.length < expectedLength) throw {
    'logMessage': 'Missing one or more arguments',
    'sendMessage': 'Missing arguments'
  }
}

function checkIfArgsTheSame(message, args) {
  if (args[0] === args[1]) throw {
    'logMessage': 'Same voicechannel name',
    'sendMessage': moveerMessage.VOICE_CHANNEL_NAMES_THE_SAME + ' <@' + message.author.id + '>'
  }
}

function checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) {
  if (fromVoiceChannel === null) return
  if (fromVoiceChannel.members.array().length < 1) throw {
    'logMessage': 'No users inside the channel: ' + fromVoiceChannelName,
    'sendMessage': moveerMessage.NO_USERS_INSIDE_ROOM + ':  ' + fromVoiceChannelName + ' <@' + message.author.id + '>'
  }
}

function checkIfTextChannelIsMoveerAdmin(message) {
  if (message.channel.name.toLowerCase() !== 'moveeradmin') throw {
    'logMessage': 'Command made outside moveeradmin',
    'sendMessage': moveerMessage.CMOVE_OUTSIDE_MOVEERADMIN + ' <@' + message.author.id + '>'
  }
}

function checkForUserMentions(message, messageMentions) {
  if (messageMentions.length < 1) throw {
    'logMessage': '@Mention is missing',
    'sendMessage': moveerMessage.MESSAGE_MISSING_MENTION + ' <@' + message.author.id + '>'
  }
}

function checkIfMessageContainsMentions(message) {
  if (message.mentions.users.array().length > 0) throw {
    'logMessage': 'User tried to mention while moving groups',
    'sendMessage': moveerMessage.MOVE_MESSAGE_CONTAINS_MENTIONS + ' <@' + message.author.id + '>'
  }
}

function checkIfSelfMention(message) {
  if (message.mentions.users.has(message.author.id)) throw {
    'logMessage': 'User trying to move himself',
    'sendMessage': moveerMessage.USER_MOVING_SELF + ' <@' + message.author.id + '>'
  }
}

function checkIfAuthorInsideAVoiceChannel(message, userVoiceRoomID) {
  if (userVoiceRoomID === undefined || userVoiceRoomID === null) throw {
    'logMessage': 'User tried to move people without being inside a voice room',
    'sendMessage': moveerMessage.USER_NOT_IN_ANY_VOICE_CHANNEL + ' <@' + message.author.id + '>'
  }
}

function checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName) {
  if (authorVoiceChannelName.toLowerCase().includes('moveer')) throw {
    'logMessage': 'User trying to move people into a moveer channel',
    'sendMessage': moveerMessage.USER_INSIDE_MOVEER_VOICE_CHANNEL + ' <@' + message.author.id + '>'
  }
}

function checkIfGuildHasTwoMoveerChannels(message) {
  if (message.guild.channels.find(channel => channel.name === 'Moveer') !== null && message.guild.channels.find(channel => channel.name === 'moveer') !== null) throw {
    'logMessage': 'User has two channels called moveer/Moveer',
    'sendMessage': moveerMessage.SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS
  }
}

function checkIfMentionsInsideVoiceChannel(message, command, messageMentions) {
  for (var i = 0; i < messageMentions.length; i++) {
    if (message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined || message.guild.members.get(messageMentions[i].id).voiceChannelID === null) {
      moveerMessage.logger(message, command, 'Not moving user, not in any voice channel!')
      moveerMessage.sendMessage(message, (messageMentions[i] + ' ' + moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL))
      messageMentions.splice(i, 1)
    }
  }
  return messageMentions
}

function checkIfUsersAlreadyInChannel(message, command, messageMentions, toVoiceChannelId) {
  for (var i = 0; i < messageMentions.length; i++) {
    if (message.guild.members.get(messageMentions[i].id).voiceChannelID === toVoiceChannelId) {
      moveerMessage.logger(message, command, 'Not moving user, user already in the channel!')
      moveerMessage.sendMessage(message, (messageMentions[i].username + ' ' + moveerMessage.USER_ALREADY_IN_CHANNEL))
      messageMentions.splice(i, 1)
    }
  }
  return messageMentions
}

function checkForConnectPerms(message) {
  if (!message.member.voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) throw {
    'logMessage': 'Moveer is missing CONNECT permission',
    'sendMessage': moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION + ' <@' + message.author.id + '> \n' + moveerMessage.SUPPORT_MESSAGE
  }
}

function checkForMovePerms(message) {
  if (!message.member.voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) throw {
    'logMessage': 'Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot or check the room permissions)',
    'sendMessage': moveerMessage.MOVEER_MISSING_MOVE_PERMISSION + ' <@' + message.author.id + '> \n' + moveerMessage.SUPPORT_MESSAGE
  }
}

function checkIfChannelIsTextChannel(message, channel) {
  if (channel.type === 'text') throw {
    'logMessage': 'User tried to move with textchannels',
    'sendMessage': channel.name + moveerMessage.USER_MOVED_WITH_TEXT_CHANNEL + ' <@' + message.author.id + '> \n'
  }
}

// Helper functions
function getNameOfVoiceChannel(message, voiceChannelId) {
  return message.guild.channels.get(voiceChannelId).name
}

function getChannelByName(message, findByName) {
  let voiceChannel = message.guild.channels.find(channel => channel.id === findByName)
  if (voiceChannel === null) {
    voiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === findByName.toLowerCase())
  }
  if (voiceChannel === null) throw {
    'logMessage': 'Cant find voiceChannel: ' + findByName,
    'sendMessage': moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name: "' + findByName + '" <@' + message.author.id + '>'
  }
  return voiceChannel
}

function moveUsers(message, command, usersToMove, toVoiceChannelId) {
  let usersMoved = 0
  for (var i = 0; i < usersToMove.length; i++) {
    message.guild.member(usersToMove[i]).setVoiceChannel(toVoiceChannelId)
      .catch(err => {
        console.log(err)
        moveerMessage.logger(message, command, 'Got above error when moving people...')
      })
    usersMoved += 1
  }
  moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
  moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of' + ' <@' + message.author.id + '>'))
}

function getChannelWithSpacesName(message, command, args) {
  let string = new String(args)
  let fnuttCounter = (string[0] === '"' ? 0 : 2)
  let testFrom = ''
  let testTo = ''

  for (i = (string[0] === '"' ? 0 : 0 + args[0].length); i < string.length; i++) {

    if (string[i] === '"') {
      fnuttCounter += 1
    } else if (string[i] !== ' ') {
      if (fnuttCounter === 2 && string[i] === ',') {
        //skip
      } else {
        if (fnuttCounter < 2) {
          testFrom = testFrom + (string[i] === ',' ? ' ' : string[i])
        } else {
          testTo = testTo + (string[i] === ',' ? ' ' : string[i])
        }
      }

    }
  }

  if (parseFloat(fnuttCounter) ? !(fnuttCounter % 2) : void 0) {
    fromVoiceChannelName = (string[0] === '"' ? testFrom : args[0])
    toVoiceChannelName = testTo
  } else {
    throw {
      'logMessage': moveerMessage.MISSING_FNUTTS_IN_ARGS,
      'sendMessage': moveerMessage.MISSING_FNUTTS_IN_ARGS
    }
  }
  return [fromVoiceChannelName, toVoiceChannelName]
}

module.exports = {
  checkIfTextChannelIsMoveerAdmin,
  checkIfVoiceChannelExist,
  checkIfArgsTheSame,
  checkIfUsersInsideVoiceChannel,
  checkArgsLength,
  checkForUserMentions,
  checkIfAuthorInsideAVoiceChannel,
  checkForConnectPerms,
  checkForMovePerms,
  checkIfVoiceChannelContainsMoveer,
  checkIfGuildHasTwoMoveerChannels,
  getNameOfVoiceChannel,
  checkIfSelfMention,
  checkIfMessageContainsMentions,
  moveUsers,
  checkIfMentionsInsideVoiceChannel,
  checkIfUsersAlreadyInChannel,
  getChannelByName,
  getChannelWithSpacesName,
  checkIfChannelIsTextChannel
}
