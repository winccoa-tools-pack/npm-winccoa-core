/**
 * Platform-agnostic WinCC OA component base class
 * Stripped of VS Code-specific APIs so it can live in the shared library.
 */

import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import {
    getWinCCOAInstallationPathByVersion,
    getAvailableWinCCOAVersions,
} from '../../utils/winccoa-paths.js';
import { randomUUID } from 'crypto';

/*
class CommandHistoryEntry {
    private command: string;
    private args: string[];
    private timestamp: Date;
    public stdOut: string = '';
    public stdErr: string = '';

    constructor(command: string, args: string[]) {
        this.command = command;
        this.args = args;
        this.timestamp = new Date();
    }
}
*/

export abstract class WinCCOAComponent {

    public commandHistory: CommandHistoryEntry[] = [];
    /**
     * Accumulated standard output from the last spawned process.
     * Use this to inspect output produced by helper commands invoked
     * by the component (e.g., version queries).
     */
    public stdOut: string = '';

    /**
     * Accumulated standard error output from the last spawned process.
     */
    public stdErr: string = '';

    /**
     * Returns the canonical internal name of this component. This is the
     * identifier used to locate the executable (e.g., 'WCCILpmon').
     * Implementations must return a stable string.
     */
    abstract getName(): string;

    /**
     * Returns a human-friendly description of the component. This should be
     * suitable for display or logs and remain language-neutral where possible.
     */
    abstract getDescription(): string;

    /**
     * Returns the executable filename used by the component. Defaults to
     * the value returned by `getName()` but may be overridden by
     * platform-specific implementations.
     *
     * @returns executable filename (without path)
     */
    public getExecutableName(): string {
        return this.getName();
    }

    /**
     * Attempts to discover the full filesystem path to the component
     * executable by scanning known WinCC OA installation directories.
     *
     * The search strategy:
     * - Query available WinCC OA versions (cached by utils)
     * - For each version, resolve the installation root and check
     *   `bin/<executable>` and `bin/<executable>.exe` for existence.
     *
     * Returns the absolute path to the executable when found or `null`
     * if not present on the host system.
     *
     * @returns absolute path to executable or `null`
     */
    public getPath(): string | null {
        const exe = this.getExecutableName();
        const versions = getAvailableWinCCOAVersions();

        for (const v of versions) {
            const base = getWinCCOAInstallationPathByVersion(v);
            if (!base) continue;

            const candidate = path.join(base, 'bin', exe);
            if (fs.existsSync(candidate)) {
                return candidate;
            }

            // Windows can have .exe suffix
            if (fs.existsSync(candidate + '.exe')) {
                return candidate + '.exe';
            }
        }

        return null;
    }

    /**
     * Returns `true` when the component's executable exists on disk and is
     * discoverable by `getPath()`.
     */
    public exists(): boolean {
        const p = this.getPath();
        return !!p && fs.existsSync(p);
    }

    /**
     * Attempts to extract a version string from provided output or from the
     * component's last recorded `stdOut`. Returns the parsed version string
     * (e.g., '3.20.1') or `null` when no version could be found.
     *
     * @param output - Optional raw output to parse; falls back to `stdOut`.
     * @returns parsed version string or `null`
     */
    public getVersion(output?: string): string | null {
        const parsed = this.parseVersionOutput(output || this.stdOut || '');
        return parsed || null;
    }

    /**
     * Parses a version-like substring from arbitrary command output.
     * Default implementation finds the first occurrence of `N.N` or
     * `N.N.N` using a simple regex. Override in concrete components if
     * they produce more complex version output.
     *
     * @param output - Raw output to inspect
     * @returns matched version string or `null`
     */
    protected parseVersionOutput(output: string): string | null {
        const m = output.match(/(\d+\.\d+(?:\.\d+)?)/);
        return m ? m[1] : null;
    }

    /**
     * Starts the component process with the provided arguments.
     * Captures stdout/stderr into `stdOut`/`stdErr` and resolves with the
     * exit code when the process closes. Rejects on process start errors.
     *
     * @param args - Array of arguments to pass to the executable
     * @param options.detached - Whether to spawn the process detached
     * @returns Promise resolving with process exit code
     *
     * TODO implement the option waitForLog. need to wait until the std-err coontains the specific string
     */
    public async start(
        args: string[] = [],
        options: { detached?: boolean; waitForLog?: string } = {},
    ): Promise<number> {
        const p = this.getPath();
        // const histEntry = new CommandHistoryEntry(this.getName(), args);
        this.stdOut = '';
        this.stdErr = '';

        const cmdId = randomUUID();


        console.log(cmdId, 'Starting component', this.getName(), 'with args', args, 'from', p, 'options', options);
        if (!p) throw new Error('Executable ' + this.getName() + ' not found');

        return new Promise((resolve, reject) => {
            const spawnOptions: any = { shell: false };
            
            if (options.detached) {
                // For detached processes, ignore stdio to prevent parent from waiting
                spawnOptions.detached = true;
                spawnOptions.stdio = 'ignore';
            }
            
            const proc = spawn(p, args, spawnOptions);

            if (options.detached) {
                // Unref to allow parent to exit independently
                proc.unref();
                // Resolve immediately for detached processes
                resolve(0);
            } else {
                // Only capture output for non-detached processes
                proc.stdout?.on('data', (d) => { const str = d.toString(); this.stdOut += str; console.log(cmdId, 'STDOUT:', str); /* histEntry.stdOut += str; */ });
                proc.stderr?.on('data', (d) => { const str = d.toString(); this.stdErr += str; console.log(cmdId, 'STDERR:', str); /* histEntry.stdErr += str; */ });

                proc.on('close', (code) => resolve(code ?? 0));
                proc.on('error', (err) => reject(err));
            }
        });
    }

    /**
     * Execute a command and collect stdout lines as an array of strings.
     * Returns trimmed lines (excluding empty lines and terminating ';').
     */
    protected async execAndCollectLines(cmdPath: string, args: string[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const proc = spawn(cmdPath, args, { shell: false });
            let stdout = '';

            proc.stdout?.on('data', (d) => {
                const s = d.toString();
                stdout += s;
                this.stdOut += s;
            });

            proc.stderr?.on('data', (d) => {
                const s = d.toString();
                this.stdErr += s;
            });

            proc.on('close', (_code) => {
                const lines = stdout
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0 && l !== ';');
                resolve(lines);
            });

            proc.on('error', (err) => reject(err));
        });
    }
}
