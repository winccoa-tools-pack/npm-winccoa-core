/**
 * WinCC OA Version Information Utilities
 * Handles version string parsing and comparison
 *
 * @author mPokornyETM
 */

/**
 * Parses a version string to a comparable number
 * Format: major.minor.patch (patch is optional)
 * @param version - Version string like "3.19" or "3.19.1"
 * @returns Numeric representation for comparison (e.g., "3.19" -> 30190, "3.19.1" -> 319001)
 */
export function parseVersionString(version: string): number {
    const parts = version.split('.').map(part => parseInt(part, 10) || 0);
    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;
    return major * 100000 + minor * 1000 + patch;
}
