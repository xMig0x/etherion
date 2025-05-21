require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN || 'YOUR_TOKEN_HERE';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// Dynamically load command files from ./commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// XP/Level system data (loaded in memory for demo)
let xpData = {};
const XP_FILE = path.join(__dirname, 'xp.json');
if (fs.existsSync(XP_FILE) && fs.readFileSync(XP_FILE, 'utf-8').trim() !== '') {
    xpData = JSON.parse(fs.readFileSync(XP_FILE, 'utf-8'));
}

// Save XP data helper
function saveXp() {
    fs.writeFileSync(XP_FILE, JSON.stringify(xpData, null, 2));
}

// REACTION ROLES (in-memory, for demo)
client.reactionRoles = []; // [{ messageId, channelId, roleId, emoji }]

// Reaction Role Handler
const reactionRoleHandler = async (reaction, user, client, action = 'add') => {
    if (user.bot) return;
    if (!client.reactionRoles) return;
    // Sometimes the reaction is a custom emoji, sometimes unicode
    const emoji = reaction.emoji.id ? `<:${reaction.emoji.identifier}>` : reaction.emoji.name;
    const data = client.reactionRoles.find(rr => rr.messageId === reaction.message.id && (rr.emoji === reaction.emoji.name || rr.emoji === emoji));
    if (!data) return;
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(data.roleId);
    if (!role) return;
    if (action === 'add') {
        await member.roles.add(role).catch(() => {});
    } else {
        await member.roles.remove(role).catch(() => {});
    }
};

// Reaction Role listeners
client.on('messageReactionAdd', (reaction, user) => reactionRoleHandler(reaction, user, client, 'add'));
client.on('messageReactionRemove', (reaction, user) => reactionRoleHandler(reaction, user, client, 'remove'));

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // XP System: Give XP per message, and count messages
    const xpCmd = client.commands.get('xp');
    if (xpCmd) {
        const uid = message.author.id;
        if (!xpData[uid]) xpData[uid] = { xp: 0, messages: 0 };
        xpData[uid].messages = (xpData[uid].messages || 0) + 1;
        await xpCmd.handleXp(message, xpData, saveXp);
    }

    // Command handler
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client, { xpData, saveXp });
    } catch (error) {
        console.error(error);
        await message.reply({ embeds: [
            new EmbedBuilder()
                .setDescription('⚠️ There was an error executing that command.')
                .setColor(0xE74C3C)
        ]});
    }
});

client.on('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// === AUTO-UPDATE STATISTICI MERLIS === + STATUS DINAMIC ===
client.once('ready', async () => {
    const CHANNEL_ID = process.env.CHANNEL_ID;
    if (!CHANNEL_ID) {
        console.log('CHANNEL_ID lipsă în .env!');
        return;
    }
    const statsCmd = require('./commands/stats.js');
    let channel;
    try {
        channel = await client.channels.fetch(CHANNEL_ID);
    } catch (e) {
        console.log('Nu pot găsi canalul:', e);
        return;
    }

    // Caută dacă există deja un mesaj de bot cu embed de statistici
    let botMessage = null;
    try {
        const messages = await channel.messages.fetch({ limit: 10 });
        botMessage = messages.find(
            m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title && m.embeds[0].title.includes('Statistici Merlis')
        );
    } catch (err) {
        console.log("Nu am putut citi mesajele recente:", err);
    }

    async function updateStatsEmbed() {
        const stats = await statsCmd.fetchStats();
        if (!stats) {
            if (botMessage) {
                await botMessage.edit({ content: 'Nu am putut prelua statisticile.', embeds: [] });
            } else {
                botMessage = await channel.send('Nu am putut prelua statisticile.');
            }
            return;
        }
        const embed = statsCmd.buildStatsEmbed(stats);

        if (botMessage) {
            await botMessage.edit({ content: '', embeds: [embed] });
        } else {
            botMessage = await channel.send({ embeds: [embed] });
        }
    }

    // Trimite sau editează embed-ul inițial
    await updateStatsEmbed();
    setInterval(updateStatsEmbed, 30 * 1000);

    // === STATUS DINAMIC PLAYERI ONLINE + MESAJ CUSTOM ===
    const customStatuses = [
        "Bun venit pe Merlis!",
        "Folosește !stats pentru statistici.",
        "Joacă cu prietenii tăi!",
        "Vizitează merlis.eu pentru mai multe info."
    ];
    let statusIndex = 0;
    let showPlayers = true; // alternare între statusuri

    async function updateBotStatus() {
        try {
            const stats = await statsCmd.fetchStats();
            if (showPlayers && stats && stats.online) {
                // 1. Setează status cu playerii online
                await client.user.setActivity(`🟢 ${stats.online} playeri online`, { type: 'WATCHING' });
            } else {
                // 2. Status custom din lista
                await client.user.setActivity(customStatuses[statusIndex], { type: 'PLAYING' });
                statusIndex = (statusIndex + 1) % customStatuses.length;
            }
            showPlayers = !showPlayers; // alternează la fiecare apel
        } catch (err) {
            await client.user.setActivity("Eroare la status", { type: 'WATCHING' });
        }
    }

    // Rulează status-ul la fiecare 1 minut (schimbă între online și custom)
    updateBotStatus();
    setInterval(updateBotStatus, 60000);
});

// === AUTO-UPDATE MEMBER & BOOST COUNT IN SEPARATE VOICE CHANNELS ===
client.on('ready', () => {
    const memberChannelId = process.env.MEMBER_VOICE_CHANNEL_ID;
    const boostChannelId = process.env.BOOST_VOICE_CHANNEL_ID;

    if (!memberChannelId || !boostChannelId) {
        console.log("MEMBER_VOICE_CHANNEL_ID sau BOOST_VOICE_CHANNEL_ID lipsesc din .env!");
        return;
    }

    setInterval(async () => {
        try {
            const guild = client.guilds.cache.first();
            if (!guild) return;

            // MEMBERS
            const memberChannel = await client.channels.fetch(memberChannelId).catch(() => null);
            if (memberChannel && memberChannel.type === ChannelType.GuildVoice) {
                const members = await guild.members.fetch();
                const humanCount = members.filter(m => !m.user.bot).size;
                const memberName = `👥 Members: ${humanCount}`;
                if (memberChannel.name !== memberName) {
                    await memberChannel.setName(memberName);
                    console.log(`Updated member voice channel: ${memberName}`);
                }
            }

            // BOOSTS
            const boostChannel = await client.channels.fetch(boostChannelId).catch(() => null);
            if (boostChannel && boostChannel.type === ChannelType.GuildVoice) {
                const boostCount = guild.premiumSubscriptionCount || 0;
                const boostName = `🚀 Boosts: ${boostCount}`;
                if (boostChannel.name !== boostName) {
                    await boostChannel.setName(boostName);
                    console.log(`Updated boost voice channel: ${boostName}`);
                }
            }
        } catch (err) {
            console.error("Failed to update stats voice channels:", err);
        }
    }, 60 * 1000); // la fiecare 1 minut
});

client.login(TOKEN);