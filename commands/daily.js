const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "daily",
    description: "Claim your daily bonus.",
    async execute(message, args, client, { xpData, saveXp }) {
        const user = message.author;
        const now = Date.now();
        const last = xpData[user.id]?.lastDaily || 0;
        if (now - last < 24*60*60*1000) {
            const embed = new EmbedBuilder()
                .setColor(0xF1C40F)
                .setDescription('🕒 You have already claimed your daily! Come back later.');
            return message.reply({ embeds: [embed] });
        }
        xpData[user.id] = xpData[user.id] || {};
        xpData[user.id].credits = (xpData[user.id].credits || 0) + 500;
        xpData[user.id].lastDaily = now;
        saveXp();

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription('✅ You claimed your **500** daily credits!')
            .setFooter({ text: 'Use !credits to see your balance.' });

        return message.reply({ embeds: [embed] });
    }
};