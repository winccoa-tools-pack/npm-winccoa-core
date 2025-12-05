const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findJsonFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
      results = results.concat(findJsonFiles(full));
    } else if (entry.isFile() && full.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

const root = process.cwd();
const files = findJsonFiles(root);
if (files.length === 0) {
  console.log('No JSON files found');
  process.exit(0);
}

let failed = false;
for (const f of files) {
  process.stdout.write(`Linting: ${f} ... `);
  const res = spawnSync('npx', ['jsonlint', '-q', f], { stdio: 'inherit' });
  if (res.status !== 0) {
    failed = true;
    console.log('FAILED');
  } else {
    console.log('OK');
  }
}

process.exit(failed ? 1 : 0);
