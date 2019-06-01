const moveerMessage = require('./moveerMessage.js')


function move (args, message, command) {
  const textChannelName = message.channel.name
  const authorID = message.author.id; // The author ID
  const guild = message.guild
  const fromVoiceChannel = guild.channels.find(channel => channel.name.toLowerCase() === args[0])
  const toVoiceChannel = guild.channels.find(channel => channel.name.toLowerCase() === args[1])

  if (textChannelName.toLowerCase() !== 'moveeradmin') {
    moveerMessage.logger(message, command, 'Command made outside moveeradmin')
    moveerMessage.sendMessage(message, (moveerMessage.CMOVE_OUTSIDE_MOVEERADMIN + ' <@' + authorID + '>'))
    return;
  }


  if (fromVoiceChannel === null || fromVoiceChannel.members == undefined) {
    moveerMessage.logger(message, command, ('Cant find fromVoiceChannel: ' + args[0]))
    moveerMessage.sendMessage(message, (moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name: "' + args[0] + '" <@' + authorID + '>'))
    return;
  }

  if (toVoiceChannel === null || toVoiceChannel.members == undefined) {
    moveerMessage.logger(message, command, ('Cant find ToVoiceChannel: ' + args[1]))
    moveerMessage.sendMessage(message, (moveerMessage.NO_VOICE_CHANNEL_NAMED_X + 'the name: "' + args[1] + '" <@' + authorID + '>'))
    return;
  }

  if (args[0] === args[1]) {
    moveerMessage.logger(message, command, 'Same voicechannel name')
    moveerMessage.sendMessage(message, moveerMessage.VOICE_CHANNEL_NAMES_THE_SAME + ' <@' + authorID + '>')
    return;
  }

  const groupMembersToMove = fromVoiceChannel.members.array()
  if (groupMembersToMove.length < 1) {
    moveerMessage.logger(message, command, ('No users inside the channel: ' + args[0]))
    moveerMessage.sendMessage(message, (moveerMessage.NO_USERS_INSIDE_ROOM + ':  '+ args[0] + ' <@' + authorID + '>'))
    return;
  }

    // No errors in the message, lets get moving!
    usersMoved = 0
    for (var i = 0; i < groupMembersToMove.length; i++) {
      guild.member(groupMembersToMove[i].user.id).setVoiceChannel(toVoiceChannel.id);
      usersMoved += 1
    }
    moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
    moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of' + ' <@' + authorID + '>'))



  }














module.exports = {
  move
}