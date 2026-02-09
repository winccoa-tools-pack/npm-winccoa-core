import { WinCCOAComponent } from '../WinCCOAComponent';

export class ReduComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOARedu';
    }
    public getDescription(): string {
        return 'Redundancy Manager';
    }
}
