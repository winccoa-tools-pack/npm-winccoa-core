/**
 * Configuration Component
 */

import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class ConfComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAconf';
    }

    public getDescription(): string {
        return 'Configuration Component';
    }

    // Add CONF-specific methods here
}
