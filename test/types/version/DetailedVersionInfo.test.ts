import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('DetailedVersionInfo shape', () => {
    it('should create a valid DetailedVersionInfo-shaped object', () => {
        const info = {
            major: 3,
            minor: 19,
            patch: 1,
            raw: '3.19.1',
            numeric: 319001
        };

        assert.strictEqual(info.major, 3);
        assert.strictEqual(info.minor, 19);
        assert.strictEqual(info.patch, 1);
        assert.strictEqual(info.raw, '3.19.1');
        assert.strictEqual(info.numeric, 319001);
    });
});
