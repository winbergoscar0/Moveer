const opts = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss',
}
const log = require('simple-node-logger').createSimpleLogger(opts)
const config = require('./config.js')

const convertUserIdToTaggedUser = (userId) => {
  return '<@' + userId + '>'
}

const MESSAGE_MENTION_IS_NOT_TEXT = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - You need to mention the text channel using #nameoftextchannel.'

const NO_EMTPY_VOICECHANNELS_IN_CATEGORY = (userId, categoryName) =>
  convertUserIdToTaggedUser(userId) +
  ' - The category "' +
  categoryName +
  '" is out of voice channels to move users to. Please add more voice channels.'

const NOT_ENOUGH_VCHANNELS_IN_CATEGORY = (userId, categoryName) =>
  convertUserIdToTaggedUser(userId) + ' - No voicechannels exists or no empty voicechannels in the category: ' + categoryName

const MISSING_ARGS_IN_MESSAGE = 'Missing information in the command. See `!help <command>` for more information.'

const USER_INSIDE_BLOCKED_CHANNEL = (userInBlockedChannel) =>
  convertUserIdToTaggedUser(userInBlockedChannel) + ' is inside a blocked voice channel. Not moving!'

const NO_USER_FOUND_BY_SEARCH = (userId, username) =>
  convertUserIdToTaggedUser(userId) + ' Cant find user with the username: ' + username

const MIGHT_BE_MISSING_FNUTTS_WARNING =
  'If your voice channel contains spaces, please use "" around it. Example; `"channel with spaces"`.'

const USER_MOVING_SELF = (userId) =>
  'You need to @mention a friend you want to move, not yourself. Remove your own name (' +
  convertUserIdToTaggedUser(userId) +
  ') and try again.'

const MESSAGE_MISSING_MENTION = (userId) => convertUserIdToTaggedUser(userId) + ' - You need to @mention a friend!'

const USER_NOT_IN_ANY_VOICE_CHANNEL = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - You need to join a voice channel before moving people with this command.'

const USER_INSIDE_MOVEER_VOICE_CHANNEL = (userId) =>
  convertUserIdToTaggedUser(userId) + " - You can't move people into this voice channel, try one that isn't named moveer."

const SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS = 'You seem to be having two channels called Moveer, please remove one!'

const NOT_ENOUGH_USERS_IN_CHANNEL = (userId, fromVoiceChannelName, actualAmount, expectedAmount) =>
  convertUserIdToTaggedUser(userId) +
  ' - Not enough members inside the channel "' +
  fromVoiceChannelName +
  '" to move. Found ' +
  actualAmount + (actualAmount === 1 ? ' user' : ' users') +
  ', expected at least ' +
  expectedAmount

const NOT_ENOUGH_USERS_IN_GROUP = (userId, fromGroupName, actualAmount, expectedAmount) =>
  convertUserIdToTaggedUser(userId) +
  ' - Not enough members inside the group "' +
  fromGroupName +
  '" to move. Found ' +
  actualAmount + (actualAmount === 1 ? ' user' : ' users') +
  ', expected at least ' +
  expectedAmount

const SUPPORT_MESSAGE =
  'Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/dTdH3gD'

const MOVEER_MISSING_CONNECT_PERMISSION = (userId, voiceChannelName) =>
  convertUserIdToTaggedUser(userId) +
  " - Hey! Please make sure I got 'CONNECT' permissions in the voice channel named: " +
  voiceChannelName +
  '\n\n' +
  SUPPORT_MESSAGE

const MOVEER_MISSING_MOVE_PERMISSION = (userId, voiceChannelName) =>
  convertUserIdToTaggedUser(userId) +
  " - Hey! Please make sure I got 'MOVE_MEMBERS' permissions in the voice channel named: " +
  voiceChannelName +
  '\n\n' +
  SUPPORT_MESSAGE

const TAKE_A_WHILE_RL_MESSAGE =
  '\n\nThis is going to take a while.. Want to move users faster? Check out the announcments channel in the official discord! https://discord.gg/dTdH3gD'

const MESSAGES_NOW_ALLOWED_IN_CHANNEL = (userId, textChannelId) =>
  convertUserIdToTaggedUser(userId) + ' - Admin commands now allowed to be sent inside <#' + textChannelId + '>'

