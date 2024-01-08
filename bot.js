const {  WebhookClient } = require("discord.js");
const { AuditLogEvent } = require('discord.js');
const emoji = require("./emoji.json")
const mongoose = require("mongoose")
// zeyad help
const fetch = require(`node-fetch`);
let Color = `#2c2d31`;
  const wait = require('util').promisify(setTimeout);

const { loadEvents } = require("./handlers/loadEvents");
const format = require(`humanize-duration`);
const voicemaster = require("./database/guildData/voicemastersettings");
const voicemastersusers = require("./database/guildData/voicemaster");
const fs = require("fs");
const greet = require(`./database/guildData/greet.js`)
const autopfp  = require(`./database/guildData/autopfp.js`)
const afk  = require(`./database/guildData/afk.js`)
const { QuickDB } = require("quick.db");
const db = new QuickDB();
let wb = new QuickDB();
const { loadSlashCommands } = require("./handlers/loadSlashCommands")
//const { loadModel } = require("./handlers/Modal")
const moment = require("moment");
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const StickyDB = require("./database/guildData/sticky");
const levels = require("./database/guildData/levels");
const punish = require(`./database/guildData/punish`);
const antinuke = require(`./database/antinuke/antinuke`);
const whitelist = require(`./database/antinuke/whitelisted`);
const discord = require("discord.js");
const { ActionRowBuilder, ActivityType, PermissionsBitField,TextInputBuilder,TextInputStyle, ChannelType,UserSelectMenuBuilder, ModalBuilder, SelectMenuBuilder, ButtonStyle, Events, ButtonBuilder, EmbedBuilder } = require('discord.js');
// https://media.discordapp.net/attachments/892670946828230667/892720544280117288/019.gif
const Cluster = require('discord-hybrid-sharding');
const Discord = require("discord.js");
const Stats = require('sharding-stats');

const client = new Client({

    shards: Cluster.data.SHARD_LIST, // An array of shards that will get spawned
    shardCount: Cluster.data.TOTAL_SHARDS, // Total number of shards
  intents: [
GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildWebhooks, 
  	GatewayIntentBits.GuildBans, 
     GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
   	GatewayIntentBits.GuildMembers, 
     GatewayIntentBits.GuildEmojisAndStickers
  ],
  fetchAllMembers: true,
restRequestTimeout: 15000,
restGlobalRateLimit: 0,

partials: [
  Partials.Channel,
  Partials.Message,
  Partials.User,
  Partials.GuildMembers,
],
restSweepInterval: 60,
restTimeOffSet: 0,
restWsBridgeTimeout: 5000,
retryLimit: 500,
    ws: {
    properties: {
        browser: "Discord iOS",
    },
},
});
const Poster = new Stats.Client(client, {
  stats_uri: 'http://uptime.freso.lol/',
  authorizationkey: "freso",
})
client.cluster = new Cluster.Client(client);
loadEvents(client);
client.posting = {};
client.queue = new Map();
client.setMaxListeners(0);
const MessageEmbed = EmbedBuilder;
const MessageActionRow = ActionRowBuilder;
const MessageButton = ButtonBuilder;
const MessageSelectMenu = SelectMenuBuilder;

const { loadPlayerEvents } = require("./handlers/LoadPlayerEvents");
client.vote = new Map();
const Enmap = require("enmap")
client.slash = new discord.Collection();
client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.error = `#FFFF00`;
require("./handlers/guildslash")(client);
 client.array = [];
const {

  Welcome_Images,
} = require("./config.js");
client.embed = async function (interaction, msg) {
interaction.followUp({ 
  components: [],
  embeds: [new EmbedBuilder()
    .setDescription(`${msg}`)
  .setColor(Color)],
}).catch((e) => {
  interaction.reply({ 
    components: [],
    embeds: [new EmbedBuilder()
      .setDescription(`${msg}`)
    .setColor(Color)],
  })
})
}
client.db = require("croxydb")
process.on("unhandledRejection", (reason, promise) => {
  console.log(
    "[FATAL] Possibly Unhandled Rejection at: Promise ",
    promise,
    " reason: ",
    reason.message
  );

});
loadSlashCommands(client);
client.setXP = async function (userId, guildId, xp) {
  const user = await levels.findOne({ userID: userId, guildID: guildId });
  if (!user) return false;

  user.xp = xp;
  user.level = Math.floor(0.1 * Math.sqrt(user.xp));
  user.lastUpdated = new Date();

  user.save();

  return user;
}

client.setLevel = async function (userId, guildId, level) {
  const user = await levels.findOne({ userID: userId, guildID: guildId });
  if (!user) return false;

  user.level = level;
  user.xp = level * level * 100;
  user.lastUpdated = new Date();

  user.save();

  return user;
}

client.addXP = async function (userId, guildId, xp) {
  const user = await levels.findOne({ userID: userId, guildID: guildId });

  if (!user) {
      const newUser = new levels({
          userID: userId,
          guildID: guildId,
          xp: xp,
          level: Math.floor(0.1 * Math.sqrt(xp))
      }).save();

      return (Math.floor(0.1 * Math.sqrt(xp)) > 0);
  }

  user.xp += parseInt(xp, 10);
  user.level = Math.floor(0.1 * Math.sqrt(user.xp));
  user.lastUpdated = new Date();

  await user.save();

  return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);
}

client.addLevel = async function (userId, guildId, level) {
  const user = await levels.findOne({ userID: userId, guildID: guildId });
  if (!user) return false;

  user.level += parseInt(level, 10);
  user.xp = user.level * user.level * 100;
  user.lastUpdated = new Date();

  user.save();

  return user;
}

client.fetchLevels = async function (userId, guildId, fetchPosition = true) {
  const user = await levels.findOne({
      userID: userId,
      guildID: guildId
  });
  if (!user) return false;

  if (fetchPosition === true) {
      const leaderboard = await levels.find({
          guildID: guildId
      }).sort([['xp', 'descending']]).exec();

      user.position = leaderboard.findIndex(i => i.userID === userId) + 1;
  }

  user.cleanXp = user.xp - client.xpFor(user.level);
  user.cleanNextLevelXp = client.xpFor(user.level + 1) - client.xpFor(user.level);

  return user;
}

