module.exports = {
    name: "poke",
    description: "Poke someone.",
    async execute(message) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention someone to poke!");
        message.channel.send(`👉 ${message.author} poked ${user}!`);
    }
};