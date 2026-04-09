import { getAllPublishedArticles, closeDb } from '../lib/db.mjs';
import { outputSuccess, outputError } from '../lib/output.mjs';
import { showHelp } from '../lib/help.mjs';

export async function list({ json = false, help = false } = {}) {
  if (help) {
    showHelp('list', json);
    return;
  }

  try {
    const articles = await getAllPublishedArticles();

    outputSuccess('list', {
      total: articles.length,
      articles: articles.map(article => ({
        file: article.file_path,
        title: article.title,
        url: article.devto_url,
        devto_id: article.devto_id,
        publishedAt: article.created_at,
        lastUpdated: article.updated_at,
        platform: 'devto'
      }))
    }, json);

  } catch (err) {
    outputError('list', {
      code: err.code || 'LIST_ERROR',
      message: err.message,
      suggestions: ['Check database connection', 'Run blog migrate to setup tables', 'Try again later']
    }, json);
    process.exit(1);
  } finally {
    await closeDb();
  }
}