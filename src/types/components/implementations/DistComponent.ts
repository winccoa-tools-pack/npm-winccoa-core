import { WinCCOAComponent } from '../WinCCOAComponent.js';

export class DistComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOADist';
    }
    public getDescription(): string {
        return 'Distribution Manager';
    }
}
