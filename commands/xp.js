const { EmbedBuilder } = require('discord.js');
function getLevelFromXp(xp) {
    return Math.floor(xp / 100) + 1;
}
module.exports = {
    name: "xp",
    description: "Check your XP and level.",
    async execute(message, args, client, { xpData }) {
        let user = message.mentions.users.first() || message.author;
        let uid = user.id;
        let xp = xpData[uid]?.xp || 0;
        let level = getLevelFromXp(xp);

        return message.reply({
            embeds: [ new EmbedBuilder()
                .setTitle(`${user.username}'s XP`)
                .setDescription(`**XP:** ${xp}\n**Level:** ${level}`)
                .setColor(0xE67E22)
            ]
        });
    },
    async handleXp(message, xpData, saveXp) {
        const uid = message.author.id;
        if (!xpData[uid]) xpData[uid] = { xp: 0 };
        xpData[uid].xp += Math.floor(Math.random() * 9) + 1;
        saveXp();
        const level = getLevelFromXp(xpData[uid].xp);
        if (!xpData[uid].lastLevel || xpData[uid].lastLevel < level) {
            xpData[uid].lastLevel = level;
            saveXp();
            message.channel.send({ embeds: [
                new EmbedBuilder()
                    .setDescription(`🎉 ${message.author} leveled up to **Level ${level}**!`)
                    .setColor(0xF1C40F)
            ]});
        }
    }
};