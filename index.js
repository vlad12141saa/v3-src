const Cluster = require('discord-hybrid-sharding');
const {  WebhookClient, EmbedBuilder } = require("discord.js");
let startLogs = new  WebhookClient({ url: `https://discord.com/api/webhooks/1128777855657066656/hPScQgaGNw2MP8oLLQVCDkAb-8ZAIQ9yF7C1fyNHJfMbi8Vd8D1CEMwjKC02_63n6hXK` });
const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
    totalShards: 2, // or 'auto'
    /// Check below for more options
    shardsPerClusters: 5,
    totalClusters: 'auto',
    mode: 'process', // you can also choose "worker"
    keepAlive: {
        interval: 7000, // Interval to send a heartbeat
        maxMissedHeartbeats: 4, // Maximum amount of missed Heartbeats until Cluster will get respawned
        maxClusterRestarts: 100, // Maximum Amount of restarts that can be performed in 1 hour in the HeartbeatSystem
    },
    token: 'MTExNzMzNjg3ODcxNTI1NjgzMg.GpHmTw.pu_PD1cp-y4kfEiB3y4ibDcwJUZTyDkBE-XDoo',
});
try {
manager.on('clusterCreate', cluster => {
    console.log(`Launched Cluster ${cluster.id}`);
    let embed = new EmbedBuilder()
        .setTitle(`🆙・Launching cluster`)
        .setDescription(`A cluster has just been launched`)
        .addFields(
            { name: 'Shard ID', value: `${cluster.id + 1}` },

        )
       .setColor('#2c2d31')
    startLogs.send({
        embeds: [embed],
    });
});
manager.spawn({ timeout: -1 });
} catch (error) {
console.error(error)
}
