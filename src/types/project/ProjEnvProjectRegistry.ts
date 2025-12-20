import * as os from 'os';
import * as fs from 'fs';
import path from 'path';

/**
 * Represents the basic configuration information for a WinCC OA project
 * as stored in the PVSS configuration files and Windows registry.
 */
export interface ProjEnvProjectRegistry {
    /** The project ID */
    id: string;

    /** Absolute path to the project installation directory */
    installationDir: string;

    /** ISO 8601 date string when the project was installed/created */
    installationDate: string;

    /** Whether this project is runnable (has proper configuration) */
    notRunnable: boolean;

    /** Optional company/organization that created the project */
    company?: string;

    /** Optional the display name of the project */
    name?: string;

    /** Optional the project description */
    description?: string;

    /** Whether this is the currently active project in WinCC OA */
    currentProject?: boolean;

    installationVersion?: string;
}

export interface ProductRegistry extends ProjEnvProjectRegistry {
    lastUsedProjectDir?: string;
    currentproject?: string;
}

/**
 * Cache for registered projects loaded from pvssInst.conf.
 * Automatically refreshed when the configuration file changes.
 */
let registeredProjectsCache: ProjEnvProjectRegistry[];

/**
 * Cache for registered products (WinCC OA installations) loaded from pvssInst.conf.
 * Automatically refreshed when the configuration file changes.
 */
let registeredProducts: ProductRegistry[];

/**
 * File system watcher for pvssInst.conf.
 * Monitors changes to the configuration file and triggers cache refresh.
 */
let fileWatcher: fs.FSWatcher | undefined;

/**
 * Debounce timeout handle for file change events.
 * Prevents multiple rapid reloads by waiting 500ms after the last change.
 */
let reloadTimeout: NodeJS.Timeout | undefined;

/**
 * Retrieves all registered WinCC OA projects from the system configuration.
 * Loads from pvssInst.conf on first call and caches the results.
 * The cache is automatically refreshed when the configuration file changes.
 *
 * @returns Array of all registered project configurations
 */
export function getRegisteredProjects(): ProjEnvProjectRegistry[] {
    loadProjectRegistries();
    return registeredProjectsCache;
}

/**
 * Retrieves all registered WinCC OA product installations (versions) from the system.
 * Loads from pvssInst.conf on first call and caches the results.
 * The cache is automatically refreshed when the configuration file changes.
 *
 * @returns Array of all registered product (version) configurations
 */
export function getRegisteredProducts(): ProductRegistry[] {
    loadProjectRegistries();
    return registeredProducts;
}

/**
 * Finds a registered project by its unique identifier.
 *
 * @param id - The project ID to search for
 * @returns Project registry entry if found, undefined otherwise
 */
export function findProjectRegistryById(id: string): ProjEnvProjectRegistry | undefined {
    return getRegisteredProjects().find((projRegistry) => projRegistry.id === id);
}

export function getProductByVersion(version: string): ProductRegistry | undefined {
    loadProjectRegistries();
    return registeredProducts.find((product) => product.id === version);
}

export function getLastUsedProjectDir(version: string): string | undefined {
    loadProjectRegistries();
    return getProductByVersion(version)?.lastUsedProjectDir;
}

/**
 * Forces an immediate reload of project registries from pvssInst.conf.
 * Useful when you need to ensure the cache is up-to-date.
 * Note: File watching with automatic reload is already active, so this
 * is typically only needed for manual refresh scenarios.
 */
export function reloadProjectRegistries(): void {
    loadProjectRegistries();
}

/**
 * Internal function that loads project registries from pvssInst.conf and sets up file watching.
 *
 * **File Watching Behavior:**
 * - Sets up a file system watcher on first call to monitor pvssInst.conf
 * - Uses debouncing (500ms) to handle rapid successive file changes
 * - Prevents premature reads of incomplete file writes
 * - Automatically updates cache when changes are detected
 *
 * **Debouncing Strategy:**
 * Multiple file change events within 500ms are collapsed into a single reload.
 * This ensures the file is fully written and prevents performance issues from
 * excessive parsing during bulk operations.
 *
 * The watcher remains active for the lifetime of the process.
 */
function loadProjectRegistries(): void {
    if (fileWatcher) {
        return;
    }

    const configPath: string = getPvssInstConfPath();
    parseProjRegistryFile(configPath);

    // Set up file watcher to refresh cache when pvssInst.conf changes
    if (!fileWatcher && fs.existsSync(configPath)) {
        try {
            console.log(
                `[${new Date().toISOString()}] Setting up file watcher for pvssInst.conf:`,
                configPath,
            );
            fileWatcher = fs.watch(configPath, (eventType) => {
                if (eventType === 'change') {
                    // Debounce file changes - wait 500ms after last change before reloading
                    if (reloadTimeout) {
                        clearTimeout(reloadTimeout);
                    }
                    console.log(
                        `[${new Date().toISOString()}] pvssInst.conf change detected, scheduling reload in 500ms`,
                    );
                    reloadTimeout = setTimeout(() => {
                        console.log(
                            `[${new Date().toISOString()}] pvssInst.conf changed, reloading project registries`,
                        );
                        reloadTimeout = undefined;
                        console.log(
                            `[${new Date().toISOString()}] Reloading project registries. Current cache size: ${registeredProjectsCache.length}`,
                        );
                        parseProjRegistryFile(configPath);
                        console.log(
                            `[${new Date().toISOString()}] Project registries reloaded. Current cache size: ${registeredProjectsCache.length}`,
                        );
                    }, 500);
                }
            });
        } catch (error) {
            // Silently fail if file watching is not supported
            console.warn(
                `[${new Date().toISOString()}] Could not create file watcher for pvssInst.conf:`,
                error,
            );
        }
    }
}

