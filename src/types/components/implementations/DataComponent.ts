/**
 * Database Manager Component
 */

import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class DataComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCILdata';
    }

    public getDescription(): string {
        return 'Database Manager';
    }

    // Add DATA-specific methods here
}
