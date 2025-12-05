import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class UIComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAui';
    }

    public getDescription(): string {
        return 'User Interface';
    }

    /**
     * Starts the UI with a specific panel
     * @param panelPath - Path to the panel file
     * @param args - Additional arguments
     * @returns Process exit code
     */
    public async startWithPanel(
        panelPath: string,
        args: string[] = [],
        outputCallback?: (msg: string) => void,
    ): Promise<number> {
        const cmdArgs = ['-p', panelPath, ...args];

        const hasExecStub =
            Object.prototype.hasOwnProperty.call(this, 'execAndCollectLines') &&
            typeof (this as any).execAndCollectLines === 'function';
        const exePath = this.getPath();
        if (!exePath && hasExecStub) {
            try {
                await (this as any).execAndCollectLines('', cmdArgs, outputCallback);
            } catch {
                // ignore
            }
            return 0;
        }

        return this.start(cmdArgs);
    }
}
