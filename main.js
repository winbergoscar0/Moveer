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

// Listen for messages
client.on('message', message => {
  if (!message.content.startsWith(config.discordPrefix)) return;
  if (message.author.bot) return;
  const args = message.content.slice(config.discordPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'move') {
    log.info('Moving @mentions....')
    move.mentions(args, message)
  }

  if (command === 'gmove') {
    log.info('Moving group....')
    move.group(args, message)
  }
});

client.login(token);
