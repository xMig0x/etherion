const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: "ban",
    description: "Ban a user.",
    async execute(message, args) {
        if (!message.member.permissions.has("BanMembers")) return message.reply("You don't have permission to ban!");
        const user = message.mentions.members.first();
        if (!user) return message.reply("Mention a user!");
        const reason = args.slice(1).join(' ') || "No reason";
        await user.ban({ reason }).catch(()=>{});
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(`✅ **${user.user.tag}** has been banned!\n**Reason:** ${reason}`);
        message.reply({ embeds: [embed] });
    }
};