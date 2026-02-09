import { WinCCOAComponent } from '../WinCCOAComponent';

export class DistComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOADist';
    }
    public getDescription(): string {
        return 'Distribution Manager';
    }
}
