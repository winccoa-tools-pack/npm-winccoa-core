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
    pid: number;
    startMode: ProjEnvManagerStartMode;
    startTime: Date;
    managerNumber: number;
}

export interface ProjEnvManagerOptions {
    component: string;
    startMode: ProjEnvManagerStartMode;
    secondToKill: number;
    resetMin: number;
    resetStartCounter: number;
    startOptions: string;
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

export enum ProjEnvProjectRunnable {
    Unknown = -1,
    Runnable = 0,
    NotRunnable = 1,
}

export const ProjEnvProjectFileSysStruct = Object.freeze({
    BIN_REL_PATH: 'bin/',
    SOURCE_REL_PATH: 'source/',
    HELP_REL_PATH: 'help/',
    MSG_REL_PATH: 'msg/',
    CONFIG_REL_PATH: 'config/',
    PICTURES_REL_PATH: 'pictures/',
    PRINTERS_REL_PATH: 'printers/',
    COLORDB_REL_PATH: 'colorDB/',
    PANELS_REL_PATH: 'panels/',
    IMAGES_REL_PATH: 'images/',
    SCRIPTS_REL_PATH: 'scripts/',
    LIBS_REL_PATH: 'scripts/libs/',
    DATA_REL_PATH: 'data/',
    DB_REL_PATH: 'db/wincc_oa/',
    LOG_REL_PATH: 'log/',
    DPLIST_REL_PATH: 'dplist/',
    NLS_REL_PATH: 'nls/',
    JAVASCRIPT_REL_PATH: 'javascript/',
    PIXMAPS_REL_PATH: 'pictures/',
    ICONS_REL_PATH: 'pictures/',
    GIF_REL_PATH: 'pictures/',
} as const);

export type ProjEnvProjectFileSysStructKey = keyof typeof ProjEnvProjectFileSysStruct;
export type ProjEnvProjectFileSysStructValue =
    (typeof ProjEnvProjectFileSysStruct)[ProjEnvProjectFileSysStructKey];
