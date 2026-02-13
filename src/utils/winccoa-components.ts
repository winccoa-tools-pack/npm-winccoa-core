import { WinCCOAComponent } from '../types/components/WinCCOAComponent';
import * as componentImplementations from '../types/components/implementations';
import * as winccoaPaths from './winccoa-paths';

/**
 * Returns the canonical internal name of a WinCC OA component.
 *
 * This is a small helper around {@link WinCCOAComponent.getName}.
 */

export function getComponentName(component: WinCCOAComponent): string {
    return component.getName();
}

/**
 * Returns all WinCC OA components that are available on the host system for a given WinCC OA version.
 *
 * Behavior:
 * - Resolves the WinCC OA installation root for `oaVersion`.
 * - Instantiates the list of all known component implementations.
 * - Sets the requested version on each component and filters to only those whose executable exists.
 *
 * Notes:
 * - This function checks component availability by calling `component.exists()`, which in turn relies on
 *   the version-specific installation path lookup.
 *
 * @param oaVersion - WinCC OA version string (e.g. `"3.20"`).
 * @returns Array of components that exist for that version.
 * @throws Error if the WinCC OA installation for the given version cannot be found.
 */
export function getAllWinCCOAComponents(oaVersion: string): WinCCOAComponent[] {
    // Validate that the requested WinCC OA version exists on this host.
    const oaPath = winccoaPaths.getWinCCOAInstallationPathByVersion(oaVersion);

    if (!oaPath) {
        throw new Error(`WinCC OA version ${oaVersion} not found. Cannot retrieve components.`);
    }

    const allPossibleComponents = componentImplementations.getAllComponents();

    const components: WinCCOAComponent[] = [];

    allPossibleComponents.forEach((component) => {
        component.setVersion(oaVersion);
        if (component.exists()) {
            components.push(component);
        }
    });

    return components;
}
