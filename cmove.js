const moveerMessage = require('./moveerMessage.js')

function move (args, message, command) {
  const guild = message.guild
  const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
  const authorID = message.author.id; // The author ID
  const messageMentions = message.mentions.users.array(); // Mentions in the message
  const textChannelName = message.channel.name

  // Check for room identifer
  if (args.length < 1 || args === undefined || args === null || args === []) {
    moveerMessage.logger(message, command, 'room identifier is missing')
    moveerMessage.sendMessage(message, (moveerMessage.CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + authorID + '>'))
    return;
  }

  // Try find channel using ID
  let guildChannels = guild.channels.find(channel => channel.id === args[0])
  if (guildChannels === null) {
    // Check for a channel named X since no channel could be found using ID search
    guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === args[0].toLowerCase())
    if (guildChannels === null || guildChannels.members == undefined) {
      moveerMessage.logger(message, command, ('No voice channel called ' + args[0]))
      moveerMessage.sendMessage(message, (moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'that name or id "' + args[0] + '" <@' + authorID + '>'))
      return;
    }
  }


  // Make sure the command comes from moveeradmin
  if (textChannelName.toLowerCase() !== 'moveeradmin') {
    moveerMessage.logger(message, command, 'Command made outside moveeradmin')
    moveerMessage.sendMessage(message, (moveerMessage.CMOVE_OUTSIDE_MOVEERADMIN + ' <@' + authorID + '>'))
    return;
  }

  // Make sure the user @mentions someone
  if (args < 1 || messageMentions.length < 1) {
    moveerMessage.logger(message, command, '@Mention is missing')
    moveerMessage.sendMessage(message, (moveerMessage.MESSAGE_MISSING_MENTION + ' <@' + authorID + '>'))
    return;
  }
  


  // All godd, lets get moving!
  usersMoved = 0
  for (var i = 0; i < messageMentions.length; i++) {
    if (message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined || message.guild.members.get(messageMentions[i].id).voiceChannelID === null) {
      moveerMessage.logger(message, command, 'Not moving user, not in any voice channel!')
      moveerMessage.sendMessage(message, (messageMentions[i] + ' ' + moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL))
    } else if (message.guild.members.get(messageMentions[i].id).voiceChannelID === guildChannels.id) {
      moveerMessage.logger(message, command, 'Not moving user, user already in the channel!')
      moveerMessage.sendMessage(message, (messageMentions[i].username + ' ' + moveerMessage.USER_ALREADY_IN_CHANNEL))
    } else {
      guild.member(messageMentions[i].id).setVoiceChannel(guildChannels).catch(err => {
        moveerMessage.logger(message, command, err)
      })
      usersMoved = usersMoved + 1
    }
  }
  // Done moving send finish message
  if (usersMoved > 0) {
    moveerMessage.logger(message, command, ('Moved ' + usersMoved + ' users.'))
    moveerMessage.sendMessage(message, ('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + ' <@' + authorID + '>'))
  }
}

module.exports = {
  move
}