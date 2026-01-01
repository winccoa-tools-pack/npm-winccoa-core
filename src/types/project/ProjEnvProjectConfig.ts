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
        this.loaded = false;
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

    public getEntryValueList(key: string, _section = 'general'): string[] | undefined {
        const sectionData: Record<string, string | string[]> = this.getSection(_section);
        if (sectionData[key] !== undefined) {
            if (Array.isArray(sectionData[key])) {
                return sectionData[key] as string[];
            } else {
                console.log('Wrapping single entry into array for key:', key);
                return [sectionData[key] as string];
            }
        }
        return undefined;
    }

    public getEntryValue(key: string, _section = 'general'): string | undefined {
        const sectionData: Record<string, string | string[]> = this.getSection(_section);
        if (sectionData[key] !== undefined) {
            if (Array.isArray(sectionData[key])) {
                console.log('Joining array entry into single string for key:', key);
                return sectionData[key].join('\n');
            } else {
                return sectionData[key] as string;
            }
        }
        return undefined;
    }

    private loaded: boolean = false;
    private sections: Record<string, Record<string, string | string[]>> = {};

    private getSection(section: string): Record<string, string | string[]> {
        if (!this.loaded) {
            const content = fs.readFileSync(this.getConfigPath(), 'utf-8');
            this.sections = this.parseConfigSections(content);
            this.loaded = true;
        }

        return this.sections[section];
    }

    /**
     * Parses a configuration file into sections
     * @param content File content to parse
     * @returns Sections with key-value pairs
     */
    private parseConfigSections(
        content: string,
    ): Record<string, Record<string, string | string[]>> {
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
                console.log(
                    `Parsing key="${trimmedKey}" value="${value}" in section [${currentSection}]`,
                );
                // console.log('Current section data before insertion:', sections[currentSection][trimmedKey]);
                if (sections[currentSection][trimmedKey] !== undefined) {
                    // console.log(`Key "${trimmedKey}" already exists in section [${currentSection}]. Converting to array. Is array:`, Array.isArray(sections[currentSection][trimmedKey]));
                    if (!Array.isArray(sections[currentSection][trimmedKey])) {
                        console.log(`Converting existing entry to array for key "${trimmedKey}"`);
                        sections[currentSection][trimmedKey] = [
                            sections[currentSection][trimmedKey],
                        ];
                    }

                    const entries = sections[currentSection][trimmedKey] as string[];
                    entries.push(value);
                    sections[currentSection][trimmedKey] = entries;
                } else {
                    sections[currentSection][trimmedKey] = value;
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
    private saveConfigSections(sections: Record<string, Record<string, string | string[]>>): void {
        const cfgPath = this.getConfigPath();
        if (!cfgPath) {
            if (this.throwErrors) throw new Error('Config path is not set');
            return;
        }

        this.loaded = false;

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
            const keys = Object.keys(entries);
            for (const key of keys) {
                const value = entries[key] ?? '';
                if (Array.isArray(value)) {
                    for (const val of value) {
                        const escaped = String(val).replace(/"/g, '\\"');
                        outLines.push(`${key} = "${escaped}"`);
                    }
                } else {
                    const escaped = String(value).replace(/"/g, '\\"');
                    outLines.push(`${key} = "${escaped}"`);
                }
            }
            outLines.push('');
        }

        const content = outLines.join('\n');
        fs.writeFileSync(cfgPath, content, 'utf-8');
    }
}

export default ProjEnvProjectConfig;
