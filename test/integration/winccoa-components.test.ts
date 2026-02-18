import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getAllWinCCOAComponents } from '../../src/utils/winccoa-components';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('winccoa-components', () => {
    describe('getAllWinCCOAComponents', () => {
        it('should throw when the requested WinCC OA version is not found', () => {
            assert.throws(
                () => getAllWinCCOAComponents('999.999'),
                /WinCC OA version 999\.999 not found\. Cannot retrieve components\./,
            );
        });

        const versions = getAvailableWinCCOAVersions();
        const testVersion = versions.length > 0 ? versions[0] : null;

        if (!testVersion) {
            it('skips tests because no WinCC OA versions were detected', () => {
                assert.ok(true, 'No WinCC OA versions detected, skipping tests');
            });
            return;
        }

        it('should return only components that exist for the detected version', () => {
            const components = getAllWinCCOAComponents(testVersion);
            assert.ok(Array.isArray(components));

            // Each returned component should have a resolvable path for the same version.
            for (const c of components) {
                const p = c.getPath(testVersion);
                assert.ok(typeof p === 'string' && p.length > 0, `Expected path for ${c.getName()}`);
            }
        });
    });
});