client.xpFor = function (targetLevel) {
  return targetLevel * targetLevel * 100;
}
const cooldown = new Set();
client.on("messageCreate", async message => {
  if(message.author.bot) return;
  if (message.channel.type === Discord.ChannelType.DM) {
    const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1127488610090885160/XXgMMNM5rk4Fm97iZpqkS4CQhk0vZo70mUWZ2jJJ0wrqsUr_qZbUSUxCtv5qwig2eqne' });
  message.reply(`${emoji.success} Hey ${message.author}, for support and concerns join here: https://discord.gg/WJhUSDw4pM`).then((m) => {
    setTimeout(() => {
      m.delete();
    }, 60000)
  })
    let embedLogs = new Discord.EmbedBuilder()
      .setTitle(`💬・New DM message!`)
      .setDescription(`Bot has received a new DM message!`)
      .addFields(
        { name: "👤┆Send By", value: `${message.author} (${message.author.tag})`, inline: true },
        { name: `💬┆Message`, value: `${message.content || "None"}`, inline: true },
      )
      .setColor(Color)
      .setTimestamp();
  
    if (message.attachments.size > 0)
      embedLogs.addFields(
        { name: `📃┆Attachments`, value: `${message.attachments.first()?.url}`, inline: false },
      )
    return webhookClient.send({
      embeds: [embedLogs],
    });
  }
  if(!message.guild) returm;

  afk.findOne(
    { Guild: message.guild.id, User: message.author.id },
    async (err, data) => {
      if (data) {
        await afk.deleteOne({
          Guild: message.guild.id,
          User: message.author.id,
        });

         
          message.reply(`🤟🏾 welcome back ${message.author}, you've been **afk since** ${data.Date}.`).then(async (m) => {
          });

        if (message.member.displayName.startsWith(`[AFK] `)) {
          let name = message.member.displayName.replace(`[AFK] `, ``);
          message.member.setNickname(name).catch((e) => { });
        }
      }
    }
  );

  message.mentions.users.forEach(async (u) => {
    if (
      !message.content.includes("@here") &&
      !message.content.includes("@everyone")
    ) {
      afk.findOne(
        { Guild: message.guild.id, User: u.id },
        async (err, data) => {
          if (data) {
        message.reply({ embeds: [new EmbedBuilder()
        .setDescription(`${u} has been afk since ${data.Date}! **Reason:** ${data.Message}`)
        .setColor(Color)
        ]})
          }
        }
      );
    }
  }); 
  const Leval = require("./database/guildData/functions");

const messageSchema = require("./database/guildData/levelmessages");
const levelRewards = require("./database/guildData/levelrewards");
const levelLogs = require("./database/guildData/levelchannels");

if (cooldown.has(message.author.id)) return;
Leval.findOne({ Guild: message.guild.id }, async (err, data) => {
if(!data) {
  return new Leval({ 
    Guild: message.guild.id,
  Levels: true,
 }).save(); 
}
    if (data) {
   //   console.log('2')
      if (data.Levels == true) {
    //    console.log('3')
        const randomXP = Math.floor(Math.random() * 15.5) + 1.5;
        const hasLeveledUp = await client.addXP(
          message.author.id,
          message.guild.id,
          randomXP
        );
        cooldown.add(message.author.id);

        setTimeout(() => {
          cooldown.delete(message.author.id);
        }, 30000 / 2); 

        if (hasLeveledUp) {
          const user = await client.fetchLevels(
            message.author.id,
            message.guild.id
          );

          const levelData = await levelLogs.findOne({
            Guild: message.guild.id,
          });
          const messageData = await messageSchema.findOne({
            Guild: message.guild.id,
          });
     
          levelRewards.findOne(
            { Guild: message.guild.id, Level: user.level },
            async (err, data) => {
              if (data) {
                message.guild.members.cache
                  .get(message.author.id)
                  .roles.add(data.Role)
                  .catch((e) => { console.log(e)});
              }
            }
          );
          const dmrow = new ActionRowBuilder().addComponents(
            new MessageButton()
            .setLabel(`Level gained in ${message.guild.name}`)
 
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
           
        );

          if (data.LevelAnnouce == true) { 
          if (data.LevelDM === true) {
            let levelMessage =  `{member_mention}, you are now **level {member_level}**`;
            if(messageData && messageData.Message) levelMessage = messageData.Message;
            levelMessage = levelMessage.replaceAll(
              `{member_username}`,
              message.author.username
            );
            levelMessage = levelMessage.replaceAll(
              `{member_discriminator}`,
              message.author.discriminator
            );
            levelMessage = levelMessage.replaceAll(
              `{member_tag}`,
              message.author.tag
            );
            levelMessage = levelMessage.replaceAll(
              `{member_mention}`,
              message.author
            );

            levelMessage = levelMessage.replaceAll(`{member_level}`, user.level);
            levelMessage = levelMessage.replaceAll(`{member_xp}`, user.xp);
            levelMessage = levelMessage.replaceAll(`{server_icon}`, message.guild.iconURL({dynamic:true}) || null);
            levelMessage = levelMessage.replaceAll(`{server_name}`, message.guild.name || null);
            levelMessage = levelMessage.replaceAll(`{server_id}`, message.guild.id || null);
            if(message.author.displayAvatarURL()) { 
            levelMessage = levelMessage.replaceAll(`{member_pfp}`, message.author?.displayAvatarURL({ }) || null);
            }
            if(levelMessage.startsWith("{") && levelMessage.endsWith("}")){
      
              let emb = JSON.parse(levelMessage);
                  return  message.author.send(emb)
                  }
                  return message.author.send({ components: [dmrow], content: levelMessage }).catch(e => {
                    console.log(e)
                  })

          } else if(!data.LevelDM || data.LevelDM === false) {
            console.log('Data level annouce normal is on')

            var levelMessage =  `{member_mention}, you are now **level {member_level}**`;
            if(messageData && messageData.Message) levelMessage = messageData.Message;
            levelMessage = levelMessage.replaceAll(
              `{member_username}`,
              message.author.username
            );
            levelMessage = levelMessage.replaceAll(
              `{member_discriminator}`,
              message.author.discriminator
            );
            levelMessage = levelMessage.replaceAll(
              `{member_tag}`,
              message.author.tag
            );
            levelMessage = levelMessage.replaceAll(
              `{member_mention}`,
              message.author
            );

            levelMessage = levelMessage.replaceAll(`{member_level}`, user.level);
            levelMessage = levelMessage.replaceAll(`{member_xp}`, user.xp);
            levelMessage = levelMessage.replaceAll(`{server_icon}`, message.guild.iconURL({dynamic:true}) || null);
            levelMessage = levelMessage.replaceAll(`{server_name}`, message.guild.name || null);
            levelMessage = levelMessage.replaceAll(`{server_id}`, message.guild.id || null);
            if(message.author.displayAvatarURL()) { 

            levelMessage = levelMessage.replaceAll(`{member_pfp}`, message.author?.displayAvatarURL({dyanmic: true}) || null);
            }
           try { 
             if (levelData) {
              if(levelMessage.startsWith("{") && levelMessage.endsWith("}")){
      
                let emb = JSON.parse(levelMessage);
                    return  message.guild.channels.cache
                    .get(levelData.Channel)
                    .send(emb)
                    } else { 

              await message.guild.channels.cache
                .get(levelData.Channel)
                .send({ content: `${levelMessage || `${message.author}, you are now **level ${user.level}**`}` })
                .catch(() => { });
                    }
            } else {
              if(levelMessage.startsWith("{") && levelMessage.endsWith("}")){
      
                let emb = JSON.parse(levelMessage);
                    return await message.channel.semd(emb)
                    } else { 
              await message.channel.send({ content: levelMessage });
                    }
            }
          } catch {
            if(levelMessage.startsWith("{") && levelMessage.endsWith("}")){
      
              let emb = JSON.parse(levelMessage);
                  return await message.channel.semd(emb)
                  } else { 
            await message.channel.send({ content: `${levelMessage || `${message.author}, you are now **level ${user.level}**`}` })
                  }
          }
          }
        }
      }
      }
    }
  }); 

if(message.author.bot) return;
  const args2 = message.content
    .slice(2)
    .trim()
    .split(" ");
  if (message.content.includes(args2))
    if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {

      const roew = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel(`Invite me`)
            .setStyle(ButtonStyle.Link)

            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`),
          new MessageButton()
          .setLabel('Support Server')
          .setStyle(ButtonStyle.Link)

          .setURL("https://discord.gg/fleed"),
        )

              message.reply({  content: `bot only supports ** [/] slash commands**.`})

    }
})
client.on('modalSubmit', async (modal) => {
	if (modal.customId === 'modal-customid') {
    let interaction = modal;
	 const { member, user, guild } = modal;
    const DB1 = require(`./database/guildData/SuggestDB`)
        const DB2 = require(`./database/guildData/SuggestSetupDB`)
          const input = interaction.getTextInputValue("Suggestion_Modal");

  const Data = await DB2.findOne({ GuildID: interaction.guild.id });

  if (!Data) { return interaction.reply({ embeds: [ new MessageEmbed().setColor(client.error).setDescription(`⚠️ This server must setup the suggestion system`) ], ephemeral: true }) }

  const ID = new Array(8).join().replace(/(.|$)/g, function () { return ((Math.random() * 36) | 0).toString(36) [Math.random() < 0.5 ? "toString" : "toUpperCase"](); });

  await guild.channels.cache.get(Data.SuggestChannel).send({ embeds: [ new MessageEmbed().setColor(Color).setAuthor({ name: `${user.tag}`, iconURL: user.avatarURL({ dynamic: true }) }).addFields({ name: "Suggestion:", value: `${input}`, inline: false }, { name: "User ID", value: `\`${user.id}\``, inline: true }, { name: "Status", value: "`Pending`", inline: true }, { name: "ID", value: `\`${ID}\``, inline: true }) ] }).then(async (Message) => {
 Message.react(`${emoji.success}`);
Message.react(`${emoji.error}`);

  await DB1.create({ GuildID: interaction.guild.id, MessageID: Message.id, Details: [ { MemberID: member.id, SuggestionID: ID, SuggestionMessage: input } ] }).catch((err) => console.log(err));

  await interaction.reply({ embeds: [ new MessageEmbed().setColor(Color).setDescription(`${emoji.success} Your [suggestion](${Message.url}) was successfully sent`) ], ephemeral: true });

  await user.send({ embeds: [ new MessageEmbed().setThumbnail(guild?.iconURL({dynamic:true})).setColor(Color).setDescription(`Thanks for submitting a suggestion in: **${guild.name}**`).setFields({ name: "Your suggestion:", value: `\`\`\`${input}\`\`\`` }).setAuthor({ name: `${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) }) ] }).catch((err) => { console.log(err); }) });


	}
});

const Guild = require(`./database/guildData/autostatus`);
const internal = require("stream");

client.on("presenceUpdate", async (oP, nP) => {
if(!nP || !oP) return;
if(!nP.guild || !oP.guild) return;
   const hasSetup = await Guild.findOne({ id: nP.guild.id });
let newPresence = nP;
  let oldPresence = oP;
  
  if (!hasSetup) return
  let guild = oP.guild;
let textInStats = hasSetup.statusmessage;
  let roleId = hasSetup.role;
  let log = hasSetup.log;

    if(nP){

        //get user from guild
        var m = guild.members.cache.get(nP.userId);
        //if not received, fetch it
        if(!m || !m.roles) m = await guild.members.fetch(nP.userId).catch(()=>{}) || false;
        //return if still not in guild
        if(!m) return; 
        //if the status is right, then...
        if(nP.activities.some(({ state }) => state?.match(textInStats))) {

            if(!m.roles.cache.has(roleId)) { // add role if user doesn't have it
                m.roles.add(roleId).then(() => { 
guild.channels.cache.get(log).send({
    embeds: [new MessageEmbed()
            .setAuthor({ name: `${m.user.tag}`, iconURL: m.user.displayAvatarURL({dynamic: true}) })
.setColor(Color)
.setThumbnail(m.user?.displayAvatarURL())
            .setDescription(`${emoji.success} **${m.user.tag}** updated thier status with matching context **${textInStats}**, they have been given <@&${roleId}> role.`)
            .setFooter({ text: `User ID: ${m.user.id}`})]
  })

});
                
            }
        } else {
            if(m.roles.cache.has(roleId)) { //removes role if user has it
                m.roles.remove(roleId).then(() => {
guild.channels.cache.get(log).send({
    embeds: [new MessageEmbed()
            .setAuthor({ name: `${m.user.tag}`, iconURL: m.user.displayAvatarURL({dynamic: true}) })
         
.setColor(Color)
.setThumbnail(m.user?.displayAvatarURL())
.setDescription(`${emoji.error} **${m.user.tag}** updated thier status and removed the matching context **${textInStats}**, they have been removed from the <@&${roleId}> role.`)
            .setFooter({ text: `User ID: ${m.user.id}`})]})
});
              

            }
        }
    }
})
client.embed = MessageEmbed;
client.row = MessageActionRow;
client.button = MessageButton;
client.menu = MessageSelectMenu;
client.cap = 
client.error = (err, msg) => msg.channel.send({
    embeds: [new MessageEmbed()
.setTitle("Error")
.setColor("RED")
.setDescription(err)]
})

client.on("interactionCreate", async i => {
  let interaction = i;
  
  let find = await db.get(`alerti${i.user.id}`);
  if(!find) {
 await  db.set(`alerti${i.user.id}`, Date.now());
    let embed = new MessageEmbed()
    .setAuthor({ name: `Welcome to ${client.user.username}`, iconURL: i.user.displayAvatarURL({dynamic:true}) })
.setThumbnail(client.user.displayAvatarURL())
    .setColor(Color)
    .setDescription(`**${client.user.username}** is redefining the true the purpose of versatility, you can consider [**inviting me**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)\n**Note**: This message was sent to because you ran your first command with **freso**.`)
      	const row = new MessageActionRow()
			.addComponents(
					new MessageButton()
					.setLabel('Support Server')
					.setStyle(ButtonStyle.Link)
                  .setURL(`https://discord.gg/WJhUSDw4pM`),				new MessageButton()
					.setLabel('Invite Me')
					.setStyle(ButtonStyle.Link)
                  .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
              	              
              
			);
    interaction.user.send({
      embeds: [embed],
      components: [row],

    });
  }
})
/*client.on("interactionCreate", async i => {
  const Ticketsetup = require(`./database/guildData/ticketsetup`);
  const createTranscript = require(`discord-html-transcripts`)
  const DB = require(`./database/guildData/ticket`);
  if(!i.isButton) return;
  const  { guild, customId, channel, member } = i;
  if(!["close", "claim", "lock", "unlock"].includes(customId)) return;

  if(!member.permissions.has(`MANAGE_CHANNELS`)) return i.reply({
    content: `You need **MANAGE_CHANNELS** permission to use this.`,
    ephemeral: true,
  });
  const Embed = new MessageEmbed()
  .setColor(Color);
  DB.findOne({ GuildID: guild.id, ChannelID: channel.id }, async (err, docs) => {
   if(!docs.GuildID) return;
    if(err) throw err;
    if(!docs) return i.reply({
    content: `No database related to this ticket... Try deleting normally.`,
    ephemeral: true,
  });
    switch(customId) {
      case "lock":
        if(docs.Locked == true)  { 
          Embed.setDescription(`This ticket was already locked..`)
         return
           i.reply({
   embeds: [Embed],
    ephemeral: true,
  });
        } 
        await DB.updateOne({
          ChannelID: channel.id },
 {Locked: true });
    docs.MembersID.forEach((m) => { 
               channel.permissionsOverwrite.edit(m, {
          SEND_MESSAGES: false,
        })
          })
    
        Embed.setDescription(`This channel is now locked.`)
        i.reply({
          embeds: [Embed],
        })
break;
        
      case "unlock":
        if(docs.Locked == false)
        return     i.reply({
   content: `This was already unlocked.`,
    ephemeral: true,
  });
        await DB.updateOne(
          { ChannelID: channel.id},
                           { Locked: false},
        );
        Embed.setDescription(`This ticket is now unlocked!`);
       docs.MembersID.forEach((m) => { 
               channel.permissionsOverwrite.edit(m, {
          SEND_MESSAGES: true,
        })
          })
         i.reply({
          embeds: [Embed],
        })
        break;
      case "close":
        if(docs.Closed == true)
         return  i.reply({
   content: `This was already closed.. Maybe wait till it gets deleted.. `,
    ephemeral: true,
  });
    const attachment = await discordTranscripts.createTranscript(channel, {
      limit: -1,
      returnBuffer: false,
      fileName: `${docs.Type}.html`
    });
        await DB.updateOne(
          { ChannelID: channel.id},
                           { Closed: true},
        );
        const Message = await guild.channels.cache.get(docs.Transcript).send({
embeds: [
  Embed.setDescription(`Transcript Type: ${docs.Type}\nID: ${docs.TicketID}`)
],
          files: [attachment]
          
        });
        Embed.setDescriptipn(`The [transcript](${Message.url}) was saved successfully.`)
        i.reply({
          embeds: [Embed]
        });
  
        break;
        case "claim":
 if(docs.Claimed == true)
        return     i.reply({
   content: `This ticket already claimed by <@${docs.ClaimedBy}>.`,
    ephemeral: true,
  });
        await DB.updateOne(
          { ChannelID: channel.id},
                           { Claimed: true},
                           {ClaimedBy: member.id},
        );
        Embed.setDescription(`This ticket was claimed by ${member}`)
        i.reply({
          embeds: [Embed]
        })
        
        break;
    }
    
    
  })
})*/

client.on('shardReady', async (shard) => {
// Set presence for specific shard by using shardId on the method.
//client.user.setStatus(`dnd`);

    client.user.setActivity({
      name: `/help`,
      type: ActivityType.Streaming,
      url: `https://www.twitch.tv/onlyyxny`,

    });

  
      })

  client.on("messageCreate", async (message) => {
  const { guildId, channelId } = message;
    if (message.author.bot) return;

    StickyDB.findOne({ GuildID: guildId, ChannelID: channelId }, async (err, data) => {
        if(err) throw err;
        if (data) {
            if (data.MessageCount >= data.Threshold) {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount = 0;
              Count.save();
                           message.channel.messages.fetch(data.Lastmsg).then(fetchedMessage => fetchedMessage.delete()).catch(() => null);
	const e = new MessageActionRow()
			.addComponents(new MessageButton()
          .setCustomId(`greet-show`)
.setDisabled(true)
.setLabel("Sticky Message")
          .setStyle(ButtonStyle.Secondary))
              message.channel.send({ components: [e], content: `${ data.Message }`}).then((msg) => {
                Count.Lastmsg = msg.id;
                Count.save();
              })
            } else {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount += 1;
              Count.save();
              return;
            }
        }
    })
 
})
  /*client.on("messageCreate", async (message) => {
  CheckForSelfBot(message);
})
client.on("messageUpdate", (oldMessage, newMessage) => {
  CheckForSelfBot(newMessage);
})*/
//client.on('messageDelete', async(message) => {
// let snipes = client.snipes.get(message.channel.id) || [];

// storing last 10 deleted messages in the collection. you may increase it as per your wish
//   if(snipes.length > 15) snipes = snipes.slice(0, 9);

//    snipes.unshift({

//  author: message.author.displayAvatarURL({ dynamic: true }),

//   content: message.content,
// member : message.author.tag,
//image  : message.attachments.first() ? message.attachments.first().proxyURL : null,
//time   : Date.now()
//    });

//  client.snipes.set(message.channel.id, snipes);

//})


/*client.on('messageCreate', async message => {
        if (message.mentions.members.size < 2) {
message.react(`${emoji.success}`)

        }

        }) */
/*client.on('messageCreate', async (message) => {
 await  message.guild.members.fetch()
  if(!message.guild) return;

  if(!message.member?.permissions.has("MANAGE_MESSAGES")) {
   
const warnings = require("./database/guildData/warnings")
  const ma = db.fetch(`antimentions${message.guild.id}`)
  if(!ma) return;
   const max = db.fetch(`antimention${message.guild.id}`)
   if(!max) return;
  const punish = db.fetch(`punish-mention${message.guild.id}`)
  if(!punish) return;

        if (message.mentions.members.size > max) {
          if(punish.includes("mute")) {
           new warnings({
   action: `MUTE`,
userId:  client.user.id,
guildId:  message.guild.id,
moderatorId:  message.author.id,
reason: `Reached max mentions per message`,
timestamp: new Date(),

// msg.channel.send(``<t:${parseInt(message.timestamp / 1000 )}:F>``)


 }).save();
 
    const role = message.guild.roles.cache.find((ro) => ro.name === "Muted") ||  message.guild.roles.cache.find((ro) => ro.name === "muted");
    message.member.roles.add(role)
 message.reply({ content: `You've been **muted** for reaching the max mentions per message.`}).then(m => setTimeout(() => m.delete(), 55000));

      
       }
           if(punish.includes("kick")) {
           new warnings({
   action: `KICK`,
userId:  client.user.id,
guildId:  message.guild.id,
moderatorId:  message.author.id,
reason: `Reached max mentions per message`,
timestamp: new Date(),

// msg.channel.send(``<t:${parseInt(message.timestamp / 1000 )}:F>``)


 }).save();
 
 message.reply({ content: `You've been **kick** for reaching the max mentions per message.`}).then(m => setTimeout(() => m.delete(), 5000));
 message.member.send({ content: `You've been **kick** from ${message.guild.name} - ${message.guild.id} for reaching the max mentions per message.`})
 message.member.kick({reason: `Reached max mention per message`})

      
       }
                  if(punish.includes("ban")) {
           new warnings({
   action: `ban`,
userId:  client.user.id,
guildId:  message.guild.id,
moderatorId:  message.author.id,
reason: `Reached max mentions per message`,
timestamp: new Date(),

// msg.channel.send(``<t:${parseInt(message.timestamp / 1000 )}:F>``)


 }).save();
 
 message.reply({ content: `You've been **banned** for reaching the max mentions per message.`}).then(m => setTimeout(() => m.delete(), 5000));
 message.member.send({ content: `You've been **banned** from ${message.guild.name} - ${message.guild.id} for reaching the max mentions per message.`})
 message.member.ban({reason: `Reached max mention per message`})

      
       }
       if(punish.includes("warn")) {
           new warnings({
   action: `WARN`,
userId:  client.user.id,
guildId:  message.guild.id,
moderatorId:  message.author.id,
reason: `Reached max mentions per message`,
timestamp: new Date(),

// msg.channel.send(``<t:${parseInt(message.timestamp / 1000 )}:F>``)


 }).save();
 message.reply({ content: `You've been **warned** for reaching the max mentions per message.`}).then(m => setTimeout(() => m.delete(), 5000));

      
       }
       if(punish.includes("temp-mute")) {
           new warnings({
   action: `TEMP-MUTE`,
userId:  client.user.id,
guildId:  message.guild.id,
moderatorId:  message.author.id,
reason: `Reached max mentions per message`,
timestamp: new Date(),

// msg.channel.send(``<t:${parseInt(message.timestamp / 1000 )}:F>``)


 }).save();
 
    const role = message.guild.roles.cache.find((ro) => ro.name === "Muted") ||  message.guild.roles.cache.find((ro) => ro.name === "muted");
    if(!role) return;
 message.reply({ content: `You've been temp **muted** for 1m for reaching the max mentions per message.`}).then(m => setTimeout(() => m.delete(), 5000));
   message.member.roles.add(role);
    setTimeout(function () {
      message.member.roles.remove(role);
  
    }, 60000);
      
       }
             const embedb = new MessageEmbed()
                .setAuthor(`${message.guild.name} Modlogs`, message.guild.iconURL())
                .setColor("#ff0000")
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setFooter(message.guild.name, message.guild.iconURL())
                .addField("**Moderation**", `${punish}`)
                .addField("**User Punished**", `${message.author.username}`)
                .addField("**Reason**", `Reaching max mention limit per message.`)
                .addField("**Date**", `${message.createdAt.toLocaleString()}`)
                .setTimestamp();
 let channel = db.fetch(`modlog_${message.guild.id}`)
            if (!channel) return;

            var sChannel = message.guild.channels.cache.get(channel)
            if (!sChannel) return;
            sChannel.send({
              embeds: [embedb]
              })
    }
  }
}); */

/*const InvitesTracker = require('@androz2091/discord-invites-tracker');
const tracker = InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true,
}); */
client.on("guildMemberAdd", async member => {
//console.log(`${member.user.tag}`)
  function getRandomInt(max) {
 const num = Math.floor(Math.random() * max);
 if(num === 0) return Math.floor(Math.random() * 1);
  return num;
}
    let data =   await db.get(`togreet${member.guild.id}`)
  let toping =      await db.get(`members${member.guild.id}`)
  //if(!data || !toping) return;
  let message = member;
const time = await
     db.get(`time_${member.guild.id}`) || 5000;
  let array = []
 await db.add(`rtgreet${member.guild.id}`, 1)
 setTimeout(async () => { 
await db.sub(`rtgreet${member.guild.id}`, 1)
 }, 1000 * 3)

  if(data >= 5) {
      await db.delete(`members${member.guild.id}`)
    await  db.delete(`togreet${member.guild.id}`)
   
  let welmsg = 
    await db.get(`WM-${member.guild.id}`) ||
    `Welcome ${toping.join(`, `)}, to \`${member.guild.name}\`!!`;
  welmsg = welmsg.replace(/{member_mention}/g, `${toping.join(` `)}`)
   welmsg = welmsg.replace(/{server_name}/g, `${member.guild.name}`)
welmsg = welmsg.replace(/{server_id}/g, `${member.guild.id}`)
welmsg = welmsg.replace(/{server_count}/g, `${member.guild.memberCount}`)
       

  message.guild.channels.cache.forEach(async (channel) => {
     
    if (await greet.findOne({
        GuildID: message.guild.id,
        ChannelID: channel.id,
      })) {
      if(!await db.get(`webhook${message.guild.id}`) && !await db.get(`webhook-name${message.guild.id}`)) {
 message.guild.channels.cache.get(channel.id).send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })   
        }
if(await db.get(`webhook${message.guild.id}`) ||  await db.get(`webhook-name${message.guild.id}`)) {
        let ch = message.guild.channels.cache.get(channel.id)
  await channel.fetchWebhooks().then(async webhooks => {
    
    let name = await db.get(`webhook${message.guild.id}`) || client.user.username;
  const web = webhooks.find(webhook => webhook.name == `${name}`)

  if(!web) {
    
    let avatar = await db.get(`webhook-name${message.guild.id}`) ||  client.user.avatarURL()
const cr = await ch.createWebhook(name, {
  avatar: `${avatar}`
})
   
cr.send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })
}
web.send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })
    
})
}
    }
  })
  
          }
  
    
  if(!toping) {
     await db.push(`members${member.guild.id}`, [])
  }
  await wait(150)
  await db.add(`togreet${member.guild.id}`, 1)
  await db.push(`members${member.guild.id}`, `${member.user}`)
  const rt = await db.get(`rtgreet${member.guild.id}`);