const MESSAGE_MISSING_ROOM_IDENTIFER = (userId) =>
  convertUserIdToTaggedUser(userId) + ' - You need to write a number to identify a gMoveer room!'

const MOVE_MESSAGE_CONTAINS_MENTIONS = (userId) =>
  convertUserIdToTaggedUser(userId) + " - You're not supposed to @mention members with this command."

const NO_VOICE_CHANNEL_NAMED_X = (channelName, userId) =>
  convertUserIdToTaggedUser(userId) + " - There's no voice channel with the name or ID: " + channelName

const NO_USERS_INSIDE_ROOM = (fromVoiceChannelName, userId) =>
  convertUserIdToTaggedUser(userId) + " - There's no users inside the voice channel: " + fromVoiceChannelName

const ADMINCOMMAND_OUTSIDE_MOVEERADMIN = (userId) =>
  convertUserIdToTaggedUser(userId) +
  ' - This is an admin command, please us it inside a text channel with admin permissions. Default admin channel is `#moveeradmin` or add your own with `!changema`.'

const USER_MENTION_NOT_IN_ANY_CHANNEL = (userId) => convertUserIdToTaggedUser(userId) + ' is not inside any voice channel!'

const USER_ALREADY_IN_CHANNEL = (taggedUserId) =>
  (taggedUserId === 'Everyone' ? 'Everyone' : convertUserIdToTaggedUser(taggedUserId) + ' - ') +
  ' is already inside that voice channel.'

const DB_DOWN_WARNING =
  "Moveer cannot communicate with it's database. Since this is a admin command please create a text channel named moveeradmin and use that until my developer fixes this! He has been alerted but please poke him inside the support server! https://discord.gg/dTdH3gD"

const VOICE_CHANNEL_NAMES_THE_SAME = (userId) =>
  convertUserIdToTaggedUser(userId) + " - Please specify one channel to move from and one to move to. It can't be the same."

const MISSING_FNUTTS_IN_ARGS = (userId) =>
  convertUserIdToTaggedUser(userId) +
  ' - There is either too many or too few quotation marks (") or you forgot a space between the names.'

const USER_MOVED_WITH_TEXT_CHANNEL = (textChannelId) =>
  '<#' + textChannelId + '> seems to be a text channel. I can only move people inside voice channels!'

const HELP_MESSAGE = {
  embed: {
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: 'move',
        value: 'Moves @mentions to you',
      },
      {
        name: 'cmove',
        value: 'Moves @mentions to a specific channel',
      },
      {
        name: 'fmove',
        value: 'Moves one channel to another channel',
      },
      {
        name: 'gmove',
        value: 'Moves everyone inside a channel to you',
      },
      {
        name: 'rmove',
        value: 'Moves everyone with a certain role to you',
      },
      {
        name: 'tmove',
        value: 'Moves everyone with a certain role to a specific channel',
      },
      {
        name: 'ymove',
        value: 'Spreads x user from one channel to different voice channels inside a category',
      },
      {
        name: 'zmove',
        value: "Moves all users inside a category's voice channels to a specific channel",
      },
      {
        name: 'changema',
        value:
          'Allows moveeradmin commands to be sent from a secondary text channel of your choice \n`!changema #<channelName>`\n\nFor more information, use !help <command>',
      },
    ],
  },
}

// CMOVE

const HELP_CMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!cmove',
        value:
          "1. Create a text channel named 'moveeradmin'\n2. Tell your friends to join any voice channel.\n3. Write `!cmove <voicechannel name or id> @user1 @user2`\n \nThis command doesn't require the author to be inside a voice channel. All `!cmove` commands has to be sent inside 'moveeradmin' since this is an admin only command.\nExample usage:\n`!cmove Channel1 @Fragstealern#2543`\n`!cmove 569909202437406750 @Fragstealern#2543`\n(If your voice channel contains spaces use\n`!cmove \"channel 2\" @Fragstealern#2543`)",
      },
    ],
  },
}
// GMOVE

