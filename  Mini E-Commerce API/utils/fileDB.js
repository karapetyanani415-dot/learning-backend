const fs = require('node:fs/promises');
const path = require('node:path');

async function readFile(file) {
    const filePath = path.resolve(__dirname, '..', 'data', file);
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData || '[]');
}

async function writeData(file, data) {
    const filePath = path.resolve(__dirname, '..', 'data', file);
    await fs.writeFile(filePath, JSON.stringify(data, null, 4));
}

module.exports = { readFile, writeData };