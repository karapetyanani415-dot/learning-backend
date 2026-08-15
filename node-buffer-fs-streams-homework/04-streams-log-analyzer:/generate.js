const fs = require('node:fs');

const stream = fs.createWriteStream('server.log');
const levels = ['INFO', 'WARN', 'ERROR'];

const messages = [
  'Request handled in 42ms',
  'Connection timed out',
  'Retry attempt 2',
  'Database connection failed',
  'User authenticated',
  'Request received',
];

let currentTime = new Date('2026-08-10T14:00:00Z');

for (let i = 0; i < 100000; ++i) {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const timestamp = currentTime.toISOString();
  const line = `${timestamp} [${level}] ${message}\n`;
  stream.write(line);

  currentTime = new Date(currentTime.getTime() + 1000);
}

stream.end();
