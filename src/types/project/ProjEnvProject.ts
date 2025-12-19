//--------------------------------------------------------------------------------

import { PmonComponent } from '../components/implementations';
import { findProjectRegistryById, reloadProjectRegistries, ProjEnvProjectRegistry } from '../project/ProjEnvProjectRegistry';
import { OaLanguage } from '../localization/OaLanguage';
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
        this.setInstallDir(registry.installationDir);
        this.setId(registry.id);
        this.setName(registry.name ?? registry.id);
        this.setRunnable(!registry.notRunnable);
        this.currentProject = registry.currentProject ?? false;
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
                this.installPath = registry.installationDir;
                this.version = this.getProjectVersion();
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
        const configPath = this.getConfigPath();

        if (configPath === '') { return undefined; }

        const cfg = new ProjEnvProjectConfig(configPath);

        return cfg.getEntryValue('proj_version');
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
            return;
        }
        this.version = version;
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
        // Store path without trailing separator - getDir() will add it
        this.installPath = dirPath.replace(/[/\\]+$/, '');
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
        if (!this.getId()) return '';
        const base = this.getInstallDir();
        if (!base) return '';
        // Add separator between base and ID, handle both forward and backslash
        return base + '/' + this.getId() + (relativeDirPath ? '/' + relativeDirPath : '');
    }

    //------------------------------------------------------------------------------
    /**
     * @brief Function returns project config path.
     * @param configFileName Name of the config file. Default: "config"
     * @return Project config path.
     */
    public getConfigPath(configFileName = 'config'): string {
        const p = this.getDir(ProjEnvProjectFileSysStruct.CONFIG_REL_PATH);
        if (!p) return '';
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
    /** Function register sub-project.
     * @synchronized Function is not thread safe.
     * @return Returns 0 when project is registered successfully, otherwise -1.
     */
    public async registerProj(): Promise<number> {
        
        // set the name in case the user forgot it
        if (!this.getName()) this.setName(this.getId());

        if (!this.isValid()) this._errorHandler.exception(this.getInvalidReason());

        const result = await this._pmon.registerProject(this.getConfigPath());
        console.log('Registration result for project', this.getId(), ':', result);
        reloadProjectRegistries();
        return result ?? -1;
    }

    //------------------------------------------------------------------------------
    /** Function un-register project.
     * The project will be un-registered only. The projects files remain unchanged.
     * @synchronized Function is not thread safe.
     * @return Returns 0 when project is un-registered successfully, otherwise -1.
     */
    public async unregisterProj(): Promise<number> {
        if (!this.getId()) this._errorHandler.exception(this.getInvalidReason());

        const result = await this._pmon.unregisterProject(this.getId());
        return result ?? -1;
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

    // Languages
    protected _languages: OaLanguage[] = [];

    protected _errorHandler: WinCCOAErrorHandler = new WinCCOAErrorHandler();

    //--------------------------------------------------------------------------------
    //@private members
    //--------------------------------------------------------------------------------
}

