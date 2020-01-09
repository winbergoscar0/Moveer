const opts = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts)
const config = require('./config.js')

const USER_MOVING_SELF = 'You need to @mention a friend you want to move, not yourself. Remove your @name and try again :)'
const MESSAGE_MISSING_MENTION = 'You need to @mention a friend!'
const USER_NOT_IN_ANY_VOICE_CHANNEL = 'You need to join a voice channel before moving people.'
const USER_INSIDE_MOVEER_VOICE_CHANNEL = 'You can\'t move people into this voice channel, try one that isn\'t named moveer.'
const SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS = 'You seem to be having two channels called Moveer, please remove one!'
const SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL = 'Hello, You need to create a voice channel named "Moveer"'
const SUPPORT_MESSAGE = 'Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/dTdH3gD'
const MOVEER_MISSING_CONNECT_PERMISSION = 'Hey! Please make sure i got \'CONNECT\' permissions in the voicechannel named '
const MOVEER_MISSING_MOVE_PERMISSION = 'Hey! Please make sure i got \'MOVE_MEMBERS\' permissions in the voicechannel named '
const MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to write a number to identify a gMoveer room!'
const MOVE_MESSAGE_CONTAINS_MENTIONS = 'You\'re not supposed to @mention members with this command.'
const NO_VOICE_CHANNEL_NAMED_X = 'There\'s no voice channel with '
const NO_USERS_INSIDE_ROOM = 'There\'s no users inside the voice channel'
const CMOVE_OUTSIDE_MOVEERADMIN = 'This is an admin command, please use this inside a textchannel named "moveeradmin" or add one of your choice by writing !changema #<channelName>'
const CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to specify a voice channel!'
const USER_MENTION_NOT_IN_ANY_CHANNEL = 'is not inside any voice channel!'
const USER_ALREADY_IN_CHANNEL = 'is already inside that voice channel.'
const VOICE_CHANNEL_NAMES_THE_SAME = 'Please specify one channel to move from, and one to move to. It can\'t be the same'
const MISSING_FNUTTS_IN_ARGS = 'There is either too many or too few quotation marks (") or you forgot a space between the names :)'
const USER_MOVED_WITH_TEXT_CHANNEL = ' <- seems to be a text channel. I can only move people inside voice channels!'

const HELP_MESSAGE = {
  embed: {
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: 'move',
        value: 'Moves @mentions to you'
      },
      {
        name: 'cmove',
        value: 'Moves @mentions to a specific channel'
      },
      {
        name: 'fmove',
        value: 'Moves one channel to another channel'
      },
      {
        name: 'gmove',
        value: 'Moves everyone inside a channel to you'
      },
      {
        name: 'rmove',
        value: 'Moves everyone with a certain role to you'
      },
      {
        name: 'tmove',
        value: 'Moves everyone with a certain role to a channel you specify'
      },
      {
        name: 'ymove',
        value: 'Spreads x user from one channel to different voice channels inside a category'
      },
      {
        name: 'changema',
        value: 'Allows moveeradmin commands to be sent from a secondary textchannel of your choice \n`!changema #<channelName>`\n\nFor more information, use !help <command>'
      }

    ]
  }
}

// CMOVE
const HELP_CMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!cmove',
        value: '1. Create a text channel named \'moveeradmin\'\n2. Tell your friends to join any voice channel.\n3. Write `!cmove <voicechannel name or id> @user1 @user2`\n \nThis command doesn\'t require the author to be inside a voice channel. All `!cmove` commands has to be sent inside \'moveeradmin\' since this is an admin only command.\nExample usage:\n`!cmove Channel1 @Fragstealern#2543`\n`!cmove 569909202437406750 @Fragstealern#2543`\n(If your voice channel contains spaces use\n`!cmove "channel 2" @Fragstealern#2543`)'

      }
    ]
  }
}
// GMOVE
const HELP_GMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!gmove',
        value: 'Group moving without using @tags!\n1. Create a voice channel named \'gMoveer[name here]\' ← Notice that there is no space between the name and \'gMoveer\'.\n2. Join the voice channel you want to move users to\n3. Tell your friends to join your \'gMoveer\' channel.\n4. Write `!gmove [name of the channel]`, do not include \'gMoveer\'\n\nExample: Let\'s say I have a \'gMoveer\' channel named \'gMoveerIce\'. The command would look like this; `!gmove Ice` and it would move the members to your voice channel.\n(If your voice channel contains spaces use \n`!gmove "channel 1"`)'
      }
    ]
  }
}
// MOVE
const HELP_MOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!move',
        value: '1. Create a voice channel named \'Moveer\'\n2. Join a voice channel (Not \'Moveer\')\n3. Tell users you want to move to join the channel \'Moveer\'\n4. Write `!move @user1 @user2`\n \nThis command also contains an admin version that requires a text channel named \'moveeradmin\'. `!move` commands sent inside this channel removes the requirement of @user1 & @user2 to join the \'Moveer\' channel.\nThe author of the command can move people from any channel to any other channel.\n '
      }
    ]
  }
}
// FMOVE
const HELP_FMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!fmove',
        value: '1. Tell users you want to move to join voice channel A\n2. Write `!fmove A B` where B is the voice channel you want to move them\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\n(If your voice channel contains spaces use\n`!fmove "channel 1" "channel 2"`)'
      }
    ]
  }
}
// RMOVE
const HELP_RMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!rmove',
        value: '1. Tell users you want to move, to join any voice channel\n2. Join any other voice channel and write `!rmove damage` where damage is the role name you want to move\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\nIf your role contains spaces use\n`!rmove "super admins"`'
      }
    ]
  }
}
// TMOVE
const HELP_TMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!tmove',
        value: '1. Tell users you want to move to join any voice channel\n2. Write `!tmove channel1 damage` where damage is the role name you want to move and channel1 is the voice channel\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\nIf your role contains spaces use\n`!tmove channel1 "super admins"`'
      }
    ]
  }
}
// YMOVE
const HELP_YMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!ymove',
        value: '1. Tell users you want to move to join voice channel "before games"\n2. Create a couple of voice channels under a category named "games"\n3. Write `!ymove "before games" "games" 5`\n4. Now Moveer should spread users from the voice channel "beforegames" across the different voice channels inside the category "games". 5 users in each channel.  \nThis command requires to be sent from the text channel \'moveeradmin\''
      }
    ]
  }
}

