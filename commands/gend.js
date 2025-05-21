const { PermissionsBitField } = require('discord.js');
const { activeGiveaways, endGiveaway } = require('./giveaway.js');

module.exports = {
    name: "gend",
    description: "End the latest giveaway in this channel. Usage: !gend",
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("You need the **Manage Messages** permission to end a giveaway.");
        }
        const giveaway = activeGiveaways.get(message.channel.id);
        if (!giveaway) {
            return message.reply("There is no active giveaway in this channel.");
        }
        const channel = message.channel;
        const giveawayMsg = await channel.messages.fetch(giveaway.messageId);
        await endGiveaway(giveawayMsg, giveaway.prize, giveaway.winnerCount, channel, client, true);
    }
};