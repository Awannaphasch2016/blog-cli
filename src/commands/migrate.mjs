import { getDb, closeDb } from '../lib/db.mjs';
import { outputSuccess, outputError } from '../lib/output.mjs';

export async function migrate({ json = false } = {}) {
  try {
    const db = getDb();

    await db`
      CREATE TABLE IF NOT EXISTS blog_articles (
        id            SERIAL PRIMARY KEY,
        devto_id      INTEGER UNIQUE NOT NULL,
        devto_url     TEXT NOT NULL,
        slug          TEXT NOT NULL,
        title         TEXT NOT NULL,
        file_path     TEXT NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT now(),
        updated_at    TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS blog_article_versions (
        id            SERIAL PRIMARY KEY,
        article_id    INTEGER NOT NULL REFERENCES blog_articles(id),
        version       INTEGER NOT NULL,
        content_hash  TEXT NOT NULL,
        content       TEXT NOT NULL,
        title         TEXT NOT NULL,
        tags          TEXT[],
        published_at  TIMESTAMPTZ DEFAULT now(),
        UNIQUE(article_id, version)
      )
    `;

    await db`
      CREATE INDEX IF NOT EXISTS idx_blog_articles_file_path
      ON blog_articles(file_path)
    `;

    await db`
      CREATE INDEX IF NOT EXISTS idx_blog_article_versions_article_id
      ON blog_article_versions(article_id)
    `;

    outputSuccess('migrate', {
      message: 'Migration complete. Tables blog_articles and blog_article_versions are ready.',
      tables_created: ['blog_articles', 'blog_article_versions'],
      indexes_created: ['idx_blog_articles_file_path', 'idx_blog_article_versions_article_id']
    }, json);

  } catch (err) {
    outputError('migrate', {
      code: 'MIGRATION_ERROR',
      message: err.message,
      suggestions: [
        'Check SUPABASE_DATABASE_URL environment variable',
        'Verify database connection',
        'Ensure proper database permissions'
      ]
    }, json);
    process.exit(1);
  } finally {
    await closeDb();
  }
}
