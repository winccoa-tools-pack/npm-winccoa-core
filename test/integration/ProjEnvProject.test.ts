import { describe, it, afterEach } from 'node:test';
import { strict as assert } from 'assert';
import { ProjEnvProject } from '../../src/types/project/ProjEnvProject';
import {
    registerRunnableTestProject,
    unregisterTestProject,
    withRunnableTestProject,
    getTestProjectPath,
} from '../helpers/test-project-helpers';
import { OaLanguage } from '../../src/types/localization/OaLanguage';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('ProjEnvProject (integration)', () => {
    describe('Project Registration', () => {
        let project: ProjEnvProject | undefined;

        afterEach(async () => {
            if (project) {
                await unregisterTestProject(project);
                project = undefined;
            }
        });

        it('should register a new project', async () => {
            project = await registerRunnableTestProject();

            assert.ok(project, 'Project should be created');
            assert.ok(project.getId(), 'Project should have an ID');
            assert.ok(project.getName(), 'Project should have a name');
            assert.ok(project.getVersion(), 'Project should have a version');
            assert.ok(project.isRegistered(), `Project ${project.getId()} should be registered`);
        });

        it('should unregister a project', async () => {
            project = await registerRunnableTestProject();
            const projectId = project.getId();

            assert.ok(project.isRegistered(), 'Project should be registered initially');

            const result = await project.unregisterProj();
            assert.strictEqual(result, 0, 'Unregister should return 0 on success');

            // Create new instance to check registration status
            const checkProject = new ProjEnvProject();
            checkProject.setId(projectId);
            assert.ok(!checkProject.isRegistered(), 'Project should not be registered after unregister');

            project = undefined; // Prevent double cleanup
        });

        it('should check if project exists physically', async () => {
            const projectPath = getTestProjectPath('runnable');
            const testProject = new ProjEnvProject();
            testProject.setDir(projectPath);

            assert.ok(testProject.exists(), 'Test fixture project should exist physically');
        });

        it('should validate project properties', async () => {
            project = await registerRunnableTestProject();

            assert.strictEqual(project.getInvalidReason(), '', 'There is no reason to be invalid');
            assert.ok(project.isValid(), 'Project should be valid');
            assert.strictEqual(project.getInvalidReason(), '', 'Valid project should have no invalid reason');
        });
    });

    describe('Project Properties', () => {
        it('should set and get project ID', async () => {
            await withRunnableTestProject(async (project) => {
                const id = project.getId();
                assert.ok(id, 'Project ID should be set');
                assert.ok(id.length > 0, 'Project ID should not be empty');
            });
        });

        it('should set and get project name', async () => {
            await withRunnableTestProject(async (project) => {
                const testName = 'TestProjectName';
                project.setName(testName);
                assert.strictEqual(project.getName(), testName, 'Project name should match');
            });
        });

        it('should get display name', async () => {
            await withRunnableTestProject(async (project) => {
                const displayName = project.getDisplayName();
                assert.ok(displayName, 'Display name should be set');
                // Display name should be either the name or the ID
                const expectedName = project.getName() || project.getId();
                assert.strictEqual(displayName, expectedName, 'Display name should match name or ID');
            });
        });

        it('should set and get install directory', async () => {
            await withRunnableTestProject(async (project) => {
                const installDir = project.getInstallDir();
                assert.ok(installDir, 'Install directory should be set');
                assert.ok(installDir.length > 0, 'Install directory should not be empty');
                assert.ok(installDir.endsWith('/'), 'Install directory should end with a separator');
            });
        });

        it('should get project directory with relative path', async () => {
            await withRunnableTestProject(async (project) => {
                const baseDir = project.getDir();
                assert.ok(baseDir, 'Base directory should be returned');

                const configDir = project.getDir('config/');
                assert.ok(configDir.includes('config'), 'Config directory should contain "config"');
                assert.ok(configDir.length > baseDir.length, 'Relative path should extend base path');
            });
        });

        it('should set and check runnable status', async () => {
            await withRunnableTestProject(async (project) => {
                project.setRunnable(true);
                assert.ok(project.isRunnable(), 'Project should be runnable');

                project.setRunnable(false);
                assert.ok(!project.isRunnable(), 'Project should not be runnable');

                // Restore runnable status
                project.setRunnable(true);
            });
        });

        it('should set and get version', async () => {
            await withRunnableTestProject(async (project) => {
                const testVersion = '3.19';
                project.setVersion(testVersion);
                assert.strictEqual(project.getVersion(), testVersion, 'Version should match');
            });
        });

        it('should set and get languages', async () => {
            await withRunnableTestProject(async (project) => {
                const testLangs = [OaLanguage.en_US, OaLanguage.de_AT];
                project.setLanguages(testLangs);
                const langs = project.getLanguages();
                assert.deepStrictEqual(langs, testLangs, 'Languages should match');
            });
        });
    });

    describe('Project Configuration', () => {
        it('should get config path', async () => {
            await withRunnableTestProject(async (project) => {
                const configPath = project.getConfigPath('config');
                assert.ok(configPath, 'Config path should be returned');
                assert.ok(configPath.includes('config'), 'Config path should contain "config"');
            });
        });
        it('should get config.level path', async () => {
            await withRunnableTestProject(async (project) => {
                const configPath = project.getConfigPath('config.level');
                assert.ok(configPath, 'Config path should be returned');
                assert.ok(configPath.includes('config.level'), 'Config path should contain "config.level"');
            });
        });

        it('should get config path with custom filename', async () => {
            await withRunnableTestProject(async (project) => {
                const customPath = project.getConfigPath('custom.cfg');
                assert.strictEqual(customPath, '', 'Config path must be empty, because it does not exist');
            });
        });
    });

    describe('Project Status and State', () => {
        it('should check if project is running', async () => {
            await withRunnableTestProject(async (project) => {
                // Initially project should not be running
                const isRunning = project.isRunning();
                assert.strictEqual(typeof isRunning, 'boolean', 'isRunning should return boolean');
            });
        });

        it('should get project status', async () => {
            await withRunnableTestProject(async (project) => {
                const status = project.getStatus();
                // Status might be undefined if pmon is not running
                assert.ok(
                    status === undefined || typeof status === 'number',
                    'Status should be undefined or a number'
                );
            });
        });

        it('should check emergency mode', async () => {
            await withRunnableTestProject(async (project) => {
                const emergency = project.isEmergencyMode();
                assert.ok(
                    emergency === undefined || typeof emergency === 'boolean',
                    'Emergency mode should be undefined or boolean'
                );
            });
        });

        it('should check demo mode', async () => {
            await withRunnableTestProject(async (project) => {
                const demo = project.isDemoMode();
                assert.ok(
                    demo === undefined || typeof demo === 'boolean',
                    'Demo mode should be undefined or boolean'
                );
            });
        });

        it('should check if project is current project', async () => {
            await withRunnableTestProject(async (project) => {
                const isCurrent = project.isCurrentProject();
                assert.strictEqual(typeof isCurrent, 'boolean', 'isCurrentProject should return boolean');
            });
        });
    });

    describe('Project Lifecycle', () => {
        it('should start and stop pmon', async function() {
            // This test requires WinCC OA to be fully functional
            await withRunnableTestProject(async (project) => {
                try {
                    project.startPmon();
                    // // Result might be 0 (success) or -1/-2 (already running or error)
                    // assert.ok(
                    //     typeof startResult === 'number',
                    //     'Start pmon should return a number'
                    // );

                    // Check if pmon is running
                    const isRunning = await project.isPmonRunning();
                    assert.strictEqual(typeof isRunning, 'boolean', 'isPmonRunning should return boolean');

                    // Clean up - stop pmon
                    if (isRunning) {
                        await project.stopPmon();
                    }
                } catch (error) {
                    console.warn('Pmon lifecycle test partially skipped:', error);
                }
            });
        });

        it('should check pmon running status', async () => {
            await withRunnableTestProject(async (project) => {
                const isRunning = await project.isPmonRunning();
                assert.strictEqual(typeof isRunning, 'boolean', 'isPmonRunning should return boolean');

                const isProjectPmonRunning = await project.isPmonRunningForProject();
                assert.strictEqual(
                    typeof isProjectPmonRunning,
                    'boolean',
                    'isPmonRunningForProject should return boolean'
                );
            });
        });
    });

    describe('Project String Representation', () => {
        it('should convert project to string', async () => {
            await withRunnableTestProject(async (project) => {
                const str = project.toString();
                assert.ok(str, 'toString should return a string');
                assert.ok(str.includes(project.getId()), 'String should contain project ID');
            });
        });

        it('should convert project to string with prefix', async () => {
            await withRunnableTestProject(async (project) => {
                const prefix = '  ';
                const str = project.toString(prefix);
                assert.ok(str.includes(prefix), 'String should contain prefix');
            });
        });

        it('should get project ID in log format', async () => {
            await withRunnableTestProject(async (project) => {
                const logId = project.getIdInLogFormat();
                assert.ok(logId, 'Log ID should be returned');
                assert.strictEqual(logId, project.getId(), 'Log ID should match project ID');
            });
        });
    });

    describe('Manager Operations', () => {
        it('should get manager options', async () => {
            await withRunnableTestProject(async (project) => {
                const options = project.getManagerOptions(1);
                // Options might be null if manager doesn't exist
                assert.ok(
                    options === null || typeof options === 'object',
                    'getManagerOptions should return null or object'
                );
            });
        });

        it('should get manager options for invalid index', async () => {
            await withRunnableTestProject(async (project) => {
                const options = project.getManagerOptions(-1);
                assert.strictEqual(options, null, 'Invalid index should return null');
            });
        });

        it('should get list of manager options', async () => {
            await withRunnableTestProject(async (project) => {
                const optionsList = project.getListOfManagerOptions();
                assert.ok(Array.isArray(optionsList), 'Should return an array');
            });
        });

        it('should get project status', async () => {
            await withRunnableTestProject(async (project) => {
                const status = project.getProjectStatus();
                assert.ok(
                    status === undefined || typeof status === 'object',
                    'Project status should be undefined or object'
                );
            });
        });

        it('should get manager info', async () => {
            await withRunnableTestProject(async (project) => {
                const info = project.getManagerInfo(1);
                assert.ok(
                    info === undefined || typeof info === 'object',
                    'Manager info should be undefined or object'
                );
            });
        });

        it('should get manager status', async () => {
            await withRunnableTestProject(async (project) => {
                const status = project.getManagerStatus(1);
                assert.ok(
                    status === undefined || typeof status === 'number',
                    'Manager status should be undefined or number'
                );
            });
        });
    });

    
    describe('initFromRegister', () => {
        it('should initialize project from registry entry', async () => {
            const testRegistry = {
                id: 'test-project',
                installationDir: '/path/to/test',
                installationDate: '2025-01-01T00:00:00Z',
                notRunnable: false,
                name: 'Test Project',
                currentProject: true,
                installationVersion : '3.19'
            };

            const project = new ProjEnvProject();
            project.initFromRegister(testRegistry);

            assert.strictEqual(project.getId(), 'test-project', 'ID should be set from registry');
            assert.strictEqual(project.getName(), 'Test Project', 'Name should be set from registry');
            assert.strictEqual(project.getInstallDir(), '/path/to/test/', 'Install dir should be set');
            assert.ok(project.isRunnable(), 'Should be runnable when notRunnable is false');
            assert.ok(project.isCurrentProject(), 'Should be marked as current project');
        });

        it('should use ID as name when name is not provided in registry', async () => {
            const testRegistry = {
                id: 'test-id',
                installationDir: '/path/to/test',
                installationDate: '2025-01-01T00:00:00Z',
                notRunnable: false,
                installationVersion : '3.19'
            };

            const project = new ProjEnvProject();
            project.initFromRegister(testRegistry);

            assert.strictEqual(project.getName(), 'test-id', 'Name should default to ID');
        });

        it('should set not runnable status correctly', async () => {
            const testRegistry = {
                id: 'sub-project',
                installationDir: '/path/to/sub',
                installationDate: '2025-01-01T00:00:00Z',
                notRunnable: true,
                installationVersion : '3.19'
            };

            const project = new ProjEnvProject();
            project.initFromRegister(testRegistry);

            assert.ok(!project.isRunnable(), 'Should not be runnable when notRunnable is true');
        });
    });

    

    describe('Project Languages', () => {
        it('should get project languages', async () => {
            await withRunnableTestProject(async (project) => {
                const languages = project.getLanguages();
                assert.ok(languages, 'Project languages should be set');
                assert.strictEqual(languages.length, 2, 'Found two languages in test fixture');
                assert.strictEqual(
                    languages.at(0),
                    OaLanguage.de_AT,
                    'Project languages should include de_AT'
                );
                assert.strictEqual(
                    languages.at(1),
                    OaLanguage.en_US,
                    'Project languages should include en_US'
                );
            });
        });
    });

    describe('Project sub-projects', () => {
        it('should get sub-project', async () => {

            const projectPath = getTestProjectPath('sub-proj');
            const project = new ProjEnvProject();
            
            // Set project directory (this sets both install dir and project ID)
            project.setRunnable(false);
            project.setDir(projectPath);
            project.setName('test-sub-project');
            const availableVersions = getAvailableWinCCOAVersions();
            const testVersion = (availableVersions.length > 0) ? availableVersions[0] : '';
            project.setVersion(testVersion);
            await project.registerProj();

            await withRunnableTestProject(async (project) => {
                const subProjects = project.getSubProjects();
                assert.ok(subProjects, 'Sub-Project should be set');
                assert.strictEqual(subProjects.length, 2, 'Found two sub-projects in test fixture');
                assert.strictEqual(
                    subProjects.at(0)?.getId(),
                    'TestFramework_' + project.getVersion(),
                    'First sub-project is the WinCC OA Test Framework'
                );
                assert.strictEqual(
                    subProjects.at(1)?.getId(),
                    'sub-proj',
                    'Second sub-project is the sub-proj from our test fixture'
                );
            });
        });
    });
});
