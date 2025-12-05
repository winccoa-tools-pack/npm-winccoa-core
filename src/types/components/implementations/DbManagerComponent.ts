import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class DbManagerComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAdb';
    }
    public getDescription(): string {
        return 'DB Manager';
    }
}
