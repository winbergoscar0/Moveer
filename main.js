const Discord = require('discord.js');
const client = new Discord.Client();

// TOKEN
const config = require('./config.js');
const token = config.discordToken;

client.on('ready', () => {
  console.log(new Date().toLocaleTimeString() + ' - I am ready!');
});

// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return;
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'move') {
    console.log(message.guild.name);
    if (args < 1) {
      message.channel.send('I think you forgot to @mention someone?');
      console.log(new Date().toLocaleTimeString() + ' - ' + message.guild.name + ' - @Mention is missing');
    }
    // The voice channel ID the author of the message sits in
    const userVoiceRoomID = message.member.voiceChannelID;
    // The authors ID
    const authorID = message.author.id;
    // Which server the message comes from
    const guild = message.guild;

    // Mentions in the message
    const messageMentions = message.mentions.users.array();
    const guildChannels = guild.channels.find(channel => channel.name === 'Moveer');
    if (guildChannels === null || guildChannels.members == undefined) {
      // There's no voice channel named "Moveer"
      console.log(new Date().toLocaleTimeString() + ' - ' + message.guild.name + ' - No voice channel called Moveer');
      message.channel.send('Theres no voice channel named Moveer');
    } else {
      const usersInMoveeer = guildChannels.members;
      // What to send in the discord channel
      for (var i = 0; i < messageMentions.length; i++) {
        if (usersInMoveeer.has(messageMentions[i].id)) {
          console.log(new Date().toLocaleTimeString() + ' - ' + message.guild.name + ' - Moving a user');
          message.channel.send(
            'Moving: ' +
              messageMentions[i] +
              '. By request of ' +
              '<@' +
              authorID +
              '>'
          );
          guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
        } else {
          console.log(new Date().toLocaleTimeString() + ' - ' + message.guild.name + ' - Not moving a user. User in wrong channel.');
          message.channel.send(
            'Not moving: ' +
              messageMentions[i].username +
              '. Is the user in the correct voice channel?'
          );
        }
      }
    }
  }
});

client.login(token);
