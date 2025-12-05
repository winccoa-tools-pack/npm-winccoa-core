/**
 * OPC DA Client Component
 */

import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class OpcDaComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAopc';
    }

    public getDescription(): string {
        return 'OPC DA Client';
    }

    // Add OPCDA-specific methods here
}
