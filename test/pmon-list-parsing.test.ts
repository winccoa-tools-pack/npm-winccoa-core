import assert from 'assert';
import { test } from 'node:test';
import { PmonComponent } from '../dist/types/components/implementations/PmonComponent.js';

test('PmonComponent LIST parsing - parse MGRLIST:LIST output into managers', async () => {
    const sampleList = `LIST:3
WCCILpmon;0;30;3;1;
WCCILdata;2;30;3;1;-arg1 -arg2
WCCOAui;1;60;5;1;--opt
;`;

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => sampleList.split('\n');

        const managers = await pmon.getManagerOptionsList('MyProject'); // Renamed to getManagerOptionsList

    assert.ok(Array.isArray(managers));
    assert.strictEqual(managers.length, 3);
    const opt = await pmon.getManagerOptionsAt(1);
    assert.ok(opt);

    const m0 = managers[0];
    assert.strictEqual(m0.component, 'WCCILpmon');
    assert.strictEqual(m0.startMode, 0);

    const m1 = managers[1];
    assert.strictEqual(m1.component, 'WCCILdata');
    assert.strictEqual(m1.startOptions, '-arg1 -arg2');
    assert.strictEqual(m1.startMode, 2);

    const m2 = managers[2];
    assert.strictEqual(m2.component, 'WCCOAui');
    assert.strictEqual(m2.startMode, 1);
});
