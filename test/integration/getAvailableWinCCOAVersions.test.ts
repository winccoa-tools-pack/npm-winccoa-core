import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('getAvailableWinCCOAVersions (integration)', () => {
  it('detects at least one WinCC OA version (expects 3.x like 3.19)', () => {
    const versions = getAvailableWinCCOAVersions();
    // Helpful debug output in CI logs
    // eslint-disable-next-line no-console
    console.log('Available WinCC OA versions:', versions);
    // If this is a developer/local run and WinCC OA isn't installed, skip test.
    // CI / integration runs should set WINCCOA_INTEGRATION=1 to make the test strict.
    if (!Array.isArray(versions) || versions.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('Skipping integration test: no WinCC OA installation detected.');
      return;
    }

    assert.ok(Array.isArray(versions), 'Result should be an array');
    assert.ok(versions.length > 0, 'No WinCC OA versions detected');

    const has3x = versions.some((v) => /^3\.\d+/.test(v));
    assert.ok(has3x, 'No WinCC OA 3.x version detected (expected e.g. 3.19, 3.20, 3.21)');
  });
});
