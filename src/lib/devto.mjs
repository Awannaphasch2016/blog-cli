function getToken() {
  const token = process.env.DEV_IO_API_TOKEN;
  if (!token) {
    throw new Error(
      'DEV_IO_API_TOKEN not set. Run via: doppler run --project blog --config dev -- blog <command>'
    );
  }
  return token;
}

export async function createArticle(article) {
  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dev.to API error (${res.status}): ${body}`);
  }
  return res.json();
}

export async function updateArticle(devtoId, article) {
  const res = await fetch(`https://dev.to/api/articles/${devtoId}`, {
    method: 'PUT',
    headers: {
      'api-key': getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dev.to API error (${res.status}): ${body}`);
  }
  return res.json();
}
