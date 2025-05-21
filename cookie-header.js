const fs = require('fs');
const path = require('path');

const cookiePath = path.join(__dirname, 'cookies.txt');
const raw = fs.readFileSync(cookiePath, 'utf-8');
const lines = raw.split('\n').filter(line => line && !line.startsWith('#') && line.split('\t').length >= 7);

const cookies = lines.map(line => {
    const parts = line.split('\t');
    // parts[5] = cookie name, parts[6] = cookie value
    return `${parts[5]}=${parts[6]}`;
}).join('; ');

fs.writeFileSync(path.join(__dirname, 'cookies_header.txt'), cookies);

console.log('Cookie header:', cookies);