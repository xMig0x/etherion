const { EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');

// Map: channelId -> giveawayData
const activeGiveaways = new Collection();

function parseDuration(input) {
    const match = input.match(/^(\d+)([sm])$/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    return unit === "m" ? value * 60 : value; // return seconds
}

async function endGiveaway(giveawayMsg, prize, winnerCount, channel, client, announce = true) {
    await giveawayMsg.fetch();
    const reaction = giveawayMsg.reactions.cache.get("🎉");
    if (!reaction) {
        if (announce) channel.send("No entries for the giveaway.");
        activeGiveaways.delete(channel.id);
        return;
    }

    const users = (await reaction.users.fetch()).filter(u => !u.bot);
    if (users.size === 0) {
        if (announce) channel.send("No valid participants, no winner can be chosen.");
        activeGiveaways.delete(channel.id);
        return;
    }

    let winners = [];
    const userArray = Array.from(users.values());
    while (winners.length < Math.min(winnerCount, userArray.length)) {
        const idx = Math.floor(Math.random() * userArray.length);
        const candidate = userArray[idx];
        if (!winners.includes(candidate)) winners.push(candidate);
    }

    // Announce in channel
    if (announce) {
        if (winners.length === 1) {
            channel.send(`🎊 Congratulations ${winners[0]}! You won **${prize}**!`);
        } else {
            channel.send(`🎊 Congratulations ${winners.map(u => u.toString()).join(", ")}! You won **${prize}**!`);
        }
    }

    // DM winners
    for (const winner of winners) {
        try {
            await winner.send(`🎉 Congratulations! You won **${prize}** in a giveaway in **${giveawayMsg.guild.name}**!`);
        } catch (e) {}
    }

    // Mark as ended
    if (activeGiveaways.has(channel.id)) {
        let g = activeGiveaways.get(channel.id);
        g.ended = true;
        g.lastWinners = winners.map(u => u.id);
        activeGiveaways.set(channel.id, g);
    }
}

async function rerollGiveaway(giveawayMsg, giveaway, channel, client) {
    await giveawayMsg.fetch();
    const reaction = giveawayMsg.reactions.cache.get("🎉");
    const users = (await reaction.users.fetch()).filter(u => !u.bot && !giveaway.lastWinners.includes(u.id));
    if (users.size === 0) {
        return channel.send("No new valid participants to reroll.");
    }
    let winners = [];
    const userArray = Array.from(users.values());
    while (winners.length < Math.min(giveaway.winnerCount, userArray.length)) {
        const idx = Math.floor(Math.random() * userArray.length);
        const candidate = userArray[idx];
        if (!winners.includes(candidate)) winners.push(candidate);
    }

    if (winners.length === 1) {
        channel.send(`🎊 Reroll Winner: ${winners[0]}! You won **${giveaway.prize}**!`);
    } else {
        channel.send(`🎊 Reroll Winners: ${winners.map(u => u.toString()).join(", ")}! You won **${giveaway.prize}**!`);
    }

    // DM reroll winners
    for (const winner of winners) {
        try {
            await winner.send(`🎉 Congratulations! You won **${giveaway.prize}** in a reroll for a giveaway in **${giveawayMsg.guild.name}**!`);
        } catch (e) {}
    }
    // Update lastWinners with reroll winners
    giveaway.lastWinners = winners.map(u => u.id);
    activeGiveaways.set(channel.id, giveaway);
}

module.exports = {
    name: "giveaway",
    description: "Start a giveaway. Usage: !giveaway <duration[e.g. 5m, 60s]> [winners] <prize>",
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("You need the **Manage Messages** permission to start a giveaway.");
        }
        if (args.length < 2) {
            return message.reply("Usage: `!giveaway <duration[e.g. 5m, 60s]> [winners] <prize>`\nExample: `!giveaway 5m 2 Nitro`");
        }

        let durationSeconds = parseDuration(args[0]);
        if (!durationSeconds) {
            return message.reply("Invalid duration! Use format like `5m` or `60s`.");
        }

        let winnerCount = 1;
        let prizeArgsStart = 1;

        if (!isNaN(args[1])) {
            winnerCount = Math.max(1, parseInt(args[1]));
            prizeArgsStart = 2;
        }
        const prize = args.slice(prizeArgsStart).join(" ");
        if (!prize) {
            return message.reply("Please specify a prize!");
        }

        let timeLeft = durationSeconds;

        const embed = new EmbedBuilder()
            .setTitle("🎉 Giveaway! 🎉")
            .setDescription(
                `Prize: **${prize}**\n` +
                `React with 🎉 to enter!\n` +
                `Duration: **${timeLeft} seconds**\n` +
                `Winners: **${winnerCount}**`
            )
            .setColor(0xF1C40F)
            .setFooter({ text: `Hosted by ${message.author.tag}` })
            .setTimestamp();

        const giveawayMsg = await message.channel.send({ 
            embeds: [embed]
        });
        await giveawayMsg.react("🎉");

        // Register giveaway per channel
        activeGiveaways.set(message.channel.id, {
            messageId: giveawayMsg.id,
            channelId: message.channel.id,
            guildId: message.guild.id,
            prize,
            winnerCount,
            ended: false,
            entrants: [],
            hostId: message.author.id
        });

        // Interval update
        const interval = setInterval(async () => {
            if (!activeGiveaways.has(message.channel.id)) return clearInterval(interval);
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(interval);
                return;
            }
            try {
                const newEmbed = EmbedBuilder.from(embed)
                    .setDescription(
                        `Prize: **${prize}**\n` +
                        `React with 🎉 to enter!\n` +
                        `Duration: **${timeLeft} seconds**\n` +
                        `Winners: **${winnerCount}**`
                    );
                await giveawayMsg.edit({ embeds: [newEmbed] });
            } catch (e) {
                clearInterval(interval);
            }
        }, 1000);

        setTimeout(async () => {
            clearInterval(interval);
            if (activeGiveaways.get(message.channel.id)?.ended) return;
            await endGiveaway(giveawayMsg, prize, winnerCount, message.channel, client, true);
        }, durationSeconds * 1000);
    },
    activeGiveaways,
    endGiveaway,
    rerollGiveaway
};