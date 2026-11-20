import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const order = [
  'src/constants.js',
  'src/audio.js',
  'src/sprites.js',
  'src/webgl-post.js',
  'src/world.js',
  'src/game.js',
  'src/renderer.js',
  'src/main.js',
];

const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = order
  .map((rel) => {
    let code = fs.readFileSync(path.join(__dirname, rel), 'utf8');
    code = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
    code = code.replace(/^\s*export\s+(?=(const|let|var|function|class)\b)/gm, '');
    return `// === ${rel} ===\n${code.trim()}\n`;
  })
  .join('\n');

html = html
  .replace('<link rel="stylesheet" href="./style.css" />', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="./src/main.js"></script>', `<script>\n(() => {\n'use strict';\n${js}\n})();\n</script>`);

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'aether-blade.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html, 'utf8');
console.log(`Built aether-blade standalone HTML (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
