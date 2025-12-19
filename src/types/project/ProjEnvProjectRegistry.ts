import * as os from 'os';
import * as fs from 'fs';

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
}

export interface ProductRegistry extends ProjEnvProjectRegistry {
    lastUsedProjectDir?: string;
    currentproject?: string;
}

let registeredProjectsCache: ProjEnvProjectRegistry[];
let registeredProducts: ProductRegistry[];
let fileWatcher: fs.FSWatcher | undefined;

export function getRegisteredProjects(): ProjEnvProjectRegistry[] {
    loadProjectRegistries();
    return registeredProjectsCache;
}

export function getRegisteredProducts(): ProductRegistry[] {
    loadProjectRegistries();
    return registeredProducts;
}

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

export function reloadProjectRegistries(): void {
    loadProjectRegistries();
}

function loadProjectRegistries(): void {
    if (registeredProjectsCache && registeredProjectsCache.length > 0) {
        return;
    }

    const configPath: string = getPvssInstConfPath();
    parseProjRegistryFile(configPath);
    
    // Set up file watcher to refresh cache when pvssInst.conf changes
    if (!fileWatcher && fs.existsSync(configPath)) {
        try {
            fileWatcher = fs.watch(configPath, (eventType) => {
                if (eventType === 'change') {
                    // Clear cache and reload on next access
                    registeredProjectsCache = [];
                    registeredProducts = [];
                }
            });
        } catch (error) {
            // Silently fail if file watching is not supported
            console.warn('Could not create file watcher for pvssInst.conf:', error);
        }
    }
}

function parseProjRegistryFile(configPath: string): void {
    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    const projects: ProjEnvProjectRegistry[] = [];
    const products: ProductRegistry[] = [];

    let currentProjectSection: ProjEnvProjectRegistry = {
        currentProject: false,
        id: '',
        installationDir: '',
        notRunnable: false,
        installationDate: '',
    };
    let currentProductRegistry: ProductRegistry = currentProjectSection;

    let inProjectSection = false;
    let inProductSection = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
            // Save previous project if complete
            if (inProjectSection) {
                projects.push(currentProjectSection);
            } else if (inProductSection) {
                products.push(currentProductRegistry);
            }

            // Extract content inside the brackets
            // Format: Software\<company>\<product>\Configs\<projectID>
            // or:     Software\<company>\<product>\<versionNumber>
            const sectionPath = trimmedLine.slice(1, -1); // Remove [ and ]
            const pathParts = sectionPath.split('\\');

            // Extract project ID or version from the last part of the path
            const projectId = pathParts[pathParts.length - 1] || '';

            // Start new project section
            inProjectSection = true;
            currentProjectSection = {
                currentProject: false,
                id: projectId,
                installationDir: '',
                notRunnable: false,
                installationDate: '',
            };
            inProductSection = false;
            currentProductRegistry = currentProjectSection;
        } else if (inProjectSection && trimmedLine.includes('=')) {
            const [key, value] = trimmedLine.split('=', 2).map((s: string) => s.trim());

            switch (key.toLowerCase()) {
                case 'installationdir':
                    currentProjectSection.installationDir = value.replace(/['"]/g, '');
                    break;
                case 'installationdate':
                    currentProjectSection.installationDate = value.replace(/['"]/g, '');
                    break;
                case 'notrunnable':
                    currentProjectSection.notRunnable =
                        value.toLowerCase() === 'true' || value === '1';
                    break;
                case 'company':
                    currentProjectSection.company = value.replace(/['"]/g, '');
                    break;
                case 'currentproject':
                    currentProductRegistry = currentProjectSection;
                    currentProductRegistry.currentproject = value.replace(/['"]/g, '');
                    inProductSection = true;
                    break;
                case 'lastusedprojectdir':
                    currentProductRegistry = currentProjectSection;
                    currentProductRegistry.lastUsedProjectDir = value.replace(/['"]/g, '');
                    inProductSection = true;
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
    if (inProjectSection) {
        projects.push(currentProjectSection);
    } else if (inProductSection) {
        products.push(currentProductRegistry);
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
