import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { findArticleByFilePath, getLatestVersion, closeDb } from '../lib/db.mjs';
import { outputSuccess, outputError } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function status(filePath, { json = false, help = false } = {}) {
  if (help) {
    showHelp('status', json);
    return;
  }

  try {
    if (filePath) {
      // Check specific file status
      const absolutePath = resolve(process.cwd(), filePath);

      if (!existsSync(absolutePath)) {
        outputError('status', {
          code: 'FILE_NOT_FOUND',
          message: `File not found: ${absolutePath}`,
          file: absolutePath,
          suggestions: ['Check file path spelling', 'Ensure file exists']
        }, json);
        process.exit(1);
      }

      const article = await findArticleByFilePath(absolutePath);

      if (!article) {
        outputSuccess('status', {
          file: absolutePath,
          published: false,
          message: 'File has not been published yet'
        }, json);
      } else {
        const latest = await getLatestVersion(article.id);
        outputSuccess('status', {
          file: absolutePath,
          published: true,
          url: article.devto_url,
          title: article.title,
          devto_id: article.devto_id,
          publishedAt: article.created_at,
          lastUpdated: article.updated_at,
          version: latest?.version || 1,
          platform: 'devto'
        }, json);
      }
    } else {
      // Show all published files status
      const { getAllPublishedArticles } = await import('../lib/db.mjs');
      const articles = await getAllPublishedArticles();

      outputSuccess('status', {
        total: articles.length,
        articles: articles.map(article => ({
          file: article.file_path,
          title: article.title,
          url: article.devto_url,
          publishedAt: article.created_at,
          lastUpdated: article.updated_at
        }))
      }, json);
    }
  } catch (err) {
    outputError('status', {
      code: err.code || 'STATUS_ERROR',
      message: err.message,
      suggestions: ['Check database connection', 'Try again later']
    }, json);
    process.exit(1);
  } finally {
    await closeDb();
  }
}