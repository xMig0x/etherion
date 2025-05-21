const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'reactionrole',
    description: 'Set up a reaction role message. Usage: !reactionrole #channel :emoji: @role',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setDescription("❌ You do not have permission to set up reaction roles.")
                    .setColor(0xE74C3C)
            ]});
        }

        const channel = message.mentions.channels.first();
        const emoji = args.find(arg => /^:.+:$|[\u{1F300}-\u{1F6FF}]/u.test(arg));
        const role = message.mentions.roles.first();

        if (!channel || !emoji || !role) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setDescription('❌ Usage: !reactionrole #channel :emoji: @role')
                    .setColor(0xE74C3C)
            ]});
        }

        const embed = new EmbedBuilder()
            .setTitle('Reaction Role')
            .setDescription(`React with ${emoji} to get the **${role.name}** role!`)
            .setColor(0x7289DA);

        const sentMessage = await channel.send({ embeds: [embed] });
        try {
            await sentMessage.react(emoji);
        } catch (err) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setDescription("❌ Failed to react with that emoji. Make sure it's a valid emoji and I have access to it.")
                    .setColor(0xE74C3C)
            ]});
        }

        // Save in memory (for demo, use DB or JSON in production)
        if (!client.reactionRoles) client.reactionRoles = [];
        client.reactionRoles.push({
            messageId: sentMessage.id,
            channelId: channel.id,
            roleId: role.id,
            emoji: emoji
        });

        message.reply({ embeds: [
            new EmbedBuilder()
                .setDescription(`✅ Reaction role set! [Jump to message](${sentMessage.url})`)
                .setColor(0x2ECC71)
        ]});
    }
};