if(rt >= 9) return;
    setTimeout(async () => {
   
          toping =   await db.get(`members${member.guild.id}`)
      data =  await db.get(`togreet${member.guild.id}`);
        await db.delete(`members${member.guild.id}`)
        await  db.delete(`togreet${member.guild.id}`)
       if(data && toping) {
     
  let welmsg  = 
  await db.get(`WM-${member.guild.id}`) ||
    `Welcome ${toping.join(` `)} to \`${member.guild.name}\`!!`;
  welmsg = welmsg.replace(/{member_mention}/g, `${toping.join(` `)}`)
   welmsg = welmsg.replace(/{server_name}/g, `${member.guild.name}`)
welmsg = welmsg.replace(/{server_id}/g, `${member.guild.id}`)
welmsg = welmsg.replace(/{server_count}/g, `${member.guild.memberCount}`)
      

 message.guild.channels.cache.forEach(async (channel) => {
    if (await greet.findOne({
        GuildID: message.guild.id,
        ChannelID: channel.id,
      })) 
      if(!await db.get(`webhook${message.guild.id}`) && !await db.get(`webhook-name${message.guild.id}`)) {
 message.guild.channels.cache.get(channel.id).send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })   
        }
if(await db.get(`webhook${message.guild.id}`) || await db.get(`webhook-name${message.guild.id}`)) {
        let ch = message.guild.channels.cache.get(channel.id)
  await channel.fetchWebhooks().then(async webhooks => {
    
    let name = await db.get(`webhook${message.guild.id}`) || client.user.username;
  const web = webhooks.find(webhook => webhook.name == `${name}`)

  if(!web) {
    
    let avatar = await db.get(`webhook-name${message.guild.id}`) ||  client.user.avatarURL()
const cr = await ch.createWebhook(name, {
  avatar: `${avatar}`
})
   
return cr.send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })
}
return web.send(welmsg).then(msg => {
        setTimeout(() => msg.delete(), time);
      })
  })

}
 })
       }
    }, 1200);
   
    });
client.on("userUpdate", async (oldMember, newMember) => {
  let user = newMember;
   
   if (newMember.username !== oldMember.username) {

  let find = await db.get(`usernames${user.id}`);
  if(!find) {
    await db.push(`usernames${user.id}`, [])
  }
 return await db.push(`usernames${user.id}`, `${oldMember.username} <t:${parseInt(Date.now() / 1000)}:R>`)
   }
});

client.on('guildMemberAdd', async member => {
  if (!member.guild) return;
    let message = member;
  let age = await wb.get(`age.${member.guild.id}`);
  let logs = await wb.get(`logs.${member.guild.id}`);
  let punishment = await wb.get(`punishment.${member.guild.id}`);
  let bypassed = await wb.get(`bypass.${member.guild.id}`);
 const muterole = await db.get(`roles-add${message.guild.id}`);  
   const roles = await db.get(`antiroles-add${message.guild.id}`); 
        const msg = await db.get(`dm-msg${message.guild.id}`) ||
    `You've been **${punishment}** in the server ${message.guild.name} for being a sus account. `
  await wait(1400)
  if (!bypassed?.includes(member.id)) {
    let day = Number(age)
    let x = Date.now() - member.user.createdAt;
    let created = Math.floor(x / 86400000);

    if (day >= created) {

      if (punishment?.includes("roled") && roles) {
          
          member.roles.add(roles)
          
                        const row = new MessageActionRow()
			.addComponents(
        new MessageButton()
	.setURL(`${emoji.link}`)
					.setLabel('My Support server')
        .setEmoji('972389476057890836')
					.setStyle(ButtonStyle.Link),
           new MessageButton()
.setStyle('LINK')
  	.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
                    .setLabel(`Sent from ${member.guild.name}`),
           new MessageButton()
.setStyle(ButtonStyle.Secondary)
        .setEmoji('972389476057890836')
                        .setDisabled(true)
                        .setCustomId("nigegedrgerg")
                    .setLabel(`Sent from ${member.guild.name} - ${member.guild.id}`))
      
          //  member.send({ components: [row], content: msg })
      }
      if (punishment?.includes("kick")) {
        console.log(`ANTI-alt kick\n${member.guild.name}\nMEMBER: ${member.user.tag}`)
         const ro = new MessageActionRow()
			.addComponents(
        new MessageButton()
	.setURL(`${emoji.link}`)
 .setLabel(`Sent from ${member.guild.name}`)
        .setEmoji('972389476057890836')
					.setStyle(ButtonStyle.Link),
           new MessageButton()
	.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
					.setLabel('Invite me!')
					.setStyle(ButtonStyle.Link))
      
                member.send({ components: [ro], content: msg})
        member.kick(`Anti-alt [Younger than ${day} days]`)
      } else if (punishment?.includes("ban")) {
        console.log(`Anti-alt ban\n${member.guild.name}\nMEMBER: ${member.user.tag}`)
                       const row = new MessageActionRow()
			.addComponents(
        new MessageButton()
	.setURL(`${emoji.link}`)
					.setLabel('My Support server')
        .setEmoji('972389476057890836')
					.setStyle(ButtonStyle.Link),
           new MessageButton()
	.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
			 .setLabel(`Sent from ${member.guild.name}`)
        .setEmoji('972389476057890836')
					.setStyle(ButtonStyle.Link))
      //      member.send({ components: [row], content: msg })
        member.ban(`Anti alt [Younger than ${day} days]`)
      }

let user = member;
      let channel = await member.guild.channels.cache.get(logs);
  let stat = {
      online: "<:online:972549094134407209> Online",
      idle: "<:idle:972549141546795038> Idle",
      dnd:  "<:dnd:972549115017855016> Do not disturb",
      offline: "<:offline:972549165081047050> Invisible/Offline"
    }
 const badges = {
      
            DISCORD_EMPLOYEE: "<:tool:966954339795087360>",
            PARTNERED_SERVER_OWNER: "<:partner:968133482482130984>",
            BUGHUNTER_LEVEL_1: "<:bug1:968133635553247252>",
            BUGHUNTER_LEVEL_2: "<:bug2:968133662711382066>",
            HYPESQUAD_EVENTS: "<:hypesquadevents:948738577234288670>",
            HOUSE_BRILLIANCE: "<:BadgeHypeSquadBrilliance:948738569378365470>",
            HOUSE_BRAVERY: "<:hypesquadbravey:948738579029454919>",
            HOUSE_BALANCE: "<:BadgeHypeSquadBalance:948738599241793567>",
            EARLY_SUPPORTER: "<:earlysupporter:948738574717689946>",
            TEAM_USER: "Team User",
            VERIFIED_BOT: "<:verified:949567380315578388>",
             DISCORD_CERTIFIED_MODERATOR: "<:certifiedmod:949474147036184616>",
            EARLY_VERIFIED_BOT_DEVELOPER : "<:BadgeEarlyVerifiedBotDeveloper:948738362309763072>",
           
}
       ni =  member.user.displayAvatarURL({dynamic:true})?.endsWith('.gif');
      if(ni)  ni = "<:Icon_Nitro:949470425254097016>"
        if(!ni) ni = 'No nitro';
      
       const f = (await client.users.fetch(`${user.id}`, {force: true})).bannerURL({ size: 4096, dynamic: true});

      if(f) ni = `<:Icon_Nitro:949470425254097016> <a:Boost:949472544761741313>` 
      let embed = new EmbedBuilder()
        .setAuthor({ name: `Suspicious! Account age less than ${day} days`, iconURL: member.user.displayAvatarURL({ dynamic: true, }) })
.setDescription(`> **Member**: ${member.user} (ID: ${member.user.id})\n> **Account Age**: <t:${parseInt(member.user.createdTimestamp / 1000 )}:F>\n**Status**: ${stat[member.presence.status]} `)
.setImage(member.user.displayAvatarURL({ dynamic: true, }))
     .setColor(Color)
     if(f) {
    embed.setImage(f)
}
         if (channel) channel.send({ embeds: [embed] });
    }
  }
});
client.on("interactionCreate", async interaction => { 
  if(interaction.customId === 'checkmsgs') {
    await interaction.deferReply({ ephemeral: true})
    if(!interaction.guild) return;
    const MessageData = require(`./database/guildData/messages`);
    MessageData.findOne(
      {
        userID: interaction.user.id,
       GuildID: interaction.guild.id,
      },
      (err, messages) => {
        if (err) console.error(err);
        if (!messages) {
          const newTracker = new MessageData({
            userID: user.id,
            GuildID: interaction.guild.id,
            messageCount: 0,
          });
          newTracker.save().catch(err => console.error(err));
                      let e = new MessageEmbed()
            .setColor(Color)
       

          .setDescription(`${emoji.error} You have no messages tracked in this server.`)
                                     
    
          interaction.followUp({ embeds: [e] })
        } else {
          let embed = new MessageEmbed()
            .setColor(Color)
          .setDescription(`${user} you have sent **${messages.messageCount}** messages.`)
          interaction.followUp({ embeds: [embed] })
        }
      }
    );
  }
})
client.on("ready", async c => { 
  const DB = require(`./database/guildData/autorefresh`);
  const delay = (ms) => new Promise(r => setTimeout(() => r(2), ms));
  const MD = require(`./database/guildData/messages`);
    setInterval(async () => {
     
    
  c.guilds.cache.forEach(async g => {
    const e = await DB.findOne({
      GuildID: g.id,
    });
    if(e) {
      let ch =  g.channels.cache.get(e.ChannelID);
      if(!ch) return;
      let msg = await ch.messages.fetch(e.Message);
      if(!msg) return;
      let Database = await MD.find({ 
         GuildID: g.id })
         .sort([["messageCount", "Descending"]])
       .exec(async (err, res) => {
      //if database not found
      if (!res || !res.length) { 
        
        
        return;
      } 
    
      let array = [];

      
      for (i = 0; i < res.length; i++) {
      array.push(`\`${top(i + 1)}. \` <@${res[i].userID}> • **${res[i].messageCount}** messages sent.`);
        
 // if(res[i].userID === interaction.user.id)  msg = `Your posistion: \`${top(i + 1)}. \``;
     
      }
 const interval = 10;


  let t = Number((Date.now() + 600000).toString().slice(0, -3))

    const range = (array.length == 1) ? '[1]' : `[1 - ${array.length}]`;
let guilds = array;
      const generateEmbed = async start => {
  const current = array.slice(start, start + 10)

  // You can of course customise this embed however you want
  return new EmbedBuilder({
   
    author: {
      name: `${g.name}`,
    iconURL: g?.iconURL({dyanmic: true})
    },
       	thumbnail: {
          url: g?.iconURL({ size: 4096, dyanmic: true}),
        },
          title: `Message Leaderboard ${start + 1}-${start + current.length} out of ${
      guilds.length
    }`,
    description: `${current.join(`\n`)}\n`,
timestamp: Date.now() + 60 * 60 * 1000, // 35 minutes
    footer: {
      text: `Next Refresh:`,
    },
    color: 0x7cade2,
  })
      };
    const ee = new ButtonBuilder()
         .setLabel(`Check messages`)
   
    .setStyle(ButtonStyle.Primary)
         .setCustomId(`checkmsgs`);
         const row = new ActionRowBuilder()
         .addComponents(ee);
   
// Send the embed with the first 10 guilds
const canFitOnOnePage = guilds.length <= 10
msg.edit({
  components: [ee],
  embeds: [await generateEmbed(0)],
  //components: [new MessageActionRow({components: [ee]})]
})
// Exit if there is only one page of guilds (no need for all of this)
if (canFitOnOnePage) return;

// Collect button interactions (when a user clicks a button),
// but only when the button as clicked by the original message author


  
       
                              
  })
    
    function top(index) {
      return index === 1 ? '🥇' : index === 2 ? '🥈' : index === 3 ? '🥉' : index < 10 ? String(`0${index}`) : index;
    }
      
    }
  });
       
    }, 60 * 60 * 1000)
  
await delay(1200)
})
client.on("messageCreate", async message => {
  if(message.author.bot) return;
const MessageData = require(`./database/guildData/messages`);
  
   MessageData.findOne(
      {
        userID: message.author.id,
        GuildID: message.guild.id
      },
      (err, messages) => {
        if (err) console.log(err);
        if (!messages) {
          const newTracker = new MessageData({
            userID: message.author.id,
            GuildID: message.guild.id,
            messageCount: 1
          });
          newTracker.save().catch(err => console.error(err));
        } else {
          messages.messageCount = messages.messageCount + 1;
    //     let  m = messages.messageCount + 1;
    /*messageRewards.findOne(
      { Guild: message.guild.id, Messages: data.Messages },
      async (err, data) => {
        if (data) {
          try {
            message.guild.members.cache
              .get(message.author.id)
              .roles.add(data.Role);
          } catch { }
        }
      }
    ); */
        messages.save().catch(err => console.error(err));
        }
      }
    );
});
client.on('guildCreate', async (guild) => {
  const channelId = '932458221598302278';//add your channel ID 
                //https://discord.com/api/webhooks/936431584813391942/nK01m2CBnGoXPYw9ufgL5yYlk6TrSxrXZE53HN34k4_0p0xOW_RdH5v-b33tAi9hrce3
//https://discord.com/api/webhooks/936431584813391942/nK01m2CBnGoXPYw9ufgL5yYlk6TrSxrXZE53HN34k4_0p0xOW_RdH5v-b33tAi9hrce3
// https://discord.com/api/webhooks/938964255678562344/h6-rCy8w8pbvjs6YctApMaqZs_jGt_nbpDNrvdQQIV_niCM8bGjVyioq-ayy2poEgC_M
const channel = new WebhookClient({url: 'https://discord.com/api/webhooks/1127473290353578005/mHxNcD311eykvSB2C7c1ipjkKrf6uQ4efZgL2BSkgFs8__dt1I6ZHf9VyHtRy6ucj_xU' });
//https://discord.com/api/webhooks/963237285007085638/gDOiRZ3nQy60M32EijT7DpWvGWr4LoZDxDKK1ZFUd_rTRhrDUQb_PD7i6GHhMZXokC4N
  if (!guild) return;
  if (!guild.name) return;
  if (!guild.id) return;
  if (!guild.memberCount) return;
  

client.cluster.fetchClientValues('guilds.cache.size')
	.then(async results => {
    let owner = await client.users.fetch(guild.ownerId);
   if(!owner) owner = (await guild.fetchOwner()).user;
const embed = new Discord.EmbedBuilder()
.setTitle('Joined a new guild')
.setColor(Color)
.setDescription(`${results.reduce((acc, guildCount) => acc + guildCount, 0)} total guilds!`)
.addFields(
  { name: `Server Name`, value: `${guild.name}` },
  { name: 'Server ID', value: `${guild.id}` },
  { name: `Server Membercount`, value: `${guild.memberCount}`, inline: true },
  { name: `Server Owner`, value: `${owner.username|| 'N/A'}`, inline: true },
  { name: `Text Channels`, value: `${guild.channels.cache.filter((c) => c.type === 0).toJSON.length}`, inline: true },
  { name: `Voice Channels`, value: `${guild.channels.cache.filter((c) => c.type === 2).toJSON.length}`, inline: true },
  { name: `Categories`, value: `${guild.channels.cache.filter((c) => c.type === 4).toJSON.length}`, inline: true },
  { name: `Roles`, value: `${guild.roles.cache.size}`, inline: true },
)
            .setThumbnail(guild?.iconURL({ dynamic: true }))
            .setImage((guild.bannerURL({ size: 512 }) ?? guild.splashURL({ size: 512 }) ?? null))
            .setFooter({
                text: `ID ${guild.id}`,
                iconURL: (await guild.fetchOwner()).avatarURL({ dynamic: true }) 
            });
            channel.send({ embeds: [embed]}) 

           
})

});

