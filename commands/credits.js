const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "credits",
    description: "Check your balance (credits).",
    async execute(message, args, client, { xpData }) {
        const user = message.mentions.users.first() || message.author;
        const credits = xpData[user.id]?.credits || 0;
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`💰 **${user.username}** has **${credits}** credits.`);
        message.reply({ embeds: [embed] });
    }
};