import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { outputSuccess, outputError } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function newPost(title, { template = 'technical-post', target = 'drafts', json = false, help = false } = {}) {
  if (help) {
    showHelp('new', json);
    return;
  }

  if (!title) {
    outputError('new', {
      code: 'MISSING_TITLE',
      message: 'Post title is required',
      suggestions: ['Provide a descriptive post title', 'Example: blog new "How to Build a REST API"']
    }, json);
    process.exit(1);
  }

  try {
    // Check if we're in a blog content repository
    const contentRepoPath = findContentRepo();

    if (!contentRepoPath) {
      outputError('new', {
        code: 'NO_CONTENT_REPO',
        message: 'No blog content repository found',
        suggestions: [
          'Run "blog repo init" to set up content repository',
          'Navigate to your blog-content directory',
          'Clone your blog content repository first'
        ]
      }, json);
      process.exit(1);
    }

    // Generate filename from title
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens

    const filename = `${date}-${slug}.md`;
    const targetPath = join(contentRepoPath, target);
    const filePath = join(targetPath, filename);

    // Check if file already exists
    if (existsSync(filePath)) {
      outputError('new', {
        code: 'FILE_EXISTS',
        message: `File already exists: ${filename}`,
        file: filePath,
        suggestions: [
          'Choose a different title',
          'Delete existing file if starting over',
          'Edit existing file instead'
        ]
      }, json);
      process.exit(1);
    }

    // Read template
    const templatePath = join(contentRepoPath, 'templates', `${template}-template.md`);

    if (!existsSync(templatePath)) {
      outputError('new', {
        code: 'TEMPLATE_NOT_FOUND',
        message: `Template not found: ${template}`,
        suggestions: [
          'Use available templates: technical-post, tutorial, announcement, opinion',
          'Check template name spelling',
          'Create custom template if needed'
        ]
      }, json);
      process.exit(1);
    }

    let templateContent = readFileSync(templatePath, 'utf-8');

    // Replace placeholder values in template
    templateContent = templateContent
      .replace(/title: ".*?"/, `title: "${title}"`)
      .replace(/Your Technical Post Title/g, title)
      .replace(/How to \[Do Something\]: A Complete Guide/g, title)
      .replace(/Announcing \[Product\/Feature Name\]/g, title)
      .replace(/Why I Think \[Your Opinion\/Position\]/g, title);

    // Write the new post
    writeFileSync(filePath, templateContent);

    // Create git branch for the post
    const branchName = `post/${slug}`;

    try {
      execSync(`git checkout -b ${branchName}`, {
        cwd: contentRepoPath,
        stdio: 'pipe'
      });
    } catch (gitError) {
      // Branch creation failed, but file was created successfully
      // Continue without failing the entire operation
    }

    outputSuccess('new', {
      title,
      filename,
      filePath,
      template: `${template}-template`,
      targetDirectory: target,
      branchName,
      nextSteps: [
        `Edit the post: ${filePath}`,
        'Validate: blog validate ' + join(target, filename),
        'Create PR when ready for review'
      ]
    }, json);

  } catch (error) {
    outputError('new', {
      code: error.code || 'NEW_POST_ERROR',
      message: error.message,
      suggestions: ['Check file permissions', 'Ensure content repository is accessible']
    }, json);
    process.exit(1);
  }
}

function findContentRepo() {
  // Look for blog content repository in common locations
  const possiblePaths = [
    process.cwd(), // Current directory
    resolve(process.cwd(), '../blog-content'), // Sibling directory
    resolve(process.cwd(), 'blog-content'), // Subdirectory
  ];

  for (const path of possiblePaths) {
    if (existsSync(join(path, 'templates')) && existsSync(join(path, 'posts'))) {
      return path;
    }
  }

  return null;
}