client.on('guildDelete', (guild) => {
  const channelId = '932458221598302278';//add your channel ID 
                //https://discord.com/api/webhooks/936431584813391942/nK01m2CBnGoXPYw9ufgL5yYlk6TrSxrXZE53HN34k4_0p0xOW_RdH5v-b33tAi9hrce3
//https://discord.com/api/webhooks/936431584813391942/nK01m2CBnGoXPYw9ufgL5yYlk6TrSxrXZE53HN34k4_0p0xOW_RdH5v-b33tAi9hrce3
// https://discord.com/api/webhooks/938964255678562344/h6-rCy8w8pbvjs6YctApMaqZs_jGt_nbpDNrvdQQIV_niCM8bGjVyioq-ayy2poEgC_M
const channel = new WebhookClient({  url: 'https://discord.com/api/webhooks/1127478499033235526/-ZyMSSzML-2t56g_I0T6IT0IYPmKsGp1oB6gI-pp7Ot3Xf0xARdf_vIdduXmNjlfNZ-Q' });

  if (!guild) return;
  if (!guild.name) return;
  if (!guild.id) return;
  if (!guild.memberCount) return;
  client.cluster.fetchClientValues('guilds.cache.size')
	.then(async results => {
const embed = new Discord.EmbedBuilder()
.setTitle('Left a  guild')
.setColor(Color)
.setDescription(`${results.reduce((acc, guildCount) => acc + guildCount, 0)} total guilds!`)
.addFields(
  { name: `Server Name`, value: `${guild.name}` },
  { name: 'Server ID', value: `${guild.id}` },
  { name: `Server Membercount`, value: `${guild.memberCount}`, inline: true },
)
            .setThumbnail(guild?.iconURL({ dynamic: true }))
            .setImage((guild.bannerURL({ size: 512 }) ?? guild.splashURL({ size: 512 }) ?? null))
        


          channel.send({ embeds: [embed]}) 
})

});
client.on("guildMemberAdd", async member => {
let autorole = require(`./database/guildData/autorole.js`)
  let DB = await autorole.findOne({
    GuildID: member.guild.id,
  })
  if(DB) {
    member.guild.roles.cache.forEach(async role => {
      let DB2 = await autorole.findOne({
    GuildID: member.guild.id,
        Role: role.id,
  });
      if(DB2) member.roles.add(role.id)
    })
  }
})
client.on(`channelCreate`, async channel => {
  let message = channel;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: channel.guild.id,
    channelCreate: true,
  }) || await DB.findOne({
    GuildID: channel.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
    .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})
    .setDescription(`**Channel Created**:\n> **Channel**: ${message} \` [${message.name}]\``)
.setTimestamp()
      .setFooter({ text: `Channel  ID: ${channel.id}` })

    .setThumbnail(channel.guild.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  
})
client.on(`channelDelete`, async channel => {
  let message = channel;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: channel.guild.id,
    channelDelete: true,
  }) || await DB.findOne({
    GuildID: channel.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
  .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})
    .setDescription(`**Channel Deleted**:\n> **Channel**: \` [${message.name}]\``)
.setTimestamp()
    .setFooter({ text: `Channel  ID: ${channel.id}` })

    .setThumbnail(channel.guild.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  
})

  client.on(`emojiCreate`, async channel => {
    let message = channel;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: channel.guild.id,
    emoji: true,
  }) || await DB.findOne({
    GuildID: channel.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
      .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})

    .setDescription(`**Emoji Added**:\n**Emoji**: ${channel}\n> **Emoji Name**: \` [${channel.name}]\``)
.setTimestamp()
    .setFooter({ text: `Emoji ID: ${channel.id}` })

    .setThumbnail(channel.guild?.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  });
  client.on(`emojiUpdate`, async channel => {
    let message = channel;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: channel.guild.id,
    emoji: true,
  }) || await DB.findOne({
    GuildID: channel.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
   .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})

    .setDescription(`**Emoji Updated**:\n**Emoji**: ${channel}\n> **Emoji Name**: \` [${channel.name}]\``)
.setTimestamp()
    .setFooter({ text: `Emoji ID: ${channel.id}` })

    .setThumbnail(channel.guild.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`emojiDelete`, async channel => {
    let message = channel;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: channel.guild.id,
    emoji: true,
  }) || await DB.findOne({
    GuildID: channel.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
    .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})
    .setDescription(`**Emoji Delete**:\n**Emoji**: ${channel}\n> **Emoji Name**: \` [${channel.name}]\``)
.setTimestamp()
     .setFooter({ text: `Emoji ID: ${channel.id}` })
    .setThumbnail(channel.guild.iconURL({dynamic:true}) || null)
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`guildBanAdd`, async ban => {
    let channel = ban;
    let message = ban;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: ban.guild.id,
    guildBanAdd: true,
  }) || await DB.findOne({
    GuildID: ban.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
   .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})
    .setDescription(`**Ban Added**:\n**User**: ${ban.user} \`${ban.user.tag}\`\n**Reason**: ${ban.reason || 'N/A'}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${ban.user.id}` })
    .setThumbnail(channel.guild.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`guildBanRemove`, async ban => {
    let message = ban;
    let channel = ban;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: ban.guild.id,
    guildBanAdd: true,
  }) || await DB.findOne({
    GuildID: ban.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
      .setAuthor({ name:`${channel.guild.name}`, iconURL: channel.guild.iconURL({dynamic:true})})

    .setDescription(`**Ban Remove**:\n**User**: ${ban.user} \`${ban.user.tag}\`\n**Reason**: ${ban.reason || `N/A`}`)
.setTimestamp()
      .setFooter({ text: `User ID: ${ban.user.id}` })
    .setThumbnail(channel.guild.iconURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`guildMemberAdd`, async ban => {
    let message = ban;
    let channel = ban;
  
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: ban.guild.id,
    guildMemberAdd: true,
  }) || await DB.findOne({
    GuildID: ban.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
     .setAuthor({ name:`${ban.user.tag}`, iconURL: ban.user.displayAvatarURL({dynamic:true})})

    .setDescription(`**Member Joined**:\n**User**: ${ban.user} \`${ban.user.tag}\`\n**Account Created**: <t:${parseInt(ban.user.createdTimestamp / 1000)}:R>`)
.setTimestamp()
       .setFooter({ text: `User ID: ${ban.user.id}` })
    .setThumbnail(ban.user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`guildMemberRemove`, async ban => {
    let message = ban;
    let channel = ban;
  
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: ban.guild.id,
    guildMemberRemove: true,
  }) || await DB.findOne({
    GuildID: ban.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.user.tag}`, iconURL: ban.user.displayAvatarURL({dynamic:true})})
    .setDescription(`**Member Left**:\n**User**: ${ban.user} \`${ban.user.tag}\`\n**Account Created**: <t:${parseInt(ban.user.createdTimestamp / 1000)}:R>\n> **Roles**: ${ban.roles.cache.sort((a, b) => b.position - a.position).map(r => r).join(" ").replace("@everyone", "") || "None"}`)
  
.setTimestamp()
    .setFooter({ text: `User ID: ${ban.user.id}` })
    .setThumbnail(ban.user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  })
  client.on(`guildMemberUpdate`, async (oldMember, newMember) => {
    let ban = newMember;
    let message = ban;
    let channel = ban;
        let oldNickname = oldMember.nickname ? oldMember.nickname : oldMember.user.username
        let newNickname = newMember.nickname ? newMember.nickname : newMember.user.username;

    if (newMember.nickname !== oldMember.nickname) {
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: ban.guild.id,
    guildMemberUpdate: true,
  }) || await DB.findOne({
    GuildID: ban.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
    .setAuthor({ name:`${ban.user.tag}`, iconURL: ban.user.displayAvatarURL({dynamic:true})})
    .setDescription(`**Member Updated**:\n**User**: ${ban.user} \`${ban.user.tag}\`\n**Account Created**: <t:${parseInt(ban.user.createdTimestamp / 1000)}:R>\n> **Roles**: ${ban.roles.cache.sort((a, b) => b.position - a.position).map(r => r).join(" ").replace("@everyone", "") || "None"}`)
         
.setTimestamp()
    .setFooter({ text: `User ID: ${ban.id}`, })
    .setThumbnail(ban.user.displayAvatarURL({dynamic:true}) || null)
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
}
  })
client.on(`messageDelete`, async message => {
if(message.author.bot) return;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: message.guild.id,
    messageDelete: true,
  }) || await DB.findOne({
    GuildID: message.guild.id,
    All: true,
  });
  if(!f) return;
  const embed = new MessageEmbed()
   .setAuthor({ name:`${message.author.tag}`, iconURL: message.author.displayAvatarURL({dynamic:true})})
    .setDescription(`**Message Deleted**:\n> **Author**: ${message.author} \`${message.author.tag}\`\n> **Channel**: ${message.channel} \` [${message.channel.name}]\` \n${message.content}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${message.author.id}`, })
    .setThumbnail(message.author.displayAvatarURL({dynamic:true}))
    .setColor(Color)
  message.guild.channels.cache.get(f.Channel).send({
    embeds: [embed]
  })
  
})
client.on('messageDeleteBulk', async(collection) => {
    let message = collection;
  let member = collection;
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.first().guild.id,
    messageDelete: true,
  }) || await DB.findOne({
    GuildID: member.first().guild.id,
    All: true,
  });
  if(!f) return;



    const embed = new MessageEmbed()
    .setTitle("Messages Deleted")
   .setColor(Color)
    .setDescription(`${collection.size} messages were deleted in ${collection.first().channel}\n${collection.map(m => `[${m.author.tag || m.author.username || m.author.id}]: ${m.content}`).join("\n")}`)
    .setFooter({ text: `Channel ID: ${collection.first().channel.id} `})
    .setTimestamp()
return member.first().guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

})

client.on('messageUpdate', async(oldMessage, newMessage) => {
    let message = oldMessage;
  let member = message;
  if(newMessage.author.bot) return;
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID:oldMessage.guild.id,
    messageUpdate: true,
  }) || await DB.findOne({
    GuildID: oldMessage.guild.id,
    All: true,
  });
  if(!f) return;
if(oldMessage.content === newMessage.content) return;

  
    const oldMessageContent =
      oldMessage.content
        .replace(/\`/g, "")
        .replace(/[\n]{2,}/g, "\n\n")
        .trim()
        .slice(0, 1800) + (oldMessage.content.length > 1800 ? "..." : "");

    const newMessageContent =
      newMessage.content
        .replace(/\`/g, "")
        .replace(/[\n]{2,}/g, "\n\n")
        .trim()
        .slice(0, 1800) + (newMessage.content.length > 1800 ? "..." : "");


    const embed = new MessageEmbed()
   .setAuthor({ name:`${newMessage.author.tag}`, iconURL: newMessage.author.displayAvatarURL({dynamic:true})})
    .setTitle(`Message Edited in #${message.channel.name}`)
.setDescription(`**Before**: ${oldMessage.content}
**+After**: ${newMessage.content}\n**Channel:** ${newMessage.channel}`)
          .setColor(Color)
.setThumbnail(message.author.displayAvatarURL({dynamic: true}))
    .setFooter({ text: `Message ID ${newMessage.id}`, })
.setTimestamp()
      const rw = new MessageActionRow()
			.addComponents(
          new MessageButton()
	.setURL(`https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`)
					.setLabel(`Message Link`)
					.setStyle(ButtonStyle.Link))
 message.guild.channels.cache.get(f.Channel).send({ embeds: [embed], components: [rw]})

})

         client.on('roleCreate', async(role) => {
   
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: role.guild.id,
    roleCreate: true,
  }) || await DB.findOne({
    GuildID: role.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
         .setThumbnail(`${role.guild?.iconURL({dynamic:true})}`)
    .setTitle("Role Created")
    .setDescription(`> **Role Name**: ${role.name}\n> **Role ID:** ${role.id}\n> **Hoisted**: ${role.hoisted ? "Yes" : "No"}\n> **Mentionable**: ${role.mentionable ? "Yes" : "No"}`)
    .setColor(Color)
    .setTimestamp()

    role.guild.channels.cache.get(f.Channel).send({ embeds: [embed] })
         })
  client.on('roleDelete', async(role) => {

    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: role.guild.id,
    roleDelete: true,
  }) || await DB.findOne({
    GuildID: role.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
         .setThumbnail(`${role.guild?.iconURL({dynamic:true})}`)
    .setTitle("Role Deleted")
    .setDescription(`> **Role Name**: ${role.name}\n> **Role ID**: ${role.id}\n> **Hoisted**: ${role.hoisted ? "Yes" : "No"}\n> **Mentionable**: ${role.mentionable ? "Yes" : "No"}`)
    .setColor(Color)
    .setTimestamp()

    role.guild.channels.cache.get(f.Channel).send({ embeds: [embed] })
         })
 client.on("voiceChannelJoin", async (member, channel) => {
   let message = member;

    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    voice: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
   const emb = new MessageEmbed()
   .setTitle(`${member.user.tag} joined #${channel.name}`)
   .setAuthor({ name:`${member.user.tag}`, iconURL: member.user.displayAvatarURL({dynamic:true})})
.setDescription(`**Channel**\nName: ${channel.name}\nMention: ${channel}\nID: ${channel.id}`)
.setColor(Color)
.setTimestamp()
member.guild.channels.cache.get(f.Channel).send({ embeds: [emb]})
    
  })
 
 client.on("voiceChannelLeave", async (member, channel) => {
      let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    voice: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
   let message = member;

   const emb = new MessageEmbed()
   .setTitle(`${member.user.tag} left #${channel.name}`)
.setAuthor({ name:`${member.user.tag}`, iconURL: member.user.displayAvatarURL({dynamic:true})})
.setDescription(`**Channel**\n> Name: ${channel.name}\nMention: ${channel}\ID: ${channel.id}`)
   .setColor(Color)
.setTimestamp()
member.guild.channels.cache.get(f.Channel).send({ embeds: [emb]})
    
  })

