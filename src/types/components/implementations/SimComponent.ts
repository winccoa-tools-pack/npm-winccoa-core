/**
 * Simulation Driver Component
 */

import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class SimComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCILsim';
    }

    public getDescription(): string {
        return 'Simulation Driver';
    }

    // Add SIM-specific methods here
}
