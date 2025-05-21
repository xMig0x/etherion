const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "userinfo",
    description: "Show info about a user.",
    async execute(message) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        const embed = new EmbedBuilder()
            .setTitle(`User Info - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }))
            .addFields(
                { name: "ID", value: user.id },
                { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>` },
                { name: "Joined Server", value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:R>` : "N/A" },
                { name: "Roles", value: member ? member.roles.cache.filter(r=>r.id!==message.guild.id).map(r => r.name).join(', ') || "None" : "N/A" }
            )
            .setColor(0xF1C40F);
        message.reply({ embeds: [embed] });
    }
};