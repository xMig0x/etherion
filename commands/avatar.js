const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "avatar",
    description: "Show a user's avatar.",
    async execute(message) {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 512, dynamic: true }));
        message.reply({ embeds: [embed] });
    }
};