const HELP_GMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!gmove',
        value:
          "Group moving without using @tags!\n1. Create a voice channel named 'gMoveer[name here]' ← Notice that there is no space between the name and 'gMoveer'.\n2. Join the voice channel you want to move users to\n3. Tell your friends to join your 'gMoveer' channel.\n4. Write `!gmove [name of the channel]`, do not include 'gMoveer'\n\nExample: Let's say I have a 'gMoveer' channel named 'gMoveerIce'. The command would look like this; `!gmove Ice` and it would move the members to your voice channel.\n(If your voice channel contains spaces use \n`!gmove \"channel 1\"`)",
      },
    ],
  },
}
// MOVE

const HELP_MOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!move',
        value:
          "1. Create a voice channel named 'Moveer'\n2. Join a voice channel (Not 'Moveer')\n3. Tell users you want to move to join the channel 'Moveer'\n4. Write `!move @user1 @user2`\n \nThis command also contains an admin version that requires a text channel named 'moveeradmin'. `!move` commands sent inside this channel removes the requirement of @user1 & @user2 to join the 'Moveer' channel.\nThe author of the command can move people from any channel to any other channel.\n ",
      },
    ],
  },
}
// FMOVE

const HELP_FMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!fmove',
        value:
          '1. Tell users you want to move to join voice channel A\n2. Write `!fmove A B` where B is the voice channel you want to move them\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\n(If your voice channel contains spaces use\n`!fmove "channel 1" "channel 2"`)',
      },
    ],
  },
}
// RMOVE

const HELP_RMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!rmove',
        value:
          '1. Tell users you want to move, to join any voice channel\n2. Join any other voice channel and write `!rmove damage` where damage is the role name you want to move\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\nIf your role contains spaces use\n`!rmove "super admins"`',
      },
    ],
  },
}
// TMOVE

const HELP_TMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!tmove',
        value:
          '1. Tell users you want to move to join any voice channel\n2. Write `!tmove channel1 damage` where damage is the role name you want to move and channel1 is the voice channel\n \nThis command requires to be sent from the text channel \'moveeradmin\'.\nIf your role contains spaces use\n`!tmove channel1 "super admins"`',
      },
    ],
  },
}
// YMOVE

const HELP_YMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!ymove',
        value:
          '1. Tell users you want to move to join voice channel "before games"\n2. Create a couple of voice channels under a category named "games"\n3. Write `!ymove "before games" "games" 5`\n4. Now Moveer should spread users from the voice channel "beforegames" across the different voice channels inside the category "games". 5 users in each channel.  \nThis command requires to be sent from the text channel \'moveeradmin\'',
      },
    ],
  },
}

const HELP_ZMOVE = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: 'move',
        value:
          'Best used to move everyone back to a single channel after !ymove is used\n1. Create a couple of voice channels under a category named "games"\n3. Write `!zmove "games" "after games"`\n4. Moveer should now move all users from all the voice channels inside the category "games" to the "after games" voice channel. \nThis command requires to be sent from the text channel \'moveeradmin\'',
      },
    ],
  },
}

const HELP_CHANGEMA = {
  embed: {
    color: 2387002,
    footer: {
      text: 'Support server: https://discord.gg/dTdH3gD',
    },
    fields: [
      {
        name: '!changema',
        value:
          '1. Write !changema #<channelName>\n2. Moveer should reply that admin commands are now allowed inside #<channelName>\nBe sure the actually # tagging the text channel name',
      },
    ],
  },
}

const FALLBACK_HELP_MESSAGE =
  'move - Moves @mentions to you\ncmove  Moves @mentions to a specific channel\nfmove' +
  '- Moves users inside one channel to another channel\ngmove - Moves everyone inside a channel to you. \n\n' +
  'For more information, use !help <command>\nSupport Server: <https://discord.gg/dTdH3gD>'

const FALLBACK_HELP_FMOVE = HELP_FMOVE.embed.fields[0].value
const FALLBACK_HELP_CMOVE = HELP_CMOVE.embed.fields[0].value
const FALLBACK_HELP_MOVE = HELP_MOVE.embed.fields[0].value
const FALLBACK_HELP_GMOVE = HELP_GMOVE.embed.fields[0].value
const FALLBACK_HELP_TMOVE = HELP_TMOVE.embed.fields[0].value
const FALLBACK_HELP_YMOVE = HELP_YMOVE.embed.fields[0].value
const FALLBACK_HELP_ZMOVE = HELP_ZMOVE.embed.fields[0].value
const FALLBACK_HELP_CHANGEMA = HELP_CHANGEMA.embed.fields[0].value
const FALLBACK_HELP_RMOVE = HELP_RMOVE.embed.fields[0].value

