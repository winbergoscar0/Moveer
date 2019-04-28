const opts = {
  timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts);
const moveerMessage = require('./moveerMessage.js')

function mentions (args, message) {
    const guild = message.guild; // The guild where the user sends its message
    const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
    const authorID = message.author.id; // The author ID
    const messageMentions = message.mentions.users.array(); // Mentions in the message
    const guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === 'moveer')
    const textChannelName = message.channel.name

    // Make sure the user @mentions someone
    if (args < 1 || messageMentions.length < 1) {  
      message.channel.send(moveerMessage.MESSAGE_MISSING_MENTION + ' <@' + authorID + '>');
      log.info(message.guild.name + ' - @Mention is missing ')
      return;
    }

    if (message.mentions.users.has(authorID)) {
      message.channel.send(moveerMessage.USER_MOVING_SELF + ' <@' + authorID + '>');
      log.info(message.guild.name + ' - User trying to move himself')
      return;
    }

    // Stop people from trying to move people without being inside a voice room
    if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
      message.channel.send(moveerMessage.USER_NOT_IN_ANY_VOICE_CHANNEL + ' <@' + authorID + '>');
      log.info(message.guild.name + ' - User tried to move people without being inside a voice room')
      return;
    }
    
    if (textChannelName.toLowerCase() !== 'moveeradmin') {
      // If the message comes from the admin room, don't require the users to be inside Moveer

      const userVoiceRoomName = guild.channels.get(userVoiceRoomID).name // Name of authors voice room
      // Stop people from trying to move people into Moveer
      if (userVoiceRoomName.toLowerCase().includes('moveer')){
        message.channel.send(moveerMessage.USER_INSIDE_MOVEER_VOICE_CHANNEL + ' <@' + authorID + '>');
        log.info(message.guild.name + ' - User trying to move people into a moveer channel')
        return;
      }

      if (guild.channels.find(channel => channel.name === 'Moveer') !== null && guild.channels.find(channel => channel.name === 'moveer') !== null) {
        message.channel.send(moveerMessage.SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS);
        log.info(message.guild.name + ' - User has two channels called moveer/Moveer')
        return;
      }
      
      // Check for errors in the message
      // Make sure there's a voice room called Moveer
      if (guildChannels === null || guildChannels.members == undefined) {
        message.channel.send(moveerMessage.SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL);
        message.channel.send(moveerMessage.SUPPORT_MESSAGE)
        log.info(message.guild.name + ' - No voice channel called Moveer')
        return;
      }

      // Make sure there are users inside Moveer
        if (guildChannels.members.length < 1) {
          message.channel.send(moveerMessage.NO_USERS_INSIDE_ROOM + ' Moveer <@' + authorID + '>');
          log.info(message.guild.name + ' - No users inside the Moveer channel ')
          return;
        }
    }

    // Check that moveer has access to the voice room
    if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
      message.channel.send(moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION + ' <@' + authorID + '>');
      message.channel.send(moveerMessage.SUPPORT_MESSAGE)
      log.info(message.guild.name + ' - Moveer is missing CONNECT permission to ')
      return;
    }

    // Check that moveer has move members role 
    if (!guild.me.hasPermission('MOVE_MEMBERS')) {
      message.channel.send(moveerMessage.MOVEER_MISSING_MOVE_PERMISSION + ' <@' + authorID + '>');
      message.channel.send(moveerMessage.SUPPORT_MESSAGE)
      log.info(message.guild.name + ' - Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot or check the room permissions) ')
      return;
    }
  
    let usersMoved = 0
    // No errors in the message, try moving everyone in the @mention
    if (textChannelName.toLowerCase() === 'moveeradmin'){
      // START - Command came from moveeradmin, don't requrire users to be inside Moveer
      for (var i = 0; i < messageMentions.length; i++) {
        guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
        usersMoved = usersMoved + 1
      }
      if (usersMoved > 0) {
        log.info(message.guild.name + ' - Admin moved ' + usersMoved + ' users.')
        message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + ' <@' + authorID + '>');
      }
      // END - Command came from moveeradmin, don't require users to be inside Moveer
    } else {
      // START - Command not sent from moveeradmin, make sure the users are inside Moveer
      for (var i = 0; i < messageMentions.length; i++) {
        const usersInMoveeer = guildChannels.members; // The members ofthe Moveer voice room
        if (usersInMoveeer.has(messageMentions[i].id)) {
          guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
          usersMoved = usersMoved + 1
        } else { 
          message.channel.send('Not moving: ' + messageMentions[i].username + '. Is the user in the voice channel "Moveer"?');
          log.info(message.guild.name + ' - User in wrong channel.')
        }
      }
      if (usersMoved > 0) {
        log.info(message.guild.name + ' - Moved ' + usersMoved + ' users.')
        message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of' + ' <@' + authorID + '>');
      }
      // END - Command not sent from moveeradmin, make sure the users are inside Moveer
    }




    
    
}

// NEW FUNCTION

