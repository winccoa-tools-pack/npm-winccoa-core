import { WinCCOAComponent } from '../WinCCOAComponent.js';
import { ProjEnvPmonStatus } from '../../project/ProjEnvPmonStatus.js';
import {
    ProjEnvManagerOptions,
    ProjEnvManagerStartMode,
    ProjEnvManagerState,
    ProjEnvProjectState,
} from '../../project/ProjEnv.js';
import type { ProjEnvManagerInfo } from '../../project/ProjEnv.js';
import { ProjEnvPmonProjectStatus } from '../../project/ProjEnvPmonStatus.js';

export class PmonComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCILpmon';
    }

    public getDescription(): string {
        return 'Process Monitor';
    }

    /**
     * Registers a sub-project using pmon's -regsubf option
     * @param projectPath - Path to the sub-project directory
     * @returns Promise that resolves when registration is complete
     */
    public async registerSubProject(projectPath: string): Promise<number> {
        const args = ['-regsubf', '-proj', projectPath, '-log', '+stderr'];
        const code =  super.start(args);

        
        sleep(2000); // wait a second to let the registry update

        return code;
    }

    /**
     * Unregisters a project using pmon's -unreg option
     * @param projectName - Name of the project to unregister
     * @param outputCallback - Optional callback for output logging
     * @returns Promise that resolves when unregistration is complete
     */
    public async unregisterProject(projectName: string): Promise<number> {
        // Use -unreg option to unregister project
        const args = ['-unreg', projectName, '-log', '+stderr'];
        const code =  super.start(args);

        return code;
    }

    /**
     * Registers a runnable project using pmon's -config -autofreg -status options
     * @param configPath - Path to the project config file
     * @param outputCallback - Optional callback for output logging
     * @returns Promise that resolves when registration is complete with exit code
     */
    public async registerProject(configPath: string, projectVersion: string): Promise<number> {

        if (configPath === undefined || configPath === '') {
            throw new Error('Config path is not set for PmonComponent');
        }
        // Use -config -autofreg -status options to register runnable project
        const args = ['-config', configPath, '-log', '+stderr', '-autofreg', '-status'];
        const code = super.start(args, { version: projectVersion });
    
        // the pmon returns 3 if the project is not running after registrations

        const state = this.pmonStateCodeToStatus(await code);

        return (state !== ProjEnvPmonStatus.Unknown) ? 0 : -1;
    }

    /**
     * Get pmon status. It check if the pmon is running or not
     */
    public async getStatus(projectName: string): Promise<ProjEnvPmonStatus> {
        /*
         -status  ... returns status of pmon:
          0=pmon is running, 3=pmon is stopped, 4=unknown
        */
        const args = ['-status', '-proj', projectName, '-log', '+stdout'];
        const code = super.start(args);

        return this.pmonStateCodeToStatus(await code);
    }

    private pmonStateCodeToStatus(code: number): ProjEnvPmonStatus {
        console.log('Pmon status code:', code);
        let status: ProjEnvPmonStatus = ProjEnvPmonStatus.Unknown;

        if (code === 0) status = ProjEnvPmonStatus.Running;
        else if (code === 3) status = ProjEnvPmonStatus.NotRunning;
        else status = ProjEnvPmonStatus.Unknown;

        return status;
    }
    

    /**
     * Starts pmon only (without auto-starting managers)
     */
    public async startPmonOnly(projectName: string): Promise<number> {
        const args = ['-proj', projectName, '-noAutostart'];

        return super.start(args, { detached: true, waitForLog: 'WAIT_MODE' });
    }

    /**
     * Starts a project with all managers
     */
    public async startProject(projectName: string, startAll: boolean = true): Promise<number> {
        let args: string[] = ['-proj', projectName];

        if (startAll) {
            args = args.concat(['-command', 'START_ALL:']);
            // INFO, 9/pmon, Das Projekt wurde gestartet und läuft. Gehe in den Überwachungsmodus
            return super.start(args, { waitForLog: '9/pmon' });
        } else {
            // starting pmon only without extra arguments means, it will start the project too.
            // that means the pmon process will never end (hopefully, otherwise it crashed), so we need to detach
            return super.start(args, { detached: true, waitForLog: 'WAIT_MODE' });
        }
    }

    /**
     * Stops all managers in a project
     */
    public async stopProject(projectName: string): Promise<number> {
        const args = ['-proj', projectName, '-command', 'STOP_ALL:'];
        // INFO, 13/pmon, Projekt wurde komplett gestoppt - warte auf Befehle
        return super.start(args, { waitForLog: '13/pmon' });
    }

    /**
     * Stops all managers and exits pmon
     */
    public async stopProjectAndPmon(projectName: string): Promise<number> {
        const args = ['-proj', projectName, '-stopWait'];
        return super.start(args);
    }

    /**
     * Restarts all managers in a project
     */
    public async restartProject(projectName: string): Promise<number> {
        const args = ['-proj', projectName, '-command', 'RESTART_ALL:'];
        return super.start(args);
    }

    /**
     * Sets pmon wait mode
     */
    public async setWaitMode(projectName: string): Promise<number> {
        const args = ['-proj', projectName, '-command', 'WAIT_MODE:'];
        return super.start(args);
    }

    /**
     * Starts a specific manager by index
     */
    public async startManager(projectName: string, managerIndex: number): Promise<number> {
        const args = [
            '-proj',
            projectName,
            '-command',
            'SINGLE_MGR:START',
            managerIndex.toString(),
        ];
        return super.start(args);
    }

    /**
     * Stops a specific manager by index
     */
    public async stopManager(projectName: string, managerIndex: number): Promise<number> {
        const args = ['-proj', projectName, '-command', 'SINGLE_MGR:STOP', managerIndex.toString()];
        return super.start(args);
    }

    /**
     * Kills a specific manager by index
     */
    public async killManager(projectName: string, managerIndex: number): Promise<number> {
        const args = ['-proj', projectName, '-command', 'SINGLE_MGR:KILL', managerIndex.toString()];
        return super.start(args);
    }

    /**
     * Removes a specific manager by index
     */
    public async removeManager(projectName: string, managerIndex: number): Promise<number> {
        const args = ['-proj', projectName, '-command', 'SINGLE_MGR:DEL', managerIndex.toString()];
        return super.start(args);
    }

    /**
     * Gets the list of managers in a project
     */
    public async getManagerOptionsList(projectName: string): Promise<ProjEnvManagerOptions[]> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            throw new Error('WCCILpmon executable not found');
        }

        const args = ['-proj', projectName, '-command', 'MGRLIST:LIST', '-log', '+stdout'];
        const callPath = pmonPath ?? '';
        const lines = await (this as any).execAndCollectLines(callPath, args);
        const parsed = this.parseManagerList(lines.join('\n'));
        return parsed;
    }

    /**
     * Convenience accessor for manager option (from MGRLIST:LIST) by index.
     * If `projectName` is provided, it will refresh the options list first.
     * If omitted, it returns the manager from last fetched list if available.
     * 
     * TODO use command `>WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:PROP_GET 2
once 30 3 1 -m gedi -n -num 5` to get the properties. It shall be mu more faster, then query the whole list
     */
    public async getManagerOptionsAt(
        index: number,
        projectName?: string,
    ): Promise<ProjEnvManagerOptions | undefined> {
        if (typeof index !== 'number' || index < 0) return undefined;

        if (projectName) {
            const list = await this.getManagerOptionsList(projectName);
            return list[index];
        }

        return undefined;
    }

    public async setManagerOptionsAt(
        options: ProjEnvManagerOptions,
        projectName: string,
        managerIndex: number,
    ): Promise<number> {
        const args = [
            '-proj',
            projectName,
            '-command',
            'SINGLE_MGR:PROP_PUT',
            managerIndex.toString(),
            options.startMode.toString(),
            options.secondToKill.toString(),
            options.resetStartCounter.toString(),
            options.restart.toString(),
            options.startOptions,
        ];
        return super.start(args);
    }

    public async insertManagerAt(
        options: ProjEnvManagerOptions,
        projectName: string,
        managerIndex: number,
    ): Promise<number> {
        const args = [
            '-proj',
            projectName,
            '-command',
            'SINGLE_MGR:INS',
            managerIndex.toString(),
            options.component,
            options.startMode.toString(),
            options.secondToKill.toString(),
            options.resetStartCounter.toString(),
            options.restart.toString(),
            options.startOptions,
        ];
        return super.start(args);
    }

    public async sendDebugFlag(
        flag: string,
        projectName: string,
        managerIndex: number,
    ): Promise<number> {
        const args = [
            '-proj',
            projectName,
            '-command',
            'SINGLE_MGR:DEBUG',
            managerIndex.toString(),
            flag,
        ];
        return super.start(args);
    }

    /**
     * Gets detailed project and manager status (MGRLIST:STATI) and returns typed managers and optional project state
     */

    public async getProjectStatus(projectName: string): Promise<ProjEnvPmonProjectStatus> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            throw new Error(errorMsg);
        }

        const args = ['-proj', projectName, '-command', 'MGRLIST:STATI', '-log', '+stdout'];
        const callPath = pmonPath ?? '';
        const lines = await (this as any).execAndCollectLines(callPath, args);
        const raw = lines.join('\n');
        const parsed = this.parseManagerStatus(raw);
        return parsed;
    }

    /**
     * Convenience method to get a single manager status by index.
     * If `projectName` is provided, it will refresh the list first.
     * If omitted, it returns the manager from last fetched list if available.
     */
    public async getManagerStatusAt(
        index: number,
        projectName?: string,
    ): Promise<ProjEnvManagerInfo | undefined> {
        if (typeof index !== 'number' || index < 0) return undefined;

        if (projectName) {
            const res = await this.getProjectStatus(projectName);
            return res.managers[index];
        }

        // No cached data and no project specified
        return undefined;
    }

    // Private parser for manager list output
    private parseManagerList(output: string): ProjEnvManagerOptions[] {
        const lines = output
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0 && l !== ';');
        if (lines.length === 0) return [];
        if (/^LIST:\d+/i.test(lines[0])) lines.shift();

        const result: ProjEnvManagerOptions[] = [];
        for (const line of lines) {
            const parts = line.split(';');
            if (parts.length < 1) continue;

            if (parts.length < 6) {
                throw new Error(`The line '${line}' has incorrect format`);
            }

            const name = parts[0];
            const startModeNum = Number(parts[1]);
            const seckill = Number(parts[2]);
            const restartCount = Number(parts[3]);
            const resetMin = Number(parts[4]);
            const args = parts.slice(5).filter(Boolean).join(';');

            let startModeEnum: ProjEnvManagerStartMode;
            switch (startModeNum) {
                case 0:
                    startModeEnum = ProjEnvManagerStartMode.Manual;
                    break;
                case 1:
                    startModeEnum = ProjEnvManagerStartMode.Once;
                    break;
                case 2:
                    startModeEnum = ProjEnvManagerStartMode.Always;
                    break;
                default:
                    throw new Error(
                        `The line '${line}' contains invalid start mode. Expected 0,1,2 becames ${startModeNum}`,
                    );
            }

            result.push({
                component: name,
                startMode: startModeEnum,
                secondToKill: seckill,
                restart: restartCount,
                resetStartCounter: resetMin,
                startOptions: args,
            });
        }
        return result;
    }

    // Parse project state line from STATI output
    private parseProjectState(line: string): {
        status: ProjEnvProjectState;
        statusCode: number;
        text: string;
        emergency: boolean;
        demo: boolean;
    } | null {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
            const statusCode = parseInt(parts[0], 10);
            const text = parts[1];
            const emergency = parseInt(parts[2], 10) === 1;
            const demo = parseInt(parts[3], 10) === 1;

            let status: ProjEnvProjectState = ProjEnvProjectState.Unknown;
            switch (statusCode) {
                case -1:
                    status = ProjEnvProjectState.Unknown;
                    break;
                case 0:
                    status = ProjEnvProjectState.Down;
                    break;
                case 1:
                    status = ProjEnvProjectState.Starting;
                    break;
                case 2:
                    status = ProjEnvProjectState.Monitoring;
                    break;
                case 3:
                    status = ProjEnvProjectState.Stopping;
                    break;
                case 5:
                    status = ProjEnvProjectState.Restarting;
                    break;
                default:
                    status = ProjEnvProjectState.Unknown;
                    break;
            }

            return { status, statusCode, text, emergency, demo };
        }

        return null;
    }

    // Parse STATI output into typed managers and project state
    private parseManagerStatus(output: string): ProjEnvPmonProjectStatus {
        const managers: ProjEnvManagerInfo[] = [];
        const lines = output.split('\n');

        let listStarted = false;
        let projectState:
            | {
                  status: ProjEnvProjectState;
                  statusCode: number;
                  text: string;
                  emergency: boolean;
                  demo: boolean;
              }
            | undefined = undefined;
        let projectStateLineFound = false;

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();

            if (trimmed.startsWith('STATI:') || trimmed.startsWith('LIST:')) {
                listStarted = true;
                continue;
            }

            if (trimmed === ';') {
                break;
            }

            if (!listStarted || !trimmed) continue;

            // Look ahead to detect project state line (line before ';')
            let isProjectStateLine = false;
            for (let j = i + 1; j < lines.length; j++) {
                const nextTrimmed = lines[j].trim();
                if (nextTrimmed === ';') {
                    isProjectStateLine = true;
                    break;
                } else if (nextTrimmed !== '') break;
            }

            if (isProjectStateLine && !projectStateLineFound) {
                const parsed = this.parseProjectState(trimmed);
                if (parsed) projectState = parsed;
                projectStateLineFound = true;
                continue;
            }

            const parts = trimmed.split(';');
            if (parts.length >= 5) {
                const runningStateNum = parseInt(parts[0].trim(), 10);
                const pid = parseInt(parts[1].trim(), 10);
                const startModeNum = parseInt(parts[2].trim(), 10);
                const startTimeStamp = parts[3].trim();
                const managerNumber = parseInt(parts[4].trim(), 10);

                let runningStateEnum: ProjEnvManagerState;
                switch (runningStateNum) {
                    case 0:
                        runningStateEnum = ProjEnvManagerState.NotRunning;
                        break;
                    case 1:
                        runningStateEnum = ProjEnvManagerState.Init;
                        break;
                    case 2:
                        runningStateEnum = ProjEnvManagerState.Running;
                        break;
                    case 3:
                        runningStateEnum = ProjEnvManagerState.Blocked;
                        break;
                    default:
                        runningStateEnum = ProjEnvManagerState.NotRunning;
                        break;
                }

                let startModeEnum: ProjEnvManagerStartMode;
                switch (startModeNum) {
                    case 0:
                        startModeEnum = ProjEnvManagerStartMode.Manual;
                        break;
                    case 1:
                        startModeEnum = ProjEnvManagerStartMode.Once;
                        break;
                    case 2:
                        startModeEnum = ProjEnvManagerStartMode.Always;
                        break;
                    default:
                        startModeEnum = ProjEnvManagerStartMode.Manual;
                        break;
                }

                let parsedTimestamp: Date | undefined;
                if (
                    startTimeStamp &&
                    startTimeStamp !== '0' &&
                    startTimeStamp !== '' &&
                    startTimeStamp !== '-1' &&
                    !startTimeStamp.startsWith('1970')
                ) {
                    try {
                        const winccOaMatch = startTimeStamp.match(
                            /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
                        );
                        if (winccOaMatch) {
                            const [, year, month, day, hours, minutes, seconds, milliseconds] =
                                winccOaMatch;
                            parsedTimestamp = new Date(
                                parseInt(year, 10),
                                parseInt(month, 10) - 1,
                                parseInt(day, 10),
                                parseInt(hours, 10),
                                parseInt(minutes, 10),
                                parseInt(seconds, 10),
                                parseInt(milliseconds, 10),
                            );
                        }
                    } catch {
                        parsedTimestamp = undefined;
                    }
                }

                // Build object with new typed fields and include legacy field names for compatibility
                const managerObj: any = {
                    state: runningStateEnum,
                    pid: pid === -1 ? undefined : pid,
                    startMode: startModeEnum,
                    startTime: parsedTimestamp,
                    managerNumber,
                };

                // Legacy compatibility fields used by older consumers/tests
                managerObj.runningState =
                    runningStateEnum === ProjEnvManagerState.Running
                        ? 'running'
                        : runningStateEnum === ProjEnvManagerState.Init
                          ? 'init'
                          : runningStateEnum === ProjEnvManagerState.Blocked
                            ? 'blocked'
                            : 'stopped';
                managerObj.startTimeStamp = parsedTimestamp;
                managerObj.startMode =
                    startModeEnum === ProjEnvManagerStartMode.Always
                        ? 'always'
                        : startModeEnum === ProjEnvManagerStartMode.Once
                          ? 'once'
                          : startModeEnum === ProjEnvManagerStartMode.Manual
                            ? 'manual'
                            : 'unknown';

                managers.push(managerObj);
            }
        }

        const state: ProjEnvPmonProjectStatus = {
            managers: managers,
            project: projectState,
        };

        return state;
    }
}
export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

