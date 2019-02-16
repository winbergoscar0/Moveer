# Moveer

A discord bot that can move users from a channel to another.

### Installing

Start by installing node.js

After that, install the requirements by running.

```
npm install
```

### Deployment

CD into the project folder then run

```
npm start
```
### Deploy using docker


```
docker build -t <your username>/moveer .
docker run --restart always -d <your username>/moveer
```


### Inside discord

1. Create a voice channel with the name "Moveer"
2. Join a channel (Can be locked/hidden from the user you want to move)
3. Tell the user you want to move to join the "Moveer" voice channel.
4. Write ```!move @username```
5. The user should get moved and the bot should reply with: 

```Moving: <@username>. By request of <@yourUsername>```


### Invite Moveer

Invite the bot using the link below or host it yourself!

[Invite me!](https://discordapp.com/api/oauth2/authorize?client_id=400724460203802624&permissions=8&scope=bot)

