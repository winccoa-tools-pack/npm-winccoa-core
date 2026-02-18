import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ProjEnvProject } from '../../../../src/types/project/ProjEnvProject';
import { ProjEnvProjectFileSysStruct } from '../../../../src/types/project/ProjEnv';
import type { ProjEnvProjectRegistry } from '../../../../src/types/project/ProjEnvProjectRegistry';

function makeTempDir(prefix = 'projenv-project-'): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe('ProjEnvProject - version fallback', () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs.splice(0)) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it('reads project version from config when registry has no installationVersion', () => {
        const root = makeTempDir();
        tempDirs.push(root);

        const installDir = path.join(root, 'projects');
        fs.mkdirSync(installDir, { recursive: true });

        const projectId = 'MyProject';
        const configDir = path.join(installDir, projectId, ProjEnvProjectFileSysStruct.CONFIG_REL_PATH);
        fs.mkdirSync(configDir, { recursive: true });

        const configPath = path.join(configDir, 'config');
        fs.writeFileSync(configPath, '[general]\nproj_version = "3.21"\n', 'utf-8');

        const registry: ProjEnvProjectRegistry = {
            id: projectId,
            installationDir: installDir,
            installationDate: new Date().toISOString(),
            notRunnable: false,
            name: projectId,
            currentProject: false,
            installationVersion: undefined,
        };

        const project = new ProjEnvProject();
        project.initFromRegister(registry);

        assert.strictEqual(project.getVersion(), '3.21');
    });

    it('throws when registry and config versions are both present but mismatch', () => {
        const root = makeTempDir();
        tempDirs.push(root);

        const installDir = path.join(root, 'projects');
        fs.mkdirSync(installDir, { recursive: true });

        const projectId = 'MyProject';
        const configDir = path.join(installDir, projectId, ProjEnvProjectFileSysStruct.CONFIG_REL_PATH);
        fs.mkdirSync(configDir, { recursive: true });

        const configPath = path.join(configDir, 'config');
        fs.writeFileSync(configPath, '[general]\nproj_version = "3.21"\n', 'utf-8');

        const registry: ProjEnvProjectRegistry = {
            id: projectId,
            installationDir: installDir,
            installationDate: new Date().toISOString(),
            notRunnable: false,
            name: projectId,
            currentProject: false,
            installationVersion: '3.20',
        };

        const project = new ProjEnvProject();

        assert.throws(
            () => project.initFromRegister(registry),
            /Project version mismatch between registry and config file/,
        );
    });
});
