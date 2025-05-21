const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "kick",
    description: "Kick a user.",
    async execute(message, args) {
        if (!message.member.permissions.has("KickMembers")) return message.reply("You don't have permission to kick!");
        const user = message.mentions.members.first();
        if (!user) return message.reply("Mention a user!");
        const reason = args.slice(1).join(' ') || "No reason";
        await user.kick(reason).catch(()=>{});
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`✅ **${user.user.tag}** has been kicked!\n**Reason:** ${reason}`);
        message.reply({ embeds: [embed] });
    }
};