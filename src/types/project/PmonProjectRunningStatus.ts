/**
 * Enumeration of possible project running states as reported by PMON.
 */
export enum ProjEnvPmonStatus {
    /** Status cannot be determined */
    Unknown = 'unknown',

    /** Project is currently running with active managers */
    Running = 'running',

    /** Project is configured but not currently running */
    NotRunning = 'not-running'
}
