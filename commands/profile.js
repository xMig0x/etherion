const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "profile",
    description: "Shows your Tatsumaki-style profile.",
    async execute(message, args, client, { xpData }) {
        const user = message.mentions.users.first() || message.author;
        const uid = user.id;
        const data = xpData[uid] || {};
        const xp = data.xp || 0;
        const level = Math.floor(xp / 100) + 1;
        const rep = data.rep || 0;
        const credits = data.credits || 0;
        const bio = data.bio || 'No bio set!';
        const nextLevelXp = level * 100;
        const prevLevelXp = (level - 1) * 100;
        const currentXp = xp - prevLevelXp;
        const neededXp = nextLevelXp - prevLevelXp;

        // Simulated XP bar with emojis
        const xpBarLength = 20;
        const progress = Math.round((currentXp / neededXp) * xpBarLength);
        const progressBar = '▰'.repeat(progress) + '▱'.repeat(xpBarLength - progress);

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F) // Tatsumaki's gold/yellow
            .setTitle(`${user.username}'s Profile`)
            .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }))
            .setDescription(
                `**Bio:** ${bio}\n\n` +
                `**Level ${level}**\n` +
                `**XP:** \`${currentXp} / ${neededXp}\`\n` +
                `${progressBar}`
            )
            .addFields(
                { name: 'Reputation', value: `${rep}`, inline: true },
                { name: 'Credits', value: `${credits}`, inline: true }
            )
            .setFooter({ text: `ID: ${user.id} • Use !setbio to change your bio` });

        return message.reply({ embeds: [embed] });
    }
};