import assert from 'assert';
import { test } from 'node:test';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { PmonComponent } from '../../src/types/components/implementations/PmonComponent';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

test('PmonComponent STATI parsing - parse MGRLIST:STATI output into managers and project state', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fixture = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'stopped-stati.txt'), 'utf8');

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => fixture.split('\n');
    pmon.setVersion(getAvailableWinCCOAVersions().pop() || '');

    const result = await pmon.getProjectStatus('MyProject');

    assert.ok(result);
    assert.ok(Array.isArray(result.managers));
    assert.strictEqual(result.managers.length, 9);

    const m0 = result.managers[0] as any;
    assert.strictEqual(m0.managerNumber, 1);
    assert.strictEqual(m0.runningState, 'running');
    assert.strictEqual(typeof m0.startTimeStamp, 'object');
    assert.strictEqual(m0.pid, 33540);

    const m1 = result.managers[1] as any;
    assert.strictEqual(m1.pid, undefined);
    assert.strictEqual(m1.runningState, 'stopped');

    const m2 = result.managers[2];
    // m2 in this fixture is not started

    // project state
    assert.ok(result.project);
    assert.strictEqual(result.project?.statusCode, 0);
    assert.strictEqual(result.project?.text, 'WAIT_MODE');
    // also test getManagerStatusAt
    const single = await pmon.getManagerStatusAt(2, 'MyProject') as any;
    assert.ok(single);
    assert.strictEqual(typeof single?.managerNumber, 'number');
});
