const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "hug",
    description: "Give someone a hug.",
    async execute(message) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention someone to hug!");
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`🤗 ${message.author} hugged ${user}!`);
        message.channel.send({ embeds: [embed] });
    }
};