import { WinCCOAComponent } from '../WinCCOAComponent.js';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ProjEnvPmonStatus } from '../../project/ProjEnvPmonStatus.js';
import type { ProjEnvManagerOptions } from '../../project/ProjEnv.js';
import { ProjEnvManagerStartMode, ProjEnvManagerState } from '../../project/ProjEnv.js';
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
     * @param outputCallback - Optional callback for output logging
     * @returns Promise that resolves when registration is complete
     */
    public async registerSubProject(
        projectPath: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) throw new Error('pmon executable not found');
        if (!fs.existsSync(pmonPath)) throw new Error(`pmon executable not found at ${pmonPath}`);

        if (outputCallback) {
            outputCallback(`Registering sub-project: ${projectPath}`);
            outputCallback(`pmon path: ${pmonPath}`);
        }

        const args = ['-regsubf', '-proj', projectPath, '-log', '+stderr'];

        if (outputCallback) outputCallback(`Executing: ${pmonPath} ${args.join(' ')}`);

        return new Promise((resolve, reject) => {
            const process = spawn(pmonPath, args, {
                cwd: path.dirname(pmonPath),
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            this.stdOut = '';
            this.stdErr = '';

            process.stdout?.on('data', (data) => {
                const output = data.toString();
                this.stdOut += output;
                if (outputCallback) outputCallback(output);
            });

            process.stderr?.on('data', (data) => {
                const output = data.toString();
                this.stdErr += output;
                if (outputCallback) outputCallback(output);
            });

            process.on('close', (code) => {
                if (outputCallback) {
                    outputCallback(`\nProcess exited with code: ${code}`);
                }

                if (code === 0 || code === 3) {
                    if (outputCallback)
                        outputCallback('Sub-project registration completed successfully!');
                    resolve();
                } else {
                    const errorMsg = `Sub-project registration failed with exit code ${code}`;
                    if (outputCallback) {
                        outputCallback(errorMsg);
                        if (this.stdErr) outputCallback(`Error details: ${this.stdErr}`);
                    }
                    reject(new Error(errorMsg));
                }
            });

            process.on('error', (error) => {
                const errorMsg = `Failed to start pmon process: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Unregisters a project using pmon's -unreg option
     * @param projectName - Name of the project to unregister
     * @param outputCallback - Optional callback for output logging
     * @returns Promise that resolves when unregistration is complete
     */
    public async unregisterProject(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) throw new Error('pmon executable not found');
        if (!fs.existsSync(pmonPath)) throw new Error(`pmon executable not found at ${pmonPath}`);

        if (outputCallback) {
            outputCallback(`Unregistering project: ${projectName}`);
            outputCallback(`pmon path: ${pmonPath}`);
        }

        // Use -unreg option to unregister project
        const args = ['-unreg', projectName, '-log', '+stderr'];

        if (outputCallback) outputCallback(`Executing: ${pmonPath} ${args.join(' ')}`);

        return new Promise((resolve, reject) => {
            const process = spawn(pmonPath, args, {
                cwd: path.dirname(pmonPath),
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            this.stdOut = '';
            this.stdErr = '';

            process.stdout?.on('data', (data) => {
                const output = data.toString();
                this.stdOut += output;
                if (outputCallback) outputCallback(output);
            });

            process.stderr?.on('data', (data) => {
                const output = data.toString();
                this.stdErr += output;
                if (outputCallback) outputCallback(output);
            });

            process.on('close', (code) => {
                if (outputCallback) {
                    outputCallback(`\nProcess exited with code: ${code}`);
                }

                if (code === 0) {
                    if (outputCallback)
                        outputCallback('Project unregistration completed successfully!');
                    resolve();
                } else {
                    const errorMsg = `Project unregistration failed with exit code ${code}`;
                    if (outputCallback) {
                        outputCallback(errorMsg);
                        if (this.stdErr) outputCallback(`Error details: ${this.stdErr}`);
                    }
                    reject(new Error(errorMsg));
                }
            });

            process.on('error', (error) => {
                const errorMsg = `Failed to start pmon process: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Registers a runnable project using pmon's -config -autofreg -status options
     * @param configPath - Path to the project config file
     * @param outputCallback - Optional callback for output logging
     * @returns Promise that resolves when registration is complete with exit code
     */
    public async registerProject(
        configPath: string,
        outputCallback?: (message: string) => void,
    ): Promise<number> {
        const pmonPath = this.getPath();
        if (!pmonPath) throw new Error('pmon executable not found');
        if (!fs.existsSync(pmonPath)) throw new Error(`pmon executable not found at ${pmonPath}`);

        if (outputCallback) {
            outputCallback(`Registering project: ${configPath}`);
            outputCallback(`pmon path: ${pmonPath}`);
        }

        // Use -config -autofreg -status options to register runnable project
        const args = ['-config', configPath, '-log', '+stderr', '-autofreg', '-status'];

        if (outputCallback) outputCallback(`Executing: ${pmonPath} ${args.join(' ')}`);

        return new Promise((resolve, reject) => {
            const process = spawn(pmonPath, args, {
                shell: false,
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            this.stdOut = '';
            this.stdErr = '';

            process.stdout?.on('data', (data) => {
                const output = data.toString();
                this.stdOut += output;
                if (outputCallback) outputCallback(output);
            });

            process.stderr?.on('data', (data) => {
                const output = data.toString();
                this.stdErr += output;
                if (outputCallback) outputCallback(`[STDERR] ${output}`);
            });

            process.on('close', (code) => {
                if (outputCallback) outputCallback(`\npmon process exited with code: ${code}`);

                if (code === 0 || code === 3) {
                    if (outputCallback)
                        outputCallback('Project registration completed successfully!');
                    resolve(code || 0);
                } else {
                    const errorMsg = `Project registration failed with exit code ${code}`;
                    if (outputCallback) {
                        outputCallback(errorMsg);
                        if (this.stdErr) outputCallback(`STDERR: ${this.stdErr}`);
                        if (this.stdOut) outputCallback(`STDOUT: ${this.stdOut}`);
                    }
                    reject(new Error(errorMsg));
                }
            });

            process.on('error', (error) => {
                const errorMsg = `Failed to start pmon process: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Get pmon status. It check if the pmon is running or not
     */
    public async getStatus(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<{ project: string; status: ProjEnvPmonStatus; error?: string }> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            return { project: projectName, status: ProjEnvPmonStatus.Unknown, error: errorMsg };
        }

        return new Promise((resolve, reject) => {
            const args = ['-status', '-proj', projectName, '-log', '+stdout'];
            const command = `"${pmonPath}" ${args.join(' ')}`;

            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            process.stderr.on('data', (data) => {
                const output = data.toString();
                    if (outputCallback) outputCallback(output);
                stderr += output;
            });

            process.on('close', (code) => {
                if (outputCallback) {
                    if (stdout) outputCallback(stdout);
                    if (stderr) outputCallback(stderr);
                }

                const status =
                    code === 0 ? ProjEnvPmonStatus.Running : ProjEnvPmonStatus.NotRunning;
                resolve({ project: projectName, status });
            });

            process.on('error', (error) => {
                const errorMsg = `Failed to check project status: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Starts pmon only (without auto-starting managers)
     */
    public async startPmonOnly(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-noAutostart'];
            const command = `"${pmonPath}" ${args.join(' ')}`;

            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false, detached: true });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Pmon process exited with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to start pmon: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Starts a project with all managers
     */
    public async startProject(
        projectName: string,
        startAll: boolean = true,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            let args: string[] = ['-proj', projectName];
            let detached = false;

            if (startAll) {
                args = args.concat(['-command', 'START_ALL:']);
            } else {
                // starting pmon only without extra arguments means, it will start the project too.
                // that means the pmon process will never end (hopefully, otherwise it crashed), so we need to detach
                detached = true;
            }

            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false, detached: detached });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Start project failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to start project: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Stops all managers in a project
     */
    public async stopProject(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', 'STOP_ALL:'];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Stop project failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to stop project: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Stops all managers and exits pmon
     */
    public async stopProjectAndPmon(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-stopWait'];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Stop and exit pmon failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to stop project and pmon: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Restarts all managers in a project
     */
    public async restartProject(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', 'RESTART_ALL:'];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Restart project failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to restart project: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Sets pmon wait mode
     */
    public async setWaitMode(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', 'WAIT_MODE:'];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Set wait mode failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to set wait mode: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Starts a specific manager by index
     */
    public async startManager(
        projectName: string,
        managerIndex: number,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', `START_MANAGER:${managerIndex}`];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Start manager failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to start manager: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Stops a specific manager by index
     */
    public async stopManager(
        projectName: string,
        managerIndex: number,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', `STOP_MANAGER:${managerIndex}`];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Stop manager failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to stop manager: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Kills a specific manager by index
     */
    public async killManager(
        projectName: string,
        managerIndex: number,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', `KILL_MANAGER:${managerIndex}`];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Kill manager failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to kill manager: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Removes a specific manager by index
     */
    public async removeManager(
        projectName: string,
        managerIndex: number,
        outputCallback?: (message: string) => void,
    ): Promise<void> {
        const pmonPath = this.getPath();
        if (!pmonPath) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const args = ['-proj', projectName, '-command', `REMOVE_MANAGER:${managerIndex}`];
            const command = `"${pmonPath}" ${args.join(' ')}`;
            if (outputCallback) outputCallback(`Executing:\n${command}`);

            const process = spawn(pmonPath, args, { shell: false });

            process.stdout.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });
            process.stderr.on('data', (data) => {
                if (outputCallback) outputCallback(data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Remove manager failed with code ${code}`));
            });
            process.on('error', (error) => {
                const errorMsg = `Failed to remove manager: ${error.message}`;
                if (outputCallback) outputCallback(errorMsg);
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Gets the list of managers in a project
     */
    public async getManagerOptionsList(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<ProjEnvManagerOptions[]> {
        const pmonPath = await this.getPath();
        const hasInstanceExecStub =
            Object.prototype.hasOwnProperty.call(this, 'execAndCollectLines') &&
            typeof (this as any).execAndCollectLines === 'function';
        if (!pmonPath && !hasInstanceExecStub) {
            throw new Error('WCCILpmon executable not found');
        }

        const args = ['-proj', projectName, '-command', 'MGRLIST:LIST', '-log', '+stdout'];
        const callPath = pmonPath ?? '';
        const lines = await (this as any).execAndCollectLines(callPath, args, outputCallback);
        const parsed = this.parseManagerList(lines.join('\n'));
        return parsed;
    }

    /**
     * Convenience accessor for manager option (from MGRLIST:LIST) by index.
     * If `projectName` is provided, it will refresh the options list first.
     * If omitted, it returns the manager from last fetched list if available.
     */
    public async getManagerOptionsAt(
        index: number,
        projectName?: string,
        outputCallback?: (message: string) => void,
    ): Promise<ProjEnvManagerOptions | undefined> {
        if (typeof index !== 'number' || index < 0) return undefined;

        if (projectName) {
            const list = await this.getManagerOptionsList(projectName, outputCallback);
            return list[index];
        }

        return undefined;
    }

    /**
     * Gets detailed project and manager status (MGRLIST:STATI) and returns typed managers and optional project state
     */

    public async getProjectStatus(
        projectName: string,
        outputCallback?: (message: string) => void,
    ): Promise<ProjEnvPmonProjectStatus> {
        const pmonPath = await this.getPath();
        const hasInstanceExecStub =
            Object.prototype.hasOwnProperty.call(this, 'execAndCollectLines') &&
            typeof (this as any).execAndCollectLines === 'function';
        if (!pmonPath && !hasInstanceExecStub) {
            const errorMsg = 'Could not locate WCCILpmon executable';
            if (outputCallback) outputCallback(errorMsg);
            throw new Error(errorMsg);
        }

        const args = ['-proj', projectName, '-command', 'MGRLIST:STATI', '-log', '+stdout'];
        const callPath = pmonPath ?? '';
        const lines = await (this as any).execAndCollectLines(callPath, args, outputCallback);
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
        outputCallback?: (message: string) => void,
    ): Promise<ProjEnvManagerInfo | undefined> {
        if (typeof index !== 'number' || index < 0) return undefined;

        if (projectName) {
            const res = await this.getProjectStatus(projectName, outputCallback);
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
            const name = parts[0] || '';
            const startModeNum = Number(parts[1] ?? NaN);
            const seckill = parts[2] ? Number(parts[2]) : undefined;
            const restartCount = parts[3] ? Number(parts[3]) : undefined;
            const resetMin = parts[4] ? Number(parts[4]) : undefined;
            const args = parts.slice(5).filter(Boolean).join(';') || undefined;

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
                    startModeEnum = ProjEnvManagerStartMode.Unknown;
                    break;
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
        status: string;
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

            let status: string;
            switch (statusCode) {
                case -1:
                    status = 'Unknown';
                    break;
                case 0:
                    status = 'Down';
                    break;
                case 1:
                    status = 'Starting';
                    break;
                case 2:
                    status = 'Monitoring';
                    break;
                case 3:
                    status = 'Stopping';
                    break;
                case 5:
                    status = 'Restarting';
                    break;
                default:
                    status = 'Unknown';
                    break;
            }

            return { status, statusCode, text, emergency, demo };
        }

        return null;
    }

    // Parse STATI output into typed managers and project state
    private parseManagerStatus(output: string): ProjEnvPmonProjectStatus {
        // {   managers: ProjEnvManagerState[]; project?: { status: string; statusCode: number; text: string; emergency: boolean; demo: boolean } }
        const managers: ProjEnvManagerInfo[] = [];
        const lines = output.split('\n');

        let listStarted = false;
        let projectState:
            | {
                  status: string;
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
