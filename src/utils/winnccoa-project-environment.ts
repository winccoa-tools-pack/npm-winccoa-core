import { ProjEnvProject } from '../types/project/ProjEnvProject';

/**
 * Return a list of all registered projects.
 * Placeholder implementation: returns an empty list.
 */
export async function getRegisteredProjects(): Promise<ProjEnvProject[]> {
    return [];
}

/**
 * Helpers that filter the registered projects. These are convenience
 * wrappers around `getRegisteredProjects()` and intentionally return
 * empty lists so you can implement the underlying logic later.
 */
export async function getRunningProjects(): Promise<ProjEnvProject[]> {
    return [];
}

export async function getRunnableProjects(): Promise<ProjEnvProject[]> {
    return [];
}

export async function getCurrentProjects(): Promise<ProjEnvProject[]> {
    return [];
}

export default {
    getRegisteredProjects,
    getRunningProjects,
    getRunnableProjects,
    getCurrentProjects,
};
