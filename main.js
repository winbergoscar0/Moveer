const Discord = require('discord.js');
const client = new Discord.Client();

// TOKEN
const token = 'SUPERSECRET';


client.on('ready', () => {
  console.log('I am ready!');
});

// Listen for messages
client.on('message', message => {
  if (message.content.indexOf('!move') >= 0) {

    // The voice channel ID the author of the message sits in
    const userVoiceRoomID = message.member.voiceChannelID
    // The authors ID
    const authorID = message.author.id
    // The content of the message
    const messageContent = message.content
    // Which server the message comes from
    const guild = message.guild

    // Mentions in the message
    const messageMentions = message.mentions.users.array()
    const usersInMoveeer = guild.channels.get('400060174624227329').members //.map(user => user.id).join("\n")
    
    
    // What to send in the discord channel
    for (i = 0; i < messageMentions.length; i++) {
        if(usersInMoveeer.has(messageMentions[i].id)){
            message.channel.send("Moving: " + messageMentions[i] + ". By request of " + "<@" + authorID + ">")
            guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID)
        }else{
            message.channel.send("Not moving: " + messageMentions[i] + ". Are you in the wrong channel?")
        }
    } 
  }
});


client.login(token);
