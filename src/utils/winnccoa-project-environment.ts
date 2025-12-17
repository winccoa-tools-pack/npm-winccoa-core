import { ProjEnvProject } from '../types/project/ProjEnvProject';
import { getRegisteredProjects as getRegistries } from '../types/project/ProjEnvProjectRegistry';

/**
 * Return a list of all registered projects.
 * Creates ProjEnvProject instances from the Windows registry entries.
 */
export async function getRegisteredProjects(): Promise<ProjEnvProject[]> {
    const registries = getRegistries();
    const projects: ProjEnvProject[] = [];

    for (const registry of registries) {
        try {
            const project = new ProjEnvProject();
            project.initFromRegister(registry);
            projects.push(project);
        } catch (error) {
            // Skip projects that fail to initialize
            console.warn(`Failed to initialize project ${registry.id}:`, error);
        }
    }

    return projects;
}

/**Returns all running projects locate on the locale host
 */
export async function getRunningProjects(): Promise<ProjEnvProject[]> {
    return (await getRegisteredProjects()).filter(project => project.isRunning());
}

/**Returns all runnable projects locate on the locale host*/
export async function getRunnableProjects(): Promise<ProjEnvProject[]> {
    return (await getRegisteredProjects()).filter(project => project.isRunnable());
}

/**Returns all current projects locate on the locale host.
 * A current project is the one that is currently active in WinCC OA.
 * Note: per WinCC OA, there can be only one current project at a time.
 * However, this function returns an array because you can have multiple WinCC OA installations
*/
export async function getCurrentProjects(): Promise<ProjEnvProject[]> {
    return (await getRegisteredProjects()).filter(project => project.isCurrentProject());
}

/** Export default object with all functions */
export default {
    getRegisteredProjects,
    getRunningProjects,
    getRunnableProjects,
    getCurrentProjects,
};
