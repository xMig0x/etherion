const { PermissionsBitField } = require('discord.js');
const { activeGiveaways, rerollGiveaway } = require('./giveaway.js');

module.exports = {
    name: "greroll",
    description: "Reroll the latest giveaway in this channel. Usage: !greroll",
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("You need the **Manage Messages** permission to reroll a giveaway.");
        }
        const giveaway = activeGiveaways.get(message.channel.id);
        if (!giveaway) {
            return message.reply("There is no active giveaway in this channel.");
        }
        if (!giveaway.ended) {
            return message.reply("The giveaway is still ongoing! You can only reroll ended giveaways.");
        }
        const channel = message.channel;
        const giveawayMsg = await channel.messages.fetch(giveaway.messageId);
        await rerollGiveaway(giveawayMsg, giveaway, channel, client);
    }
};