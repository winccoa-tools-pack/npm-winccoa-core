import { WinCCOAComponent } from '../WinCCOAComponent';

export class ApiComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOApi';
    }

    public getDescription(): string {
        return 'API Manager';
    }

    // Add API-specific methods here
}
