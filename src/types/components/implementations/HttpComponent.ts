import { WinCCOAComponent } from '../WinCCOAComponent';

export class HttpComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAhttp';
    }
    public getDescription(): string {
        return 'HTTP / Web server component';
    }
}
