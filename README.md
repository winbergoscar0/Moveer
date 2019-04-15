
# Moveer
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


### Inside discord
![](https://media.giphy.com/media/S3moCmPvbhJCObeFkb/giphy.gif)
1. Create a voice channel with the name "Moveer"
2. Join a channel (Can be locked/hidden from the user you want to move. The channel should also have a userlimit of 1)
3. Tell the users you want to move to join the "Moveer" voice channel.
4. Write ```!move @username```
5. The user should get moved and the bot should reply with: 

```Moving: <@username>. By request of <@yourUsername>```


### Want to try it out? Or do you need support? Join the official Moveer discord!
Join us with the following link https://discord.gg/KqaEfhb and tag a moderator for assistance!
### Invite Moveer to your discord using the link below!

Invite the bot to your server using the link below or host it yourself!

[Invite me!](https://discordapp.com/api/oauth2/authorize?client_id=400724460203802624&permissions=16777216&scope=bot)

