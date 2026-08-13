const fs = require('node:fs');

const filePath = process.argv[2];
if (!filePath) {
    throw new Error('Usage: node parse.js <path-to-records.bin>');
}

const buffer = fs.readFileSync(filePath);

const magic = buffer.toString('ascii', 0, 4);
if (magic !== 'SNSR') {
    throw new Error('Invalid file format: expected SNSR');
}

const version = buffer.readUInt8(4);
if (version !== 1) {
    throw new Error(`Unsupported version: ${version}`);
}

const recordCount = buffer.readUInt16BE(5);
const headerSize = 7;
const recordSize = 9;

const recordsEnd = headerSize + recordCount * recordSize;
const expectedFileSize = recordsEnd + 1;

if (buffer.length < expectedFileSize) {
    throw new Error(
        `File too short: expected at least ${expectedFileSize} bytes, got ${buffer.length}`
    );
}

const records = [];
let checksum = 0;

for (let i = 0; i < recordCount; ++i) {
    const offset = headerSize + i * recordSize;

    for (let j = 0; j < recordSize; j++) {
        checksum = (checksum + buffer[offset + j]) % 256;
    }

    const timestamp = buffer.readUInt32BE(offset);
    const temperature = buffer.readFloatBE(offset + 4);
    const sensorId = buffer.readUInt8(offset + 8);

    records.push({
        timestamp: new Date(timestamp * 1000),
        temperature,
        sensorId
    });
}

const expectedChecksum = buffer.readUInt8(recordsEnd);
const checksumValid = checksum === expectedChecksum;

let temperatureSum = 0;
for (const record of records) {
    temperatureSum += record.temperature;
}
const averageTemperature = temperatureSum / records.length;

const sensorCount = {};
for (const record of records) {
    const id = record.sensorId;
    if (!sensorCount[id]) {
        sensorCount[id] = 0;
    }
    ++sensorCount[id];
}

let mostActive = 0;
let mostRead = 0;

for (const sensorId in sensorCount) {
    if (sensorCount[sensorId] > mostRead) {
        mostRead = sensorCount[sensorId];
        mostActive = sensorId;
    }
}

console.log('File format valid (SNSR v1)');
console.log(`Records parsed: ${records.length}`);
console.log(`Average temperature: ${averageTemperature.toFixed(2)}°C`);
console.log(`Most active sensor: #${mostActive} (${mostRead} readings)`);

if (checksumValid) {
    console.log('Checksum verified ✓');
} else {
    console.warn(
        `Checksum mismatch: expected ${expectedChecksum}, got ${checksum}`
    );
}