require('dotenv').config();

async function updateVoiceStats(client) {
    const guildId = process.env.GUILD_ID; // recomandat să folosești și GUILD_ID
    const memberChannelId = process.env.MEMBER_VOICE_CHANNEL_ID;
    const boostChannelId = process.env.BOOST_VOICE_CHANNEL_ID;

    if (!guildId || !memberChannelId || !boostChannelId) {
        console.log("GUILD_ID, MEMBER_VOICE_CHANNEL_ID sau BOOST_VOICE_CHANNEL_ID lipsesc din .env!");
        return;
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
        console.log("Nu pot accesa guild-ul.");
        return;
    }

    const memberChannel = await guild.channels.fetch(memberChannelId).catch(() => null);
    const boostChannel = await guild.channels.fetch(boostChannelId).catch(() => null);

    if (memberChannel && memberChannel.type === 2) { // ChannelType.GuildVoice === 2
        const memberName = `👥 Members: ${guild.memberCount}`;
        if (memberChannel.name !== memberName) {
            await memberChannel.setName(memberName).catch(() => {});
        }
    }
    if (boostChannel && boostChannel.type === 2) { // ChannelType.GuildVoice === 2
        const boostName = `🚀 Boosts: ${guild.premiumSubscriptionCount}`;
        if (boostChannel.name !== boostName) {
            await boostChannel.setName(boostName).catch(() => {});
        }
    }
}

module.exports = updateVoiceStats;