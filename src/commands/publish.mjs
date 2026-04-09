import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { sha256 } from '../lib/hash.mjs';
import {
  findArticleByFilePath,
  getLatestVersion,
  createArticleWithVersion,
  updateArticleWithVersion,
  closeDb,
} from '../lib/db.mjs';
import { createArticle, updateArticle } from '../lib/devto.mjs';
import { outputSuccess, outputError, outputDryRun, outputNoChanges } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function publish(filePath, { dry = false, json = false, help = false } = {}) {
  if (help) {
    showHelp('publish', json);
    return;
  }

  if (!filePath) {
    outputError('publish', {
      code: 'MISSING_FILE',
      message: 'File path is required',
      suggestions: ['Provide a markdown file path', 'Example: blog publish my-post.md']
    }, json);
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);

  let rawContent;
  try {
    rawContent = readFileSync(absolutePath, 'utf-8');
  } catch {
    outputError('publish', {
      code: 'FILE_NOT_FOUND',
      message: `File not found: ${absolutePath}`,
      file: absolutePath,
      suggestions: ['Check file path spelling', 'Ensure file exists', 'Use relative or absolute path']
    }, json);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = parseFrontmatter(rawContent);
  } catch (error) {
    outputError('publish', {
      code: 'INVALID_FRONTMATTER',
      message: error.message,
      file: absolutePath,
      suggestions: ['Add required title field to frontmatter', 'Check YAML syntax', 'Example: title: "My Post Title"']
    }, json);
    process.exit(1);
  }

  const contentHash = sha256(rawContent);

  try {
    const existing = await findArticleByFilePath(absolutePath);

    let mode;
    if (existing) {
      const latest = await getLatestVersion(existing.id);
      if (latest && latest.content_hash === contentHash) {
        outputNoChanges(json);
        return;
      }
      mode = 'update';
    } else {
      mode = 'create';
    }

    if (dry) {
      outputDryRun('publish', {
        file: absolutePath,
        title: parsed.title,
        tags: parsed.tags,
        contentHash,
        action: mode === 'create' ? 'CREATE new article' : `UPDATE article (devto_id: ${existing.devto_id})`
      }, json);
      return;
    }

    const articlePayload = {
      title: parsed.title,
      body_markdown: parsed.body_markdown,
      published: parsed.published,
      tags: parsed.tags,
    };
    if (parsed.description) articlePayload.description = parsed.description;
    if (parsed.canonical_url) articlePayload.canonical_url = parsed.canonical_url;
    if (parsed.series) articlePayload.series = parsed.series;

    if (mode === 'create') {
      const response = await createArticle(articlePayload);

      const result = await createArticleWithVersion({
        devtoId: response.id,
        devtoUrl: response.url,
        slug: response.slug,
        title: parsed.title,
        filePath: absolutePath,
        contentHash,
        content: rawContent,
        tags: parsed.tags,
      });

      outputSuccess('publish', {
        mode: 'create',
        url: response.url,
        id: response.id,
        version: result.version,
        contentHash,
        file: absolutePath,
        platform: 'devto'
      }, json);
    } else {
      const response = await updateArticle(existing.devto_id, articlePayload);

      const result = await updateArticleWithVersion({
        articleId: existing.id,
        devtoUrl: response.url,
        slug: response.slug,
        title: parsed.title,
        contentHash,
        content: rawContent,
        tags: parsed.tags,
      });

      outputSuccess('publish', {
        mode: 'update',
        url: response.url,
        id: existing.devto_id,
        version: result.version,
        contentHash,
        file: absolutePath,
        platform: 'devto'
      }, json);
    }
  } catch (err) {
    outputError('publish', {
      code: err.code || 'PUBLISH_ERROR',
      message: err.message,
      suggestions: ['Check network connection', 'Verify Dev.to API token', 'Try again later']
    }, json);
    process.exit(1);
  } finally {
    await closeDb();
  }
}
