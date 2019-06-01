const moveerMessage = require('./moveerMessage.js')

function checkIfVoiceChannelExist(message, voiceChannel, channelName) {
  if (voiceChannel === null || voiceChannel.members == undefined) throw {
    'logMessage': 'Cant find fromVoiceChannel: ' + channelName,
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






function checkForConnectPerms(message) {
  if (!message.member.voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) throw {
    'logMessage': 'Moveer is missing CONNECT permission',
    'sendMessage': moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION + ' <@' + authorID + '> \n' + moveerMessage.SUPPORT_MESSAGE
  }
}

function checkForMovePerms(message) {
  if (!message.member.voiceChannel.memberPermissions(message.guild.me).has('CONNECT')) throw {
    'logMessage': 'Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot or check the room permissions)',
    'sendMessage': moveerMessage.MOVEER_MISSING_MOVE_PERMISSION + ' <@' + authorID + '> \n' + moveerMessage.SUPPORT_MESSAGE
  }
}











// Helper functions


function getNameOfVoiceChannel(message, voiceChannelId) {
  return message.guild.channels.get(voiceChannelId).name
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
  checkIfSelfMention
}
