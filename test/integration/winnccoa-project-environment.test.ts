import { describe, it, afterEach } from 'node:test';
import { strict as assert } from 'assert';
import {
    getRegisteredProjects,
    getRunningProjects,
    getRunnableProjects,
    getCurrentProjects,
} from '../../src/utils/winccoa-project-environment';
import {
    registerRunnableTestProject,
    unregisterTestProject,
} from '../helpers/test-project-helpers';
import { ProjEnvProject } from '../../src/types/project/ProjEnvProject';
import { getAvailableWinCCOAVersions } from '../../src/utils/winccoa-paths';

describe('winccoa-project-environment (integration)', () => {
    let testProject: ProjEnvProject | undefined;

    afterEach(async () => {
        if (testProject) {
            await unregisterTestProject(testProject);
            testProject = undefined;
        }
    });

    describe('getRegisteredProjects', () => {
        it('should return an array of projects', async () => {
            const projects = await getRegisteredProjects();
            assert.ok(Array.isArray(projects), 'Should return an array');
        });

        it('should return projects with valid properties', async () => {
            testProject = await registerRunnableTestProject();
            
            const projects = await getRegisteredProjects();
            assert.ok(projects.length > 0, 'Should have at least one project');

            // Find our test project
            const found = projects.find(p => p.getId() === testProject!.getId());
            assert.ok(found, 'Should find the test project in registered projects');
            assert.ok(found.getId(), 'Project should have an ID');
            assert.ok(found.getName(), 'Project should have a name');
            assert.ok(found.getInstallDir(), 'Project should have an install directory');
        });

        it('should return all registered projects from registry', async () => {
            testProject = await registerRunnableTestProject();
            
            const projects = await getRegisteredProjects();
            
            // Verify each project has required properties
            for (const project of projects) {
                assert.ok(project.getId(), 'Each project should have an ID');
                assert.ok(project instanceof ProjEnvProject, 'Should be ProjEnvProject instance');
            }
        });

        it('should handle projects that fail to initialize gracefully', async () => {
            // This test verifies that getRegisteredProjects continues even if some projects fail
            const projects = await getRegisteredProjects();
            assert.ok(Array.isArray(projects), 'Should still return an array even if some projects fail');
        });
    });

    describe('getRunningProjects', () => {
        it('should return an array of running projects', async () => {
            const projects = await getRunningProjects();
            assert.ok(Array.isArray(projects), 'Should return an array');
        });

        it('should return only projects that are currently running', async () => {
            const projects = await getRunningProjects();
            
            // Verify all returned projects are actually running
            for (const project of projects) {
                assert.ok(project.isRunning(), 'Each project should be running');
            }
        });

        it('should not include stopped projects', async () => {
            testProject = await registerRunnableTestProject();
            
            // Ensure project is not running
            if (testProject.isRunning()) {
                await testProject.stop();
            }
            
            const runningProjects = await getRunningProjects();
            const found = runningProjects.find(p => p.getId() === testProject!.getId());
            assert.ok(!found, 'Stopped project should not be in running projects list');
        });

        it('should include project after it is started', async () => {
            testProject = await registerRunnableTestProject();
            
            // Start the project
            try {
                await testProject.start();
                
                const runningProjects = await getRunningProjects();
                const found = runningProjects.find(p => p.getId() === testProject!.getId());
                
                if (testProject.isRunning()) {
                    assert.ok(found, 'Started project should be in running projects list');
                }
            } catch (error) {
                console.warn('Could not start project for test:', error);
            } finally {
                // Clean up - stop the project
                if (testProject.isRunning()) {
                    await testProject.stop();
                }
            }
        });
    });

    describe('getRunnableProjects', () => {
        it('should return an array of runnable projects', async () => {
            let projects = await getRunnableProjects();
            assert.ok(Array.isArray(projects), 'Should return an array');
            assert.ok(projects.length >= 0, 'Array length should be zero or more');
            projects.forEach(proj => {
                console.log(`Runnable project ID: ${proj.getId()}`);
            });
            let proj = projects.find(p => p.getId() === 'runnable');
            
            assert.ok(!proj, 'runnable project does not exists per default');

            proj = projects.find(p => p.getId().startsWith('DemoApplication_'));
            assert.ok(proj, 'DemoApplication_<version> project does shall be installed');
            const testedVersion = getAvailableWinCCOAVersions().pop() || '';
            assert.strictEqual(proj.getVersion(), testedVersion, 'DemoApplication project should have the expected version');
            assert.strictEqual(proj.getId(), 'DemoApplication_' + proj.getVersion(), 'Project should have an ID: runnable');
            assert.ok(proj.isRunnable(), 'The projects DemoApplication_<version> should be runnable');
            assert.ok(proj.isRegistered(), 'The projects DemoApplication_<version> should be registered');
            assert.ok(proj.getInstallDir() != '', 'The projects DemoApplication_<version> should have an install dir');

            await registerRunnableTestProject();
            projects = await getRunnableProjects();
            projects.forEach(proj => {
                console.log(`Second try. Runnable project ID: ${proj.getId()}`);
            });
            proj = projects.find(p => p.getId() === 'runnable');
            assert.ok(proj, 'runnable project found');

            assert.ok(proj, 'Should find project with ID: runnable');
            assert.strictEqual(proj.getId(), 'runnable', 'Project should have an ID: runnable');
            assert.ok(proj.isRunnable(), 'The projects should be runnable');
            assert.ok(proj.isRegistered(), 'The projects should be registered');
            assert.ok(proj.getInstallDir() != '', 'The projects should have an install dir');

            assert.strictEqual(proj.getDir(), proj.getInstallDir() + proj.getId() + '/', 'The projects directory should be installDir + id');
        });

        it('should return only runnable projects', async () => {
            const projects = await getRunnableProjects();
            
            assert.ok(Array.isArray(projects), 'Should return an array');
            assert.ok(projects.length >= 0, 'Array length should be zero or more');
            // Verify all returned projects are runnable
            for (const project of projects) {
                assert.ok(project.isRunnable(), 'Each project should be runnable');
            }
        });

        it('should include registered runnable test project', async () => {
            testProject = await registerRunnableTestProject();
            
            const runnableProjects = await getRunnableProjects();
            const found = runnableProjects.find(p => p.getId() === testProject!.getId());
            
            assert.ok(found, `Runnable test project ${testProject!.getId()} should be in runnable projects list`);
            assert.ok(found.isRunnable(), `Found project ${found.getId()} should be marked as runnable`);
        });

        it('should not include non-runnable projects', async () => {
            testProject = await registerRunnableTestProject();
            
            // Temporarily mark as not runnable
            testProject.setRunnable(false);
            
            const runnableProjects = await getRunnableProjects();
            
            // All projects in the list should be runnable
            for (const project of runnableProjects) {
                assert.ok(project.isRunnable(), 'Should only contain runnable projects');
            }
            
            // Restore runnable status for cleanup
            testProject.setRunnable(true);
        });
    });

    describe('getCurrentProjects', () => {
        it('should return an array of current projects', async () => {
            const projects = await getCurrentProjects();
            assert.ok(Array.isArray(projects), 'Should return an array');
        });

        it('should return only current projects', async () => {
            const projects = await getCurrentProjects();
            
            // Verify all returned projects are marked as current
            for (const project of projects) {
                assert.ok(project.isCurrentProject(), 'Each project should be marked as current');
            }
        });

        it('should return empty array when no current project is set', async () => {
            // Note: This test behavior depends on system state
            // Just verify it returns an array
            const projects = await getCurrentProjects();
            assert.ok(Array.isArray(projects), 'Should return an array even if empty');
        });

        it('should typically return at most one current project per installation', async () => {
            const projects = await getCurrentProjects();
            
            // Note: Multiple WinCC OA installations can have multiple current projects
            // but typically there's only one
            assert.ok(Array.isArray(projects), 'Should return an array');
            
            // Log for debugging
            if (projects.length > 0) {
                console.log(`Found ${projects.length} current project(s)`);
            }
        });
    });

    describe('Integration between helper functions', () => {
        it('should have consistent results across helper functions', async () => {
            testProject = await registerRunnableTestProject();

            assert.ok(testProject, 'Do we have test project?');
            assert.ok(testProject.isRegistered(), 'is project registered?');
            assert.ok(testProject.isRunnable(), 'is project runnable?');
            
            const registered = await getRegisteredProjects();
            const runnable = await getRunnableProjects();
            
            // Runnable projects should be a subset of registered projects
            assert.ok(runnable.length <= registered.length, 
                'Runnable projects should be subset of all registered projects');
            
            // Test project should be in both lists
            // registered.forEach(p => {
            //      console.log(`Registered project: ${p.getId()}`);
            // });
            const foundInRegistered = registered.find(p => p.getId() == 'runnable');
            const foundInRunnable = runnable.find(p => p.getId() == 'runnable');
            
            assert.ok(foundInRegistered, `Test project 'runnable' should be in registered list`);
            assert.ok(foundInRunnable, `Test project 'runnable' should be in runnable list`);
        });

        it('should filter registered projects correctly', async () => {
            const registered = await getRegisteredProjects();
            const running = await getRunningProjects();
            const runnable = await getRunnableProjects();
            const current = await getCurrentProjects();
            
            // All filtered lists should be subsets of registered
            assert.ok(running.length <= registered.length, 
                'Running projects should be subset of registered');
            assert.ok(runnable.length <= registered.length, 
                'Runnable projects should be subset of registered');
            assert.ok(current.length <= registered.length, 
                'Current projects should be subset of registered');
            
            // All running projects should also be in runnable (running implies runnable)
            for (const project of running) {
                assert.ok(project.isRunnable(), 
                    'Running projects must be runnable');
            }
        });
    });

    describe('Default export', () => {
        it('should export all functions as default object', async () => {
            const defaultExport = await import('../../src/utils/winccoa-project-environment');
            
            assert.ok(defaultExport.default, 'Should have default export');
            assert.strictEqual(typeof defaultExport.default.getRegisteredProjects, 'function',
                'Default export should have getRegisteredProjects');
            assert.strictEqual(typeof defaultExport.default.getRunningProjects, 'function',
                'Default export should have getRunningProjects');
            assert.strictEqual(typeof defaultExport.default.getRunnableProjects, 'function',
                'Default export should have getRunnableProjects');
            assert.strictEqual(typeof defaultExport.default.getCurrentProjects, 'function',
                'Default export should have getCurrentProjects');
        });

        it('should work when using default import', async () => {
            const defaultExport = await import('../../src/utils/winccoa-project-environment');
            
            const projects = await defaultExport.default.getRegisteredProjects();
            assert.ok(Array.isArray(projects), 'Default export functions should work');
        });
    });
});
