import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { PmonComponent } from '../../src/types/components/implementations/PmonComponent';

// Expose private parseManagerList for testing
class TestablePmonComponent extends PmonComponent {
    public testParseManagerList(output: string) {
        return (this as any).parseManagerList(output);
    }
}

describe('PmonComponent.parseManagerList', () => {
    const pmon = new TestablePmonComponent();

    it('parses valid manager lines', () => {
        const output = [
            'LIST:3',
            'WCCILpmon;2;30;3;1;',
            'WCCILdata;2;30;3;1;',
            'WCCILctrl;2;30;3;1;-num 1 -f main.ctl',
        ].join('\n');

        const result = pmon.testParseManagerList(output);
        assert.equal(result.length, 3);
        assert.equal(result[0].component, 'WCCILpmon');
        assert.equal(result[2].component, 'WCCILctrl');
        assert.equal(result[2].startOptions, '-num 1 -f main.ctl');
    });

    it('skips PMON warning lines mixed into output', () => {
        const output = [
            'LIST:2',
            'WCCILpmon;2;30;3;1;',
            'WCCILpmon    (1), 2026.03.05 09:32:16.072, PARAM,WARNING,    54, Unexpected state, Resources, readSection, illegal value for useCMContainerSerialNumber, ignored',
            'WCCILdata;2;30;3;1;',
        ].join('\n');

        const result = pmon.testParseManagerList(output);
        assert.equal(result.length, 2);
        assert.equal(result[0].component, 'WCCILpmon');
        assert.equal(result[1].component, 'WCCILdata');
    });

    it('returns empty array for empty output', () => {
        const result = pmon.testParseManagerList('');
        assert.deepEqual(result, []);
    });

    it('returns empty array for output with only log lines', () => {
        const output = 'WCCILpmon    (1), 2026.03.05 09:32:16.072, PARAM,WARNING, 54, some warning';
        const result = pmon.testParseManagerList(output);
        assert.deepEqual(result, []);
    });
});
