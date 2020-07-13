const { ShardingManager } = require('discord.js')
const config = require('./config.js')

const manager = new ShardingManager('./main.js', { token: config.discordToken, autoSpawn: true })

manager.spawn(5)
manager.on('launch', (shard) => console.log(`[SHARD-LAUNCH] Shard ${shard.id}/${shard.manager.totalShards}`))
manager.on('shardCreate', (shard) => console.log(`[SHARD-LAUNCH] Shard ${shard.id}/${shard.manager.totalShards}`))
