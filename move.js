const opts = {
  timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts);


function mentions (args, message) {
    const guild = message.guild; // The guild where the user sends its message
    const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
    const authorID = message.author.id; // The author ID
    const messageMentions = message.mentions.users.array(); // Mentions in the message
    const guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === 'moveer')
    const textChannelName = message.channel.name

    // Make sure the user @mentions someone
    if (args < 1 || messageMentions.length < 1) {
      message.channel.send('You need to @mention a friend!' + '<@' + authorID + '>');
      log.info(message.guild.name + ' - @Mention is missing ')
      return;
    }

    if (message.mentions.users.has(authorID)) {
      log.info(message.guild.name + ' - User trying to move himself')
      message.channel.send("You need to @mention a friend you want to move, not yourself! :) " + '<@' + authorID + '>');
      return;
    }

    // Stop people from trying to move people without being inside a voice room
    if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
      message.channel.send("You need to join a voice room before moving people " + '<@' + authorID + '>');
      log.info(message.guild.name + ' - User tried to move people without being inside a voice room')
      return;
    }
    
    if (textChannelName.toLowerCase() !== 'moveeradmin') {
      console.log('iffing')
      // If the message comes from the admin room, don't require the users to be inside Moveer

      const userVoiceRoomName = guild.channels.get(userVoiceRoomID).name // Name of authors voice room
      // Stop people from trying to move people into Moveer
      if (userVoiceRoomName.toLowerCase().includes('moveer')){
        message.channel.send("You can't move people into this voice room " + '<@' + authorID + '>');
        log.info(message.guild.name + ' - User trying to move people into a moveer channel')
        return;
      }

      if (guild.channels.find(channel => channel.name === 'Moveer') !== null && guild.channels.find(channel => channel.name === 'moveer') !== null) {
        log.info(message.guild.name + ' - User has two voice channels called moveer/Moveer')
        message.channel.send('You seem to be having two voice channels called Moveer, please remove one!');
        return;
      }
      
      // Check for errors in the message
      // Make sure there's a voice room called Moveer
      if (guildChannels === null || guildChannels.members == undefined) {
        log.info(message.guild.name + ' - No voice channel called Moveer')
        message.channel.send('Hello, You need to create a voice channel named "Moveer"');
        message.channel.send("Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF")
        return;
      }
      const usersInMoveeer = guildChannels.members; // The members ofthe Moveer voice room
    }

    // Check that moveer has access to the voice room
    if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
      message.channel.send("Hey! I'm not allowed to move people to this room. I won't join you but discord requires me to have CONNECT privileges to move people! " + '<@' + authorID + '>');
      message.channel.send("Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF")
      log.info(message.guild.name + ' - Moveer is missing CONNECT permission to ')
      return;
    }

    // Check that moveer has move members role 
    if (!guild.me.hasPermission('MOVE_MEMBERS')) {
      message.channel.send("Hey! I'm not allowed to move people in this discord :/ Please kick me and reinvite me with 'Move Members' checked." + '<@' + authorID + '>');
      message.channel.send("Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF")
      log.info(message.guild.name + ' - Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot) ')
      return;
    }
  
    let usersMoved = 0
    // No errors in the message, try moving everyone in the @mention
    console.log(textChannelName.toLowerCase())
    if (textChannelName.toLowerCase() === 'moveeradmin'){
      // START - Command came from moveeradmin, don't requrire users to be inside Moveer
      for (var i = 0; i < messageMentions.length; i++) {
        guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
        usersMoved = usersMoved + 1
      }
      if (usersMoved > 0) {
        log.info(message.guild.name + ' - Admin moved ' + usersMoved + ' users.')
        message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + '<@' + authorID + '>');
      }
      // END - Command came from moveeradmin, don't require users to be inside Moveer
    } else {
      // START - Command not sent from moveeradmin, make sure the users are inside Moveer
      for (var i = 0; i < messageMentions.length; i++) {
        if (usersInMoveeer.has(messageMentions[i].id)) {
          guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
          usersMoved = usersMoved + 1
        } else {
          log.info(message.guild.name + ' - User in wrong channel.')
          message.channel.send('Not moving: ' + messageMentions[i].username + '. Is the user in the voice channel "Moveer"?');
        }
      }
      if (usersMoved > 0) {
        log.info(message.guild.name + ' - Moved ' + usersMoved + ' users.')
        message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + '<@' + authorID + '>');
      }
      // END - Command not sent from moveeradmin, make sure the users are inside Moveer
    }




    
    
}


















