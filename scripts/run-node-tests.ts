import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function collectTestFiles(rootDir: string): string[] {
    const out: string[] = [];
    const stack: string[] = [rootDir];

    while (stack.length > 0) {
        const dir = stack.pop()!;
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (entry.isFile() && entry.name.endsWith('.test.ts')) {
                out.push(fullPath);
            }
        }
    }

    return out.sort();
}

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
    console.error('Usage: node --import tsx scripts/run-node-tests.ts <dir> [dir...]');
    process.exit(2);
}

const cwd = process.cwd();
const files = dirs
    .map((d) => path.resolve(cwd, d))
    .flatMap((d) => collectTestFiles(d));

if (files.length === 0) {
    console.error(`No '*.test.ts' files found under: ${dirs.join(', ')}`);
    process.exit(1);
}


    let failed = false;
    for (const file of files) {
        const args = ['--import', 'tsx', '--test', '--test-force-exit', file];
        const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
        if (result.status !== 0) {
            failed = true;
        }
    }
    process.exit(failed ? 1 : 0);
