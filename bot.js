const { ShardingManager } = require('discord.js')
const config = require('./config.js')

const manager = new ShardingManager('./main.js', { token: config.discordToken, autoSpawn: true, respawn: true })

manager.on('shardCreate', (shard) => console.log(`[SHARD-LAUNCH] Shard ${shard.id + 1}/${shard.manager.totalShards}`))
manager.spawn(0)
