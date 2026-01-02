/**
 * Lightweight error handler used by project utilities.
 * Intended to be small and dependency-free so it can be used in NPM packages.
 */
export type WinCCOAErrorHandlerLogLevel = 'verbose' | 'info' | 'warning' | 'severe' | 'exception';

/** Output hook can be a function or a VS Code-like OutputChannel with appendLine(). */
export type OutputHook = ((line: string) => void) | { appendLine: (line: string) => void };

export interface WinCCOAErrorHandlerOptions {
    verbose?: boolean;
    debugFlag?: string;
    /** If true, methods labeled 'exception' or 'severe' will throw Error objects. */
    throwOnSevere?: boolean;
    prefix?: string;
    output?: OutputHook;
}

export class WinCCOAErrorHandler {
    protected verboseEnabled: boolean;
    protected debugFlag?: string;
    protected throwOnSevere: boolean;
    protected prefix?: string;
    protected outputHook?: OutputHook;

    constructor(opts?: WinCCOAErrorHandlerOptions) {
        this.verboseEnabled = Boolean(opts?.verbose);
        this.debugFlag = opts?.debugFlag;
        this.throwOnSevere = Boolean(opts?.throwOnSevere ?? true);
        this.prefix = opts?.prefix;
        this.outputHook = opts?.output;
    }

    public setOutputHook(hook?: OutputHook) {
        this.outputHook = hook;
    }

    protected sendToOutput(line: string) {
        if (!this.outputHook) return;
        try {
            if (typeof this.outputHook === 'function') {
                this.outputHook(line);
            } else if (typeof this.outputHook.appendLine === 'function') {
                this.outputHook.appendLine(line);
            }
        } catch {
            // swallow hook errors to avoid crashing callers
        }
    }

    protected formatMessage(level: WinCCOAErrorHandlerLogLevel, msg: string): string {
        const ts = new Date().toISOString();
        const p = this.prefix ? `${this.prefix}` : '';
        return `[${ts}] ${p}[${level.toUpperCase()}] ${msg}`;
    }

    public verbose(msg: string): void {
        if (this.verboseEnabled || (this.debugFlag && this.debugFlag.length > 0)) {
            const out = this.formatMessage('verbose', msg);
             
            console.error(out);
            this.sendToOutput(out);
        }
    }

    public info(msg: string): void {
        const out = this.formatMessage('info', msg);
         
        console.warn(out);
        this.sendToOutput(out);
    }

    public warning(msg: string, code = 54): Error {
        const body = `${msg} (code=${code})`;
        const out = this.formatMessage('warning', body);
         
        console.warn(out);
        this.sendToOutput(out);
        return new Error(body);
    }

    public severe(msg: string, code = 54): never | void {
        const body = `${msg} (code=${code})`;
        const out = this.formatMessage('severe', body);
         
        console.error(out);
        // include stack trace
         
        console.error(new Error(body).stack);
        this.sendToOutput(out + '\n' + (new Error(body).stack ?? ''));
        if (this.throwOnSevere) {
            throw new Error(body);
        }
    }

    public exception(msg: string, code = 54): never {
        const body = `${msg} (code=${code})`;
        const out = this.formatMessage('exception', body);
         
        console.error(out);
        this.sendToOutput(out);
        throw new Error(body);
    }

    public log(level: WinCCOAErrorHandlerLogLevel, msg: string, code = 0): void | Error | never {
        switch (level) {
            case 'verbose':
                this.verbose(msg);
                return;
            case 'info':
                this.info(msg);
                return;
            case 'warning':
                return this.warning(msg, code);
            case 'severe':
                return this.severe(msg, code);
            case 'exception':
                return this.exception(msg, code);
            default:
                 
                console.log(this.formatMessage('info', msg));
                this.sendToOutput(this.formatMessage('info', msg));
                return;
        }
    }
}