client.on("guildMemberRoleRemove", async(member, role) => {
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    roleRemove: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
       .setThumbnail(member.guild?.iconURL({dynamic:true}))
     .setAuthor({ name:`${member.user.tag}`, iconURL: member.user.displayAvatarURL({dynamic:true})})
      .setColor(Color)
   
.setDescription(`${role} Removed from: <@${member.user.id}>`)

    .setFooter(`�ID: ${member.user.id}`)
    .setTimestamp()
return member.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})


});
client.on("guildMemberRoleAdd", async(member, role) => {
       let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID:member.guild.id,
    roleAdd: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
       .setThumbnail(member.guild?.iconURL({dynamic:true}))
    .setAuthor({ name:`${member.user.tag}`, iconURL: member.user.displayAvatarURL({dynamic:true})})
        .setColor(Color)

.setDescription(`${role} Added to: <@${member.user.id}>`)

    .setFooter(`ID: ${member.user.id}`)
    .setTimestamp()
return member.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})


});
client.on("guildMemberBoost", async (member) => {
     let message = member;
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: members.guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
      
.setAuthor(`${member.user.tag} has started boosting`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)
.addField(`Current boost level:`,`>>> ${newLevel}`)
.setColor(Color)
    .setFooter(`ID: ${member.id}`)
    .setTimestamp()
return member.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildMemberUnboost", async (member) => {
     let message = member;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: members.guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
      
.setAuthor(`${member.user.tag} has stopped boosting`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)
.addField(`Current boost level:`,`>>> ${newLevel}`)
.setColor(Color)
    .setFooter(`ID: ${member.id}`)
    .setTimestamp()
return member.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildBoostLevelUp", async (guild, oldLevel, newLevel) => {
      let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: guild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
.setAuthor(`We gained a boost level!`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)
.addField(`Current boost level:`,`>>> ${newLevel}`)
.setColor(Color)
   
    .setTimestamp()
return member.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildBoostLevelDown", async (guild, oldLevel, newLevel) => {
      let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
      
.setAuthor(`We lost a boost level`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)
.addField(`�Current boost level:`,`>>> ${newLevel}`)
.setColor(Color)
    .setTimestamp()
return member.channels.cache.get(f.Channel).send({ embeds: [embed]})
      
  
});
client.on("guildBannerAdd", async (guild, bannerURL) => {
       let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: members.guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
      
.setAuthor(`Server banner updates`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)       
      .setColor(Color)
//.setDescription(`Executed by:`, `>>> ${me}`)
.setImage(`${guild.bannerURL({ dynamic: true, format: `png` })}`)
  
    .setTimestamp()
    .setColor(Color)
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]});

});
client.on("guildAfkChannelAdd", async (guild, afkChannel) => {
      let member = guild;
  let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: members.guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
 .setThumbnail(guild?.iconURL({dynamic:true}))
.setAuthor(`�AFK channel added`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)   
    .setTitle(`#${afkchannel.name} AFK channel Added`)
.setColor(Color)
.setDescription(`AFK channel:\n> ${afkchannel}`)
    .setFooter(`ID: ${afkchannel.id}`)
    .setTimestamp()
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildVanityURLAdd", async (guild, vanityURL) => {     let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
      .setThumbnail(guild?.iconURL({dynamic:true})) 
.setAuthor(`Vanity updates`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)          .setColor(Color)
.setDescription(`Vanity URL added:\n> ${vanityURL}`)
.setColor(Color)
    .setFooter(`ID: ${guild.id}`)
    .setTimestamp()
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildVanityURLRemove", async (guild, vanityURL) => {     
  let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: guild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
      

.setDescription(`New Vanity:\n> ${vanityURL}`)
.setColor(Color)
    .setFooter(`ID: ${guild.id}`)
    .setTimestamp()
return guild.channels.cache.get(f.Channel).send({ embeds: [embed] })
});
client.on("guildVanityURLUpdate", async (guild, oldVanityURL, newVanityURL) => {
  let member = guild;
 let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: guild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: guild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
      
.setAuthor(`Vanity URL updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)        
    .setColor(Color)
.setDescription(`>>> \`${oldVanityURL}\` >>> \`${newVanityURL}\``)
      .setThumbnail(guild?.iconURL({dynamic:true}))
    .setFooter(`Guild ID: ${guild.id}`)
    .setTimestamp()
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]});

  
});
client.on("guildFeaturesUpdate", async (oldGuild, newGuild) => {
  let member = newGuild;
let guild = newGuild;
      let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: oldGuild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: oldGuild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
      
.setAuthor(`Server features updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)          .setColor(Color)
      .setDescription(`New features:\n> ${newGuild.features.join(", ")}`)
    .setFooter(`ID: ${oldGuild.id}`)
    .setTimestamp()
      .setThumbnail(oldGuild?.iconURL({dynamic:true}))
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]})


});

client.on("guildOwnerUpdate", async (oldGuild, newGuild) => {
  let member = newGuild;
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: oldGuild.id,
    guildUpdate: true,
  }) || await DB.findOne({
    GuildID: oldGuild.id,
    All: true,
  });
  if(!f) return;

    const embed = new MessageEmbed()
      
.setAuthor(`Server ownership updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)      
            .setThumbnail(oldGuild?.iconURL({dynamic:true}))
      .setColor(Color)
.setDescription(`${newGuild.name}'s new owner:\n> <@${newGuild.ownerId}>`)
      .addField(`Ownership Transferred From:`, `>>> <@${oldGuild.ownerId}>`)
    .setFooter(`ID: ${oldGuild.id}`)
    .setTimestamp()
return guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

  })

client.on("rolePermissionsUpdate",async (role, oldPermissions, newPermissions) => {
      let member = role;
   let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    roleUpdate: true,
  }) || await DB.findOne({
    GuildID: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
      
.setAuthor(`.Role permissions updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)        .setColor(Color)
      .setDescription(`New permissions: ${role.permissions.toArray()}`)
      .setThumbnail(channel.guild?.iconURL({dynamic:true}))
    .setFooter(`Role ID: ${role.id} | Role name: ${role.name}`)
    .setTimestamp()
return role.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildChannelTopicUpdate",async (channel, oldTopic, newTopic) => {
     let member = channel;
     let role = channel;
   let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    channelUpdate: true,
  }) || await DB.findOne({
    chnanelUpdate: member.guild.id,
    All: true,
  });
  if(!f) return;
    const embed = new MessageEmbed()
.setThumbnail(channel.guild?.iconURL({dynamic:true}))
.setAuthor(`Channel topic updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)           .setColor(Color)
.addField(`Updates`, `**Old Topic**: ${oldTopic}\n**New Topic**: ${newTopic}`)
    .setColor(Color)
    .setFooter(`ID: ${role.id} | Name: ${role.name}`)
    .setTimestamp()
return channel.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})

});
client.on("guildChannelPermissionsUpdate", async (channel, oldPermissions, newPermissions) => {
     let member = channel;
     let role = channel;
    let DB = require(`./database/guildData/logs`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
    channelUpdate: true,
  }) || await DB.findOne({
    chnanelUpdate: member.guild.id,
    All: true,
  });
    const embed = new MessageEmbed()
      .setThumbnail(channel.guild?.iconURL({dynamic:true}))
.setAuthor(`Channel Permissions Updated`, `https://cdn.discordapp.com/emojis/966694961925988463.webp?size=96&quality=lossless`)          .setColor(Color)
   .setDescription(`**Channel**: ${role} was updated.`)
      .setFooter(`Channel ID: ${role.id} | Channel name: ${role.name}`)
    .setTimestamp()
return channel.guild.channels.cache.get(f.Channel).send({ embeds: [embed]})
});
client.on('guildMemberUpdate', async (oldMember, newMember) => {
let member = newMember;
  if (!oldMember.premiumSince && newMember.premiumSince) {
  let message = member;
 let interaction = member;
let mc = member.guild.memberCount;
    console.log(`${member.user.tag} just boosted ${member.guild.name}!`);
  let DB = require(`./database/guildData/boostlog`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
  });
  if(!f) return;
  //await member.guild.members.fetch();
  let msg = f.Message || `{
  "content": "> Thanks for **boosting**!",
  "embeds": [
    {
      "title": ":tada: New Booster",
      "description": "**Booster**: {member_mention}",
      "color": 15100413
    }
  ],
  "attachments": []
}`;
       msg = msg.replace("{member_mention}", `${member}`);
     msg = msg.replace("{member_tag}", `${member.user.tag}`);
   msg = msg.replace("{member}", `${member}`);
   msg = msg.replace("{member_id}", `${member.user.id}`);
     msg = msg.replace("{server}", `${member.guild.name}`);
         msg = msg.replace("{member_name}", `${member.user.username}`);
     msg = msg.replace(/{member_createdAgo}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:F>`)
     msg = msg.replace(/{member_createdAt}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:R>`);

       msg = msg.replace("{server_boosts}", `${member.guild.premiumSubscriptionCount}`);
    msg = msg.replace("{server_boosters}", `${member.guild.members.cache.filter((m) => m.premiumSince).size}`);
  msg = msg.replaceAll("{member_pfp}", `${member.user.displayAvatarURL({dynamic:true})}`);
      msg = msg.replace(
       "{server_membercount}",
       `${member.guild.memberCount}`
     );
      msg = msg.replaceAll(
       "{server_icon}",
       `${member.guild?.iconURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{footer_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{footer_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );

    if(msg.startsWith("{") && msg.endsWith("}")){
      
let emb = JSON.parse(msg);
    return  member.guild.channels.cache.get(f.Channel).send(emb)
    }
      
    return  member.guild.channels.cache.get(f.Channel).send(msg)
    }
});
 client.on('guildMemberAdd', async (member) => {
  let message = member;
 let interaction = member;
  let DB = require(`./database/guildData/welc`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
  });
  if(!f || !f.Channel) return;
let mc = member.guild.memberCount;
const nth = function (d) {
	const dString = String(d);
	const last = +dString.slice(-2);
	if (last > 3 && last < 21) return "th";
	switch (last % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
};
  let msg = f.Message || `Welcome to the server {member_mention}!`;
       msg = msg.replaceAll("{member_mention}", `${member}`);
     msg = msg.replaceAll("{member_tag}", `${member.user.tag}`);
     msg = msg.replaceAll("{member_name}", `${member.user.username}`);
     msg = msg.replaceAll(/{member_createdAgo}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:F>`)
   msg = msg.replaceAll(/{member_createdAt}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:R>`);

   msg = msg.replaceAll("{member}", `${member}`);
   msg = msg.replaceAll("{member_id}", `${member.user.id}`);
     msg = msg.replaceAll("{server}", `${member.guild.name}`);
      msg = msg.replaceAll("{member_place}", `${nth(mc)}`);
  msg = msg.replaceAll("{member_pfp}", `${member.user.displayAvatarURL({dynamic:true})}`);
      msg = msg.replaceAll(
       "{server_membercount}",
       `${member.guild.memberCount}`
     );
  msg = msg.replaceAll(
       "{server_icon}",
       `${member.guild?.iconURL({dynamic:true})}`
     )
 msg = msg.replace(
       "{footer_member_pfp}",
       `${member.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{footer_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );

    if(msg.startsWith("{") && msg.endsWith("}")){
      
let emb = JSON.parse(msg);
    return  member.guild.channels.cache.get(f.Channel).send(emb)
    }
      
    return  member.guild.channels.cache.get(f.Channel).send(msg)
    
});
client.on('guildMemberRemove', async (member) => {
  let message = member;
  let interaction = member;
  let DB = require(`./database/guildData/leave`)
  let f = await DB.findOne({
    GuildID: member.guild.id,
  });
let mc = member.guild.memberCount;
  if(!f || !f.Channel) return;
const nth = function (d) {
	const dString = String(d);
	const last = +dString.slice(-2);
	if (last > 3 && last < 21) return "th";
	switch (last % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
};
  let msg = f.Message || `**{member_tag}** sadly has left the server.`;
       msg = msg.replaceAll("{member_mention}", `${member}`);
     msg = msg.replaceAll("{member_tag}", `${member.user.tag}`);
     msg = msg.replaceAll("{member_name}", `${member.user.username}`);
     msg = msg.replaceAll(/{member_createdAgo}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:F>`)
   msg = msg.replaceAll(/{member_createdAt}/g, `<t:${parseInt(member.user.createdTimestamp / 1000 )}:R>`);
 msg = msg.replaceAll(/{member_roles}/g, `${member.roles.cache.sort((a, b) => b.position - a.position).map(r => r).join(" ").replace("@everyone", "") || "None"}`);

   msg = msg.replaceAll("{member}", `${member}`);
   msg = msg.replaceAll("{member_id}", `${member.user.id}`);
     msg = msg.replaceAll("{server}", `${member.guild.name}`);
      msg = msg.replaceAll("{member_place}", `${nth(mc)}`);
  msg = msg.replaceAll("{member_pfp}", `${member.user.displayAvatarURL({dynamic:true})}`);
      msg = msg.replaceAll(
       "{server_membercount}",
       `${member.guild.memberCount}`
     );
    msg = msg.replaceAll(
       "{server_icon}",
       `${member.guild?.iconURL({dynamic:true})}`
     )
 msg = msg.replaceAll(
       "{footer_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_member_pfp}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{footer_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
 msg = msg.replace(
       "{thumbnail_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );
msg = msg.replace(
       "{author_server_icon}",
       `${interaction.user?.displayAvatarURL({dynamic:true})}`
     );

    if(msg.startsWith("{") && msg.endsWith("}")){
      
let emb = JSON.parse(msg);
    return  member.guild.channels.cache.get(f.Channel).send(emb)
    }
      
    return  member.guild.channels.cache.get(f.Channel).send(msg)
    
});

client.on('messageCreate', async message => { 
  let msg = message;
if(message.content.includes(`$eval`)) { 
    let owner = ["1117336878715256832"]

if(message.content.match(`token`)) {
  return; 
}
  if (!owner.includes(message.author.id)) return;
        const prefix = '$eval'
         const args = message.content

    .slice(prefix.length)
    .trim()
    .split(/ +/g);
          try {
      const code = args.join(" ");
      if (!code) {
        return message.channel.send("Missing args");
      }
    


      let evaled = await eval(code)

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

      let embed = new MessageEmbed()
        .addField("Output", `\`\`\`${evaled}\`\`\``)
          .setColor(Color)
      message.channel.send({ embeds: [embed] });
      

    } catch (err) {
     
       let embed1 = new MessageEmbed()
        .setAuthor("ERROR", message.author.avatarURL({ dynamic: true, }))
      .setDescription(`\`\`\`\n${err}\n\`\`\``)
      .setColor(Color)
      message.channel.send({
        embeds: [embed1]
      });
    }

  }
})
client.on(`interactionCreate`, async interaction => { 
const { ButtonInteraction, Client, EmbedBuilder } = require("discord.js");
const DB = require("./database/guildData/GiveawayDB");
    if (!interaction.isButton()) return;
        if (interaction.customId !== "giveaway-join") return;
await interaction.deferReply({ ephemeral: true })
await wait(450)
        const embed = new EmbedBuilder();
        const data = await DB.findOne({
            GuildID: interaction.guild.id,
            ChannelID: interaction.channel.id,
            MessageID: interaction.message.id
        });

        if (!data) {
            embed
               .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})

                .setDescription("There is no data found in this guild's database..");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        if (data.Entered.includes(interaction.user.id)) {
            embed
                .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})
                .setDescription("Hmm, lol you already entered this giveaway!");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        if (data.Paused === true) {
            embed
              .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})

                .setDescription("That giveaway is paused");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        if (data.Ended === true) {
            embed
                .setColor(Color)

.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})
                .setDescription("This giveaway has ended");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        await DB.findOneAndUpdate({
            GuildID: interaction.guild.id,
            ChannelID: interaction.channel.id,
            MessageID: interaction.message.id
        }, {
            $push: { Entered: interaction.user.id }
        }).then(async () => {
await db.add(`Entries${interaction.message.id}`, 1)

let g = await db.get(`Entries${interaction.message.id}`);

            embed
                .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})

                .setDescription("You have successfully joined the giveaway");
            interaction.followUp({ embeds: [embed], ephemeral: true });
     const e = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
                .setCustomId("giveaway-join")
             
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enter"),
            new ButtonBuilder()
                         .setDisabled(true)
