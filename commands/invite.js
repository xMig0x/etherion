const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "invite",
    description: "Get the bot's invite link.",
    async execute(message, args, client) {
        const invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`[Click here to invite the bot to your server!](${invite})`);
        message.reply({ embeds: [embed] });
    }
};