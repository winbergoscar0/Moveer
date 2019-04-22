const Discord = require('discord.js');
const client = new Discord.Client();

const opts = {
  timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
const log = require('simple-node-logger').createSimpleLogger(opts);

// TOKEN
const config = require('./config.js');
const token = config.discordToken;

const move = require('./move.js')

if (config.discordBotListToken !== 'x') {
  // Only run if bot is public at discordbotlist.com
  const DBL = require("dblapi.js");
  const dbl = new DBL(config.discordBotListToken, client);
  dbl.on('posted', () => {
    log.info('Posted Server count to DBL. Member of (' + client.guilds.array().length + ') servers')
  })

  dbl.on('error', e => {
    log.warn (`DBL Error!:  ${e}`)
  })
}

client.on('ready', () => {
  log.info('Startup successful.')
  console.log()
});

client.on('guildCreate', (guild) => {
  const welcomeMessage = 'Hello and thanks for inviting me! If you need help or got any questions, please head over to the official Moveer discord at https://discord.gg/8BXKe9g'
  const supportMessage = 'To get started, please follow the guide below\n 1. Create a voice channel and name it "Moveer".\n 2. Ask your friends to join "Moveer"\n 3. Join any voice channel except "Moveer"\n 4. Write `!move @friend1 @friend2`\n 5. Thats it! @friend1 & @friend2 should be moved to your voice channel'
  log.info('Joined a new server: ' + guild.name)
  let defaultChannel = "";
  guild.channels.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
      if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  })
  defaultChannel.send(welcomeMessage)
  defaultChannel.send(supportMessage)
})


// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return;
  if (message.author.bot) return;
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'move') {
    log.info('------------------ Moving @mentions ------------------')
    move.mentions(args, message)
    log.info('------------------------------------------------------')
  }

  if (command === 'gmove') {
    log.info('-------------------- Moving Group --------------------')
    move.group(args, message)
    log.info('------------------------------------------------------')
  }

  if (command === 'cmove') {
    log.info('-------------------- Moving Cmove --------------------')
    move.cmove(args, message)
    log.info('------------------------------------------------------')
  }
});

client.login(token);
