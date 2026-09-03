const { readdirSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const root = join(__dirname, '..');
const sourceFiles = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.js')) sourceFiles.push(fullPath);
  }
}

collect(root);
let failed = false;
for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  failed ||= result.status !== 0;
}

if (failed) process.exit(1);
console.log(`Verified ${sourceFiles.length} backend JavaScript files.`);
