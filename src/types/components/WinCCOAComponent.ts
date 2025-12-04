/**
 * Platform-agnostic WinCC OA component base class
 * Stripped of VS Code-specific APIs so it can live in the shared library.
 */

import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { getWinCCOAInstallationPathByVersion, getAvailableWinCCOAVersions } from '../../utils/winccoa-paths.js';

export abstract class WinCCOAComponent {
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
     */
    public async start(args: string[] = [], options: { detached?: boolean } = {}): Promise<number> {
        const p = this.getPath();
        if (!p) throw new Error('executable not found');

        return new Promise((resolve, reject) => {
            const proc = spawn(p, args, { detached: !!options.detached });

            proc.stdout?.on('data', d => this.stdOut += d.toString());
            proc.stderr?.on('data', d => this.stdErr += d.toString());

            proc.on('close', code => resolve(code ?? 0));
            proc.on('error', err => reject(err));
        });
    }

    /**
     * Execute a command and collect stdout lines as an array of strings.
     * Returns trimmed lines (excluding empty lines and terminating ';').
     */
    protected async execAndCollectLines(cmdPath: string, args: string[], outputCallback?: (msg: string) => void): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const proc = spawn(cmdPath, args, { shell: false });
            let stdout = '';
            let stderr = '';

            proc.stdout?.on('data', d => {
                const s = d.toString();
                stdout += s;
                this.stdOut += s;
                if (outputCallback) outputCallback(s);
            });

            proc.stderr?.on('data', d => {
                const s = d.toString();
                stderr += s;
                this.stdErr += s;
                if (outputCallback) outputCallback(s);
            });

            proc.on('close', code => {
                const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && l !== ';');
                resolve(lines);
            });

            proc.on('error', err => reject(err));
        });
    }
}
