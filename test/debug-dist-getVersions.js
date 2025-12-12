import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  const mod = require('../dist/winccoa-paths.js');
  const fn = mod.getAvailableWinCCOAVersions || (mod.default && mod.default.getAvailableWinCCOAVersions);
  if (typeof fn !== 'function') {
    console.error('DEBUG: getAvailableWinCCOAVersions not found on module exports', Object.keys(mod));
    process.exitCode = 2;
  } else {
    const versions = fn();
    console.log('DEBUG dist versions:', versions);
  }
} catch (err) {
  console.error('DEBUG error calling getAvailableWinCCOAVersions:', err);
  process.exitCode = 1;
}
