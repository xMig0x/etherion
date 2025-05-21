const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "serverinfo",
    description: "Show server info.",
    async execute(message) {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setTitle(`Server Info - ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 256, dynamic: true }))
            .addFields(
                { name: "Members", value: `${guild.memberCount}`, inline: true },
                { name: "Channels", value: `${guild.channels.cache.size}`, inline: true },
                { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
                { name: "Created", value: `<t:${Math.floor(guild.createdTimestamp/1000)}:R>`, inline: true }
            )
            .setColor(0xF1C40F);
        message.reply({ embeds: [embed] });
    }
};