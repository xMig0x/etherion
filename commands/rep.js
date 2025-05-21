const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "rep",
    description: "Give reputation to a member.",
    async execute(message, args, client, { xpData, saveXp }) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention someone to give them rep!");
        if (user.id === message.author.id) return message.reply("You can't give rep to yourself!");
        const uid = user.id;
        xpData[uid] = xpData[uid] || {};
        xpData[uid].rep = (xpData[uid].rep || 0) + 1;
        saveXp();

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`⭐ **${message.author.tag}** gave a reputation point to **${user.tag}**!`)
            .setFooter({ text: 'Use !profile to see your rep.' });

        return message.reply({ embeds: [embed] });
    }
};