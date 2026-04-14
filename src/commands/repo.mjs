import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { outputSuccess, outputError } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function repo(action, repoUrl, { json = false, help = false } = {}) {
  if (help) {
    showHelp('repo', json);
    return;
  }

  if (!action) {
    outputError('repo', {
      code: 'MISSING_ACTION',
      message: 'Repository action is required',
      suggestions: ['Use: init, clone, sync, or status', 'Example: blog repo init']
    }, json);
    process.exit(1);
  }

  try {
    switch (action) {
      case 'init':
        await initRepo(json);
        break;
      case 'clone':
        if (!repoUrl) {
          outputError('repo', {
            code: 'MISSING_URL',
            message: 'Repository URL is required for clone',
            suggestions: ['Provide a Git repository URL', 'Example: blog repo clone https://github.com/user/blog-content.git']
          }, json);
          process.exit(1);
        }
        await cloneRepo(repoUrl, json);
        break;
      case 'sync':
        await syncRepo(json);
        break;
      case 'status':
        await repoStatus(json);
        break;
      default:
        outputError('repo', {
          code: 'UNKNOWN_ACTION',
          message: `Unknown repository action: ${action}`,
          suggestions: ['Available actions: init, clone, sync, status']
        }, json);
        process.exit(1);
    }
  } catch (error) {
    outputError('repo', {
      code: 'REPO_ERROR',
      message: error.message
    }, json);
    process.exit(1);
  }
}

async function initRepo(json) {
  const repoDir = resolve(process.cwd(), 'blog-content');

  if (existsSync(repoDir)) {
    outputError('repo', {
      code: 'REPO_EXISTS',
      message: 'Repository directory already exists',
      suggestions: ['Use a different directory', 'Delete existing directory first']
    }, json);
    process.exit(1);
  }

  mkdirSync(repoDir, { recursive: true });

  try {
    execSync('git init', { cwd: repoDir, stdio: 'pipe' });
    execSync('echo "# Blog Content" > README.md', { cwd: repoDir, stdio: 'pipe' });
    execSync('mkdir -p drafts posts', { cwd: repoDir, stdio: 'pipe' });
    execSync('git add README.md', { cwd: repoDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit"', { cwd: repoDir, stdio: 'pipe' });

    outputSuccess('repo', {
      message: 'Repository initialized successfully',
      path: repoDir
    }, json);
  } catch (error) {
    outputError('repo', {
      code: 'INIT_FAILED',
      message: `Failed to initialize repository: ${error.message}`
    }, json);
    process.exit(1);
  }
}

async function cloneRepo(repoUrl, json) {
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const repoDir = resolve(process.cwd(), repoName);

  if (existsSync(repoDir)) {
    outputError('repo', {
      code: 'REPO_EXISTS',
      message: 'Repository directory already exists',
      suggestions: ['Use a different directory', 'Delete existing directory first']
    }, json);
    process.exit(1);
  }

  try {
    execSync(`git clone ${repoUrl}`, { stdio: 'pipe' });

    outputSuccess('repo', {
      message: 'Repository cloned successfully',
      url: repoUrl,
      path: repoDir
    }, json);
  } catch (error) {
    outputError('repo', {
      code: 'CLONE_FAILED',
      message: `Failed to clone repository: ${error.message}`
    }, json);
    process.exit(1);
  }
}

async function syncRepo(json) {
  try {
    execSync('git pull origin main', { stdio: 'pipe' });

    outputSuccess('repo', {
      message: 'Repository synchronized successfully'
    }, json);
  } catch (error) {
    outputError('repo', {
      code: 'SYNC_FAILED',
      message: `Failed to sync repository: ${error.message}`
    }, json);
    process.exit(1);
  }
}

async function repoStatus(json) {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

    const changes = status.split('\n').filter(line => line.trim()).length;

    outputSuccess('repo', {
      message: 'Repository status retrieved',
      branch: branch,
      changes: changes,
      clean: changes === 0
    }, json);
  } catch (error) {
    outputError('repo', {
      code: 'STATUS_FAILED',
      message: `Failed to get repository status: ${error.message}`
    }, json);
    process.exit(1);
  }
}