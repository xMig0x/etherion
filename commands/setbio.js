const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "setbio",
    description: "Set your profile bio.",
    async execute(message, args, client, { xpData, saveXp }) {
        const bio = args.join(' ');
        if (!bio) return message.reply("Please type your new bio!");
        xpData[message.author.id] = xpData[message.author.id] || {};
        xpData[message.author.id].bio = bio;
        saveXp();
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription("✅ Bio updated!");
        message.reply({ embeds: [embed] });
    }
};