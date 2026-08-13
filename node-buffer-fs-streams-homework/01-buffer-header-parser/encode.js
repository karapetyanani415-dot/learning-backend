const fs = require('node:fs');

const recordCount = 12;
const recordSize = 9;
const headerSize = 7;
const checksumSize = 1;

const buffer = Buffer.alloc(
    headerSize + recordCount * recordSize + checksumSize
);

buffer.write('SNSR', 0);
buffer.writeUInt8(1, 4);
buffer.writeUInt16BE(recordCount, 5);

const baseTimestamp = Math.floor(Date.now() / 1000);

for (let i = 0; i < recordCount; i++) {
    const offset = headerSize + i * recordSize;

    const timestamp = Math.floor(Date.now() / 1000);
    const temperature = 20 + i * 0.5;
    const sensorId = (i % 3) + 1;

    buffer.writeUInt32BE(timestamp, offset);
    buffer.writeFloatBE(temperature, offset + 4);
    buffer.writeUInt8(sensorId, offset + 8);
}


let checksum = 0;
const recordsStart = headerSize;
const recordsEnd = headerSize + recordCount * recordSize;

for (let i = recordsStart; i < recordsEnd; i++) {
    checksum = (checksum + buffer[i]) % 256;
}

buffer.writeUInt8(checksum, recordsEnd);

fs.writeFileSync('records.bin', buffer);

console.log(`Wrote records.bin: ${recordCount} records, checksum=${checksum}`);