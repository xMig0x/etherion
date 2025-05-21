const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "help",
    description: "Displays the list of available commands and useful information.",
    async execute(message, args, client) {
        // Get all commands from client.commands
        const commands = Array.from(client.commands.values());

        // Use your uploaded image as both thumbnail and image
        const imageUrl = "attachment://image3.png"; // will be attached with the message

        const embed = new EmbedBuilder()
            .setColor(0x00BFFF)
            .setTitle('📖 Help & Commands')
            .setDescription(
                "Hello! I'm the **Merlis** bot. Here are the commands you can use:\n\n" +
                commands.map(cmd => `> \`!${cmd.name}\` - ${cmd.description || 'No description.'}`).join('\n')
            )
            .setThumbnail(imageUrl)
            .setFooter({ text: 'Bot by xMig0x • Use !help anytime you need assistance!' })
            .setTimestamp();

        // Send as embed with image file attached
        await message.reply({ 
            embeds: [embed], 
            files: [{ attachment: './image3.png', name: 'image3.png' }]
        });
    }
};