let fs = require('node:fs/promises');
let path = require('node:path');

const LIMIT = 1024;
const filePath = process.argv[2];

async function rotateLog() {
    let stats;
    try {
        stats = await fs.stat(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log(`No log file yet at ${filePath} -- nothing to rotate.`);
            return;
        }
    }
    const size = stats.size;
    if (size <= LIMIT) {
        console.log(`${filePath} is ${size} bytes -- under the limit, no rotation needed.`);
        return;
    } else {
        const date = new Date().toISOString();
        const archivedPath = `${path.basename(filePath, '.log')}-${date}.log`;

        await fs.rename(filePath, archivedPath);
        await fs.writeFile(filePath, '');

        console.log(`Rotated: ${filePath} -> ${archivedPath} (fresh log created)`);
    }
}

rotateLog()