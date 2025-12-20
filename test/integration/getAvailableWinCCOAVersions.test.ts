import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('getAvailableWinCCOAVersions (integration)', () => {
  it('detects at least one WinCC OA version (expects 3.x like 3.19)', () => {
    const versions = getAvailableWinCCOAVersions();
    // Helpful debug output in CI logs
    // eslint-disable-next-line no-console
    console.log('Available WinCC OA versions:', versions);

    assert.ok(Array.isArray(versions), 'Result should be an array');
    assert.ok(versions.length > 0, 'No WinCC OA versions detected');

    const has3x = versions.some((v) => /^3\.\d+/.test(v));
    assert.ok(has3x, 'No WinCC OA 3.x version detected (expected e.g. 3.19, 3.20, 3.21)');
  });
});
