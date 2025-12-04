import assert from 'assert';
import { test } from 'node:test';
import { PmonComponent } from '../dist/types/components/implementations/PmonComponent.js';
import type { WinCCOAManager } from '../dist/types/status/WinCCOAManager.js';

// We'll stub execAndCollectLines on PmonComponent instances to return sample outputs

test('PmonComponent STATI parsing - parse MGRLIST:STATI output into managers and project state', async () => {
    const sampleStati = `STATI:3
2;25404;0;2025.11.04 08:02:53.379;1
0;-1;0;1970.01.01 01:00:00.000;2
1;12345;2;2025.11.04 08:05:00.100;3
0 WAIT_MODE 0 0
;`;

    const pmon = new PmonComponent();
    // mock execAndCollectLines to return the sample output as lines
    (pmon as any).execAndCollectLines = async () => sampleStati.split('\n');

    const result = await pmon.getManagerStatusList('MyProject');

    assert.ok(result);
    assert.ok(Array.isArray(result.managers));
    assert.strictEqual(result.managers.length, 3);

    const m0 = result.managers[0];
    assert.strictEqual(m0.managerNumber, 1);
    assert.strictEqual(m0.runningState, 'running');
    assert.strictEqual(typeof m0.startTimeStamp, 'object');
    assert.strictEqual(m0.pid, 25404);

    const m1 = result.managers[1];
    assert.strictEqual(m1.pid, undefined);
    assert.strictEqual(m1.runningState, 'stopped');

    const m2 = result.managers[2];
    assert.strictEqual(m2.pid, 12345);
    assert.strictEqual(m2.startMode, 'always');
    assert.strictEqual(m2.runningState, 'init');

    // project state
    assert.ok(result.projectState);
    assert.strictEqual(result.projectState?.statusCode, 0);
    assert.strictEqual(result.projectState?.text, 'WAIT_MODE');
    // also test getManagerStatusAt
    const single = await pmon.getManagerStatusAt(2);
    assert.ok(single);
    assert.strictEqual(single?.managerNumber, 3);
});
