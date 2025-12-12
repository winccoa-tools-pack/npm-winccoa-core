import { describe, it } from 'node:test';
import fs from 'fs';
import { strict as assert } from 'assert';
import { getAvailableWinCCOAVersions, getWinCCOAInstallationPathByVersion } from '../../src/utils/winccoa-paths.ts';

describe('getWinCCOAInstallationPathByVersion (integration)', () => {
  it('detects the WinCC OA installation path', () => {
    const versions = getAvailableWinCCOAVersions();
    // Helpful debug output in CI logs
    // eslint-disable-next-line no-console
    console.log('Available WinCC OA versions:', versions);
    

    const installationPath = getWinCCOAInstallationPathByVersion(versions[0]);

    assert.ok(typeof installationPath === 'string', 'Installation path should be a string');
    assert.ok(installationPath!.length > 0, 'Installation path should not be empty');
    assert.ok(fs.existsSync(installationPath!), `Installation path does not exist: ${installationPath}`);
  });
});