.setCustomId(`sjjajsjajs`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`Entries: ${g}`)
        );

return interaction.message.edit({ components: [e] });
        });
})
client.on(`interactionCreate`, async interaction => { 
const { Client, EmbedBuilder, ModalSubmitInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ms = require("ms");
const { endGiveaway } = require("./Utils/GiveawayFunctions");
const DB = require("./database/guildData/GiveawayDB");
     if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== "giveaway-options") return;

        const embed = new EmbedBuilder();

        const prize = interaction.fields.getTextInputValue("giveaway-prize").slice(0, 256);
        const winners = Math.round(parseFloat(interaction.fields.getTextInputValue("giveaway-winners")));
        const duration = ms(interaction.fields.getTextInputValue("giveaway-duration"));

        if (isNaN(winners) || !isFinite(winners) || winners < 1) {
            embed
                .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})

                .setDescription("⚠️ Please provide a valid winner count");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (duration === undefined) {
            embed
                .setColor(Color)
.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({dynamic:true})})

                .setDescription("⚠️ Please provide a valid duration");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const formattedDuration = parseInt((Date.now() + duration) / 1000);

        const giveawayEmbed = new EmbedBuilder()
            .setColor(Color)
            .setTitle(prize)
            .setDescription(`**Hosted By**: ${interaction.member}\n**Winners**: ${winners}\n**Ends In**: <t:${formattedDuration}:R> (<t:${formattedDuration}>)`)
.setFooter({ text: `Giveaway Drawing:`, iconURL: interaction.guild.iconURL({dynamic:true})})
            .setTimestamp(parseInt(Date.now() + duration));

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("giveaway-join")
             
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enter")
        );

        interaction.reply({ content: ":tada: **Giveaway Started** :tada:", embeds: [giveawayEmbed], components: [button], fetchReply: true }).then(async (message) => {
            await DB.create({
                GuildID: interaction.guild.id,
                ChannelID: interaction.channel.id,
                EndTime: formattedDuration,
                Ended: false,
                HostedBy: interaction.user.id,
                Prize: prize,
                Winners: winners,
                Paused: false,
                MessageID: message.id,
                Entered: []
            }).then((data) => {
    setInterval(async () => {
   if (!data.Ended) return;
let sec = data.Timer - 10000;
                 await  DB.findOneAndUpdate({       GuildID: interaction.guild.id, 
Timer: sec});
                }, 10000);

                setTimeout(async () => {
                    if (!data.Ended) endGiveaway(message);
                }, duration);
            });
        })
})
client.on("ready", async c => { 
  const DB = autopfp;
  const delay = (ms) => new Promise(r => setTimeout(() => r(2), ms));
client.guilds.cache.forEach(async g => await g.members.fetch())
    setInterval(async () => {
   
    
  c.guilds.cache.forEach(async g => {
    const e = await DB.findOne({
      GuildID: g.id,
    });

    if(e) {
      g.channels.cache.forEach(async channel => { 
await wait(500)
    const ee = await DB.findOne({
      GuildID: g.id,
      ChannelID: channel.id
    });

        if(ee) {

let f;
          f = async () => { 
       let user =  client.users.cache.random()
          if(user.displayAvatarURL({dynamic:true})?.match('embed')) return f();
    const o2w = new MessageActionRow()
			.addComponents(
         new MessageButton()
	.setCustomId("e2s")
.setDisabled(true)
					.setLabel(`${user.tag}`)
					.setStyle(ButtonStyle.Secondary))

            channel.send({ components: [o2w], embeds: [new EmbedBuilder()

.setColor(Color) 
                                   .setImage(user.displayAvatarURL({dynamic: true, size: 4096}))]})
        }
        
   
    
   await f()
       
                              
  
    
   
      
    }
      })
                               }
  })
      
    
       
    }, 60 * 1000)
  

})
client.on(`guildCreate`, async guild => {
  return
let Guild = require(`./database/guildData/premium`);
if(!await Guild.findOne({ GuildID: guild.id })) {
let ch = await guild.channels.cache.random()
setTimeout(() => { 
guild.leave();
},12000)
     const row = new MessageActionRow()
			.addComponents(
        new MessageButton()

					.setLabel(`Support Server`)
     .setURL(`https://discord.gg/DPpWF8jF4W`)
      					.setStyle(ButtonStyle.Link))

ch.send({ components: [row], embeds: [new MessageEmbed()
.setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({dynamic:true}) })
.setColor(Color)
.setDescription(`This server is not authorized, please join our [**support server**](https://discord.gg/DPpWF8jF4W) to get authorized thanks :)`)], })
    const user = await guild.fetchAuditLogs({
    type: AuditLogEvent.BotAdd,
  }).then(audit => audit.entries.first())
  const entry = user.executor;
if(entry) {
entry.send({ components: [row], embeds: [new MessageEmbed()
.setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({dynamic:true}) })
.setColor(Color)
.setDescription(`This server is not authorized, please join our [**support server**](https://discord.gg/DPpWF8jF4W) to get authorized thanks :)`)], }).catch((e) => guild.leave())
}

 guild.leave()
}
})
client.on(`ready`, async client => {
  return;
let Guild = require(`./database/guildData/premium`);
 setInterval(async () => {
      await Guild.find({ }).exec(async (err, result) => {
     for (let i = 0; i < result.length; i++) {
if(!result[i].GuildID) return console.log(`hmm`);
if(!result[i].time) console.log(`1`);
if(!result[i].expires) console.log(`2`);

          if (
            Number(result[i].time) >=
            Number(result[i].expires)
          ) {

            const guildPremium = client.guilds.cache.get(result[i].GuildID);
          
          
            
           let ch =  guildPremium.channels.cache.random()
ch.send(`This server has lost premium please renew it: https://discord.gg/WJhUSDw4pM`).catch(() => {});


             
          
              await Guild.findOneAndRemove({ GuildID: result[i].GuildID }).catch(() => {});
            
              }
}
})
    }, 3 * 1000);
})
client.on(`ready`, async client => {
const { endGiveaway } = require("./Utils/GiveawayFunctions");

const DB = require("./database/guildData/GiveawayDB");
  await DB.find({ }).exec(async (err, result) => {
     for (let i = 0; i < result.length; i++) {
let guild = result[i].GuildID;
let timer = result[i].Timer;
let msg = result[i].MessageID;

if(guild && timer && msg ) {
console.log(`${timer}  | ${guild}`)
 setTimeout(async () => {

                    if (!result[i].Ended) { 
let m = await client.guilds.cache.get(guild).channels.cache.get(result[i].ChannelID).messages.fetch(msg);
 endGiveaway(m);
}
                }, timer); 

}
}
})
})
client.on(`guildBanAdd`, async ban => {   
 let message = ban;
let guild = ban.guild;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);

  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Bans || f.Bans === false) return;
  
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.MemberBanAdd,
  }).then(audit => audit.entries.first())
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
//console.log(`okkkkk`);

  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || await db.get(`whitelisted${guild.id}${user.id}`)) return;

let qdb = await db.get(`bansuser${ban.guild.id},${user.id}`);
if(qdb > 3) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`bansuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
    await db.subtract(`bansuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${ban.user} was banned by the moderator: ${entry} `)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)

ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
  })
client.on(`guildMemberRemove`, async member => {   
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Kicks || f.Kicks === false) return
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.MemberKick,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || db.get(`whitelisted${guild.id}${user.id}`)) return;


let qdb = await db.get(`kicksuser${ban.guild.id},${user.id}`);
if(qdb > 3) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);

ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`kicksuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
    await db.subtract(`kicksuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${ban.user} was kicked by the moderator: ${entry} `)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });

  })
client.on(`channelCreate`, async channel => {   
let member = channel;
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Channels || f.Channels === false) return;
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.ChannelCreate,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || db.get(`whitelisted${guild.id}${user.id}`)) return;

let qdb = db.get(`channelsuser${ban.guild.id},${user.id}`);
if(qdb > 4) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
  return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`channelsuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
    await db.subtract(`channelsuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${channel} was created by ${entry}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)

ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
  })
client.on(`channelDelete`, async channel => {   
let member = channel;
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Channels || f.Channels === false) return;
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.ChannelDelete,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || await db.get(`whitelisted${guild.id}${user.id}`)) return;


let qdb = await db.get(`channelsuser${ban.guild.id},${user.id}`);
if(qdb > 5) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
  console.log(`lmfao`);
return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`channelsuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
    await db.subtract(`channelsuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${channel.name} was deleted by ${entry}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });


  })
client.on(`roleDelete`, async channel => {   

let member = channel;
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Roles || f.Roles === false) return;
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.RoleDelete,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || await db.get(`whitelisted${guild.id}${user.id}`)) return;

let qdb = await db.get(`rolesuser${ban.guild.id},${user.id}`);
if(qdb > 5) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
  console.log(`lmfao`);
return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });

}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`rolesuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
    await db.subtract(`rolesuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${channel.name} was deleted by ${entry}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });


  })
client.on(`roleCreate`, async role => {   
let channel = role;
let member = channel;
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Roles || f.Roles === false) return;
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.RoleCreate,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || db.get(`whitelisted${guild.id}${user.id}`)) return;


let qdb = await db.get(`rolesuser${ban.guild.id},${user.id}`);
if(qdb > 5) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
  console.log(`lmfao`);
return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
await db.add(`rolesuser${ban.guild.id},${user.id}`, 1);
  setTimeout(async () => {
await db.subtract(`rolesuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${channel.name} was created by ${entry}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });

  })
client.on(`roleCreate`, async role => {  
  return;
let channel = role;
let member = channel;
 let message = member;
let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Roles || f.Roles === false) return
 let e = await guild.fetchAuditLogs({
    type: AuditLogEvent.RoleCreate,
  }).then(audit => audit.entries.first())
if(!e) return;
  const entry = e.executor;
if(entry.id === client.user.id) return;
let user = await message.guild.members.fetch(entry.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || db.get(`whitelisted${guild.id}${user.id}`)) return;


let qdb = db.get(`rolesuser${ban.guild.id},${user.id}`);
if(qdb > 5) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for reaching anti nuke moderator limits.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
  console.log(`lmfao`);
return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

//user.send(`Anti-nuke is in this server, so be careful on how much you **ban/kick**.`);
db.add(`rolesuser${ban.guild.id},${user.id}`, 1);
  setTimeout(() => {
db.subtract(`rolesuser${ban.guild.id},${user.id}`, 1);

}, 10000) 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${channel.name} was created by ${entry}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });

  })

client.on(`messageCreate`, async message => {   
if(message.author.bot) return;
if(!message.guild) return;
let channel = message;
let member = channel;

let guild = member.guild;
let ban = member;
let cooldowns = new Discord.Collection();
  let DB = require(`./database/guildData/antinuke`);
  let f = await DB.findOne({
    GuildID: ban.guild.id,
  });
  if(!f || !f.Pings || f.Pings === false) return 
let user = await message.guild.members.fetch(message.author.id);
  const bl = [`${guild.ownerId}`]
if (bl.includes(user.id) || await db.get(`whitelisted${guild.id}${user.id}`)) return;


let qdb = await db.get(`pingsuser${ban.guild.id},${user.id}`);
if(qdb > 1) {
user.ban({ reason: `This server has antinuke enabled, to bypass the owners of the server must whitelist you.` });
 const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} was punished for pinging @here/@everyone to fast.`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color);
 return ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}

if(message.content.match(`@here`) || message.content.match(`@everyone`)) { 

if(message.member.permissions.has(`MENTION_EVERYONE`)) { 

await db.add(`pingsuser${ban.guild.id},${user.id}`, 1);
}
}
  setTimeout(async () => {
    await db.subtract(`pingsuser${ban.guild.id},${user.id}`, 1);

}, 12000) 
if(message.content.match(`@here`) || message.content.match(`@everyone`)) { 
  const embed = new MessageEmbed()
   .setAuthor({ name:`${ban.guild.name}`, iconURL: ban.guild.iconURL({dynamic:true})})
    .setDescription(`${user} pinged @everyone/@here in ${message.channel}`)
.setTimestamp()
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor(Color)
ban.guild.channels.cache.get(f.Channel).send({ embeds: [embed] });
}
  })
client.on(`guildMemberAdd`, async member => {
return
let guild = member.guild;
if(!member.user.bot) return;
let Guild = require(`./database/guildData/antibot`);
let chelet = await Guild.findOne({ 
  GuildID: guild.id,
Enabled: true
})
if(chelet) { 
  
  let check = await Guild.findOne({ 
  GuildID: guild.id,
Whitelisted: member.user.id})
 if(!check) member.kick(`This bot is not authorized to enter this guild, authorize it by using /antibot whitelist.`);

}
})
client.generateEmbed = async function (start, end, lb, title, interaction) {
  const current = lb.slice(start, end + 10);
  const result = current.join("\n");

  let embed = new EmbedBuilder()
      .setTitle(`${title}`)
      .setDescription(`${result.toString()}`)
.setColor(Color)
.setThumbnail(interaction.guild.iconURL({dynamic:true}) || null) 
  return embed;
}

client.createLeaderboard = async function (title, lb, interaction) {
  interaction.editReply({ embeds: [await client.generateEmbed(0, 0, lb, title, interaction)], fetchReply: true }).then(async msg => {
      if (lb.length <= 10) return;

      let button1 = new Discord.ButtonBuilder()
          .setCustomId('back_button')
          .setEmoji('⬅️')
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(true);

      let button2 = new Discord.ButtonBuilder()
          .setCustomId('forward_button')
          .setEmoji('➡️')
          .setStyle(Discord.ButtonStyle.Primary);

      let row = new Discord.ActionRowBuilder()
          .addComponents(button1, button2);

      msg.edit({ embeds: [await client.generateEmbed(0, 0, lb, title, interaction)], components: [row] })

      let currentIndex = 0;
      const collector = interaction.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 60000 });

      collector.on('collect', async (btn) => {
          if (btn.user.id == interaction.user.id && btn.message.id == msg.id) {
              btn.customId === "back_button" ? currentIndex -= 10 : currentIndex += 10;

              let btn1 = new Discord.ButtonBuilder()
                  .setCustomId('back_button')
                  .setEmoji('⬅️')
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setDisabled(true);

              let btn2 = new Discord.ButtonBuilder()
                  .setCustomId('forward_button')
                  .setEmoji('➡️')
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setDisabled(true);

              if (currentIndex !== 0) btn1.setDisabled(false);
              if (currentIndex + 10 < lb.length) btn2.setDisabled(false);

              let row2 = new Discord.ActionRowBuilder()
                  .addComponents(btn1, btn2);

              msg.edit({ embeds: [await client.generateEmbed(currentIndex, currentIndex, lb, title, interaction)], components: [row2] });
              btn.deferUpdate();
          }
      })

      collector.on('end', async (btn) => {
          let btn1Disable = new Discord.ButtonBuilder()
              .setCustomId('back_button')
              .setEmoji('⬅️')
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(true);

          let btn2Disable = new Discord.ButtonBuilder()
              .setCustomId('forward_button')
              .setEmoji('➡️')
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(true);

          let rowDisable = new Discord.ActionRowBuilder()
              .addComponents(btn1Disable, btn2Disable);

          msg.edit({ embeds: [await client.generateEmbed(currentIndex, currentIndex, lb, title, interaction)], components: [rowDisable] });
      })
  })
}
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database
  let userId = executorId;
  if(executorId === client.user.id) return;
  let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.Kicks && guildSettings.Kicks === false) return;
