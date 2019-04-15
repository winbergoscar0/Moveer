const Discord = require('discord.js');
const client = new Discord.Client();

const opts = {
  timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts);

// TOKEN
const config = require('./config.js');
const token = config.discordToken;

if (config.discordBotListToken !== 'x') {
  // Only run if bot is public at discordbotlist.com
  const DBL = require("dblapi.js");
  const dbl = new DBL(config.discordBotListToken, client);
  dbl.on('posted', () => {
    log.info('Posted Server count to DBL')
  })

  dbl.on('error', e => {
    log.warn (`DBL Error!:  ${e}`)
  })
}


client.on('ready', () => {
  log.info('Startup successful.')
});

// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return;
  if (message.author.bot) return;
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'move') {
    const userVoiceRoomID = message.member.voiceChannelID; // ID of the authors voice room
    const authorID = message.author.id; // The author ID
    const guild = message.guild; // The guild where the user sends its message
    const messageMentions = message.mentions.users.array(); // Mentions in the message
    const guildChannels = guild.channels.find(channel => channel.name === 'Moveer'); // Search for the voiceroom Moveer

    
    // Check for errors in the message
    // Make sure there's a voice room called Moveer
    if (guildChannels === null || guildChannels.members == undefined) {
      log.info(message.guild.name + ' - No voice channel called Moveer')
      message.channel.send('Hello, You need to create a voice channel named "Moveer" \nDo you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF ');
      return;
    }
    const usersInMoveeer = guildChannels.members; // The members ofthe Moveer voice room
    // Make sure the user @mentions someone
    if (args < 1) {
      message.channel.send('You need to @mention a friend!' + '<@' + authorID + '>');
      log.info(message.guild.name + ' - @Mention is missing ')
      return;
    }
    
    // Stop people from trying to move people into Moveer
    if (usersInMoveeer.has(authorID)){
      message.channel.send("You can't move people into this voice room " + '<@' + authorID + '>');
      log.info(message.guild.name + ' - User trying to move people into Moveer')
      return;
    }

    // Stop people from trying to move people without being inside a voice room
    if (userVoiceRoomID === undefined || userVoiceRoomID === null) {
      message.channel.send("You need to join a voice room before moving people " + '<@' + authorID + '>');
      log.info(message.guild.name + ' - User tried to move people without being inside a voice room')
      return;
    }

    // Check that moveer has access to the voice room
    if (!message.member.voiceChannel.memberPermissions(guild.me).has('CONNECT')) {
      message.channel.send("Hey! I'm not allowed to move people to this room. Please give me permissions to connect to this voice channel. \nDo you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF " + '<@' + authorID + '>');
      log.info(message.guild.name + ' - Moveer is missing CONNECT permission to ')
      return;
    }

    // Check that moveer has move members role 
    if (!guild.me.hasPermission('MOVE_MEMBERS')) {
      message.channel.send("Hey! I'm not allowed to move people in this discord :/ Please kick me and reinvite me with 'Move Members' checked. \nDo you need support? Join us at the official discord and tag a moderator! https://discord.gg/m8gGKUF " + '<@' + authorID + '>');
      log.info(message.guild.name + ' - Moveer is missing Move Members permission (Missing when adding to the discord, reinvite the bot) ')
      return;
    }

    // No errors in the message, try moving everyone in the @mention
    for (var i = 0; i < messageMentions.length; i++) {
      if (usersInMoveeer.has(messageMentions[i].id)) {
        log.info(message.guild.name + ' - Moving a user')
        message.channel.send('Moving: ' + messageMentions[i] + '. By request of ' + '<@' + authorID + '>');
        guild.member(messageMentions[i].id).setVoiceChannel(userVoiceRoomID);
      } else {
        if (messageMentions[i].id === authorID) {
          // Stop people from trying to move themself
          message.channel.send("You need to @mention a friend you want to move, not yourself! :) " + messageMentions[i]);
          log.info(message.guild.name + ' - User trying to move himself')
          return;
        }
        log.info(message.guild.name + ' - User in wrong channel.')
        message.channel.send('Not moving: ' + messageMentions[i].username + '. Is the user in the correct voice channel? (Moveer)');
      }
    }
  }
});

client.login(token);
