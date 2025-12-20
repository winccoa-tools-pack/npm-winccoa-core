import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseVersionString } from '../../../src/utils/winccoa-version-info';

describe('winccoa-version-info', () => {
    describe('parseVersionString', () => {
        it('should parse major.minor version', () => {
            assert.strictEqual(parseVersionString('3.19'), 319000);
            assert.strictEqual(parseVersionString('3.20'), 320000);
        });

        it('should parse major.minor.patch version', () => {
            assert.strictEqual(parseVersionString('3.19.1'), 319001);
            assert.strictEqual(parseVersionString('3.20.5'), 320005);
        });

        it('should handle version comparison correctly', () => {
            const v319 = parseVersionString('3.19');
            const v320 = parseVersionString('3.20');
            const v3191 = parseVersionString('3.19.1');
            
            assert.ok(v320 > v319, '3.20 should be greater than 3.19');
            assert.ok(v3191 > v319, '3.19.1 should be greater than 3.19');
            assert.ok(v320 > v3191, '3.20 should be greater than 3.19.1');
        });

        it('should handle invalid version strings', () => {
            assert.strictEqual(parseVersionString('invalid'), 0);
            assert.strictEqual(parseVersionString(''), 0);
            assert.strictEqual(parseVersionString('abc.def'), 0);
        });

        it('should handle edge cases', () => {
            assert.strictEqual(parseVersionString('0.0'), 0);
            assert.strictEqual(parseVersionString('1.0'), 100000);
            assert.strictEqual(parseVersionString('99.99.99'), 9999099);
        });

        it('should sort versions correctly', () => {
            const versions = ['3.19', '3.20', '3.19.1', '3.18', '3.20.1'];
            const sorted = versions.sort((a, b) => parseVersionString(b) - parseVersionString(a));
            
            assert.deepStrictEqual(sorted, ['3.20.1', '3.20', '3.19.1', '3.19', '3.18']);
        });
    });
});