function group (args, message) {


  const guild = message.guild; // The guild where the user sends its message
  const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
  const authorID = message.author.id; // The author ID
  const messageMentions = message.mentions.users.array(); // Mentions in the message

  if (args.length < 1 || args === undefined || args === null || args === []) {
    message.channel.send('You need to write a number to identify a gMoveer room!' + '<@' + authorID + '>');
    log.info(message.guild.name + ' - room identifier is missing ')
    return;
  }

  const guildChannels = guild.channels.find(channel => channel.name.toLowerCase() === 'gmoveer' + args[0].toLowerCase())

  if (messageMentions.length > 0) {
    message.channel.send("You're not supposed to @mention members with this command. Try !gmove <roomNumber> instead!" + '<@' + authorID + '>');
    log.info(message.guild.name + ' - User tried to mention while moving groups ')
    return;
  }

  if (guildChannels === null || guildChannels.members == undefined) {
    log.info(message.guild.name + ' - No voice channel called gMoveer' + args[0])
    message.channel.send("Hello, " + '<@' + authorID + '>' +  " There's no voice channel named gMoveer" + args[0]);
    return;
  }

  // Stop people from trying to move people without being inside a voice room
  if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
    message.channel.send("You need to join a voice room before moving people " + '<@' + authorID + '>');
    log.info(message.guild.name + ' - User tried to move people without being inside a voice room')
    return;
  }

  const userVoiceRoomName = guild.channels.get(userVoiceRoomID).name // Name of authors voice room
  if (userVoiceRoomName.toLowerCase().includes('moveer')){
    message.channel.send("You can't move people into this voice room " + '<@' + authorID + '>');
    log.info(message.guild.name + ' - User trying to move people into a moveer channel')
    return;
  }

  // Check that moveer has access to the voice room
  if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
    message.channel.send("Hey! I'm not allowed to move people to this room. I won't join you but discord requires me to have CONNECT privileges to move people! " + '<@' + authorID + '>');
    message.channel.send("Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF")
    log.info(message.guild.name + ' - Moveer is missing CONNECT permission to ')
    return;
  }
  
  // Check that moveer has move members role 
  if (!guild.me.hasPermission('MOVE_MEMBERS')) {
    message.channel.send("Hey! I'm not allowed to move people in this discord :/ Please kick me and reinvite me with 'Move Members' checked." + '<@' + authorID + '>');
    message.channel.send("Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF")
    log.info(message.guild.name + ' - Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot) ')
    return;
  }

  const groupMembersToMove = guildChannels.members.array()
  if (groupMembersToMove.length < 1) {
    message.channel.send("There's no users inside gMoveer" + args[0] + ' <@' + authorID + '>');
    log.info(message.guild.name + ' - No users inside the gMoveer channel ')
    return;
  }

  // No errors in the message, try moving everyone in the @mention
  try{
    usersMoved = 0
    for (var i = 0; i < groupMembersToMove.length; i++) {
      guild.member(groupMembersToMove[i].user.id).setVoiceChannel(userVoiceRoomID);
      usersMoved += 1
    }
    log.info(message.guild.name + ' - Group moved ' + usersMoved + ' users.')
    message.channel.send('Moved ' + usersMoved + ' user' + (usersMoved === 1 ? "" : "s") + ' by request of ' + '<@' + authorID + '>');
  }
  catch (error){
    log.error('Error moving people..')
    log.error(error)
    message.channel.send('Something went wrong... Please contact an Moderator at https://discord.gg/m8gGKUF');
  }


}










module.exports = {
    mentions,
    group
  };