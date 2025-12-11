import type { ProjEnvManagerInfo, ProjEnvProjectState } from './ProjEnv';

/**
 * Enumeration of possible project running states as reported by PMON.
 */
export enum ProjEnvPmonStatus {
    /** Status cannot be determined */
    Unknown = 'unknown',

    /** Project is currently running with active managers */
    Running = 'running',

    /** Project is configured but not currently running */
    NotRunning = 'not-running',
}

export class ProjEnvPmonProjectStatus {
    managers: ProjEnvManagerInfo[] = [];
    project?: {
        status: ProjEnvProjectState;
        statusCode: number;
        text: string;
        emergency: boolean;
        demo: boolean;
    };
}
