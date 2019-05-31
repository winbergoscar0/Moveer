const moveerMessage = require('./moveerMessage.js')

function move (args, message, command) {
  const guild = message.guild; // The guild where the user sends its message
  const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
  const authorID = message.author.id; // The author ID
  const messageMentions = message.mentions.users.array(); // Mentions in the message

  if (args.length < 1 || args === undefined || args === null || args === []) {
    moveerMessage.logger(message, command, 'room identifier is missing')
    moveerMessage.sendMessage(message, (moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + authorID + '>'))
    return;
  }

  const guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === 'gmoveer' + args[0].toLowerCase())

  if (messageMentions.length > 0) {
    moveerMessage.logger(message, command, 'User tried to mention while moving groups')
    moveerMessage.sendMessage(message, (moveerMessage.GROUP_MOVE_MESSAGE_CONTAINS_MENTIONS + ' <@' + authorID + '>'))
    return;
  }

  if (guildChannels === null || guildChannels.members == undefined) {
    moveerMessage.logger(message, command, ('No voice channel called gMoveer' + args[0]))
    moveerMessage.sendMessage(message, (moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name "gMoveer' + args[0] + '" <@' + authorID + '>'))
    return;
  }

  // Stop people from trying to move people without being inside a voice room
  if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
    moveerMessage.logger(message, command, 'User tried to move people without being inside a voice room')
    moveerMessage.sendMessage(message, (moveerMessage.USER_NOT_IN_ANY_VOICE_CHANNEL + ' <@' + authorID + '>'))
    return;
  }

  const userVoiceRoomName = guild.channels.get(userVoiceRoomID).name // Name of authors voice room
  if (userVoiceRoomName.toLowerCase().includes('moveer')){
    moveerMessage.logger(message, command, 'User trying to move people into a moveer channel')
    moveerMessage.sendMessage(message, (moveerMessage.USER_INSIDE_MOVEER_VOICE_CHANNEL + ' <@' + authorID + '>'))
    return;
  }

  // Check that moveer has access to the voice room
  if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
    moveerMessage.logger(message, command, ('Moveer is missing CONNECT permission to ' + args[0]))
    moveerMessage.sendMessage(message, (moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION + ' <@' + authorID + '>'))
    moveerMessage.sendMessage(message, moveerMessage.SUPPORT_MESSAGE)
    return;
  }
  
  // Check that moveer has move members role 
  if (!guild.me.hasPermission('MOVE_MEMBERS')) {
    moveerMessage.logger(message, command, 'Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot or check the room permissions)')
    moveerMessage.sendMessage(message, (moveerMessage.MOVEER_MISSING_MOVE_PERMISSION + ' <@' + authorID + '>'))
    moveerMessage.sendMessage(message, moveerMessage.SUPPORT_MESSAGE)
    return;
  }

  const groupMembersToMove = guildChannels.members.array()
  if (groupMembersToMove.length < 1) {
    moveerMessage.logger(message, command, ('No users inside the channel gMoveer' + args[0]))
    moveerMessage.sendMessage(message, (moveerMessage.NO_USERS_INSIDE_ROOM + ' gMoveer' + args[0] + ' <@' + authorID + '>'))
    return;
  }

  // No errors in the message, try moving everyone in the @mention
  
  usersMoved = 0
  for (var i = 0; i < groupMembersToMove.length; i++) {
    guild.member(groupMembersToMove[i].user.id).setVoiceChannel(userVoiceRoomID);
    usersMoved += 1
  }
  moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
  moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of' + ' <@' + authorID + '>'))
}

module.exports = {
  move
}