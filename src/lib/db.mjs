import postgres from 'postgres';

let sql;

export function getDb() {
  if (!sql) {
    const url = process.env.SUPABASE_DATABASE_URL;
    if (!url) {
      throw new Error(
        'SUPABASE_DATABASE_URL not set. Run via: doppler run --project blog --config dev -- blog <command>'
      );
    }
    sql = postgres(url, { ssl: 'require' });
  }
  return sql;
}

export async function closeDb() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export async function findArticleByFilePath(filePath) {
  const db = getDb();
  const rows = await db`
    SELECT id, devto_id, devto_url, slug, title
    FROM blog_articles
    WHERE file_path = ${filePath}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getLatestVersion(articleId) {
  const db = getDb();
  const rows = await db`
    SELECT version, content_hash
    FROM blog_article_versions
    WHERE article_id = ${articleId}
    ORDER BY version DESC
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createArticleWithVersion({ devtoId, devtoUrl, slug, title, filePath, contentHash, content, tags }) {
  const db = getDb();
  return db.begin(async (tx) => {
    const [article] = await tx`
      INSERT INTO blog_articles (devto_id, devto_url, slug, title, file_path)
      VALUES (${devtoId}, ${devtoUrl}, ${slug}, ${title}, ${filePath})
      RETURNING id
    `;
    const [version] = await tx`
      INSERT INTO blog_article_versions (article_id, version, content_hash, content, title, tags)
      VALUES (${article.id}, 1, ${contentHash}, ${content}, ${title}, ${tags})
      RETURNING version
    `;
    return { articleId: article.id, version: version.version };
  });
}

export async function updateArticleWithVersion({ articleId, devtoUrl, slug, title, contentHash, content, tags }) {
  const db = getDb();
  return db.begin(async (tx) => {
    await tx`
      UPDATE blog_articles
      SET title = ${title}, devto_url = ${devtoUrl}, slug = ${slug}, updated_at = now()
      WHERE id = ${articleId}
    `;
    const [latest] = await tx`
      SELECT COALESCE(MAX(version), 0) AS max_version
      FROM blog_article_versions
      WHERE article_id = ${articleId}
    `;
    const nextVersion = latest.max_version + 1;
    const [version] = await tx`
      INSERT INTO blog_article_versions (article_id, version, content_hash, content, title, tags)
      VALUES (${articleId}, ${nextVersion}, ${contentHash}, ${content}, ${title}, ${tags})
      RETURNING version
    `;
    return { version: version.version };
  });
}

export async function getAllPublishedArticles() {
  const db = getDb();
  const rows = await db`
    SELECT id, devto_id, devto_url, slug, title, file_path, created_at, updated_at
    FROM blog_articles
    ORDER BY updated_at DESC
  `;
  return rows;
}
