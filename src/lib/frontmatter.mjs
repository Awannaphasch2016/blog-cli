import matter from 'gray-matter';

export function parseFrontmatter(rawContent) {
  const { data, content } = matter(rawContent);

  if (!data.title) {
    throw new Error('Frontmatter must include "title"');
  }

  return {
    title: data.title,
    body_markdown: content.trim(),
    tags: data.tags || [],
    description: data.description || '',
    canonical_url: data.canonical_url || null,
    published: data.published !== false,
    series: data.series || null,
  };
}
