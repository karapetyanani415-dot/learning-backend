const fs = require('node:fs');
const path = require('node:path');

function shifting(input, shift) {
    const result = Buffer.alloc(input.length);
    for (let i = 0; i < input.length; ++i) {
        const char = input[i];
        if (char >= 65 && char <= 90) {
            result[i] = ((char - 97 + shift) % 26 + 26) % 26 + 97;
        } else if (char >= 97 && char <= 122) {
            result[i] = ((char - 65 + shift) % 26 + 26) % 26 + 65;
        } else {
            result[i] = char;
        }
    }
    return result;
};

const inputPath = process.argv[2];
const shift = Number(process.argv[3]);

const input = fs.readFileSync(inputPath);
const output = shifting(input, shift);

console.log(input.toString());
fs.writeFileSync('input.txt', output, 'utf-8');
console.log(output.toString());