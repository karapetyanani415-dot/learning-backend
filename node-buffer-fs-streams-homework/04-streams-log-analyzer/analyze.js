const fs = require('node:fs');

const filePath = process.argv[2];

let totalLines = 0;
let errorCount = 0;
let warnCount = 0;
let infoCount = 0;

let lastErrorTime = null;
let longestGap = 0;
let longestGapStart = null;
let longestGapEnd = null;

let leftover = '';

function processLine(line) {
  totalLines++;

  if (line.includes('[ERROR]')) {
    errorCount++;
    const timestamp = line.split(' ')[0];
    const errorTime = new Date(timestamp);

    if (lastErrorTime !== null) {
      const gap = (errorTime - lastErrorTime) / 1000;
      if (gap > longestGap) {
        longestGap = gap;
        longestGapStart = lastErrorTime;
        longestGapEnd = errorTime;
      }
    }
    lastErrorTime = errorTime;
  } else if (line.includes('[WARN]')) {
    warnCount++;
  } else if (line.includes('[INFO]')) {
    infoCount++;
  }
}

const stream = fs.createReadStream(filePath, {
  encoding: 'utf8',
});

stream.on('data', (chunk) => {
  const data = leftover + chunk;
  const lines = data.split('\n');

  leftover = lines.pop();
  for (const line of lines) {
    processLine(line);
  }
});

stream.on('end', () => {
  if (leftover) {
    processLine(leftover);
  }

  console.log('Lines processed:', totalLines);
  console.log('ERROR:', errorCount);
  console.log('WARN:', warnCount);
  console.log('INFO:', infoCount);
  console.log('Longest gap between ERRORs:', longestGap, 'seconds');

  if (longestGapStart !== null) {
    console.log(
      `between ${longestGapStart.toISOString()} and ${longestGapEnd.toISOString()}`,
    );
  }
});
