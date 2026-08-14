const fs = require('node:fs/promises');
const path = require('node:path');
const source = process.argv[2];
const destination = process.argv[3];
const move = process.argv.includes('--move');

async function walk(currentPath) {
  let content = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of content) {
    if (entry.isDirectory()) {
      await walk(path.join(currentPath, entry.name));
    } else if (entry.isFile()) {
      const filePath = path.join(currentPath, entry.name);
      let base = path.basename(filePath);
      let parse = path.parse(base);
      let category;
      if (base[0] === '.') {
        category = 'hidden';
      } else {
        let ext = path.extname(base);
        if (ext === '') {
          category = 'no-extension';
        } else {
          category = ext.slice(1);
        }
      }
      console.log(`Category: ${category}`);

      const categoryPath = path.join(destination, category);
      await fs.mkdir(categoryPath, { recursive: true });
      let destinationPath = path.join(categoryPath, base);
      for (let count = 1; ; ++count) {
        try {
          await fs.access(destinationPath);
          const newName = `${parse.name}-${count}${parse.ext}`;
          destinationPath = path.join(categoryPath, newName);
        } catch {
          break;
        }
      }

      console.log(`Destination: ${destinationPath}`);

      if (move) {
        try {
          await fs.rename(filePath, destinationPath);
          console.log(`Moved: ${filePath} -> ${destinationPath}`);
        } catch (err) {
          console.log(`Failed to move ${filePath}: ${err.message}`);
        }
      } else {
        await fs.copyFile(filePath, destinationPath);
        console.log(`Copied: ${filePath} -> ${destinationPath}`);
      }
    }
  }
}

walk(source);
