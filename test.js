require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN || 'MTM3NDA2NTEyMTQ0NTU0ODE4Mw.GZZA_j.L6K9_R4POumT08Dl2i-yaoKa9LLLu24mQMMOA4';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on('ready', async () => {
    console.log(`Botul e online ca ${client.user.tag}`);
    try {
        await client.user.setActivity('TEST STATUS', { type: 'PLAYING' });
        console.log('Status setat!');
    } catch (e) {
        console.error('Eroare la setActivity:', e);
    }
});

client.login(TOKEN);