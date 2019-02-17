# discord_botMover

A discord bot that can move users from a channel to another.

### Requirements

```
node.js
discord.js
```

### Installing

Start by installing node.js

After that, install the discord.js requirement to run the app.

```
npm install discord.js
```

### Deployment

CD into the project folder then run

```
node main.js
```


### Inside discord

1. Create a voice channel with the name "Moveer"
2. Join a channel (Can be locked/hidden from the user you want to move. The channel should also have a userlimit of 1)
3. Tell the user you want to move to join the "Moveer" voice channel.
4. Write ```!move @username```
5. The user should get moved and the bot should reply with: 

```Moving: <@username>. By request of <@yourUsername>```
