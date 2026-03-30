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
      suggestions: [
        'Available actions: init, clone, sync, status',
        'Example: blog repo init',
        'Example: blog repo clone <repository-url>'
      ]
    }, json);
    process.exit(1);
  }

  try {
    switch (action) {
      case 'init':
        await initContentRepo(json);
        break;
      case 'clone':
        await cloneContentRepo(repoUrl, json);
        break;
      case 'sync':
        await syncContentRepo(json);
        break;
      case 'status':
        await statusContentRepo(json);
        break;
      default:
        outputError('repo', {
          code: 'UNKNOWN_ACTION',
          message: `Unknown action: ${action}`,
          suggestions: ['Available actions: init, clone, sync, status']
        }, json);
        process.exit(1);
    }
  } catch (error) {
    outputError('repo', {
      code: error.code || 'REPO_ERROR',
      message: error.message,
      suggestions: ['Check git installation', 'Verify repository permissions', 'Check network connection']
    }, json);
    process.exit(1);
  }
}

async function initContentRepo(json) {
  const targetPath = resolve(process.cwd(), '../blog-content');

  if (existsSync(targetPath)) {
    outputError('repo', {
      code: 'REPO_EXISTS',
      message: 'Blog content repository already exists',
      path: targetPath,
      suggestions: ['Use "blog repo sync" to update existing repo', 'Remove existing directory if starting fresh']
    }, json);
    process.exit(1);
  }

  // Create directory
  mkdirSync(targetPath, { recursive: true });

  // Initialize git repository
  execSync('git init', { cwd: targetPath });

  // Create basic structure (this would be more comprehensive in practice)
  const dirs = ['posts', 'drafts', 'templates', 'assets', 'scripts', '.github/workflows'];
  dirs.forEach(dir => {
    mkdirSync(join(targetPath, dir), { recursive: true });
  });

  // Create initial commit
  execSync('git add .', { cwd: targetPath });
  execSync('git commit -m "Initial blog content repository setup"', { cwd: targetPath });

  outputSuccess('repo', {
    action: 'init',
    path: targetPath,
    message: 'Blog content repository initialized',
    nextSteps: [
      'Add remote: git remote add origin <repository-url>',
      'Push to GitHub: git push -u origin main',
      'Create first post: blog new "My First Post"'
    ]
  }, json);
}

async function cloneContentRepo(repoUrl, json) {
  if (!repoUrl) {
    outputError('repo', {
      code: 'MISSING_REPO_URL',
      message: 'Repository URL is required for clone action',
      suggestions: ['Provide repository URL', 'Example: blog repo clone https://github.com/user/blog-content.git']
    }, json);
    process.exit(1);
  }

  const targetPath = resolve(process.cwd(), '../blog-content');

  if (existsSync(targetPath)) {
    outputError('repo', {
      code: 'TARGET_EXISTS',
      message: 'Target directory already exists',
      path: targetPath,
      suggestions: ['Remove existing directory', 'Use different target location']
    }, json);
    process.exit(1);
  }

  // Clone repository
  execSync(`git clone ${repoUrl} ${targetPath}`, { stdio: 'inherit' });

  outputSuccess('repo', {
    action: 'clone',
    repoUrl,
    path: targetPath,
    message: 'Blog content repository cloned successfully',
    nextSteps: [
      'Navigate to repository: cd ../blog-content',
      'Install dependencies: npm install',
      'Create new post: blog new "Post Title"'
    ]
  }, json);
}

async function syncContentRepo(json) {
  const repoPath = findContentRepo();

  if (!repoPath) {
    outputError('repo', {
      code: 'NO_CONTENT_REPO',
      message: 'No blog content repository found',
      suggestions: ['Run "blog repo init" or "blog repo clone <url>"', 'Navigate to blog content directory']
    }, json);
    process.exit(1);
  }

  try {
    // Fetch latest changes
    execSync('git fetch origin', { cwd: repoPath });

    // Get current branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    // Pull latest changes
    execSync(`git pull origin ${currentBranch}`, { cwd: repoPath });

    outputSuccess('repo', {
      action: 'sync',
      path: repoPath,
      branch: currentBranch,
      message: 'Repository synchronized with remote'
    }, json);

  } catch (syncError) {
    outputError('repo', {
      code: 'SYNC_FAILED',
      message: 'Failed to sync repository',
      error: syncError.message,
      suggestions: ['Check network connection', 'Resolve merge conflicts', 'Verify repository access']
    }, json);
    process.exit(1);
  }
}

async function statusContentRepo(json) {
  const repoPath = findContentRepo();

  if (!repoPath) {
    outputError('repo', {
      code: 'NO_CONTENT_REPO',
      message: 'No blog content repository found',
      suggestions: ['Run "blog repo init" or "blog repo clone <url>"']
    }, json);
    process.exit(1);
  }

  try {
    // Get git status
    const status = execSync('git status --porcelain', {
      cwd: repoPath,
      encoding: 'utf8'
    });

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    // Count files
    const postCount = execSync('find posts -name "*.md" | wc -l', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    const draftCount = execSync('find drafts -name "*.md" | wc -l', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    const hasChanges = status.trim().length > 0;

    outputSuccess('repo', {
      action: 'status',
      path: repoPath,
      branch,
      hasChanges,
      changedFiles: hasChanges ? status.trim().split('\n').length : 0,
      stats: {
        posts: parseInt(postCount),
        drafts: parseInt(draftCount)
      }
    }, json);

  } catch (statusError) {
    outputError('repo', {
      code: 'STATUS_FAILED',
      message: 'Failed to get repository status',
      error: statusError.message
    }, json);
    process.exit(1);
  }
}

function findContentRepo() {
  const possiblePaths = [
    process.cwd(),
    resolve(process.cwd(), '../blog-content'),
    resolve(process.cwd(), 'blog-content'),
  ];

  for (const path of possiblePaths) {
    if (existsSync(join(path, '.git')) && existsSync(join(path, 'templates'))) {
      return path;
    }
  }

  return null;
}