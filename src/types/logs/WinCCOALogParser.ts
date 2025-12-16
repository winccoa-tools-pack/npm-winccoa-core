import * as fs from 'fs';

import { WinCCOALogEntry } from './WinCCOALogEntry';

export class WinCCOALogParser {
    /**
     * Parses a WinCC OA log file and returns an array of log entries
     * @param filePath Path to the log file
     * @returns Promise<WinCCOALogEntry[]>
     */
    public async parseLogFile(filePath: string): Promise<WinCCOALogEntry[]> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return this.parseLogContent(content);
        } catch (error) {
            throw new Error(`Failed to read log file: ${error}`);
        }
    }

    /**
     * Parses log content string and returns an array of log entries
     * @param content Raw log file content
     * @returns WinCCOALogEntry[]
     */
    public parseLogContent(content: string): WinCCOALogEntry[] {
        const lines = content.split('\n');
        const entries: WinCCOALogEntry[] = [];

        for (const line of lines) {
            if (line.trim() === '') {
                continue;
            }

            try {
                const entry = this.parseLogLine(line);
                if (entry) {
                    entries.push(entry);
                }
            } catch (error) {
                // Skip malformed lines but continue parsing
                console.warn(`Failed to parse log line: ${line}`, error);
            }
        }

        return entries;
    }

    /**
     * Parses a single log line into a WinCCOALogEntry object
     * Real WinCC OA format examples:
     * WCCOActrl    (0), 2025.10.15 13:54:33.236, SYS,  INFO,        1, Manager Start, PROJ, CTRL_BLOB_3.21, V 3.21 - 3.21.0 platform Windows AMD64
     * WCCOActrl    (0), 2025.10.15 13:54:34.364, CTRL, WARNING,     5/ctrl, Ort der folgenden Meldung:
     * 
     * Format: MANAGER_NAME (NUMBER), TIMESTAMP, ERROR_TYPE, PRIORITY, ERROR_CODE[/CATALOG], TRANSLATION, ADDITIONAL_INFO...
     * 
     * Note: Commas are the primary delimiters, spaces are optional and used for readability
     * @param line Single log line
     * @returns WinCCOALogEntry | null
     */
    private parseLogLine(line: string): WinCCOALogEntry | null {
        // Handle multi-line entries (continuation lines that start with spaces)
        if (line.startsWith('    ') || line.startsWith('\t')) {
            // This is a continuation line, skip for now (could be enhanced to merge with previous entry)
            return null;
        }

        // Split by comma and trim each part to handle optional spaces
        const rawParts = line.split(',');
        
        if (rawParts.length < 6) {
            return null;
        }

        // Trim all parts to remove optional spacing
        const parts = rawParts.map(part => part.trim());

        // Parse manager name and number: "WCCOActrl    (0)" or "WCCOActrl(0)"
        const managerMatch = parts[0].match(/^(.+?)\s*\((\d+)\)$/);
        if (!managerMatch) {
            return null;
        }
        
        const managerName = managerMatch[1].trim();
        const managerNumber = parseInt(managerMatch[2], 10);

        // Parse timestamp: "2025.10.15 13:54:33.236"
        const timestampStr = parts[1];
        const timestamp = this.parseTimestamp(timestampStr);
        if (!timestamp) {
            return null;
        }

        // Parse error type: "SYS", "CTRL", "IMPL", etc. (may have extra spaces)
        const errorType = parts[2];

        // Parse priority: "INFO", "WARNING", "SEVERE", "FATAL" (may have extra spaces)
        const priority = parts[3];

        // Parse error code: "1", "5/ctrl", "253", etc. (may have extra spaces)
        const errorCode = parts[4];

        // Parse translation (from message catalog): "Manager Start"
        const translation = parts[5] || '';

        // Parse additional info: everything after the translation (rejoin with commas since content may contain commas)
        const additionalInfo = parts.length > 6 ? parts.slice(6).join(', ') : '';

        return {
            timestamp,
            managerName,
            managerNumber,
            errorType,
            priority,
            errorCode,
            translation,
            additionalInfo,
            rawLine: line
        };
    }

    /**
     * Parses WinCC OA timestamp format
     * @param timestampStr Timestamp string in format YYYY.MM.DD HH:MM:SS.mmm
     * @returns Date | null
     */
    private parseTimestamp(timestampStr: string): Date | null {
        try {
            // Convert WinCC OA format to ISO format
            const isoFormat = timestampStr.replace(/^(\d{4})\.(\d{2})\.(\d{2})\s+/, '$1-$2-$3T') + 'Z';
            const date = new Date(isoFormat);
            
            if (isNaN(date.getTime())) {
                return null;
            }
            
            return date;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return null;
        }
    }

    /**
     * Filters log entries based on provided criteria
     * @param entries Array of log entries to filter
     * @param filters Filter criteria
     * @returns Filtered array of log entries
     */
    public filterEntries(entries: WinCCOALogEntry[], filters: LogFilters): WinCCOALogEntry[] {
        return entries.filter(entry => {
            // Timestamp filter
            if (filters.startTime && entry.timestamp < filters.startTime) {
                return false;
            }
            if (filters.endTime && entry.timestamp > filters.endTime) {
                return false;
            }

            // Manager name filter
            if (filters.managerName && !entry.managerName.toLowerCase().includes(filters.managerName.toLowerCase())) {
                return false;
            }

            // Manager number filter
            if (filters.managerNumber !== undefined && entry.managerNumber !== filters.managerNumber) {
                return false;
            }

            // Error type filter (was category)
            if (filters.errorType && !entry.errorType.toLowerCase().includes(filters.errorType.toLowerCase())) {
                return false;
            }

            // Priority filter
            if (filters.priority && !entry.priority.toLowerCase().includes(filters.priority.toLowerCase())) {
                return false;
            }

            // Error code filter
            if (filters.errorCode && !entry.errorCode.toLowerCase().includes(filters.errorCode.toLowerCase())) {
                return false;
            }

            // Translation filter
            if (filters.translation && !entry.translation.toLowerCase().includes(filters.translation.toLowerCase())) {
                return false;
            }

            // Additional info filter
            if (filters.additionalInfo && !entry.additionalInfo.toLowerCase().includes(filters.additionalInfo.toLowerCase())) {
                return false;
            }

            return true;
        });
    }
}

export interface LogFilters {
    startTime?: Date;
    endTime?: Date;
    managerName?: string;
    managerNumber?: number;
    errorType?: string;        // SYS, CTRL, IMPL, etc.
    priority?: string;         // INFO, WARNING, SEVERE, FATAL
    errorCode?: string;        // 1, 5/ctrl, etc.
    translation?: string;      // Translated message
    additionalInfo?: string;   // Additional info text search
}