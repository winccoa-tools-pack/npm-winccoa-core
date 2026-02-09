import { WinCCOAComponent } from '../WinCCOAComponent';

export class AlertManagerComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAlert';
    }
    public getDescription(): string {
        return 'Alert Manager';
    }
}
