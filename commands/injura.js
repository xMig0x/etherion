const fs = require('fs');
const path = require('path');

let sentences = null;

function loadSentences() {
    if (!sentences) {
        const filePath = path.join(__dirname, '../sentences.txt');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            sentences = content.split(/\r?\n/).filter(s => s.trim().length > 0);
        } else {
            sentences = [];
        }
    }
}

module.exports = {
    name: 'injura',
    description: 'Trimite o propoziție random dintr-un fișier .txt către un membru menționat.',
    async execute(message, args) {
        // Verifică dacă există un mention
        const mention = message.mentions.members.first();
        if (!mention) {
            return message.reply('Te rog să menționezi un membru! Exemplu: !propozitie @nume');
        }

        // Încarcă propozițiile dacă nu sunt deja încărcate
        loadSentences();
        if (!sentences.length) {
            return message.reply('Nu am găsit nicio propoziție în sentences.txt!');
        }

        // Alege random o propoziție
        const line = sentences[Math.floor(Math.random() * sentences.length)];

        // Trimite mesajul
        return message.channel.send(`${mention} ${line}`);
    }
};