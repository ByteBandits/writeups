#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const generatorScript = path.join(__dirname, 'generate_index.py');

const isWindows = process.platform === 'win32';
const pythonFromEnv = process.env.PYTHON;
const pythonCandidates = [];

if (pythonFromEnv) {
  pythonCandidates.push(pythonFromEnv);
}

if (process.env.VIRTUAL_ENV) {
  pythonCandidates.push(
    path.join(
      process.env.VIRTUAL_ENV,
      isWindows ? 'Scripts' : 'bin',
      isWindows ? 'python.exe' : 'python',
    ),
  );
}

const localVenv = path.join(
  repoRoot,
  '.venv',
  isWindows ? 'Scripts' : 'bin',
  isWindows ? 'python.exe' : 'python',
);
if (existsSync(localVenv)) {
  pythonCandidates.push(localVenv);
}

const pythonNames = isWindows
  ? ['python.exe', 'python3.exe', 'py', 'python']
  : ['python3', 'python'];
pythonCandidates.push(...pythonNames);

function resolvePython() {
  for (const candidate of pythonCandidates) {
    if (!candidate) continue;
    const check = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (!check.error && (check.status === 0 || check.status === null)) {
      return candidate;
    }
  }
  return null;
}

const pythonExecutable = resolvePython();

if (!pythonExecutable) {
  console.error(
    "Unable to find a Python interpreter. Activate your virtual environment or set the PYTHON environment variable.",
  );
  process.exit(1);
}

const result = spawnSync(pythonExecutable, [generatorScript], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
