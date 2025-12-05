/**
 * Modbus Driver Component
 */

import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class ModbusComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAmod';
    }

    public getDescription(): string {
        return 'Modbus Driver';
    }

    // Add MODBUS-specific methods here
}
