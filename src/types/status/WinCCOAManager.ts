export interface WinCCOAManager {
    index: number;
    name: string;
    status: string;
    pid?: number;
    startMode?: 'manual' | 'once' | 'always';
    secKill?: number;
    restartCount?: number;
    resetMin?: number;
    args?: string;
    runningState?: 'stopped' | 'init' | 'running' | 'blocked';
    managerNumber?: number;
    startTimeStamp?: Date;
}
