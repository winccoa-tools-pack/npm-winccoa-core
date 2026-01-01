import assert from 'assert';
import { test } from 'node:test';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { PmonComponent } from '../../src/types/components/implementations/PmonComponent';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

test('PmonComponent LIST parsing - parse MGRLIST:LIST output into managers', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fixture = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'list.txt'), 'utf8');

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => fixture.split('\n');
    const availableVersions = getAvailableWinCCOAVersions();
    const testVersion = (availableVersions.length > 0) ? availableVersions[0] : '';
    pmon.setVersion(testVersion);

    const managers = await pmon.getManagerOptionsList('MyProject');

    assert.ok(Array.isArray(managers));
    assert.strictEqual(managers.length, 9);
    const opt = await pmon.getManagerOptionsAt(1, 'MyProject');
    assert.ok(opt);

    const m0 = managers[0];
    assert.strictEqual(m0.component, 'WCCILpmon');
    assert.strictEqual(m0.startMode, 0);

    const m1 = managers[1];
    assert.strictEqual(m1.component, 'WCCILdataSQLite');
    const withArgs = managers.find((p: any) => p.component === 'WCCOActrl' && p.startOptions && p.startOptions.includes('-num 1'));
    assert.ok(withArgs);
});
