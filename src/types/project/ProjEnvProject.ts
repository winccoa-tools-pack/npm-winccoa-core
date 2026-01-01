//--------------------------------------------------------------------------------

import { PmonComponent } from '../components/implementations';
import { findProjectRegistryById, ProjEnvProjectRegistry } from '../project/ProjEnvProjectRegistry';
import { OaLanguage, OaLanguageFromString } from '../localization/OaLanguage';
import { tr } from '../../utils/winccoa-localization';
import fs from 'fs';
// import { getComponentName } from "../../utils/winccoa-components"
import { ProjEnvPmonProjectStatus, ProjEnvPmonStatus } from './ProjEnvPmonStatus';
import { ProjEnvProjectConfig } from './ProjEnvProjectConfig';
import {
    ProjEnvProjectRunnable,
    ProjEnvManagerState,
    ProjEnvManagerOptions,
    ProjEnvManagerStartMode,
    ProjEnvManagerInfo,
    ProjEnvProjectFileSysStruct,
    ProjEnvProjectState,
} from './ProjEnv';
import { WinCCOAErrorHandler } from '../logs/WinCCOAErrorHandler';
import path from 'path';

/**
 * @brief WinCC OA Project class for managing project lifecycle and configuration
 * @details Handles project creation, registration, startup, shutdown and management
 *          of project components and settings.
 */
export class ProjEnvProject {
    private runnable: ProjEnvProjectRunnable = ProjEnvProjectRunnable.Unknown;
    private version?: string;
    private currentProject = false;

