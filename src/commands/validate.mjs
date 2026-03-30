import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { outputSuccess, outputError } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function validate(filePath, { json = false, help = false } = {}) {
  if (help) {
    showHelp('validate', json);
    return;
  }

  if (!filePath) {
    outputError('validate', {
      code: 'MISSING_FILE',
      message: 'File path is required',
      suggestions: ['Provide a markdown file path', 'Example: blog validate my-post.md']
    }, json);
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);

  try {
    // Check if file exists and is readable
    const rawContent = readFileSync(absolutePath, 'utf-8');

    // Check file extension
    if (!filePath.endsWith('.md') && !filePath.endsWith('.markdown')) {
      outputError('validate', {
        code: 'INVALID_FILE_TYPE',
        message: 'File must be a markdown file (.md or .markdown)',
        file: absolutePath,
        suggestions: ['Use .md or .markdown extension', 'Ensure file contains markdown content']
      }, json);
      process.exit(1);
    }

    // Check if file is empty
    if (rawContent.trim().length === 0) {
      outputError('validate', {
        code: 'EMPTY_FILE',
        message: 'File is empty',
        file: absolutePath,
        suggestions: ['Add content to the file', 'Include frontmatter with title']
      }, json);
      process.exit(1);
    }

    // Validate frontmatter
    let parsed;
    try {
      parsed = parseFrontmatter(rawContent);
    } catch (error) {
      outputError('validate', {
        code: 'INVALID_FRONTMATTER',
        message: error.message,
        file: absolutePath,
        suggestions: [
          'Add required title field to frontmatter',
          'Check YAML syntax in frontmatter',
          'Example frontmatter:',
          '---',
          'title: "Your Post Title"',
          'tags: ["tag1", "tag2"]',
          '---'
        ]
      }, json);
      process.exit(1);
    }

    // Check content length
    const wordCount = parsed.body_markdown.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = parsed.body_markdown.length;

    // Validate required and optional fields
    const validation = {
      file: absolutePath,
      valid: true,
      frontmatter: {
        title: parsed.title,
        tags: parsed.tags,
        description: parsed.description || null,
        published: parsed.published,
        canonical_url: parsed.canonical_url || null,
        series: parsed.series || null
      },
      content: {
        wordCount,
        charCount,
        hasContent: wordCount > 0
      },
      warnings: []
    };

    // Add warnings for best practices
    if (wordCount < 100) {
      validation.warnings.push('Content is quite short (less than 100 words)');
    }

    if (!parsed.description) {
      validation.warnings.push('No description provided - consider adding one for SEO');
    }

    if (!parsed.tags || parsed.tags.length === 0) {
      validation.warnings.push('No tags provided - consider adding relevant tags');
    }

    if (parsed.tags && parsed.tags.length > 4) {
      validation.warnings.push('Many tags provided - Dev.to recommends 4 or fewer tags');
    }

    outputSuccess('validate', validation, json);

  } catch (error) {
    if (error.code === 'ENOENT') {
      outputError('validate', {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${absolutePath}`,
        file: absolutePath,
        suggestions: ['Check file path spelling', 'Ensure file exists', 'Use relative or absolute path']
      }, json);
    } else {
      outputError('validate', {
        code: error.code || 'VALIDATION_ERROR',
        message: error.message,
        file: absolutePath,
        suggestions: ['Check file permissions', 'Ensure file is readable']
      }, json);
    }
    process.exit(1);
  }
}