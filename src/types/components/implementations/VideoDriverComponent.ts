import { WinCCOAComponent } from '../WinCCOAComponent';

export class VideoDriverComponent extends WinCCOAComponent {
    public getName(): string {
        return 'WCCOAvideo';
    }
    public getDescription(): string {
        return 'Video Driver';
    }
}
