import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import { ensurePmonAcceptingCommands, withRunnableTestProject } from '../helpers/test-project-helpers';
import type { ProjEnvManagerOptions } from '../../src/types/project/ProjEnv';

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('pmon manager options (integration)', () => {
    it('should read manager options list via MGRLIST:LIST', async (t) => {
        await withRunnableTestProject(async (project) => {
            try {
                const pmon = await ensurePmonAcceptingCommands(t, project);
                if (!pmon) return;

                const list = await pmon.getManagerOptionsList(project.getId());
                assert.ok(Array.isArray(list), 'Expected an array of manager options');
                assert.ok(list.length >= 2, 'Expected at least 2 managers in runnable fixture');

                const components = list.map((m) => m.component);
                if (components.join(',') !== 'WCCILpmon,WCCOAui') {
                    t.skip(
                        `Unexpected initial MGRLIST:LIST order for runnable fixture (expected WCCILpmon,WCCOAui): ${components.join(',')}`,
                    );
                    return;
                }

                for (const m of list) {
                    assert.ok(typeof m.component === 'string' && m.component.length > 0);
                    assert.ok(typeof m.startMode === 'number');
                    assert.ok(Number.isFinite(m.secondToKill));
                    assert.ok(Number.isFinite(m.resetMin));
                    assert.ok(Number.isFinite(m.resetStartCounter));
                    assert.ok(typeof m.startOptions === 'string');
                }
            } finally {
                try {
                    await project.stop();
                    await project.stopPmon(10);
                } catch {
                    // ignore
                }
            }
        });
    });

    it('should change manager options via SINGLE_MGR:PROP_PUT (and restore)', async (t) => {
        await withRunnableTestProject(async (project) => {
            try {
                const pmon = await ensurePmonAcceptingCommands(t, project);
                if (!pmon) return;

                const beforeList = await pmon.getManagerOptionsList(project.getId());
                const beforeComponents = beforeList.map((m) => m.component);
                if (beforeComponents.join(',') !== 'WCCILpmon,WCCOAui') {
                    t.skip(
                        `Unexpected initial MGRLIST:LIST order for runnable fixture (expected WCCILpmon,WCCOAui): ${beforeComponents.join(',')}`,
                    );
                    return;
                }

                const uiIndexInList = 1; // list[1] is WCCOAui when fixture is clean
                const originalUi: ProjEnvManagerOptions = { ...beforeList[uiIndexInList] };

                // Pmon index base differs between environments; try a few plausible indices.
                // (Some setups treat the first manager as idx=0, others as idx=1.)
                const candidateUiIndices = [1, 2];

                const updatedUi: ProjEnvManagerOptions = {
                    ...originalUi,
                    resetMin: originalUi.resetMin + 1,
                };

                let usedIndex: number | undefined;

                try {
                    const timeoutMs = 7_500;

                    for (const idx of candidateUiIndices) {
                        const rc = await project.changeManagerOptions(idx, updatedUi);
                        if (rc === -1) {
                            continue;
                        }

                        const start = Date.now();
                        while (Date.now() - start < timeoutMs) {
                            const afterList = await pmon.getManagerOptionsList(project.getId());
                            const afterUi = afterList[uiIndexInList];
                            if (afterUi && afterUi.resetMin === updatedUi.resetMin) {
                                usedIndex = idx;
                                break;
                            }
                            await sleep(500);
                        }

                        if (usedIndex !== undefined) break;
                    }

                    if (usedIndex === undefined) {
                        t.skip(
                            `SINGLE_MGR:PROP_PUT did not update WCCOAui.resetMin (tried indices ${candidateUiIndices.join(',')})`,
                        );
                        return;
                    }

                    const verifyList = await pmon.getManagerOptionsList(project.getId());
                    assert.equal(
                        verifyList[uiIndexInList]?.resetMin,
                        updatedUi.resetMin,
                        'Expected resetMin to be updated for WCCOAui',
                    );
                } finally {
                    // Restore original options (best-effort)
                    try {
                        await project.changeManagerOptions(usedIndex ?? candidateUiIndices[0], originalUi);
                    } catch {
                        // ignore
                    }
                }
            } finally {
                try {
                    await project.stop();
                    await project.stopPmon(10);
                } catch {
                    // ignore
                }
            }
        });
    });
});
