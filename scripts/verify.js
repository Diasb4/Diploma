import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'dist/index.html',
  'dist-server/index.js',
  'dist-server/app.js',
  'public/manifest.webmanifest',
  'public/aitu-mark.svg',
  'data/topics.json',
  'data/professors.json',
  'src/services/api.ts',
  'src/components/workspace/ApplicationsView.tsx',
  'server/src/services/session.ts'
];

for (const relativePath of requiredFiles) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing required file: ${relativePath}`);
}

const topics = JSON.parse(fs.readFileSync(path.join(baseDir, 'data/topics.json'), 'utf8')).topics;
const professors = JSON.parse(fs.readFileSync(path.join(baseDir, 'data/professors.json'), 'utf8'));
if (!Array.isArray(topics) || topics.length < 20) throw new Error('Topic dataset is incomplete');
if (!Array.isArray(professors) || professors.length < 100) throw new Error('Professor dataset is incomplete');

const clientBundle = fs.readdirSync(path.join(baseDir, 'dist/assets')).find((file) => file.endsWith('.js'));
if (!clientBundle) throw new Error('Client JavaScript bundle was not generated');
const bundleSize = fs.statSync(path.join(baseDir, 'dist/assets', clientBundle)).size;
if (bundleSize > 350_000) throw new Error(`Client bundle is too large: ${bundleSize} bytes`);

console.log(`Verification passed: ${topics.length} topics, ${professors.length} professors, bundle ${Math.round(bundleSize / 1024)} KiB.`);
