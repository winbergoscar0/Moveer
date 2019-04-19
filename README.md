
# Moveer
[![Discord Bots](https://discordbots.org/api/widget/status/400724460203802624.svg?noavatar=true)](https://discordbots.org/bot/400724460203802624)
[![BuyMeACoffee](https://img.shields.io/badge/BuyMeACoffee-Donate-ff813f.svg?logo=CoffeeScript&style=flat-square)](https://www.buymeacoffee.com/Moveer)
[![Discord Chat](https://img.shields.io/discord/546695271242006549.svg)](https://discord.gg/KqaEfhb)

A discord bot that can move users from one channel to another. Inlcuding locked and hidden voice rooms!

### Installing

Start by installing node.js

After that, install the requirements by running ```npm install```

Then open the project folder and rename example.config.js to config.js and replace x with your Developer Bot token.

Finally run ```npm start```

### Deploy using docker

Start by renaming the example.config.js to config.js and replace x with your Developer Bot token
```
docker build -t moveer .
docker run --restart always -d -e TZ=Your/Timezone moveer
```

### How to operate the bot using commands.

** You can only move people if they are in the Moveer/gMoveer channel unless you have access to "#adminmoveer" text channel, (then you can move them from any voicechannel). **

1. If you want to move a single user they will have to join the voice channel called "Moveer". Then use the command ```!move @username.``` (Notice that you can also tag multiple people and it will still move all of them).

2. Instead of using many @tags to move people you can use our group function! In order for this to work you will have to create a voice channel called "gMoveer [insert name here]" then use the command ```!gmove [name of the channel].``` For example the voice channel name is gMoveerOverwatch. The commands becomes ```!gmove overwatch)```

3. In order to use the "admin" version of the bot you will have to create a text channel named "adminmoveer". In this textchannel the bot will move people with the command ```!move @username``` (can be more than 1 user) even if they aren't in the "Moveer" channel.


### Want to try it out? Or do you need support? Join the official Moveer discord!
Join us with the following link https://discord.gg/KqaEfhb and tag a moderator for assistance!
### Invite Moveer to your discord using the link below!

Invite the bot to your server using the link below or host it yourself!

[Invite me!](https://discordapp.com/api/oauth2/authorize?client_id=400724460203802624&permissions=16777216&scope=bot)

