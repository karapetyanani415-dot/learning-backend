const path = require('node:path');

function clear(name) {
    const { name: base, ext } = path.parse(name);
    const cleanExt = ext.toLowerCase();
    const cleanBase = base.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleanBase + cleanExt;
};

const inputPath = process.argv[2];
console.log(clear(inputPath));