
export interface WinCCOALogEntry {
    timestamp: Date;
    managerName: string;
    managerNumber: number;
    errorType: string;     // SYS, CTRL, IMPL, etc.
    priority: string;      // INFO, WARNING, SEVERE, FATAL
    errorCode: string;     // 1, 5/ctrl, etc.
    translation: string;   // Translated message from catalog
    additionalInfo: string; // Rest of the message
    rawLine: string;
}
