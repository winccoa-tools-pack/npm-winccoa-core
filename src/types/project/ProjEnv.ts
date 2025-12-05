/**
 * WinCC OA project and manager enums and helper functions
 */

export enum ProjEnvProjectState {
    Unknown = -1,
    Down = 0,
    Starting = 1,
    Monitoring = 2,
    Stopping = 3,
    Restarting = 5,
}

export enum ProjEnvManagerStartMode {
    Unknown = -1,
    Manual = 0,
    Once = 1,
    Always = 2,
}

export enum ProjEnvManagerState {
    Unknown = -1,
    NotRunning = 0,
    Init = 1,
    Running = 2,
    Blocked = 3,
}

export function ProjEnvManagerStateToString(state: ProjEnvManagerState): string {
    switch (state) {
        case ProjEnvManagerState.Unknown:
            return 'Unknown';
        case ProjEnvManagerState.NotRunning:
            return 'NotRunning';
        case ProjEnvManagerState.Init:
            return 'Init';
        case ProjEnvManagerState.Running:
            return 'Running';
        case ProjEnvManagerState.Blocked:
            return 'Blocked';
        default:
            return 'Invalid';
    }
}

export function ProjEnvProjectStateToString(state: ProjEnvProjectState): string {
    switch (state) {
        case ProjEnvProjectState.Unknown:
            return 'Unknown';
        case ProjEnvProjectState.Down:
            return 'Stopped';
        case ProjEnvProjectState.Starting:
            return 'Starting';
        case ProjEnvProjectState.Monitoring:
            return 'Started';
        case ProjEnvProjectState.Stopping:
            return 'Stopping';
        case ProjEnvProjectState.Restarting:
            return 'Restarting';
        default:
            return 'Invalid';
    }
}

export interface ProjEnvManagerInfo {
    state: ProjEnvManagerState;
    pid?: number;
    startMode: ProjEnvManagerStartMode;
    startTime?: Date;
    managerNumber?: number;
}

export interface ProjEnvManagerOptions {
    component?: string;
    startMode?: ProjEnvManagerStartMode;
    secondToKill?: number;
    restart?: number;
    resetStartCounter?: number;
    startOptions?: string;
}

export function startModeToString(mode: ProjEnvManagerStartMode): string {
    switch (mode) {
        case ProjEnvManagerStartMode.Always:
            return 'always';
        case ProjEnvManagerStartMode.Manual:
            return 'manual';
        case ProjEnvManagerStartMode.Once:
            return 'once';
        default:
            return '';
    }
}
