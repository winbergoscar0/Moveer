const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  const fromVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === 'moveer')
  const fromVoiceChannelName = helper.getNameOfVoiceChannel(message, fromVoiceChannel.id)
  const authorVoiceRoomId = message.member.voiceChannelID; // ID of the authors voice room
  const authorVoiceChannelName = helper.getNameOfVoiceChannel(message, authorVoiceRoomId)
  const messageMentions = message.mentions.users.array(); // Mentions in the message

  try {
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    helper.checkIfAuthorInsideAVoiceChannel(message, authorVoiceRoomId)
    helper.checkForMovePerms(message)
    helper.checkForConnectPerms(message)
    helper.checkIfSelfMention(message)
    if (message.channel.name.toLowerCase() !== 'moveeradmin') { 
      helper.checkIfVoiceChannelExist(message, fromVoiceChannel, authorVoiceChannelName)
      helper.checkIfVoiceChannelContainsMoveer(message, authorVoiceChannelName)
      helper.checkIfGuildHasTwoMoveerChannels(message)
      helper.checkIfUsersInsideVoiceChannel(message, fromVoiceChannelName, fromVoiceChannel)
    }
  }
  catch (err) {
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  let usersMoved = 0
  if (message.channel.name.toLowerCase() === 'moveeradmin') {
    // START - Command came from moveeradmin, don't requrire users to be inside Moveer
    for (var i = 0; i < messageMentions.length; i++) {
      if (message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined || message.guild.members.get(messageMentions[i].id).voiceChannelID === null) {
        moveerMessage.logger(message, command, 'Not moving user, not in any voice channel!')
        moveerMessage.sendMessage(message, (messageMentions[i] + ' ' + moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL))
      } else if (message.guild.members.get(messageMentions[i].id).voiceChannelID === authorVoiceRoomId) {
        moveerMessage.logger(message, command, 'Not moving user, user already in the channel!')
        moveerMessage.sendMessage(message, (messageMentions[i].username + ' ' + moveerMessage.USER_ALREADY_IN_CHANNEL))
      } else {
        message.guild.member(messageMentions[i].id).setVoiceChannel(authorVoiceRoomId);
        usersMoved = usersMoved + 1
      }
    }
    if (usersMoved > 0) {
      moveerMessage.logger(message, command, ('Admin moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
      moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of ' + ' <@' + message.author.id + '>'))
    }
    // END - Command came from moveeradmin, don't require users to be inside Moveer
  } else {
    // START - Command not sent from moveeradmin, make sure the users are inside Moveer
    for (var i = 0; i < messageMentions.length; i++) {
      const usersInMoveeer = fromVoiceChannel.members; // The members ofthe Moveer voice room
      if (!usersInMoveeer.has(messageMentions[i].id) || message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined) {
        moveerMessage.logger(message, command, 'User not inside "Moveer"')
        moveerMessage.sendMessage(message, ('Not moving: ' + messageMentions[i].username + '. Is the user in the voice channel "Moveer"?'))
      } else {
        message.guild.member(messageMentions[i].id).setVoiceChannel(authorVoiceRoomId);
        usersMoved = usersMoved + 1
      }
    }
    if (usersMoved > 0) {
      moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
      moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of' + ' <@' + message.author.id + '>'))
    }
    // END - Command not sent from moveeradmin, make sure the users are inside Moveer
  }
}




module.exports = {
  move
};