if(!guildSettings.Kicks) return;

	// Check only for kicked users.
	if (action !== AuditLogEvent.MemberKick) return;
	const executor = await client.users.fetch(executorId);
	const kickedUser = await client.users.fetch(targetId);
  if (executor) {
   let whitelistDB = await whitelist.findOne({
    GuildID: guild.id,
    userId: executor.id,
   });
   if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
   if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
   if(whitelistDB && whitelist.Kickswhitelisted && whitelist.Kickswhitelisted === true) return;
   let Threshold = 5;
   if(guildSettings.Kicksthreshold)  Threshold = guildSettings.Kicksthreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.KicksCount += 1;
      await userKicks.save();
   
      if (userKicks.KicksCount >= Threshold) {
        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.KicksCount = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.KicksCount = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.KicksCount = 0;
              await userKicks.save();
            }
      }
     
await wait(1000)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.KicksCount}
        Action: Kicking user(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
        Member Kicked: ${kickedUser}
 

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
      setTimeout(async () => {
        userKicks.KicksCount -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    KicksCount: 1,
   }).save();
   setTimeout(async () => {
   userKicks.KicksCount -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  let userId = executorId;
  if(executorId === client.user.id) return;

  // Fetch the guild settings from the database
  let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.Bans && guildSettings.Bans === false) return;
if(!guildSettings.Bans) return;
	// Check only for kicked users.
	if (action !== AuditLogEvent.MemberBanAdd) return;
	const executor = await client.users.fetch(executorId);
	const kickedUser = await client.users.fetch(targetId);
  if (executor) {
   let whitelistDB = await whitelist.findOne({
    GuildID: guild.id,
    userId: executor.id,
   });
   if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
   if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
   if(whitelistDB && whitelist.Banswhitelisted && whitelist.Banswhitelisted === true) return;
   let Threshold = 5;
   if(guildSettings.Bansthreshold)  Threshold = guildSettings.Bansthreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.BansCount += 1;
      await userKicks.save();
    
      if (userKicks.BansCount >= Threshold) {
        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.BansCount = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.BansCount = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.BansCount = 0;
              await userKicks.save();
            }
      }    

  await wait(1000)
        setTimeout(async () => {
        
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setThumbnail(guild?.iconURL())
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle(`${guild.name} Nuke Logs`)
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.BansCount}
        Action: Banning user(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
        Member Banned: ${kickedUser}
 

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]});
      }
      }, 10 * 1000)
      
      setTimeout(async () => {
        userKicks.BansCount -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    BansCount: 1,
   }).save();
   setTimeout(async () => {
   userKicks.BansCount -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database
  let owner = await guild.fetchOwner();
  let userId = executorId;
  if(executorId === client.user.id) return;

   if(executorId === owner.id) return;
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.RoleCreate && guildSettings.RoleCreate === false) return;
if(!guildSettings.RoleCreate) return;
	// Check only for kicked users.
	if (action !== AuditLogEvent.RoleCreate) return;
	const executor = await client.users.fetch(executorId);
	//const kickedUser = await client.users.fetch(targetId);
  if (executor) {
    let whitelistDB = await whitelist.findOne({
      GuildID: guild.id,
      userId: executor.id,
     });
     if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
     if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
     if(whitelistDB && whitelist.RoleCreatewhitelisted && whitelist.RoleCreatewhitelisted === true) return;
     let Threshold = 5;
     if(guildSettings.RoleCreatethreshold)  Threshold = guildSettings.RoleCreatethreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.CreateRoleCount += 1;
      await userKicks.save();
    
      if (userKicks.CreateRoleCount >= Threshold) {
        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.CreateRoleCount = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.CreateRoleCount = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.CreateRoleCount = 0;
              await userKicks.save();
            }
      }
    await wait(1500)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.CreateRoleCount}
        Action: Creating roles(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
        

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
      setTimeout(async () => {
        userKicks.CreateRoleCount -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    CreateRoleCount: 1,
   }).save();
   setTimeout(async () => {
   userKicks.CreateRoleCount -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database
  let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
   let userId = executorId;
   if(executorId === client.user.id) return;

  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.RoleDelete && guildSettings.RoleDelete === false) return;
if(!guildSettings.RoleDelete) return;
	// Check only for kicked users.
	if (action !== AuditLogEvent.RoleDelete) return;
	const executor = await client.users.fetch(executorId);
	//const kickedUser = await client.users.fetch(targetId);
  if (executor) {
    let whitelistDB = await whitelist.findOne({
      GuildID: guild.id,
      userId: executor.id,
     });
     if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
     if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
     if(whitelistDB && whitelist.RoleDeletewhitelisted && whitelist.RoleDeletewhitelisted === true) return;
     let Threshold = 5;
     if(guildSettings.RoleDeletehreshold)  Threshold = guildSettings.RoleDeletehreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.DeleteRoleCount += 1;
      await userKicks.save();
    
      if (userKicks.DeleteRoleCount >= Threshold) {
        punished = `User has enough thresolds, attmeping to punish.` 
        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.DeleteRoleCount = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.DeleteRoleCount = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.DeleteRoleCount = 0;
              await userKicks.save();
            }
      }
   await wait(1500)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.DeleteRoleCount}
        Action: Deleting roles(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
 

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
      setTimeout(async () => {
        userKicks.DeleteRoleCount -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    DeleteRoleCount: 1,
   }).save();
   setTimeout(async () => {
   userKicks.DeleteRoleCount -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database
  let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
   if(executorId === client.user.id) return;

   let userId = executorId;
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.ChannelCreate && guildSettings.ChannelCreate === false) return;
if(!guildSettings.ChannelCreate) return;
	// Check only for kicked users.
	if (action !== AuditLogEvent.ChannelCreate) return;
	const executor = await client.users.fetch(executorId);
	//const kickedUser = await client.users.fetch(targetId);
  if (executor) {
    let whitelistDB = await whitelist.findOne({
      GuildID: guild.id,
      userId: executor.id,
     });
     if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
     if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
     if(whitelistDB && whitelist.ChannelCreatewhitelisted && whitelist.ChannelCreatewhitelisted === true) return;
     let Threshold = 5;
     if(guildSettings.ChannelCreatethreshold)  Threshold = guildSettings.ChannelCreatethreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.ChannelCreateCounts += 1;
      await userKicks.save();
    
      if (userKicks.ChannelCreateCounts >= Threshold) {
        punished = `User has enough thresolds, attmeping to punish.` 

        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.ChannelCreateCounts = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.ChannelCreateCounts = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.ChannelCreateCounts = 0;
              await userKicks.save();
            }
      }
   await wait(1500)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.ChannelCreateCounts}
        Action: Creating channel(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
 

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
      setTimeout(async () => {
        userKicks.ChannelCreateCounts -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    ChannelCreateCounts: 1,
   }).save();
   setTimeout(async () => {
   userKicks.ChannelCreateCounts -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database
  
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.ChannelDelete && guildSettings.ChannelDelete === false) return;
if(!guildSettings.ChannelDelete) return;
	// Check only for kicked users.
  let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
   if(executorId === client.user.id) return;

   let userId = executorId;
	if (action !== AuditLogEvent.ChannelDelete) return;
	const executor = await client.users.fetch(executorId);
	//const kickedUser = await client.users.fetch(targetId);
  if (executor) {
    let whitelistDB = await whitelist.findOne({
      GuildID: guild.id,
      userId: executor.id,
     });
     if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
     if(whitelistDB  && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
     if(whitelistDB && whitelist.ChannelDeletewhitelisted && whitelist.ChannelDeletewhitelisted === true) return;
     let Threshold = 5;
     if(guildSettings.ChannelDeletethreshold)  Threshold = guildSettings.ChannelDeletethreshold || 5;
   let punished = `User does not enough thresolds to punish.`;
    const userKicks = await whitelist.findOne({ GuildID: guild.id, userId: executor.id });
    if (userKicks) {
      userKicks.ChannelDeleteCounts += 1;
      await userKicks.save();
    
      if (userKicks.ChannelDeleteCounts >= Threshold) {
        punished = `User has enough thresolds, attmeping to punish.` 
        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
          userKicks.ChannelDeleteCounts = 0;
          await userKicks.save();
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
            userKicks.ChannelDeleteCounts = 0;
            await userKicks.save();
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
              userKicks.ChannelDeleteCounts = 0;
              await userKicks.save();
            }
      }

      await wait(1700)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Thresold: ${Threshold || 5}/60s
        User Thresolds: ${userKicks.ChannelDeleteCounts}
        Action: Deleteing channel(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: ${punished}
 

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
      setTimeout(async () => {
        userKicks.ChannelDeleteCounts -= 1;
        await userKicks.save();
        }, 60 * 1000)
    } else {
   new whitelist({
    GuildID: guild.id, 
    userId: executor.id,
    ChannelDeleteCounts: 1,
   }).save();
   setTimeout(async () => {
   userKicks.ChannelDeleteCounts -= 1;
   await userKicks.save();
   }, 60 * 1000)
    }
  }

});
client.on(Events.GuildCreate, async (guild) => {
  const fetchedLogs = await guild.fetchAuditLogs({
    type: AuditLogEvent.BotAdd,
    limit: 1,
  });
  
  
  const firstEntry = fetchedLogs.entries.first();
  const { action, executorId, targetId  } = firstEntry;
  await client.users.fetch(executorId)
  if(targetId === client.user.id) {
   guild.members.cache.get(executorId).send({
embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .addFields(
    { name: `Premium?`, value: `Consider getting premium and unlock access to some more benefits, check here </premium benefits:1127110734787137608>` },
    { name: `Need help?`, value: `If you have questions, concerns or want to report a bug please [**click here**](https://discord.gg/wVWq9wfMEV)` },
  )
  .setDescription(`${emoji.success} Thanks for inviting me to **${guild.name}**!`)
]
   });
  }

});

client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
  const creq = require("request")
let guild = newGuild;
if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.Antivanity && guildSettings.Antivanity === false) return;
if(!guildSettings.Antivanity) return;

const fetchedLogs = await guild.fetchAuditLogs({
	type: AuditLogEvent.GuildUpdate,
	limit: 1,
});


const firstEntry = fetchedLogs.entries.first();
const { action, executorId, targetId  } = firstEntry;
if(executorId === client.user.id) return;
	const executor = await client.users.fetch(executorId);
  if (executor) {
   let whitelistDB = await whitelist.findOne({
    GuildID: guild.id,
    userId: executor.id,
   });
   if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
   if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
   if(whitelistDB && whitelistDB.GuildUpdatewhitelisted && whitelistDB.GuildUpdatewhitelisted === true) return;
   let owner = await guild.fetchOwner();
   if(executorId === owner.id) return;
   if(whitelistDB) return;
   let punished = `User does not enough thresolds to punish.`;


    
   
        punished = `User has enough thresolds, attmeping to punish.` 

        if(guildSettings.punishment.includes('ban')) { 
        guild.members.ban(executor.id, { reason: 'Antinuke threshold reached.' })
          .then(() => {
    punished = `User was banned`;

            console.log(`${emoji.success} Banned user ${userId} from guild ${guild.id} for exceeding thresold.`)
          })
          .catch(console.error);
       
        }
        if(guildSettings.punishment.includes('kick')) { 
          let kickuser = guild.members.cache.get(executorId);
          kickuser.kick('Antinuke threshold reached.')
            .then(() => {
              punished = `User was kicked`;
              console.log(`${emoji.success} kick user ${userId} from guild ${guild.id} for exceeding thresold.`)
            })
            .catch(console.error);
              
          }
          if(guildSettings.punishment.includes('strip')) { 
            guild.members.cache.get(executor.id).roles.set([])
              .then(() => {
                punished = `Users roles were stripped`;
                console.log(`${emoji.success} Removed.`)
              })
              .catch(console.error);
       
            }
      
   await wait(2000)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        ${executor}
        ${executorId}
        

        - **Additional Info**

        Action: Changing server VANITY URL(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: Yes
        
      
       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
  }
}
});
client.on(Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
  const { action, executorId, targetId } = auditLog;
  // Fetch the guild settings from the database

  const guildSettings =  await antinuke.findOne({ GuildID: guild.id })
if(!guildSettings) return;
 if(guildSettings.BotAdd && guildSettings.BotAdd === false) return;
if(!guildSettings.BotAdd) return;
if(targetId === client.user.id) {
  console.log('I was added to a server')
} else { 
   
   let whitelistDB = await whitelist.findOne({
    GuildID: guild.id,
    userId: targetId,
   });
   if(whitelistDB && whitelistDB.trustedowner && whitelistDB.trustedowner === true) return;
   if(whitelistDB && whitelistDB.whitelisted && whitelistDB.whitelisted === true) return;
   if(whitelistDB && whitelistDB.BotAddwhitelisted && whitelistDB.BotAddwhitelisted === true) return;
   
   let userId = executorId;
	if (action !== AuditLogEvent.BotAdd) return;
  let kickuser = guild.members.cache.get(targetId);
  kickuser.kick(`Bot is not authorized to enter this server, can whitelist this bot by using the antinuke module.`);
	

      await wait(1700)
      if(guildSettings.Logs) {
        let embed = new MessageEmbed()
        .setColor(`${Color}`)
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({})})
        .setTitle('Anti-nuke log action')
        .setDescription(`
        - **User** 

        <@${executorId}>
        ${executorId}
        

        - **Additional Info**

        Action: Adding bot(s)
        Punishment: ${guildSettings.punishment || 'ban'}
        User Punished: No, but the bot added was kicked
        Bot kicked: <@${targetId}>

       
        `)
        
        guild.channels.cache.get(guildSettings.Logs).send({ embeds: [embed]})
      }
    }

});
client.on('voiceStateUpdate', async (OldVoice, NewVoice) => {
        
  let voicemasterDB = await voicemaster.findOne({
    GuildID: NewVoice.guild.id,
  });
if (voicemasterDB && !OldVoice.channelId && NewVoice.channelId === voicemasterDB.Create || voicemasterDB && OldVoice.channelId && NewVoice.channelId === voicemasterDB.Create ) {
        
        let Channel = await NewVoice.guild.channels.create({
            name: `${NewVoice.member.user.username}'s Channel`,
            type: ChannelType.GuildVoice,
            parent:  voicemasterDB.Category || NewVoice.member.voice.channel.parentId || null,
            userLimit: NewVoice.member.voice.channel.userLimit
        })
   await NewVoice.member.voice.setChannel(Channel)
       
  new voicemastersusers({
        GuildID: NewVoice.guild.id,
UserID: NewVoice.member.user.id,
ChannelID: Channel.id,
    Owner: true,
      }).save();
           
        
    } else {
 if (voicemasterDB && !OldVoice.channelId) { 
   return;
    new voicemastersusers({
        GuildID: NewVoice.guild.id,
UserID: NewVoice.member.user.id,
ChannelID: NewVoice.channelId,
    Owner: false,
      }).save();
    }
}
  
})
client.on('voiceStateUpdate', async (OldVoice, NewVoice) => {
    if (OldVoice.channelId && !NewVoice.channelId || OldVoice.channelId && NewVoice.channelId) {
   let voicemasterDB = await voicemaster.findOne({
    GuildID: OldVoice.guild.id,
  });
  if(voicemasterDB && voicemasterDB.Create && voicemasterDB.Create === OldVoice.channelId) return;
  let check = await voicemastersusers.findOne({
     GuildID: OldVoice.guild.id,
ChannelID: OldVoice.channelId,
  });
      let check2 = await voicemastersusers.findOne({
     GuildID: OldVoice.guild.id,
UserID: OldVoice.member.user.id,
ChannelID: OldVoice.channelId,
  });
  let     channel = OldVoice.guild.channels.cache.get(OldVoice.channelId)
  if(check){ 
    
        
            if (OldVoice.channel.members.filter(x => !x.user.bot).size == 0) {
          
              await channel.delete();
               await voicemastersusers.findOneAndRemove({
        GuildID: OldVoice.guild.id,
ChannelID: OldVoice.channelId,
      });
            } else {
              if(check2) {
                let member = OldVoice.channel.members.first();
                channel.edit({
            name: `${member.username || member.user.username}'s Channel`,
         
        });
            await voicemastersusers.findOneAndRemove({
     GuildID: OldVoice.guild.id,
UserID: OldVoice.member.user.id,
ChannelID: OldVoice.channelId,
  }); 
                  new voicemastersusers({
        GuildID: NewVoice.guild.id,
UserID: member.id,
ChannelID: OldVoice.channelId,
    Owner: true,
      }).save();
                
                
              }
            }
  }
        
      }
})
client.on('interactionCreate', async Interaction => {
    if (Interaction.isButton()) {
      
        switch (Interaction.customId) {
            case 'LockChannel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })

                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.permissionOverwrites.set([
                    {
                        id: Interaction.guild.roles.everyone.id,
                        deny: [
                            PermissionsBitField.Flags.Connect
                        ]
                    },
                    {
                        id: Interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.Connect
                        ]
                    }
                ])
            }
                break;
            case 'UnlockChannel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.permissionOverwrites.set([
                    {
                        id: Interaction.guild.roles.everyone.id,
                        allow: [
                            PermissionsBitField.Flags.Connect
                        ]
                    }
                ])
            }
                break;
            case 'HideChannel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.permissionOverwrites.set([
                    {
                        id: Interaction.guild.roles.everyone.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },
                    {
                        id: Interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    }
                ])
            }
                break;
            case 'UnhideChannel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.permissionOverwrites.set([
                    {
                        id: Interaction.guild.roles.everyone.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    }
                ])
            }
                break;
            case 'RenameChannel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                const Modal = new ModalBuilder()
                    .setCustomId('RenameModal')
                    .setTitle('Rename Channel')
                const Name = new TextInputBuilder()
                    .setStyle(TextInputStyle.Short)
                    .setLabel('Name of voice channel?')
                    .setMaxLength(50)
                    .setCustomId('Name')
                    .setRequired(true)
                const Row = new ActionRowBuilder().addComponents(Name)
                Modal.addComponents(Row)
                Interaction.showModal(Modal)
            }
                break;
            case 'Mute': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Channel.members.forEach(async Members => {
                    const Member = Interaction.guild.members.cache.get(Members.id)
                    if (Member.id !== Interaction.user.id) Member.voice.setMute(true)
                })
            }
                break;
            case 'Unmute': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Channel.members.forEach(async Members => {
                    const Member = Interaction.guild.members.cache.get(Members.id)
                    if (Member.id !== Interaction.user.id) Member.voice.setMute(false)
                })
            }
                break;
            case 'Disconnect': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Channel.members.forEach(async Members => {
                    const Member = Interaction.guild.members.cache.get(Members.id)
                    if (Member.id !== Interaction.user.id) Member.voice.disconnect();
                })
            }
                break;
            case 'Delete_Channel': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
              await voicemastersusers.findOneAndRemove({
        GuildID: Interaction.guild.id,
UserID: Interaction.user.id,
          ChannelID: Channel.id,
       
      });
              await Channel.delete()
            }
                break;
            case 'Ban_Member': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                const User = new UserSelectMenuBuilder().setPlaceholder('Select the User').setCustomId('UserMenu').setMaxValues(1)
                const Row = new ActionRowBuilder().addComponents(User)
                Interaction.reply({embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> **Executing your request**, please proceed.`)
], components: [Row], ephemeral: true })
            }
                break;
            case 'UsersManager': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                const Row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('1128802374698414292')
                        .setLabel('Mute')
                        .setCustomId('UsersManager_Mute'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('1128797600141803731')
                        .setLabel('Unmute')
                        .setCustomId('UsersManager_Unmute'),
                        new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('1128793055953170432')
                        .setLabel('Disconnect')
                        .setCustomId('UsersManager_Disconnect'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('1128813386134728796')
                        .setLabel('Deafen')
                        .setCustomId('UsersManager_Deafen'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('1128813388156375072')
                        .setLabel('Undeafen')
                        .setCustomId('UsersManager_Undeafen'))
                Interaction.reply({ embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> Select from one of the following below.`)
], components: [Row], ephemeral: true })
            }
                break;
            case 'Customize_UserLimit': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} You are not in a voice channel.`)
      ], ephemeral: true })
              let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                const Modal = new ModalBuilder()
                    .setCustomId('Customize_UsersLimit')
                    .setTitle('Customize Users Limit')
                const Number = new TextInputBuilder()
                    .setStyle(TextInputStyle.Short)
                    .setLabel('The Number')
                    .setMaxLength(2)
                    .setCustomId('The_Number')
                    .setRequired(true)
                const Row = new ActionRowBuilder().addComponents(Number)
                Modal.addComponents(Row)
                Interaction.showModal(Modal)
            }
        }
    } else if (Interaction.isStringSelectMenu()) {
       
        if (Interaction.customId == 'Menu') {
          const Channel = Interaction.member.voice.channel;
          if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.error} You are not in a voice channel.`)
     ], ephemeral: true })
               let Data = await voicemastersusers.findOne({
             GuildID: Interaction.guild.id,
     UserID: Interaction.user.id,
               ChannelID: Channel.id,
            
           });
             if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
     ], ephemeral: true })
            await Interaction.deferUpdate().catch(() => { })
            if (Interaction.guild.channels.cache.get(Channel.id).type === ChannelType.GuildVoice) {
                Interaction.guild.channels.cache.get(Channel.id).setUserLimit(Interaction.values[0])
            }
        }
    } else if (Interaction.isModalSubmit()) {
     
        if (Interaction.customId == 'RenameModal') {
          const Channel = Interaction.member.voice.channel;
          if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.error} You are not in a voice channel.`)
     ], ephemeral: true })
          let Data = await voicemastersusers.findOne({
             GuildID: Interaction.guild.id,
     UserID: Interaction.user.id,
               ChannelID: Channel.id,
            
           });
             if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
     ], ephemeral: true })
            let  Name = Interaction.fields.getTextInputValue('Name')
            Name =  Name.replace(/{user}/g, `${Interaction.user.username}`)
            Name =  Name.replace(/{username}/g, `${Interaction.user.username}`)
            await Channel.setName(Name)
            Interaction.reply({  embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
                                          .addFields(
		{ name: 'Display Username', value: `If you want to put your username in the channel name you can do this for example **{user}'s place** (output: ${Interaction.user.username} place).\n{user} will get replaced with your discord username.` },
	)
  .setDescription(`${emoji.success} Channel name was changed to **${Name}**.`)
], ephemeral: true })
        } else if (Interaction.customId == 'Customize_UsersLimit') {
          const Channel = Interaction.member.voice.channel;
          if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.error} You are not in a voice channel.`)
     ], ephemeral: true })
          let Data = await voicemastersusers.findOne({
             GuildID: Interaction.guild.id,
     UserID: Interaction.user.id,
               ChannelID: Channel.id,
            
           });
             if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
       .setColor(`${Color}`)
       .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
     ], ephemeral: true })
            const Number = Interaction.fields.getTextInputValue('The_Number')
            if (Channel.userLimit == Number) return Interaction.reply({embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`${emoji.error} the user limit is was already \`${Number}\`.`)
], ephemeral: true })
            Interaction.reply({embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`${emoji.success} successfully changed **users-limit** \`${Channel.userLimit || '0'}\` to \`${Number}\`.`)
],  ephemeral: true })
            await Channel.setUserLimit(Number)
        }
    }
})