function group (args, message) {


  const guild = message.guild; // The guild where the user sends its message
  const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
  const authorID = message.author.id; // The author ID
  const messageMentions = message.mentions.users.array(); // Mentions in the message

  if (args.length < 1 || args === undefined || args === null || args === []) {
    message.channel.send(moveerMessage.MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - room identifier is missing ')
    return;
  }

  const guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === 'gmoveer' + args[0].toLowerCase())

  if (messageMentions.length > 0) {
    message.channel.send(moveerMessage.GROUP_MOVE_MESSAGE_CONTAINS_MENTIONS + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - User tried to mention while moving groups ')
    return;
  }

  if (guildChannels === null || guildChannels.members == undefined) {
    message.channel.send(moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name "gMoveer' + args[0] + '" <@' + authorID + '>');
    log.info(message.guild.name + ' - No voice channel called gMoveer' + args[0])
    return;
  }

  // Stop people from trying to move people without being inside a voice room
  if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
    message.channel.send(moveerMessage.USER_NOT_IN_ANY_VOICE_CHANNEL + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - User tried to move people without being inside a voice room')
    return;
  }

  const userVoiceRoomName = guild.channels.get(userVoiceRoomID).name // Name of authors voice room
  if (userVoiceRoomName.toLowerCase().includes('moveer')){
    message.channel.send(moveerMessage.USER_INSIDE_MOVEER_VOICE_CHANNEL + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - User trying to move people into a moveer channel')
    return;
  }

  // Check that moveer has access to the voice room
  if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
    message.channel.send(moveerMessage.MOVEER_MISSING_CONNECT_PERMISSION + ' <@' + authorID + '>');
    message.channel.send(moveerMessage.SUPPORT_MESSAGE)
    log.info(message.guild.name + ' - Moveer is missing CONNECT permission to ')
    return;
  }
  
  // Check that moveer has move members role 
  if (!guild.me.hasPermission('MOVE_MEMBERS')) {
    message.channel.send(moveerMessage.MOVEER_MISSING_MOVE_PERMISSION + ' <@' + authorID + '>');
    message.channel.send(moveerMessage.SUPPORT_MESSAGE)
    log.info(message.guild.name + ' - Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot or check the room permissions) ')
    return;
  }

  const groupMembersToMove = guildChannels.members.array()
  if (groupMembersToMove.length < 1) {
    message.channel.send(moveerMessage.NO_USERS_INSIDE_ROOM + ' gMoveer' + args[0] + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - No users inside the gMoveer channel ')
    return;
  }

  // No errors in the message, try moving everyone in the @mention
  
  usersMoved = 0
  for (var i = 0; i < groupMembersToMove.length; i++) {
    guild.member(groupMembersToMove[i].user.id).setVoiceChannel(userVoiceRoomID);
    usersMoved += 1
  }
  log.info(message.guild.name + ' - Group moved ' + usersMoved + ' users.')
  message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of' + ' <@' + authorID + '>');
  
}

// NEW FUNCTION

function cmove (args, message) {
  const guild = message.guild
  const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
  const authorID = message.author.id; // The author ID
  const messageMentions = message.mentions.users.array(); // Mentions in the message
  const textChannelName = message.channel.name

  // Check for room identifer
  if (args.length < 1 || args === undefined || args === null || args === []) {
    message.channel.send(moveerMessage.CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - room identifier is missing ')
    return;
  }

  // Try find channel using ID
  let guildChannels = guild.channels.find(channel => channel.id === args[0])
  if (guildChannels === null) {
    // Check for a channel named X since no channel could be found using ID search
    guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === args[0].toLowerCase())
    if (guildChannels === null || guildChannels.members == undefined) {
      message.channel.send(moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'that name or id "' + args[0] + '" <@' + authorID + '>');
      log.info(message.guild.name + ' - No voice channel called ' + args[0])
      return;
    }
  }


  // Make sure the command comes from moveeradmin
  if (textChannelName.toLowerCase() !== 'moveeradmin') {
    message.channel.send(moveerMessage.CMOVE_OUTSIDE_MOVEERADMIN + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - Command made outside moveeradmin')
    return;
  }

  // Make sure the user @mentions someone
  if (args < 1 || messageMentions.length < 1) {  
    message.channel.send(moveerMessage.MESSAGE_MISSING_MENTION + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - @Mention is missing ')
    return;
  }
  


  // All godd, lets get moving!
  usersMoved = 0
  for (var i = 0; i < messageMentions.length; i++) {
    if (message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined) {
      log.info(message.guild.name + ' Not moving user, not in any voice channel!')
      message.channel.send(messageMentions[i] + ' ' + moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL);
    } else {
      guild.member(messageMentions[i].id).setVoiceChannel(guildChannels);
      usersMoved = usersMoved + 1
    }
  }
  // Done moving send finish message
  if (usersMoved > 0) {
    log.info(message.guild.name + ' - Cmoved ' + usersMoved + ' users.')
    message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + ' <@' + authorID + '>');
  }
}










module.exports = {
    mentions,
    group,
    cmove
  };