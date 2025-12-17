import path from 'path';
import { fileURLToPath } from 'url';
import { ProjEnvProject } from '../../src/types/project/ProjEnvProject';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets the absolute path to the test fixtures directory
 */
export function getFixturesPath(): string {
    return path.resolve(__dirname, '..', 'fixtures');
}

/**
 * Gets the absolute path to a test project fixture
 * @param projectName Name of the test project (e.g., 'runnable', 'sub-proj')
 */
export function getTestProjectPath(projectName: string): string {
    return path.join(getFixturesPath(), 'projects', projectName);
}

/**
 * Creates and registers a runnable WinCC OA test project
 * @returns ProjEnvProject instance for the registered test project
 * @throws Error if registration fails
 * 
 * @example
 * ```typescript
 * const project = await registerRunnableTestProject();
 * try {
 *   // Use project in tests
 *   await project.start();
 * } finally {
 *   await project.unregisterProj();
 * }
 * ```
 */
export async function registerRunnableTestProject(): Promise<ProjEnvProject> {
    const projectPath = getTestProjectPath('runnable');
    const project = new ProjEnvProject();
    
    // Set project directory (this sets both install dir and project ID)
    project.setDir(projectPath);
    project.setName('test-runnable-project');
    project.setRunnable(true);

    // Register the project with WinCC OA
    const result = await project.registerProj();
    if (result !== 0) {
        throw new Error(`Failed to register test project at ${projectPath}: error code ${result}`);
    }

    return project;
}

/**
 * Unregisters and cleans up a test project
 * @param project The project to unregister
 * @returns Promise that resolves when cleanup is complete
 */
export async function unregisterTestProject(project: ProjEnvProject): Promise<void> {
    if (!project || !project.getId()) {
        return;
    }

    try {
        // Stop the project if it's running
        if (project.isRunning()) {
            await project.stop();
        }

        // Unregister the project
        await project.unregisterProj();
    } catch (error) {
        console.warn(`Warning: Failed to clean up test project ${project.getId()}:`, error);
    }
}

/**
 * Helper to run a test with a registered project that gets automatically cleaned up
 * @param testFn Test function that receives the registered project
 * 
 * @example
 * ```typescript
 * it('should test project functionality', async () => {
 *   await withRunnableTestProject(async (project) => {
 *     await project.start();
 *     assert.ok(project.isRunning());
 *   });
 * });
 * ```
 */
export async function withRunnableTestProject(
    testFn: (project: ProjEnvProject) => Promise<void>
): Promise<void> {
    let project: ProjEnvProject | undefined;

    try {
        project = await registerRunnableTestProject();
        await testFn(project);
    } finally {
        if (project) {
            await unregisterTestProject(project);
        }
    }
}
