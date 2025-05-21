module.exports = {
    name: "slap",
    description: "Slap a user.",
    async execute(message) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention someone to slap!");
        message.channel.send(`👋 ${message.author} slapped ${user}!`);
    }
};