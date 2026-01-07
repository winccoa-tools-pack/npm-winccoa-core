import test from 'node:test';
import assert from 'assert';
import { PmonComponent } from '../../../../src/types/components/implementations/PmonComponent';

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
    }, /Executable WCCILpmon not found/);
});

test('PmonComponent.getCurrentCredentials returns stored credentials', async () => {
    const p = new PmonComponent();
    const testCredentials = { username: 'user', password: 'pass' };
    (p as any).currentCredentials = testCredentials;

    const creds = p.getCredentials();
    assert.deepStrictEqual(creds, testCredentials);
});

test('PmonComponent.verifyCredentials calls with invalid user name and pw', async () => {
    const p = new PmonComponent();
    const projectName = 'TestProject';
    let invalidCredentials = { username: 'invalidUser', password: 'invalidPass' };

    // Mock _storeCredentials to simulate failure
    (p as any)._storeCredentials = async (projName: string, oldCreds: any, newCreds: any) => {
        if (newCreds.username === 'invalidUser') {
            return 1; // Simulate failure code
        }
        return 0; // Simulate success code
    };

    invalidCredentials.password = ''; // Empty password

    assert.rejects(async () => {
        await p.verifyCredentials(projectName, invalidCredentials);
    }, /Password cannot be empty/);

    invalidCredentials.password = 'strong#pw!with.invalid-hastag'; // Reset password
    assert.rejects(async () => {
        await p.verifyCredentials(projectName, invalidCredentials);
    }, /Password cannot contain invalid characters/);

    // the same for username
    invalidCredentials = { username: '', password: 'somePassword' };
    assert.rejects(async () => {
        await p.verifyCredentials(projectName, invalidCredentials);
    }, /Username cannot be empty/);

    invalidCredentials.username = 'strong#user!with.invalid-hastag'; // Reset username
    assert.rejects(async () => {
        await p.verifyCredentials(projectName, invalidCredentials);
    }, /Username cannot contain invalid characters/);

    invalidCredentials = { username: 'invalidUser', password: 'invalidPass' };

    const result = await p.verifyCredentials(projectName, invalidCredentials);
    assert.strictEqual(result, false);

    invalidCredentials = { username: 'validUser', password: 'validPass' };
    const successResult = await p.verifyCredentials(projectName, invalidCredentials);
    assert.strictEqual(successResult, true);
});
