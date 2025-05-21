const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "rank",
    description: "Shows the server leaderboard.",
    async execute(message, args, client, { xpData }) {
        // Top 10 by XP
        const top = Object.entries(xpData)
            .map(([id, data]) => ({ id, xp: data.xp || 0 }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        const desc = await Promise.all(top.map(async (entry, idx) => {
            const user = await client.users.fetch(entry.id).catch(() => null);
            const level = Math.floor((entry.xp || 0) / 100) + 1;
            return `**${idx+1}.** ${user ? user.tag : "Unknown"}  —  Level **${level}** | XP: \`${entry.xp}\``;
        }));

        const embed = new EmbedBuilder()
            .setTitle('🏆 Server Leaderboard')
            .setColor(0xF1C40F)
            .setDescription(desc.join('\n'))
            .setFooter({ text: 'Use !profile to see your stats.' });

        return message.reply({ embeds: [embed] });
    }
};