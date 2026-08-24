const net = require('net');
const readline = require('readline');
require('dotenv').config({ quiet: true });
const PORT = process.env.PORT;

const client = net.createConnection({
    host: 'localhost',
    port: PORT
});

const readlines = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.on('data', (data) => {
    process.stdout.write(data.toString());
});

readlines.on('line', (line) => {
    client.write(line + '\n');
});

client.on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});

client.on('close', () => {
    console.log('\nDisconnected from server.');
    readlines.close();
});