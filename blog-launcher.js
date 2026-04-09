#!/usr/bin/env node

/**
 * OpenCLI Launcher for blog CLI
 * This file is used by OpenCLI to execute the blog command
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blogCliPath = resolve(__dirname, 'bin', 'blog.mjs');

// Pass all arguments to the main CLI
const args = process.argv.slice(2);

const child = spawn('node', [blogCliPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});