    //------------------------------------------------------------------------------
    public initFromRegister(registry: ProjEnvProjectRegistry) {
        // console.log(
        //     '__initFromRegister__, Initializing project from registry: ', registry
        // );
        this.setInstallDir(registry.installationDir);

        if (registry.id) {
            if (this.getId() && this.getId() !== registry.id) {
                this._errorHandler.warning(
                    `Project ID mismatch during initFromRegister: expected '${this.getId()}', got '${registry.id}'. We will use '${registry.id}'.`,
                );
            }
            this._id = registry.id;
        }
        this.setName(registry.name ?? registry.id);

        if (registry.notRunnable !== undefined) this.setRunnable(!registry.notRunnable);

        this.currentProject = registry.currentProject ?? false;

        this._subProjects = [];
        this._languages = [];

        if (this.isRunnable()) {
            if (registry.installationVersion !== undefined) {
                console.log(
                    `[${new Date().toISOString()}]`,
                    this.getId() +
                        ` Setting project version from registry: ${registry.installationVersion}`,
                );
                this.setVersion(registry.installationVersion);
            }

            // try to get other project properties from config file
            const configPath = this.getConfigPath();

            if (configPath === '') {
                this._errorHandler.warning(
                    'The project config file does not exist for project ' + this.getId(),
                );
            } else {
                this._projectConfigFile.setConfigPath(configPath);

                const projectVersion = this.getProjectVersion();

                if (projectVersion && this.getVersion() && projectVersion !== this.getVersion()) {
                    this._errorHandler.warning(
                        `Project version mismatch between registry and config file for project ${this.getId()}: registry=${this.getVersion()}, config=${projectVersion}`,
                    );
                }

                // read sub-projects from config file
                // the last one proj_path entry is the project itself
                const subProjectsEntries =
                    (this._projectConfigFile.getEntryValueList('proj_path') as string[]) || [];

                // check for sub-project entries on windows paths may take a while
                // the last one is always the project itself, therefoee we skip it
                // when we have no subpojects
                if (subProjectsEntries.length > 0) {
                    subProjectsEntries.forEach((entry: string, _idx: number) => {
                        if (!entry || entry.trim().length === 0) return;

                        entry = entry.replace(/\\/g, '/').replace(/\/\//g, '/').toLowerCase();

                        if (!entry.endsWith('/')) {
                            entry += '/';
                        }

                        const myDir = this.getDir()
                            .replace(/\\/g, '/')
                            .replace(/\/\//g, '/')
                            .toLowerCase();
                        console.log(
                            `[${new Date().toISOString()}]`,
                            `Found sub-project entry in config: ${entry}, my dir is ${this.getDir()}`,
                        );
                        if (entry.toLowerCase() === myDir) {
                            console.log(
                                `[${new Date().toISOString()}]`,
                                `Skipping sub-project entry that matches self project dir`,
                            );
                            return; // skip self
                        }

                        const subProj = new ProjEnvProject();
                        subProj.setDir(entry);
                        this._subProjects.push(subProj);
                    });
                }

                // read languages from config file
                const langEntries =
                    (this._projectConfigFile.getEntryValueList('langs') as string[]) || [];
                langEntries.forEach((entry: string, _idx: number) => {
                    this._languages.push(OaLanguageFromString(entry));
                });
            }
        }
    }

    //------------------------------------------------------------------------------
    public isCurrentProject(): boolean {
        return this.currentProject;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Sets the project identifier
     * @param id Project ID (directory name containing project files)
     * @return Error code:
     *          0 = Success
     *         -1 = Invalid project ID
     *         -2 = Invalid WinCC OA version
     *         -3 = Invalid project path
     */
    public setId(id: string): void {
        if (id === undefined || id.trim().length === 0) {
            this._errorHandler.severe(tr('The project ID must not be empty!'));
            return;
        }

        if (id === this.getId()) {
            return;
        }

        this._id = id;

        if (this.runnable == ProjEnvProjectRunnable.Unknown) {
            const registry = findProjectRegistryById(id);
            if (registry) {
                this.initFromRegister(registry);
            }
        }
    }

    //------------------------------------------------------------------------------
    private format(template: string, ...args: Array<string | number>): string {
        // Replace $1, $2 ... in template with provided args
        return template.replace(/\$(\d+)/g, (_m, idx) => {
            const i = parseInt(idx, 10) - 1;
            return args[i] !== undefined ? String(args[i]) : '';
        });
    }

    /**
     * @brief Function returns project ID.
     * @return Project ID.
     * @exception Empty string.
     */
    public getId(): string {
        return this._id;
    }

    /**
     * Gets the WinCC OA version from project config file
     */
    private getProjectVersion(): string | undefined {
        return this._projectConfigFile.getEntryValue('proj_version');
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function set the project name.
     * @param name Project name.
     * @return Error code.
     * value | description
     * ------|------------
     * 0     | Success.
     * -1    | Name is not valid.
     */
    public setName(name: string): void {
        if (!name) {
            return;
        }
        this._name = name;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns project name.
     * @return Project-name.
     * @exception Empty langString.
     */
    public getName(): string {
        return this._name;
    }

    public getDisplayName(): string {
        return this._name ? this._name : this._id;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function set project version.
     * @param version Project version in format ```<major>.<minor>```
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public setVersion(version: string): void {
        if (!version) {
            throw new Error('Project version must not be empty: ' + this.getId());
        }
        this.version = version;
        this._pmon.setVersion(this.version ?? '');
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns project version.
     * @return Project version.
     * @exception Empty string.
     */
    public getVersion(): string | undefined {
        return this.version;
    }
    //------------------------------------------------------------------------------
    /**
     * @brief Function set project dir.
     */
    public setInstallDir(dirPath: string): void {
        if (!dirPath) return;
        // Store path with trailing separator
        this.installPath = dirPath;

        // unse unix style separators
        this.installPath = this.installPath.replace(/\\/g, '/').replace(/\/\//g, '/');

        if (!this.installPath.endsWith('/')) {
            this.installPath += '/';
        }

        if (!fs.existsSync(this.installPath)) {
            console.warn(
                `[${new Date().toISOString()}] Warning: Project install directory does not exist: ${this.installPath}`,
            );
        }
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns dir, where are project created.
     * @return Project installation dir.
     */
    public getInstallDir(): string | undefined {
        return this.installPath;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns project dir inclusive project self.
     * @return Project dir path.
     */
    public getDir(relativeDirPath = ''): string {
        if (!this.getId()) {
            throw new Error('Project ID is not set');
            return '';
        }
        const base = this.getInstallDir();
        if (!base) {
            throw new Error('Project install directory is not set: ' + this.getId());
            return '';
        }

        let retPath = base + this.getId() + '/' + relativeDirPath;
        // Add separator between base and ID, handle both forward and backslash
        if (!retPath.endsWith('/')) {
            retPath += '/';
        }

        return retPath;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns project config path.
     * @param configFileName Name of the config file. Default: "config"
     * @return Project config path.
     */
    public getConfigPath(configFileName = 'config'): string {
        const p = this.getDir(ProjEnvProjectFileSysStruct.CONFIG_REL_PATH);
        if (!p || !fs.existsSync(p + configFileName)) return '';
        return p + configFileName;
    }

    //------------------------------------------------------------------------------
    /** Function set project languages.
     * @param languages Project languages.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public setLanguages(languages: OaLanguage[]): void {
        this._languages = languages;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Gets configured project languages
     * @return Dynamic array of configured language codes
     */
    public getLanguages(): OaLanguage[] {
        return this._languages;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Sets whether the project is runnable
     * @details Not runnable project are typically sub-projects
     * @param runnable True if project should be runnable, false otherwise.
     */
    public setRunnable(runnable: boolean): void {
        this.runnable = runnable
            ? ProjEnvProjectRunnable.Runnable
            : ProjEnvProjectRunnable.NotRunnable;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Checks if project is configured as runnable
     * @return True if project is runnable, false otherwise
     */
    public isRunnable(): boolean {
        return this.runnable === ProjEnvProjectRunnable.Runnable;
    }

    //------------------------------------------------------------------------------
    /** @brief Function checks if project (this object) is valid.
     * @return Returns TRUE when object is valid, otherwise FALSE.
     */
    public isValid(): boolean {
        return this.getInvalidReason() === '';
    }

    //------------------------------------------------------------------------------
    /** Function returns the reason, why is this project invalid.
     * @return empty string in case the project is valid, the reason otherwise.
     */
    public getInvalidReason(): string {
        if (!this.getId()) return this.format('The project ID is empty.\n$1', this.toString('\t'));
        if (!this.getInstallDir())
            return this.format('The project install directory is empty.\n$1', this.toString('\t'));
        if (!this.getName())
            return this.format('The project name is empty.\n$1', this.toString('\t'));

        if (this.isRunnable()) {
            if (!this.getVersion())
                return this.format('The project version is empty.\n$1', this.toString('\t'));

            if (this.isRegistered()) {
                if (this.getLanguages().length === 0)
                    return this.format('The project languages are empty.\n$1', this.toString('\t'));

                let langIndex = 1;
                for (const lang of this.getLanguages()) {
                    if (lang === OaLanguage.undefined) {
                        return this.format(
                            'The project has an undefined language configured at position $1.\n$2',
                            langIndex,
                            this.toString('\t'),
                        );
                    }
                    langIndex++;
                }
            }
        }
        return '';
    }

    //---------------------------------------------------------------------------
    /** Set the project directory
     */
    public setDir(pathStr: string): void {
        this.setInstallDir(path.dirname(pathStr));
        const projId = path.basename(pathStr);
        this.setId(projId);
        this.setName(projId);
    }

    //------------------------------------------------------------------------------
    /** @brief Function checks if the project is registered.
     * @details Function does not check if the project physically exists.
     * @return Returns TRUE when project is registered, otherwise FALSE.
     */
    public isRegistered(): boolean {
        if (!this.getId()) this._errorHandler.exception(this.getInvalidReason());
        return findProjectRegistryById(this.getId()) !== undefined;
    }

    //------------------------------------------------------------------------------
    /**
     * Registers the project with the WinCC OA system.
     * The project must have a valid configuration file.
     *
     * **Retry Logic:**
     * If the first registration attempt fails, automatically retries once.
     * This handles transient failures from file system delays or temporary locks.
     *
     * @synchronized Function is not thread safe.
     * @returns 0 when project is registered successfully, -1 if config not found, -2 on failure
     */
    public async registerProj(): Promise<number> {
        // set the name in case the user forgot it
        if (!this.getName()) this.setName(this.getId());

        if (!this.isValid()) this._errorHandler.exception(this.getInvalidReason());

        const configFile = this.getConfigPath('config');

        if (!configFile) {
            this._errorHandler.severe(
                `Cannot register project ${this.getId()}: Config file ${this.getDir() + ProjEnvProjectFileSysStruct.CONFIG_REL_PATH + 'config'} not found.`,
            );
            return -1;
        }

        let result: number;

        try {
            result = await this.tryToRegister(configFile);
        } catch (error: any) {
            this._errorHandler.warning(
                `First attempt to register project ${this.getId()} failed: ${error.toString()}`,
            );
            // retry once if registration fails
            result = await this.tryToRegister(configFile);
        }

        if (result === 0) {
            const registry = findProjectRegistryById(this.getId());
            if (registry) {
                this.initFromRegister(registry);
            } else {
                this._errorHandler.warning(
                    `Project ${this.getId()} registered successfully but could not find registry entry afterwards.`,
                );
            }
        }

        return result ?? -2;
    }

    //------------------------------------------------------------------------------
    /**
     * Internal helper to register a project with the WinCC OA system.
     *
     * **Registration Process:**
     * 1. Calls pmon's registerProject command
     * 2. Polls registration status using isRegistered() with 100ms intervals
     * 3. Waits up to 5 seconds (50 attempts) for registration to complete
     * 4. Reloads project registry cache automatically via file watching
     *
     * **Async Behavior:**
     * Uses async/await to properly wait between status checks, preventing
     * busy-waiting and allowing the file system watcher to detect changes.
     *
     * @param configFile - Absolute path to the project's config file
     * @returns 0 on success, -2 on timeout or failure
     */
    private async tryToRegister(configFile: string): Promise<number> {
        const result = await this._pmon.registerProject(configFile, this.getVersion() ?? '');
        console.log(`[${new Date().toISOString()}]`, 'Register project result:', result);
        let counter: number = 0;
        while (!this.isRegistered()) {
            ++counter;
            if (counter > 50) {
                console.warn(
                    `[${new Date().toISOString()}] Registration of project '${this.getId()}' is taking longer than expected.`,
                );
                break;
            }

            console.log(
                `[${new Date().toISOString()}] Waiting for project '${this.getId()}' to be registered...`,
            );
            await sleep(100);
        }
        return result ?? -2;
    }

    //------------------------------------------------------------------------------
    /**
     * Unregisters the project from the WinCC OA system.
     * The project files remain unchanged; only the system registration is removed.
     *
     * **Retry Logic:**
     * If the first unregistration attempt fails, automatically retries once.
     * This handles transient failures from file system delays or temporary locks.
     *
     * @synchronized Function is not thread safe.
     * @returns 0 when project is unregistered successfully, -2 on failure
     */
    public async unregisterProj(): Promise<number> {
        if (!this.getId()) this._errorHandler.exception(this.getInvalidReason());

        let result: number;

        try {
            result = await this.tryToUnregister(this.getId());
        } catch (error) {
            console.warn(`First attempt to register project ${this.getId()} failed:`, error);
            // retry once if registration fails
            result = await this.tryToUnregister(this.getId());
        }

        return result ?? -2;
    }

    //------------------------------------------------------------------------------
    /**
     * Internal helper to unregister a project from the WinCC OA system.
     *
     * **Unregistration Process:**
     * 1. Calls pmon's unregisterProject command
     * 2. Polls registration status using isRegistered() with 100ms intervals
     * 3. Waits up to 0.5 seconds (5 attempts) for unregistration to complete
     * 4. Reloads project registry cache automatically via file watching
     *
     * **Async Behavior:**
     * Uses async/await to properly wait between status checks, preventing
     * busy-waiting and allowing the file system watcher to detect changes.
     *
     * @param projId - The project ID to unregister
     * @returns 0 on success, -2 on timeout or failure
     */
    private async tryToUnregister(projId: string): Promise<number> {
        const result = await this._pmon.unregisterProject(projId);
        console.log(`[${new Date().toISOString()}]`, 'Register project result:', result);
        let counter: number = 0;
        while (this.isRegistered()) {
            ++counter;
            if (counter > 5) {
                console.warn(
                    `[${new Date().toISOString()}] UN-Registration of project ${this.getId()} is taking longer than expected.`,
                );
                break;
            }

            await sleep(100);
        }
        return result ?? -2;
    }

    //------------------------------------------------------------------------------
    /** @brief Function checks if the project physically exists.
     * @details Does not check if is registered.
     * @return Returns TRUE when project is exists, otherwise FALSE.
     */
    public exists(): boolean {
        const p = this.getDir();
        return p != '' && fs.existsSync(p);
    }

    //------------------------------------------------------------------------------
    /** @brief Function convert this object to string variable.
     * @details This is helper for debugging in std log.
     * @param prefix Prefix for each new line.
     * @return Object formatted in string variable.
     */
    public toString(prefix = ''): string {
        let ret = '';
        ret = prefix + this.format('Project ID: $1\n', this.getId());
        ret += prefix + this.format('Name: $1\n', this.getName());

        const instDir = this.getInstallDir();
        if (instDir !== undefined) ret += prefix + this.format('Install directory: $1\n', instDir);
        ret += prefix + this.format('Version: $1', this.getVersion() ?? '');
        return ret;
    }

    //------------------------------------------------------------------------------
    /** @brief Function removes (physical) and un-register the project.
     *
     * @synchronized Function is not thread safe.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     * @warning Work only with locale host.
     */
    public async deleteProj(): Promise<number> {
        const dirPath = this.getDir();

        this.unregisterProj();

        fs.rmSync(dirPath, { recursive: true, force: true });
        return fs.existsSync(dirPath) ? -1 : 0;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Starts the project and waits for completion
     * @param timeOut Seconds to wait for project startup (0 = don't wait)
     * @return Error code:
     *         0  = Success
     *         -1 = Start failed
     *         -2 = Before-start hook failed
     *         -3 = After-start hook failed
     *         -4 = Wait timeout
     *         -5 = After-started hook failed
     */
    public async start(): Promise<number> {
        this._pmon.startPmonOnly(this.getName());
        const result = await this._pmon.startProject(this.getId());
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function stops the Project.
   * @param timeOut for stopping the project.
   * @details But the pmon are still on living after them. Stop only all project managers.
   *         With default parameter the function does not wait till project stopped.
             When the function is called with parameter >= 0 it waits the amount in seconds till the Project has the State Down
   *
   * @return Error code. Returns 0 when successful. Otherwise -1.
   */
    public async stop(): Promise<number> {
        const result = await this._pmon.stopProject(this.getId());
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function restarts the project.
     * @param timeOut for starting the project.
     * @details Start the project via pmon interface.
     *         Function start also pmon self, when is not running.
     *         The function does wait till project is restarted.
     *         When the function is called with *timeOut* > 0 it waits the amount in seconds till the Project has the State Monitoring again.
     *
     * @return  Error code.
     * value | description
     * ------|------------
     * 0     | Success.
     * -1    | Pmon does not accept start command. Ex. NW-problem.
     * -2    | Could not restart project within timeOut.
     * -3    | Project could not be stopped within timeOut
     */
    public async restart(): Promise<number> {
        const result = this._pmon.restartProject(this.getId());
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function kills manager at the given idx.
     * @details Index begin with 1. Pmon has idx 0 in progs file.
     *
     * @param manIdx Manager index in the pmon table.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async killManager(manIdx: number): Promise<number> {
        const result = await this._pmon.killManager(this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function start pmon for this project.
     *  @details Pmon can be started locally only.
     * @param autoStart Enable to start project self by pmon. You can deactivate it,
     *                 so is started pmon only.
     * @return Error code.
     * value | description
     * ------|------------
     * 0     | Success.
     * -1    | Cannot start pmon. See log file for more information.
     * -2    | Cannot connect to pmon.
     */
    public async startPmon(): Promise<number> {
        const result = await this._pmon.startPmonOnly(this.getId());
        return result ?? -1;
    }
    //------------------------------------------------------------------------------
    /**
     * @brief Function stop the Pmon.
     * @return Returns 0 when successful, otherwise -1.
     */
    public async stopPmon(): Promise<number> {
        const result = await this._pmon.stopProjectAndPmon(this.getId());
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function checks if pmon is running.
     * @details Checks only pmon, does not check if the pmon is running for this project.
     *         It can be used to general check, if the pmon with given host, port is
     *         running. Be sure that you have nw-connection to the remote pmon-host.
     * @return Returns TRUE when pmon is running on the host, otherwise FALSE.
     */
    public async isPmonRunning(): Promise<boolean> {
        const result = await this._pmon.getStatus(this.getId());
        return result === ProjEnvPmonStatus.Running;
    }
    //------------------------------------------------------------------------------
    /** @brief Function checks if the project has the pmon running.
     * @details Checks if the pmon is running for this specific project.
     * @return Returns TRUE when pmon for this project is running on the host, otherwise FALSE.
     */
    public async isPmonRunningForProject(): Promise<boolean> {
        const result = await this._pmon.getStatus(this.getId());
        return result === ProjEnvPmonStatus.Running;
    }
    //------------------------------------------------------------------------------
    /** @brief Function checks if is the pmon running.
     * @return Returns TRUE when pmon with 'this' project is running on the host, otherwise FALSE.
     */
    public isRunning(): boolean {
        return this.getStatus() === ProjEnvProjectState.Monitoring;
    }

    //------------------------------------------------------------------------------
    /** Returns current project status.
      @details The function returns the project status. The status is stored in the pmon table.
      @return Project status.
      @see ProjEnvProjectState.
  */
    public getStatus(): ProjEnvProjectState | undefined {
        return this.getProjectStatus()?.project?.status;
    }

    //------------------------------------------------------------------------------
    public isEmergencyMode(): boolean | undefined {
        return this.getProjectStatus()?.project?.emergency;
    }

    //------------------------------------------------------------------------------
    public isDemoMode(): boolean | undefined {
        return this.getProjectStatus()?.project?.demo;
    }

    //------------------------------------------------------------------------------
    /** @brief  Function activates a debug flag
     * @details Sends the "activate debug flag(s)" command during running time
     * @param   manIdx Manager index in the pmon table.
     * @param   dbgFlags debug parameter e.g.: -dbg 2 or -report ALL
     * @return  Returns 0 when flag was set, otherwise returns -1 or -2.
     */
    public async sendDbgFlag(manIdx: number, dbgFlags: string): Promise<number> {
        const result = await this._pmon.sendDebugFlag(dbgFlags, this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function starts manager at the given idx.
     * @details Index begin with 1. Pmon has idx 0 in progs file.
     *
     * @param manIdx Manager index in the pmon table.
     * @param timeOut Time to wait for expected manager state.
     * @param state Expected manager state.
     * @return Error code. Returns 0 when . Otherwise -1.
     */
    public async startManager(manIdx: number): Promise<number> {
        const result = await this._pmon.startManager(this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function stopped manager at the given idx.
     * @details Index begin with 1. Pmon has idx 0 in progs file.
     *
     * @param manIdx Manager index in the pmon table.
     * @param timeOut Time to wait for expected manager state.
     * @param state Expected manager state.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async stopManager(manIdx: number): Promise<number> {
        const result = await this._pmon.stopManager(this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function deletes manager at the given idx.
     * @param manIdx Manager index in the pmon table.
     *               Index begin with 1. Pmon has idx 0 in progs file.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async deleteManager(manIdx: number): Promise<number> {
        const result = await this._pmon.removeManager(this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function inserts manager at the given idx.
     * @details Index begin with 1. Pmon has index 0 in progs file.
     * @param opts Manager options.
     * @param manIdx Manager index in the pmon table.
     *               Index begin with 1. Pmon has idx 0 in progs file.
     * @return Error code. Returns -1 when failed, -2 when pmon is not reachable, otherwise returns the index of the inserted manager.
     */
    public async insertManager(opts: ProjEnvManagerOptions, manIdx = -1): Promise<number> {
        const result = await this._pmon.insertManagerAt(opts, this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function changes manager options at the given index.
     * @details Index begin with 1. Pmon has index 0 in progs file.
     * @param manIdx Manager index in the pmon table.
     *               Index begin with 1. Pmon has index 0 in progs file.
     * @param opts Manager options.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async changeManagerOptions(
        manIdx: number,
        opts: ProjEnvManagerOptions,
    ): Promise<number> {
        const result = await this._pmon.setManagerOptionsAt(opts, this.getId(), manIdx);
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** @brief Function changes manager start mode at the given index.
     * @details Index begin with 1. Pmon has index 0 in progs file.
     * @param manIdx Manager index in the pmon table.
     *               Index begin with 1. Pmon has index 0 in progs file.
     * @param startMode Start mode of the manager.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async changeManagerStartMode(
        manIdx: number,
        startMode: ProjEnvManagerStartMode,
    ): Promise<number> {
        const current = this.getManagerOptions(manIdx);
        if (!current) return -1;
        current.startMode = startMode;
        return this.changeManagerOptions(manIdx, current);
    }

    //------------------------------------------------------------------------------
    /** @brief Function changes manager start options at the given index.
     * @details Index begin with 1. Pmon has index 0 in progs file.
     * @param manIdx Manager index in the pmon table.
     *               Index begin with 1. Pmon has index 0 in progs file.
     * @param startOptions Start options of the manager.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public async changeManagerStartOptions(manIdx: number, startOptions: string): Promise<number> {
        const current = this.getManagerOptions(manIdx);
        if (!current) return -1;
        current.startOptions = startOptions;
        return this.changeManagerOptions(manIdx, current);
    }

    //------------------------------------------------------------------------------
    /** @brief Function returns manager options at the given index.
     * @details Index begin with 1. Pmon has index 0 in progs file.
     * @param idx Manager index in the pmon table.
     * @return Manager options. Returns NULL when failed.
     */
    public getManagerOptions(idx: number): ProjEnvManagerOptions | null {
        if (idx < 0) return null;
        return null;
    }

    //------------------------------------------------------------------------------
    /** @brief Function returns list of all manager options.
     * @details The function returns the list of all manager options.
     *          The list is stored in the pmon table.
     * @return List of ProjEnvManagerOptions. In case of error is empty dyn_anytype.
     */
    public getListOfManagerOptions(): any[] {
        return [];
    }

    public getProjectStatus(): ProjEnvPmonProjectStatus | undefined {
        return undefined;
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns manager info as mapping.
     * @param idx Manager index in the pmon table.
     *            Index begin with 1. Pmon has idx 0 in progs file.
     * @return Manager information ProjEnvManagerInfo. In case of error returns empty ProjEnvManagerInfo.
     */
    public getManagerInfo(idx: number): ProjEnvManagerInfo | undefined {
        return this.getProjectStatus()?.managers?.[idx];
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns manager state ProjEnvManagerState.
     * @param idx Manager index in the pmon table.
     *            Index begin with 1. Pmon has idx 0 in progs file.
     * @return Manager state. See also ProjEnvManagerState.
     */
    public getManagerStatus(idx: number): ProjEnvManagerState | undefined {
        return this.getProjectStatus()?.managers?.[idx]?.state;
    }

    //------------------------------------------------------------------------------
    /** @brief Function insert value to project config file.
     * @param value Value to insert into the config file
     * @param key Config key under which to insert the value
     * @param section Config section name (defaults to "general")
     * @param configFile Name of config file (defaults to "config")
     * @return Error code:
     *         0  = Success
     *         -1 = Failed to insert value
     */
    public insertCfgValue(
        value: unknown,
        key: string,
        section = 'general',
        configFile = 'config',
    ): number {
        const cfg = new ProjEnvProjectConfig(this.getConfigPath(configFile));
        if (cfg.insertValue(value, key, section)) return -1;
        return 0;
    }

    //------------------------------------------------------------------------------
    /** @brief Function set value to project config file.
     * @param value Value to set in the config file
     * @param key Config key to set
     * @param section Config section name (defaults to "general")
     * @param configFile Name of config file (defaults to "config")
     * @return Error code:
     *          0 = Success
     *         -1 = Failed to set value
     */
    public setCfgValue(
        value: unknown,
        key: string,
        section = 'general',
        configFile = 'config',
    ): number {
        const cfg = new ProjEnvProjectConfig(this.getConfigPath(configFile));
        if (cfg.setValue(value, key, section)) return -1;
        return 0;
    }

    //------------------------------------------------------------------------------
    /** @brief Function deletes value in project config file.
     * @param value Value to delete from config
     * @param key Config key to delete
     * @param section Config section name (defaults to "general")
     * @param configFile Name of config file (defaults to "config")
     * @return Error code:
     *          0 = Success
     *         -1 = Failed to delete value
     */
    public deleteCfgValue(
        value: unknown,
        key: string,
        section = 'general',
        configFile = 'config',
    ): number {
        const cfg = new ProjEnvProjectConfig(this.getConfigPath(configFile));
        if (cfg.deleteValue(value, key, section)) return -1;
        return 0;
    }

    //------------------------------------------------------------------------------
    /** @brief Function deletes entry in config file, used when only the key is known - but not the value. Deletes only one entry, from top to bottom
     * @param key Config key.
     * @param section Config section.
     * @param configFile Config file.
     * @return Error code. Returns 0 when successful. Otherwise -1.
     */
    public deleteCfgEntry(key: string, section = 'general', configFile = 'config'): number {
        const cfg = new ProjEnvProjectConfig(this.getConfigPath(configFile));
        if (cfg.deleteEntry(key, section)) return -1;
        return 0;
    }

    //------------------------------------------------------------------------------
    /** Returns ID formatted for logs.
     * It includes few more information, like host name, which makes the log analysis
     * for parallel (multiple nodes) executions more easy.
     */
    public getIdInLogFormat(): string {
        const logId = this.getId();
        return logId;
    }

    //---------------------------------------------------------------------------
    /** Returns default project location (directory).
     * @details The default project location is the last used project directory.
     *          If the last used project directory is not set, the default location is:
     *          - Windows: C:\WinCC_OA_Proj\
     *          - Linux: /opt/WinCC_OA_Proj/
     * @return Default project location (directory).
     */
    public getDefaultInstallDir(): string {
        // TODO use getLastUsedProjectDir() from ProjEnvProjectRegistry here
        const defaultDirectory = ''; // placeholder for paGetLastUsedProjDir()
        if (defaultDirectory) return defaultDirectory;
        // platform-specific defaults could be returned here
        return '';
    }

    //---------------------------------------------------------------------------
    /** @brief Function checks if the given file path belongs to this project.
     * @param filePath Full path to the file to check.
     * @return Returns TRUE if the file belongs to this project, otherwise FALSE.
     */
    public isProjectFile(filePath: string): boolean {
        const projDir = this.getDir();
        if (!projDir) return false;
        const normalizedProjDir = path.normalize(projDir).toLowerCase();
        const normalizedFilePath = path.normalize(filePath).toLowerCase();
        return normalizedFilePath.startsWith(normalizedProjDir);
    }

    //------------------------------------------------------------------------------
    /** @brief Function returns sub-projects of this project.
     * @details In case the project does not contains sub-projects, the function returns an empty array.
     * @return Array of sub-projects.
     */
    public getSubProjects(): ProjEnvProject[] {
        return this._subProjects;
    }

    //--------------------------------------------------------------------------------
    //@protected members
    //--------------------------------------------------------------------------------

    //------------------------------------------------------------------------------
    // general project options
    protected _id = '';
    protected _name = '';
    // The full native path to project install directory.
    protected installPath?: string;

    // Pmon object to control pmon self.
    protected _pmon: PmonComponent = new PmonComponent();

    protected _errorHandler: WinCCOAErrorHandler = new WinCCOAErrorHandler();

    //--------------------------------------------------------------------------------
    //@private members
    //--------------------------------------------------------------------------------

    // Languages
    private _languages: OaLanguage[] = [];

    // sub-projects
    private _subProjects: ProjEnvProject[] = [];

    // project config file handler
    private _projectConfigFile: ProjEnvProjectConfig = new ProjEnvProjectConfig();
}

const sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
