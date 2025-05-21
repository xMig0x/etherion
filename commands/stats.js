const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const SITE_URL = 'https://merlis.eu/ref/pservernet';

async function fetchStats() {
    try {
        const response = await axios.get(SITE_URL);
        const html = response.data;
        const $ = cheerio.load(html);

        let stats = {};
        $('.stats-info').each((i, el) => {
            const label = $(el).find('.stats-label').text().trim();
            const value = $(el).find('.stats-value').text().trim();
            if (label && value) {
                if (label.toLowerCase().includes('online players (24h)')) stats["online24h"] = value;
                else if (label.toLowerCase().includes('online players')) stats["online"] = value;
                else if (label.toLowerCase().includes('accounts')) stats["accounts"] = value;
                else if (label.toLowerCase().includes('characters')) stats["characters"] = value;
            }
        });
        return stats;
    } catch (error) {
        console.error('EROARE:', error);
        return null;
    }
}

function buildStatsEmbed(stats) {
    return new EmbedBuilder()
        .setTitle('📊 Statistici Merlis')
        .setColor(0x2ECC71)
        .addFields(
            { name: '🟢 Online players', value: stats.online || 'N/A', inline: true },
            { name: '🕒 Online players (24h)', value: stats.online24h || 'N/A', inline: true },
            { name: '👤 Accounts', value: stats.accounts || 'N/A', inline: true },
            { name: '🧑‍🎮 Characters', value: stats.characters || 'N/A', inline: true }
        )
        .setFooter({ text: 'Actualizat automat la fiecare 30s | merlis.eu' })
        .setTimestamp();
}

module.exports = {
    name: "stats",
    description: "Afișează statisticile Merlis Server.",
    async execute(message) {
        const stats = await fetchStats();
        if (!stats) {
            return message.reply('❌ Nu am putut prelua statisticile de pe merlis.eu.');
        }
        const embed = buildStatsEmbed(stats);
        return message.reply({ embeds: [embed] });
    },
    fetchStats,
    buildStatsEmbed
};