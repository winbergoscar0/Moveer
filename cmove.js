const moveerMessage = require('./moveerMessage.js')
const helper = require('./helper.js')

function move(args, message, command) {
  const messageMentions = message.mentions.users.array(); // Mentions in the message
  const toVoiceChannelName = args[0]
  const toVoiceChannel = message.guild.channels.find(channel => channel.name.toLowerCase() === args[0])

  try {
    helper.checkIfTextChannelIsMoveerAdmin(message)
    helper.checkArgsLength(args, 1)
    helper.checkForUserMentions(message, messageMentions)
    helper.checkIfVoiceChannelExist(message, toVoiceChannel, toVoiceChannelName)
  }
  catch (err) {
    console.log(err)
    moveerMessage.logger(message, command, err.logMessage)
    moveerMessage.sendMessage(message, err.sendMessage)
    return
  }

  // No errors in the message, lets get moving!
  usersMoved = 0
  for (var i = 0; i < messageMentions.length; i++) {
    if (message.guild.members.get(messageMentions[i].id).voiceChannelID === undefined || message.guild.members.get(messageMentions[i].id).voiceChannelID === null) {
      moveerMessage.logger(message, command, 'Not moving user, not in any voice channel!')
      moveerMessage.sendMessage(message, (messageMentions[i] + ' ' + moveerMessage.USER_MENTION_NOT_IN_ANY_CHANNEL))
    } else if (message.guild.members.get(messageMentions[i].id).voiceChannelID === toVoiceChannel.id) {
      moveerMessage.logger(message, command, 'Not moving user, user already in the channel!')
      moveerMessage.sendMessage(message, (messageMentions[i].username + ' ' + moveerMessage.USER_ALREADY_IN_CHANNEL))
    } else {
      message.guild.member(messageMentions[i].id).setVoiceChannel(toVoiceChannel).catch(err => {
        moveerMessage.logger(message, command, err)
      })
      usersMoved = usersMoved + 1
    }
  }
  // Done moving send finish message
  if (usersMoved > 0) {
    moveerMessage.logger(message, command, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users")))
    moveerMessage.sendMessage(message, ('Moved ' + usersMoved + (usersMoved === 1 ? " user" : " users") + ' by request of ' + ' <@' + message.author.id + '>'))
  }
}

module.exports = {
  move
}