function parseProjRegistryFile(configPath: string): void {
    console.log(`[${new Date().toISOString()}] Loading project registries from ${configPath}`);

    if (!fs.existsSync(configPath)) {
        throw new Error(
            `The WinCC OA is probably not installed. The pvssInst.conf file not found at path: ${configPath}`,
        );
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    const projects: ProjEnvProjectRegistry[] = [];
    const products: ProductRegistry[] = [];

    let currentProjectSection: ProjEnvProjectRegistry = {
        currentProject: false,
        id: '',
        installationDir: '',
        notRunnable: true,
        installationDate: '',
        installationVersion: undefined,
    };

    let lastUsedProjectDir: string = '';
    let currentproject: string = '';
    let inProductSection = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
            // Save previous project if complete
            if (inProductSection) {
                const currentProductRegistry: ProductRegistry = currentProjectSection;
                currentProductRegistry.lastUsedProjectDir = lastUsedProjectDir;
                currentProductRegistry.currentproject = currentproject;
                currentProductRegistry.notRunnable = true;
                inProductSection = false;
                products.push(currentProductRegistry);
            } else if (currentProjectSection.id != '') {
                projects.push(currentProjectSection);
            }

            // Extract content inside the brackets
            // Format: Software\<company>\<product>\Configs\<projectID>
            // or:     Software\<company>\<product>\<versionNumber>
            const sectionPath = trimmedLine.slice(1, -1); // Remove [ and ]
            const pathParts = sectionPath.split('\\');

            // Extract project ID or version from the last part of the path
            const projectId = pathParts[pathParts.length - 1] || '';

            // Start new project section
            currentProjectSection = {
                currentProject: false,
                id: projectId,
                installationDir: '',
                notRunnable: true,
                installationDate: '',
            };

            lastUsedProjectDir = '';
            currentproject = '';
        } else if (trimmedLine.includes('=')) {
            const [key, value] = trimmedLine.split('=', 2).map((s: string) => s.trim());

            switch (key.toLowerCase()) {
                case 'firstPAStart':
                    inProductSection = true;
                    break;
                case 'currentproject':
                    currentproject = value.replace(/['"]/g, '');
                    inProductSection = true;
                    break;
                case 'lastusedprojectdir':
                    lastUsedProjectDir = value.replace(/['"]/g, '');
                    inProductSection = true;
                    break;
                case 'installationdir':
                    {
                        const entryValue = value.replace(/['"]/g, '');
                        const idFromPath = path.basename(entryValue);

                        if (idFromPath && idFromPath !== currentProjectSection.id) {
                            throw new Error(
                                `Project ID mismatch in registry entry. Expected: ${currentProjectSection.id}, Found in path: ${idFromPath}`,
                            );
                        }

                        currentProjectSection.installationDir = path.dirname(entryValue);
                    }
                    break;
                case 'installationdate':
                    currentProjectSection.installationDate = value.replace(/['"]/g, '');
                    break;
                case 'installationversion':
                    currentProjectSection.installationVersion = value.replace(/['"]/g, '');
                    break;
                case 'notrunnable':
                    currentProjectSection.notRunnable =
                        value.toLowerCase() === 'true' || value === '1';
                    break;
                case 'company':
                    currentProjectSection.company = value.replace(/['"]/g, '');
                    break;
                case 'name':
                    currentProjectSection.name = value.replace(/['"]/g, '');
                    break;
                case 'description':
                    currentProjectSection.description = value.replace(/['"]/g, '');
                    break;
            }
        }
    }

    // Don't forget the last project
    if (inProductSection) {
        const currentProductRegistry: ProductRegistry = currentProjectSection;
        currentProductRegistry.lastUsedProjectDir = lastUsedProjectDir;
        currentProductRegistry.currentproject = currentproject;
        currentProductRegistry.notRunnable = true;
        products.push(currentProductRegistry);
    } else if (currentProjectSection.id != '') {
        projects.push(currentProjectSection);
    }

    registeredProjectsCache = projects;
    registeredProducts = products;
}

/**
 * Gets the platform-specific path to the pvssInst.conf file
 * @returns The full path to the pvssInst.conf file
 */
function getPvssInstConfPath(): string {
    if (os.platform() === 'win32') {
        // Windows path
        return 'C:\\ProgramData\\Siemens\\WinCC_OA\\pvssInst.conf';
    } else {
        // Unix/Linux path
        return '/etc/opt/pvss/pvssInst.conf';
    }
}
