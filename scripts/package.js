import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Packaging LumenRadar AI for customer server deployment...');

const zipPath = path.join(process.cwd(), 'lumenradar-deploy.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Ensure production dist is built
console.log('1. Building production frontend...');
execSync('npm run build', { stdio: 'inherit' });

console.log('2. Staging files for clean distribution...');
const stagingDir = path.join(process.cwd(), '.staging_bundle');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

const itemsToCopy = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.backend.json',
  'index.html',
  'vite.config.ts',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'deploy.sh',
  'deploy.bat',
  'DEPLOY.md',
  'HANDOVER_README.md',
  'README.md',
  '.env.example',
  'backend',
  'scripts',
  'tests',
  'src',
  'public',
  'dist'
];

for (const item of itemsToCopy) {
  const src = path.join(process.cwd(), item);
  const dst = path.join(stagingDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
  }
}

// Create clean data directory in staging and include pre-seeded database
fs.mkdirSync(path.join(stagingDir, 'data'), { recursive: true });
const sourceDb = path.join(process.cwd(), 'data', 'lighting-monitor.db');
if (fs.existsSync(sourceDb)) {
  fs.copyFileSync(sourceDb, path.join(stagingDir, 'data', 'lighting-monitor.db'));
}

// Copy default .env into staging if exists
if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  fs.copyFileSync(path.join(process.cwd(), '.env'), path.join(stagingDir, '.env'));
}

console.log('3. Compressing into lumenradar-deploy.zip...');
const cmd = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath 'lumenradar-deploy.zip' -Force"`;
execSync(cmd, { stdio: 'inherit' });

// Cleanup staging
fs.rmSync(stagingDir, { recursive: true, force: true });

console.log('\n==========================================================');
console.log('  SUCCESS! Standalone bundle created: lumenradar-deploy.zip');
console.log('  Upload this ZIP file to the customer server, unzip it, and run:');
console.log('    ./deploy.sh   (Linux / Ubuntu)');
console.log('    deploy.bat    (Windows Server)');
console.log('==========================================================\n');
