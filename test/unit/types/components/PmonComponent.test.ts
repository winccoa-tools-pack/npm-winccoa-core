import test from 'node:test';
import assert from 'assert';
import { PmonComponent } from '../../../dist/types/components/implementations/PmonComponent.js';

test('PmonComponent exists() returns false when executable missing', async () => {
    const p = new PmonComponent();

    // Override getPath to simulate missing executable
    (p as any).getPath = () => null;

    assert.strictEqual(p.exists(), false);
});

test('PmonComponent.registerSubProject throws when executable missing', async () => {
    const p = new PmonComponent();
    (p as any).getPath = () => null;

    await assert.rejects(async () => {
        await p.registerSubProject('some/path');
    }, /pmon executable not found/);
});
