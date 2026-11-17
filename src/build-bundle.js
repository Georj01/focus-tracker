// Zero-Dependency Offline Bundle Generator
// Concatenates ES6 modules in topological order into src/bundle.js for file:// execution

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.resolve(__dirname, '..');

const MODULES = [
    'src/engine/input.js',
    'src/engine/camera.js',
    'src/engine/i18n.js',
    'src/engine/audio.js',
    'src/engine/sprites.js',
    'src/engine/scenarios.js',
    'src/engine/dialog.js',
    'src/engine/tasks.js',
    'src/engine/stats.js',
    'src/engine/interactions.js',
    'src/engine/world.js',
    'src/engine/timer.js',
    'src/main.js'
];

function stripImportsAndExports(source) {
    // Remove multi-line and single-line ES module import declarations
    const withoutImports = source.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
    // Strip leading export keywords while keeping declarations intact
    return withoutImports.replace(/^\s*export\s+(const|let|var|function|class)\s+/gm, '$1 ');
}

const chunks = [
    '// Pomodoro World 2D - Standalone Bundle (Zero CORS, 100% Offline, Native file:// compatible)',
    '// Auto-generated via: node src/build-bundle.js',
    '(() => {',
    "    'use strict';",
    ''
];

for (const relPath of MODULES) {
    const absPath = path.join(rootDir, relPath);
    const raw     = fs.readFileSync(absPath, 'utf8');
    const cleaned = stripImportsAndExports(raw).trim();
    const indented = cleaned
        .split('\n')
        .map(line => (line.length > 0 ? `    ${line}` : ''))
        .join('\n');

    chunks.push(`    // ============================================================================`);
    chunks.push(`    // Module: ${relPath}`);
    chunks.push(`    // ============================================================================`);
    chunks.push(indented);
    chunks.push('');
}

chunks.push('})();');
chunks.push('');

const outPath = path.join(rootDir, 'src/bundle.js');
fs.writeFileSync(outPath, chunks.join('\n'), 'utf8');
console.log(`Built ${outPath} (${MODULES.length} modules bundled).`);
