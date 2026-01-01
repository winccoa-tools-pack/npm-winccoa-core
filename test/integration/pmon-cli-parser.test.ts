import assert from 'assert';
import { describe, it } from 'node:test';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { PmonComponent } from '../../src/types/components/implementations/PmonComponent';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('Pmon CLI parser (examples)', () => {
  it('parses MGRLIST:LIST into manager options', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sample = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'list.txt'), 'utf8');

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => sample.split('\n');

    const availableVersions = getAvailableWinCCOAVersions();
    const testVersion = (availableVersions.length > 0) ? availableVersions[0] : '';
    console.log(`Registering test project with WinCC OA version: ${testVersion}`);
    pmon.setVersion(testVersion);

    const managers = await pmon.getManagerOptionsList('MyProject');
    assert(Array.isArray(managers));
    assert(managers.length === 9);
    const first = managers[0] as any;
    assert.strictEqual(first.component, 'WCCILpmon');
    assert.strictEqual(first.startMode, 0);
    assert.strictEqual(first.secondToKill || first.seckill, 30);
    const withArgs = managers.find((p: any) => p.component === 'WCCOActrl' && p.startOptions && p.startOptions.includes('-num 1'));
    assert(withArgs, 'expected WCCOActrl with startOptions to include -num 1');
  });

  it('parses MGRLIST:STATI into manager status and project state', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sample = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'stopped-stati.txt'), 'utf8');

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => sample.split('\n');
    const availableVersions = getAvailableWinCCOAVersions();
    const testVersion = (availableVersions.length > 0) ? availableVersions[0] : '';
    console.log(`Registering test project with WinCC OA version: ${testVersion}`);
    pmon.setVersion(testVersion);

    const parsed = await pmon.getProjectStatus('MyProject');
    assert(parsed);
    assert(Array.isArray(parsed.managers));
    assert(parsed.managers.length === 9);
    const m0 = parsed.managers[0] as any;
    assert.strictEqual(m0.pid, 33540);
    assert(m0.startMode === 0 || m0.startMode === 'manual');
    assert(m0.startTime instanceof Date);
    assert(parsed.project);
    assert.strictEqual(typeof parsed.project.statusCode, 'number');
  });
});
