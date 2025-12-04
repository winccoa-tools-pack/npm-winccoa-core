import assert from 'assert';
import { describe, it } from 'node:test';

// These tests use the real PMON example outputs from docs/dev/PMON_CLI.md
// Adjust import path if the parsing helpers live elsewhere.
import { PmonComponent } from '../dist/types/components/implementations/PmonComponent.js';

describe('Pmon CLI parser (examples)', () => {
  it('parses MGRLIST:LIST into manager options', async () => {
    const sample = `LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;`;

    const pmon = new PmonComponent();
    // mock execAndCollectLines to return lines of fixture
    (pmon as any).execAndCollectLines = async () => sample.split('\n');

    const managers = await pmon.getManagerOptionsList('MyProject');
    assert(Array.isArray(managers));
    assert(managers.length === 9);
    const first = managers[0];
    assert.strictEqual(first.component, 'WCCILpmon');
    assert.strictEqual(first.startMode, 0);
    assert.strictEqual(first.secondToKill, 30);
    const withArgs = managers.find((p: any) => p.component === 'WCCOActrl' && p.startOptions && p.startOptions.includes('-num 1'));
    assert(withArgs, 'expected WCCOActrl with startOptions to include -num 1');
  });

  it('parses MGRLIST:STATI into manager status and project state', async () => {
    const sample = `LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;`;

    const pmon = new PmonComponent();
    (pmon as any).execAndCollectLines = async () => sample.split('\n');

    const parsed = await pmon.getProjectStatus('MyProject');
    assert(parsed);
    assert(Array.isArray(parsed.managers));
    assert(parsed.managers.length === 9);
    const m0 = parsed.managers[0];
    assert.strictEqual(m0.pid, 33540);
    // startMode may be numeric enum or textual ('manual') depending on parser compatibility
    assert(m0.startMode === 0 || m0.startMode === 'manual');
    assert(m0.startTime instanceof Date);
    assert(parsed.project);
    assert.strictEqual(typeof parsed.project.statusCode, 'number');
  });
});