/* Users Manager */

client.on('interactionCreate', async Interaction => {
    if (Interaction.isButton()) {
     
        switch (Interaction.customId) {
        
            case 'UsersManager_Mute': {
              const Channel = Interaction.member.voice.channel;
              if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.error} You are not in a voice channel.`)
         ], ephemeral: true })
                       let Data = await voicemastersusers.findOne({
                 GuildID: Interaction.guild.id,
         UserID: Interaction.user.id,
                   ChannelID: Channel.id,
                
               });
                 if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
         ], ephemeral: true })
         
                const Row = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                            .setPlaceholder('Select user')
                            .setCustomId('UserManager_Mute')
                            .setMaxValues(1)
                    )
                Interaction.reply({ embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> select user to mute.`)
], components: [Row], ephemeral: true })
            }
                break;
            case 'UsersManager_Unmute': {
              const Channel = Interaction.member.voice.channel;
              if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.error} You are not in a voice channel.`)
         ], ephemeral: true })
                       let Data = await voicemastersusers.findOne({
                 GuildID: Interaction.guild.id,
         UserID: Interaction.user.id,
                   ChannelID: Channel.id,
                
               });
                 if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
         ], ephemeral: true })
         
                const Row = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                            .setPlaceholder('Select user')
                            .setCustomId('UserManager_Unmute')
                            .setMaxValues(1))
                Interaction.reply({ embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> select user to unmute.`)
], components: [Row], ephemeral: true })
            }
                break;
            case 'UsersManager_Deafen': {
              const Channel = Interaction.member.voice.channel;
              if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.error} You are not in a voice channel.`)
         ], ephemeral: true })
                       let Data = await voicemastersusers.findOne({
                 GuildID: Interaction.guild.id,
         UserID: Interaction.user.id,
                   ChannelID: Channel.id,
                
               });
                 if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
         ], ephemeral: true })
         
                const Row = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                            .setPlaceholder('Select user')
                            .setCustomId('UserManager_Deafen')
                            .setMaxValues(1)
                    )
                Interaction.reply({ embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> select who to deafen.`)
], components: [Row], ephemeral: true })
            }
            break;
            case 'UsersManager_Disconnect': {
              const Channel = Interaction.member.voice.channel;
              if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.error} You are not in a voice channel.`)
         ], ephemeral: true })
                       let Data = await voicemastersusers.findOne({
                 GuildID: Interaction.guild.id,
         UserID: Interaction.user.id,
                   ChannelID: Channel.id,
                
               });
                 if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
         ], ephemeral: true })
         
              const Row = new ActionRowBuilder()
                  .addComponents(
                      new UserSelectMenuBuilder()
                          .setPlaceholder('Select user')
                          .setCustomId('UserManager_Disconnect')
                          .setMaxValues(1)
                  )
              Interaction.reply({ embeds: [new Discord.EmbedBuilder()
.setColor(`${Color}`)
.setDescription(`<a:DiscordLoading:1128199694183567361> select who to disconnect.`)
], components: [Row], ephemeral: true })
          }
                break;
            case 'UsersManager_Undeafen': {
              const Channel = Interaction.member.voice.channel;
              if(!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.error} You are not in a voice channel.`)
         ], ephemeral: true })
                       let Data = await voicemastersusers.findOne({
                 GuildID: Interaction.guild.id,
         UserID: Interaction.user.id,
                   ChannelID: Channel.id,
                
               });
                 if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
           .setColor(`${Color}`)
           .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
         ], ephemeral: true })
         
                const Row = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                            .setPlaceholder('Select user')
                            .setCustomId('UserManager_Undeafen')
                            .setMaxValues(1)
                    )
                Interaction.reply({ embeds: [new Discord.EmbedBuilder()
  .setColor(`${Color}`)
  .setDescription(`<a:DiscordLoading:1128199694183567361> select who to undeafen.`)
], components: [Row], ephemeral: true })
            }
        }
    } else if (Interaction.isUserSelectMenu()) {
     
        switch (Interaction.customId) {
            case 'UserManager_Mute': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} Your are not in a voice channel.`)
      ], ephemeral: true })
                 let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.members.filter((Member) => Member.user.id == Interaction.values[0]).forEach((User) => {
                    const Member = Interaction.guild.members.cache.get(User.id)
                    Member.voice.setMute(true)
                })
            }
                break;
                case 'UserManager_Disconnect': {
                  const Channel = Interaction.member.voice.channel;
                  if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
            .setColor(`${Color}`)
            .setDescription(`${emoji.error} Your are not in a voice channel.`)
          ], ephemeral: true })
                     let Data = await voicemastersusers.findOne({
                  GuildID: Interaction.guild.id,
          UserID: Interaction.user.id,
                    ChannelID: Channel.id,
                 
                });
                  if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
            .setColor(`${Color}`)
            .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
          ], ephemeral: true })
                  await Interaction.deferUpdate().catch(() => { })
                  Interaction.member.voice.channel.members.filter((Member) => Member.user.id == Interaction.values[0]).forEach((User) => {
                      const Member = Interaction.guild.members.cache.get(User.id)
                      Member.voice.disconnect();
                  })
              }
              break;
            case 'UserManager_Unmute': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} Your are not in a voice channel.`)
      ], ephemeral: true })
                 let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.members.filter((Member) => Member.user.id == Interaction.values[0]).forEach((User) => {
                    const Member = Interaction.guild.members.cache.get(User.id)
                    Member.voice.setMute(false)
                })
            }
                break;
            case 'UserManager_Deafen': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} Your are not in a voice channel.`)
      ], ephemeral: true })
                 let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.members.filter((Member) => Member.user.id == Interaction.values[0]).forEach((User) => {
                    const Member = Interaction.guild.members.cache.get(User.id)
                    Member.voice.setDeaf(true)
                })
            }
                break;
            case 'UserManager_Undeafen': {
              const Channel = Interaction.member.voice.channel;
              if (!Channel) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.error} Your are not in a voice channel.`)
      ], ephemeral: true })
                 let Data = await voicemastersusers.findOne({
              GuildID: Interaction.guild.id,
      UserID: Interaction.user.id,
                ChannelID: Channel.id,
             
            });
              if (!Data) return Interaction.reply({ embeds: [new Discord.EmbedBuilder()
        .setColor(`${Color}`)
        .setDescription(`${emoji.success} Your not the owner of this voice channel.`)
      ], ephemeral: true })
                await Interaction.deferUpdate().catch(() => { })
                Interaction.member.voice.channel.members.filter((Member) => Member.user.id == Interaction.values[0]).forEach((User) => {
                    const Member = Interaction.guild.members.cache.get(User.id)
                    Member.voice.setDeaf(false)
                })
            }
        }
    }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const booost = require("./database/guildData/boosters");
  if (!oldMember.roles.cache.size !== newMember.roles.cache.size) {
    if(!oldMember.guild.roles.premiumSubscriberRole) return;
    if (
      !oldMember.roles.cache.has(
        newMember.guild.roles.premiumSubscriberRole.id
      ) &&
      newMember.roles.cache.has(
        newMember.guild.roles.premiumSubscriberRole.id
      )
    ) {
      await booost.findOneAndRemove({ 
        GuildID: oldMember.guild.id,
        UserID: newMember.user.id,
      });
  }
  }
  if (
    oldMember.roles.cache.has(
      oldMember.guild.roles.premiumSubscriberRole.id
    ) &&
    !newMember.roles.cache.has(oldMember.guild.roles.premiumSubscriberRole.id)
  ) {
  let boostDB = await booost.findOne({ 
    GuildID: oldMember.guild.id,
    UserID: newMember.user.id,
  });
  const currentDate = new Date();
  if(boostDB) {
 
    await booost.findOneAndUpdate({ 
      GuildID: oldMember.guild.id,
      UserID: newMember.user.id,
      Boosting: false,
      Date: `<t:${Math.floor(currentDate.getTime() / 1000)}:F>`,
  }).then(() => console.log(`${newMember.user.tag} boosted ${oldMember.guild.name}`));

  } else {
    new booost({ 
      GuildID: oldMember.guild.id,
      UserID: newMember.user.id,
      Boosting: false,
      Date: `<t:${Math.floor(currentDate.getTime() / 1000)}:F>`,
  }).save();
  }


  }
})

client.login("MTExNzMzNjg3ODcxNTI1NjgzMg.GpHmTw.pu_PD1cp-y4kfEiB3y4ibDcwJUZTyDkBE-XDoo");