const moveerMessage = require ('./moveerMessage.js')



function checkIfVoiceChannelExist(message, voiceChannel, channelName) {
  if (voiceChannel === null || voiceChannel.members == undefined) {
    throw {
      'logMessage': 'Cant find fromVoiceChannel: ' + channelName,
      'sendMessage': moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name: "' + channelName + '" <@' + message.author.id + '>'
    }
  }
}

function checkArgsLength (args, expectedLength) {
  if (args.length < expectedLength) {
    throw {
      'logMessage': 'Missing one or more arguments',
      'sendMessage': 'Missing one or more channel names\nCommand is `!fmove fromChannel ToChannel`'
    }
  }
}

function checkIfArgsTheSame(message, args) {
  if (args[0] === args[1]) {
    throw {
      'logMessage': 'Same voicechannel name',
      'sendMessage': moveerMessage.VOICE_CHANNEL_NAMES_THE_SAME + ' <@' + message.author.id + '>'
    }
  }
}

function checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel) {
  if (fromVoiceChannel === null) return
  if (fromVoiceChannel.members.array().length < 1) {
    throw {
      'logMessage': 'No users inside the channel: ' + fromVoiceChannelName,
      'sendMessage': moveerMessage.NO_USERS_INSIDE_ROOM + ':  ' + fromVoiceChannelName + ' <@' + message.author.id + '>'
    }
  }
}


function checkIfTextChannelIsMoveerAdmin(message) {
  if (message.channel.name.toLowerCase() !== 'moveeradmin') {
    throw {
      'logMessage': 'Command made outside moveeradmin',
      'sendMessage': moveerMessage.CMOVE_OUTSIDE_MOVEERADMIN + ' <@' + message.author.id + '>'
    }
  } 
}










module.exports = {
  checkIfTextChannelIsMoveerAdmin,
  checkIfVoiceChannelExist,
  checkIfArgsTheSame,
  checkIfUsersInsideVoiceChannel,
  checkArgsLength
}
