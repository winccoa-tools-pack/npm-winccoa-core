/*
 * TypeScript conversion of ProjEnvProjectConfig
 *
 * This is a best-effort translation of the original API into TypeScript.
 * The implementation is intentionally minimal: the setters/getters work,
 * but the config modification functions are placeholders that will throw
 * when `throwErrors` is enabled or return -1 when disabled. You can
 * implement real persistence/paCfg bindings later.
 *
 * TODO:
 * + Make getEntryValue() return a default value when missing.
 * + Add unit tests for these functions (recommended).
 * + Improve to heanlde list-entries
 */

import * as path from 'path';
import fs from 'fs';

export class ProjEnvProjectConfig {
    // public members
    public throwErrors = true;

    // protected/private member
    protected _configFilePath = '';

    /**
     * Default constructor
     * @param configFilePath optional path to config file
     */
    constructor(configFilePath: string = '') {
        this.setConfigPath(configFilePath);
    }

    /**
     * Return full native path to the config file. Returns empty string
     * if not set.
     */
    public getConfigPath(): string {
        return this._configFilePath;
    }

    /**
     * Set config path. This only sets the member; it does not create files.
     */
    public setConfigPath(configFilePath: string): void {
        if (!configFilePath) {
            this._configFilePath = '';
            return;
        }

        // Normalize to native path style
        this._configFilePath = path.resolve(configFilePath);
    }

    /**
     * Insert a value into the config. Placeholder: returns -1 and optionally
     * throws when not implemented.
     */
    public insertValue(value: unknown, key: string, _section = 'general'): number {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) return -1;

        try {
            const content = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf-8') : '';
            const sections = content ? this.parseConfigSections(content) : Object.create(null);
            if (!sections[_section]) sections[_section] = Object.create(null);
            // Insert only if key does not already exist
            if (Object.prototype.hasOwnProperty.call(sections[_section], key)) return -1;
            sections[_section][key] = String(value ?? '');
            this.saveConfigSections(sections);
            return 0;
        } catch (err) {
            if (this.throwErrors) throw err;
            return -1;
        }
    }

    /**
     * Set a value in the config. Placeholder implementation.
     */
    public setValue(value: unknown, key: string, _section = 'general'): number {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) return -1;

        try {
            const content = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf-8') : '';
            const sections = content ? this.parseConfigSections(content) : Object.create(null);
            if (!sections[_section]) sections[_section] = Object.create(null);
            // Set/overwrite the key
            sections[_section][key] = String(value ?? '');
            this.saveConfigSections(sections);
            return 0;
        } catch (err) {
            if (this.throwErrors) throw err;
            return -1;
        }
    }

    /**
     * Delete a value in the config. Placeholder implementation.
     */
    public deleteValue(value: unknown, key: string, _section = 'general'): number {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) return -1;

        try {
            if (!fs.existsSync(cfgPath)) return -1;
            const content = fs.readFileSync(cfgPath, 'utf-8');
            const sections = this.parseConfigSections(content);
            if (
                !sections[_section] ||
                !Object.prototype.hasOwnProperty.call(sections[_section], key)
            )
                return -1;
            // Only delete if value matches
            if (sections[_section][key] !== String(value ?? '')) return -1;
            delete sections[_section][key];
            this.saveConfigSections(sections);
            return 0;
        } catch (err) {
            if (this.throwErrors) throw err;
            return -1;
        }
    }

    /**
     * Delete an entry by key in the config. Placeholder implementation.
     */
    public deleteEntry(key: string, _section = 'general'): number {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) return -1;

        try {
            if (!fs.existsSync(cfgPath)) return -1;
            const content = fs.readFileSync(cfgPath, 'utf-8');
            const sections = this.parseConfigSections(content);
            if (
                !sections[_section] ||
                !Object.prototype.hasOwnProperty.call(sections[_section], key)
            )
                return -1;
            delete sections[_section][key];
            this.saveConfigSections(sections);
            return 0;
        } catch (err) {
            if (this.throwErrors) throw err;
            return -1;
        }
    }

    public getEntryValue(key: string, _section = 'general'): any {
        const sectionData: Record<string, any> = this.getSection(_section);
        return sectionData[key];
    }

    private getSection(section: string): Record<string, any> {
        const content = fs.readFileSync(this.getConfigPath(), 'utf-8');
        return this.parseConfigSections(content)[section];
    }

    /**
     * Parses a configuration file into sections
     * @param content File content to parse
     * @returns Sections with key-value pairs
     */
    private parseConfigSections(content: string): Record<string, Record<string, string>> {
        const lines = content.split('\n');
        const sections: Record<string, Record<string, any>> = Object.create(null);
        let currentSection = '';

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                currentSection = trimmedLine.slice(1, -1);
                sections[currentSection] = Object.create(null);
            } else if (currentSection && trimmedLine.includes('=')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                const value = valueParts.join('=').trim().replace(/['"]/g, '');
                const trimmedKey = key.trim();
                if (sections[currentSection][trimmedKey] !== undefined) {
                    if (Array.isArray(sections[currentSection][trimmedKey])) {
                        // already an array, do nothing
                        const entries = sections[currentSection][trimmedKey] as string[];
                        entries.push(value);
                        sections[currentSection][trimmedKey] = entries;
                    } else {
                        sections[currentSection][trimmedKey] = [
                            sections[currentSection][trimmedKey],
                        ];
                    }
                } else {
                    sections[currentSection][trimmedKey] = value;
                    sections[currentSection][key.trim()] = value;
                }
            }
        }

        return sections;
    }

    /**
     * Save sections back to the config file.
     * Ensures `[general]` is always the first section. Other sections and keys
     * are written alphanumerically.
     */
    private saveConfigSections(sections: Record<string, Record<string, string>>): void {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) {
            if (this.throwErrors) throw new Error('Config path is not set');
            return;
        }

        // Ensure general section exists and is first
        if (!sections['general']) sections['general'] = Object.create(null);

        const otherSections = Object.keys(sections)
            .filter((s) => s !== 'general')
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const sectionOrder = ['general', ...otherSections];

        const outLines: string[] = [];

        for (const sec of sectionOrder) {
            outLines.push(`[${sec}]`);
            const entries = sections[sec] || Object.create(null);
            const keys = Object.keys(entries).sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
            );
            for (const key of keys) {
                const value = entries[key] ?? '';
                const escaped = String(value).replace(/"/g, '\\"');
                outLines.push(`${key} = "${escaped}"`);
            }
            outLines.push('');
        }

        const content = outLines.join('\n');
        fs.writeFileSync(cfgPath, content, 'utf-8');
    }
}

export default ProjEnvProjectConfig;
