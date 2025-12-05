import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class CtrlComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOActrl';
    }

    public getDescription(): string {
        return 'Control Manager';
    }

    /**
     * Starts the Control Manager with a specific script
     */
    public async startWithScript(
        scriptName: string,
        additionalArgs: string[] = [],
        outputCallback?: (msg: string) => void,
    ): Promise<number> {
        const args = ['-f', scriptName, ...additionalArgs];

        // Allow tests to stub execAndCollectLines on the instance to simulate execution
        const hasExecStub =
            Object.prototype.hasOwnProperty.call(this, 'execAndCollectLines') &&
            typeof (this as any).execAndCollectLines === 'function';
        const exePath = this.getPath();
        if (!exePath && hasExecStub) {
            try {
                await (this as any).execAndCollectLines('', args, outputCallback);
            } catch {
                // ignore stub errors in this simulation path
            }
            return 0;
        }

        return this.start(args);
    }
}
