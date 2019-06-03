const opts = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts);
const config = require('./config.js')

const USER_MOVING_SELF = 'You need to @mention a friend you want to move, not yourself! :)'
const MESSAGE_MISSING_MENTION = 'You need to @mention a friend!'
const USER_NOT_IN_ANY_VOICE_CHANNEL = 'You need to join a voice channel before moving people.'
const USER_INSIDE_MOVEER_VOICE_CHANNEL = "You can't move people into this voice channel."
const SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS = 'You seem to be having two channels called Moveer, please remove one!'
const SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL = 'Hello, You need to create a voice channel named "Moveer"'
const SUPPORT_MESSAGE = 'Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/dTdH3gD'
const MOVEER_MISSING_CONNECT_PERMISSION = "Hey! I'm not allowed to move people to this room. I won't join you but discord requires me to have CONNECT privileges to move people!"
const MOVEER_MISSING_MOVE_PERMISSION = "Hey! I'm not allowed to move people in this discord :/ Please kick me and reinvite me with 'Move Members' checked. Or double check that I have Move Members permissions in the room you're moving people from!"
const MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to write a number to identify a gMoveer room!'
const MOVE_MESSAGE_CONTAINS_MENTIONS = "You're not supposed to @mention members with this command."
const NO_VOICE_CHANNEL_NAMED_X = "There's no voice channel with "
const NO_USERS_INSIDE_ROOM = "There's no users inside the voice channel"
const CMOVE_OUTSIDE_MOVEERADMIN = 'This is an admin command, please use this inside the textchannel "moveeradmin"'
const CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to specify a voice channel!'
const USER_MENTION_NOT_IN_ANY_CHANNEL = 'is not inside any voice channel!'
const USER_ALREADY_IN_CHANNEL = 'is already inside that voice channel.'
const VOICE_CHANNEL_NAMES_THE_SAME = "Please specify one channel to move from, and one to move to. It can't be the same"
const MISSING_FNUTTS_IN_ARGS = 'There is either too many or too few quotation marks (") or you forgot a space between the channel names :)'
const USER_MOVED_WITH_TEXT_CHANNEL = " <- seems to be a text channel. I can only move people inside voice channels!"

const HELP_MESSAGE = 'Possible commands I can perform:\n!help move\n!help cmove\n!help gmove\n!help fmove'
// CMOVE
const HELP_CMOVE = {
  "embed": {
    "color": 2387002,
    "footer": {
      "text": "Support server: https://discord.gg/dTdH3gD"
    },
    "fields": [
      {
        "name": "!cmove",
        "value": "1. Create a text channel named 'moveeradmin'\n2. Tell your friends to join any voice channel.\n3. Write `!cmove <voicechannel name or id> @user1 @user2`\n \nThis command doesn't require the author to be inside a voice channel. All `!cmove` commands has to be sent inside 'moveeradmin' since this is an admin only command.\nExample usage:\n`!cmove Channel1 Fragstealern#2543`\n`!cmove 569909202437406750 Fragstealern#2543`\n "

      }
    ]
  }
}
// GMOVE
const HELP_GMOVE = {
  "embed": {
    "color": 2387002,
    "footer": {
      "text": "Support server: https://discord.gg/dTdH3gD"
    },
    "fields": [
      {
        "name": "!gmove",
        "value": "Group moving without using @tags!\n1. Create a voice channel named 'gMoveer[name here]' ← Notice that there is no space between the name and 'gMoveer'.\n2. Join the voice channel you want to move users to\n3. Tell your friends to join your 'gMoveer' channel.\n4. Write `!gmove [name of the channel]`, do not include 'gMoveer'\n\nExample: Let's say I have a 'gMoveer' channel named 'gMoveerIce'. The command would look like this; `!gmove Ice` and it would move the members to your voice channel.\n(If your voice channel contains spaces use \n" + '`!gmove "channel 1"`)'
      }
    ]
  }
}
// MOVE
const HELP_MOVE = {
  "embed": {
    "color": 2387002,
    "footer": {
      "text": "Support server: https://discord.gg/dTdH3gD"
    },
    "fields": [
      {
        "name": "!move",
        "value": "1. Create a voice channel named 'Moveer'\n2. Join a voice channel (Not 'Moveer')\n3. Tell users you want to move to join the channel 'Moveer'\n4. Write `!move @user1 @user2`\n \nThis command also contains an admin version that requires a text channel named 'moveeradmin'. `!move` commands sent inside this channel removes the requirement of @user1 & @user2 to join the 'Moveer' channel.\nThe author of the command can move people from any channel to any other channel.\n "
      }
    ]
  }
}
// FMOVE
const HELP_FMOVE = {
  "embed": {
    "color": 2387002,
    "footer": {
      "text": "Support server: https://discord.gg/dTdH3gD"
    },
    "fields": [
      {
        "name": "!fmove",
        "value": "1. Tell users you want to move to join voice channel A\n2. Write `!fmove A B` where B is the voice channel you want to move them\n \nThis command requires to be sent from the text channel 'moveeradmin'.\n(If your voice channel contains spaces use" + '\n`!fmove "channel 1" "channel 2"`)'
      }
    ]
  }
}

function sendMessage(message, sendMessage) {
  message.channel.send(sendMessage)
    .catch((e) => {
      logger(message, message.content, e)
      if (config.discordBotListToken !== '' && message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES") === true) {
        const Discord = require("discord.js");
        const hook = new Discord.WebhookClient(config.discordHookIdentifier, config.discordHookToken);
        hook.send('New Moveer error reported. Check the logs for information.\nCommand: ' + message.content + '\nInside textChannel: ' + message.channel.name + '\nInside server: ' + message.guild.name + '\n @everyone');
      }
    });
}

function logger(message, command, logMessage) {
  log.info(message.guild.name + ' - (' + message.channel.name + ') - (' + message.content + ') - ' + logMessage)
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
  logger,
  sendMessage,
  USER_ALREADY_IN_CHANNEL,
  VOICE_CHANNEL_NAMES_THE_SAME,
  MISSING_FNUTTS_IN_ARGS,
  USER_MOVED_WITH_TEXT_CHANNEL
};