import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class ReduComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOARedu';
    }
    public getDescription(): string {
        return 'Redundancy Manager';
    }
}
