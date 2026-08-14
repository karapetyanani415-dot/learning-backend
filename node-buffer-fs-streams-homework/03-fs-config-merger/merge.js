const fs = require('node:fs/promises');
const path = require('node:path');

const environment = process.argv[2];
const basePath = path.join(__dirname, 'config.base.json');
const overridePath = path.join(__dirname, `config.${environment}.json`);
const finalPath = path.join(__dirname, 'config.final.json');

async function readFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');

  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(`Invalid JSON in ${filePath}`);
    console.error(`Reason: ${err.message}`);
    throw err;
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, override) {
  const result = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  }
  return result;
}

async function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, data, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function main() {
  if (!environment) {
    console.error('Error: please provide an environment.');
    console.error('Example: node merge.js staging');
    return;
  }

  let baseConfig;
  try {
    baseConfig = await readFile(basePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Error: required base config not found: ${basePath}`);
    }
    return;
  }

  let overrideConfig = {};
  try {
    overrideConfig = await readFile(overridePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`Warning: override file not found: ${overridePath}`);
    } else {
      return;
    }
  }

  const mergedConfig = deepMerge(baseConfig, overrideConfig);
  const data = JSON.stringify(mergedConfig, null, 2);
  await atomicWrite(finalPath, data);

  console.log('Config merged successfully.');
  console.log(`Output: ${finalPath}`);
}

main();
