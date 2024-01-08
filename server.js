const Stats = require('sharding-stats');

const express = require("express");
const app = express();

const StatsServer = new Stats.Server(app, {
  selfhost: false,
    bot: {
        name: "freso",
        icon: "https://cdn.discordapp.com/avatars/1117336878715256832/066895e2177b7a821ffa54a0df3dfc23.jpg",
        website: "http://uptime.freso.lol/",
        client_id: "1117336878715256832",
        client_secret: "29QCQ5wXr4J8LglfEhpOWvpkjW5ssFJJ"
    },
    stats_uri: "http://uptime.freso.lol/", //Base URL
    redirect_uri: "http://uptime.freso.lol/login", //Landing Page
    owners: ["1102905025421918251", "Bot_Owner2"],
    authorizationkey: "freso",
})

StatsServer.on('error', console.log)

app.listen(80, () => {
  console.log("Application started, listening on port 80!");
});
function receiveStatsDataManually() {
  return StatsServer.getStatsData(); // { raw, pretty }; // (raw|pretty).(shards|total);
}