const fs = require('fs');
const path = require('path');
const fileNameInput = process.argv[2];
const readStream = fs.createReadStream(`${fileNameInput}`, { encoding: 'utf8' });

let wordCount = 0;
let bytesProcessed = 0;
let leftover = "";

readStream.on('data', (chunk) => {
    bytesProcessed += Buffer.byteLength(chunk);
    chunk = leftover + chunk;
    const parts = chunk.split(/\s+/);
    if (!/\s$/.test(chunk)) {
        leftover = parts.pop();
    } else {
        leftover = '';
    }
    wordCount += parts.filter(Boolean).length;
});

readStream.on('end', () => {
    if (leftover) {
        wordCount++;
    }

    console.log(`Words: ${wordCount}`);
    console.log(`Bytes processed: ${bytesProcessed}`);
});