const HELP_CHANGEMA = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD'
    },
    fields: [
      {
        name: '!changema',
        value: '1. Write !changema #<channelName>\n2. Moveer should reply that admin commands are now allowed inside #<channelName>\nBe sure the actually # tagging the textchannel name'
      }
    ]
  }
}


const FALLBACK_HELP_MESSAGE = 'move - Moves @mentions to you\ncmove  Moves @mentions to a specific channel\nfmove' +
  '- Moves users inside one channel to another channel\ngmove - Moves everyone inside a channel to you. \n\n' +
  'For more information, use !help <command>\nSupport Server: <https://discord.gg/dTdH3gD>'
const FALLBACK_HELP_FMOVE = HELP_FMOVE.embed.fields[0].value
const FALLBACK_HELP_CMOVE = HELP_CMOVE.embed.fields[0].value
const FALLBACK_HELP_MOVE = HELP_MOVE.embed.fields[0].value
const FALLBACK_HELP_GMOVE = HELP_GMOVE.embed.fields[0].value
const FALLBACK_HELP_TMOVE = HELP_TMOVE.embed.fields[0].value
const FALLBACK_HELP_YMOVE = HELP_YMOVE.embed.fields[0].value
const FALLBACK_HELP_CHANGEMA = HELP_CHANGEMA.embed.fields[0].value
function sendMessage (message, sendMessage) {
  const helper = require('./helper.js')
  message.channel.send(sendMessage)
    .catch((e) => {
      logger(message, e)
      if (config.discordBotListToken !== 'x' && message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES') === true) {
        helper.reportMoveerError('type', message)
        console.log(e)
      }
    })
}

function logger (message, logMessage) {
  log.info((message.author.bot ? 'BOT - ' : '') + '(' + message.id + ') - ' + message.guild.name + ' - (' + message.channel.name + ') - (' + message.content + ') - ' + logMessage)
}

module.exports = {
  USER_MOVING_SELF,
  MESSAGE_MISSING_MENTION,
  USER_NOT_IN_ANY_VOICE_CHANNEL,
  USER_INSIDE_MOVEER_VOICE_CHANNEL,
  SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS,
  SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL,
  SUPPORT_MESSAGE,
  MOVEER_MISSING_CONNECT_PERMISSION,
  MOVEER_MISSING_MOVE_PERMISSION,
  MESSAGE_MISSING_ROOM_IDENTIFER,
  MOVE_MESSAGE_CONTAINS_MENTIONS,
  NO_VOICE_CHANNEL_NAMED_X,
  NO_USERS_INSIDE_ROOM,
  CMOVE_OUTSIDE_MOVEERADMIN,
  CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER,
  USER_MENTION_NOT_IN_ANY_CHANNEL,
  HELP_CMOVE,
  HELP_GMOVE,
  HELP_MESSAGE,
  HELP_MOVE,
  HELP_FMOVE,
  HELP_RMOVE,
  HELP_TMOVE,
  logger,
  sendMessage,
  USER_ALREADY_IN_CHANNEL,
  VOICE_CHANNEL_NAMES_THE_SAME,
  MISSING_FNUTTS_IN_ARGS,
  USER_MOVED_WITH_TEXT_CHANNEL,
  FALLBACK_HELP_CMOVE,
  FALLBACK_HELP_FMOVE,
  FALLBACK_HELP_GMOVE,
  FALLBACK_HELP_MESSAGE,
  FALLBACK_HELP_MOVE,
  FALLBACK_HELP_TMOVE,
  HELP_YMOVE,
  FALLBACK_HELP_YMOVE,
  HELP_CHANGEMA,
  FALLBACK_HELP_CHANGEMA
}
