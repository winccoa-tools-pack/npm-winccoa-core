import { WinCCOAComponent } from '../WinCCOAComponent';

export class DbManagerComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAdb';
    }
    public getDescription(): string {
        return 'DB Manager';
    }
}
