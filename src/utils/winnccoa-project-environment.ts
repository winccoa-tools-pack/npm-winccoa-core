import path from 'path';
import { ProjEnvProject } from '../types/project/ProjEnvProject';
import { getRegisteredProjects as getRegistries } from '../types/project/ProjEnvProjectRegistry';

/**
 * Finds and returns the ProjEnvProject instance for a given file or folder path
 * by checking all registered projects.
 * @param selectedPath - The file or folder path to check
 * @returns ProjEnvProject instance if found, undefined otherwise
 */
export async function findProjectForFile(
    selectedPath: string,
): Promise<ProjEnvProject | undefined> {
    return (await getRegisteredProjects()).find((project: ProjEnvProject) => {
        return project.isProjectFile(selectedPath);
    });
}

/**
 * Return a list of all registered projects.
 * Creates ProjEnvProject instances from the Windows registry entries.
 */
export async function getRegisteredProjects(): Promise<ProjEnvProject[]> {
    const registries = getRegistries();
    const projects: ProjEnvProject[] = [];

    console.log(`Found ${registries.length} registered projects in the registry.`);

    for (const registry of registries) {
        //  console.log(`Processing registry entry for project ID: ${registry.id}`);
        // Skip registry entries with empty or invalid IDs
        if (!registry.id || registry.id.trim().length === 0) {
            console.warn(`Skipping registry entry with empty ID`);
            continue;
        }

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
    return (await getRegisteredProjects()).filter((project) => project.isRunning());
}

/**Returns all runnable projects locate on the locale host*/
export async function getRunnableProjects(): Promise<ProjEnvProject[]> {
    return (await getRegisteredProjects()).filter((project) => project.isRunnable());
}

/**Returns all current projects locate on the locale host.
 * A current project is the one that is currently active in WinCC OA.
 * Note: per WinCC OA, there can be only one current project at a time.
 * However, this function returns an array because you can have multiple WinCC OA installations
 */
export async function getCurrentProjects(): Promise<ProjEnvProject[]> {
    return (await getRegisteredProjects()).filter((project) => project.isCurrentProject());
}

/**
 * Find the WinCC OA project path for a given file or folder path
 * Checks all registered projects and returns the project path that contains the given path
 * @param selectedPath - The path to check (file or folder)
 * @returns The project installation directory, or null if not found
 */
export function findProjectPathForFile(selectedPath: string): string | null {
    const allProjects = getProjects();

    // Normalize the selected path for comparison
    const normalizedPath = path.normalize(selectedPath).toLowerCase();

    // Find the project whose installation directory is a parent of the selected path
    // Sort by path length descending to find the most specific (deepest) match first
    const matchingProject = allProjects
        .filter((project) => {
            const projectPath = path.normalize(project.installationDir).toLowerCase();
            return normalizedPath.startsWith(projectPath);
        })
        .sort((a, b) => b.installationDir.length - a.installationDir.length)[0];

    return matchingProject ? matchingProject.installationDir : null;
}

/** Export default object with all functions */
export default {
    getRegisteredProjects,
    getRunningProjects,
    getRunnableProjects,
    getCurrentProjects,
};
