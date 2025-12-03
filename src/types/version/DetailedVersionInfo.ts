/**
 * Detailed version information for WinCC OA components.
 */

export interface DetailedVersionInfo {
    /** Major version number */
    major: number;
    /** Minor version number */
    minor: number;
    /** Optional patch version number */
    patch?: number;
    /** Original version string */
    raw: string;
    /** Numeric comparable value produced by parseVersionString */
    numeric?: number;
}