const handleHelpCommand = (helpCommand, gotEmbedPerms) => {
  switch (helpCommand) {
    case 'cmove':
      return gotEmbedPerms ? HELP_CMOVE : FALLBACK_HELP_CMOVE
    case 'rmove':
      return gotEmbedPerms ? HELP_RMOVE : FALLBACK_HELP_RMOVE
    case 'fmove':
      return gotEmbedPerms ? HELP_FMOVE : FALLBACK_HELP_FMOVE
    case 'move':
      return gotEmbedPerms ? HELP_MOVE : FALLBACK_HELP_MOVE
    case 'gmove':
      return gotEmbedPerms ? HELP_GMOVE : FALLBACK_HELP_GMOVE
    case 'ymove':
      return gotEmbedPerms ? HELP_YMOVE : FALLBACK_HELP_YMOVE
    case 'zmove':
      return gotEmbedPerms ? HELP_ZMOVE : FALLBACK_HELP_ZMOVE
    case 'tmove':
      return gotEmbedPerms ? HELP_TMOVE : FALLBACK_HELP_TMOVE
    case 'changema':
      return gotEmbedPerms ? HELP_CHANGEMA : FALLBACK_HELP_CHANGEMA
    default:
      return 'notFound'
  }
}

function sendMessage(message, sendMessage) {
  if (sendMessage === 'notFound') return // Ignore this. failed to find HELP message by args
  // eslint-disable-next-line eqeqeq
  if (sendMessage == null) {
    reportMoveerError('I was about to send a NULL message - Probably errors in code.. @everyone')
    return
  }
  message.channel.send(sendMessage).catch((e) => {
    logger(message, e)
    if (
      config.discordBotListToken !== 'x' &&
      message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES') === true
    ) {
      reportMoveerError('@everyone - I failed to send message for some reason: ' + e)
      console.log(e)
    }
  })
}

function logger(message, logMessage) {
  log.info(
    (message.author.bot ? 'BOT - ' : '') +
    '(' +
    message.id +
    ') - ' +
    message.guild.name +
    ' - (' +
    message.channel.name +
    ') - (' +
    message.content +
    ') - ' +
    logMessage
  )
}

function reportMoveerError(message) {
  const Discord = require('discord.js')
  const hook = new Discord.WebhookClient(config.discordHookIdentifier, config.discordHookToken)
  console.log('Sending error to DB HOOK')
  hook.send(message)
}

module.exports = {
  USER_MOVING_SELF,
  MESSAGE_MISSING_MENTION,
  USER_NOT_IN_ANY_VOICE_CHANNEL,
  USER_INSIDE_MOVEER_VOICE_CHANNEL,
  SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS,
  SUPPORT_MESSAGE,
  MOVEER_MISSING_CONNECT_PERMISSION,
  MOVEER_MISSING_MOVE_PERMISSION,
  MESSAGE_MISSING_ROOM_IDENTIFER,
  MOVE_MESSAGE_CONTAINS_MENTIONS,
  NO_VOICE_CHANNEL_NAMED_X,
  NO_USERS_INSIDE_ROOM,
  ADMINCOMMAND_OUTSIDE_MOVEERADMIN,
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
  HELP_ZMOVE,
  FALLBACK_HELP_ZMOVE,
  HELP_CHANGEMA,
  FALLBACK_HELP_CHANGEMA,
  reportMoveerError,
  NOT_ENOUGH_USERS_IN_CHANNEL,
  MISSING_ARGS_IN_MESSAGE,
  NOT_ENOUGH_VCHANNELS_IN_CATEGORY,
  MIGHT_BE_MISSING_FNUTTS_WARNING,
  USER_INSIDE_BLOCKED_CHANNEL,
  NO_EMTPY_VOICECHANNELS_IN_CATEGORY,
  MESSAGE_MENTION_IS_NOT_TEXT,
  MESSAGES_NOW_ALLOWED_IN_CHANNEL,
  handleHelpCommand,
  DB_DOWN_WARNING,
  NO_USER_FOUND_BY_SEARCH,
  TAKE_A_WHILE_RL_MESSAGE,
}
