import { WinCCOAComponent } from '../WinCCOAComponent';

export class DriverComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAdrv';
    }
    public getDescription(): string {
        return 'Driver Component';
    }
}
