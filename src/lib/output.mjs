export function outputSuccess(command, data, jsonMode = false) {
  if (jsonMode) {
    console.log(JSON.stringify({
      status: 'success',
      command,
      data
    }, null, 2));
  } else {
    // Human-readable output based on command and data
    if (command === 'publish') {
      if (data.mode === 'create') {
        console.log(`Published (new): ${data.url}`);
        console.log(`  Version: ${data.version} | Hash: ${data.contentHash?.slice(0, 12)}...`);
      } else {
        console.log(`Updated: ${data.url}`);
        console.log(`  Version: ${data.version} | Hash: ${data.contentHash?.slice(0, 12)}...`);
      }
    } else if (command === 'status') {
      if (data.published) {
        console.log(`Status: Published`);
        console.log(`  URL: ${data.url}`);
        console.log(`  Published: ${data.publishedAt}`);
      } else {
        console.log(`Status: Not published`);
      }
    } else if (command === 'list') {
      console.log(`Total articles: ${data.total}`);
      data.articles.forEach(article => {
        console.log(`  ${article.file} → ${article.url}`);
      });
    } else {
      // Default success message
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export function outputError(command, error, jsonMode = false) {
  if (jsonMode) {
    console.log(JSON.stringify({
      status: 'error',
      command,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        ...(error.file && { file: error.file }),
        ...(error.line && { line: error.line })
      },
      ...(error.suggestions && { suggestions: error.suggestions })
    }, null, 2));
  } else {
    console.error(`Error: ${error.message}`);
    if (error.suggestions) {
      console.error('Suggestions:');
      error.suggestions.forEach(suggestion => {
        console.error(`  • ${suggestion}`);
      });
    }
  }
}

export function outputDryRun(command, data, jsonMode = false) {
  if (jsonMode) {
    console.log(JSON.stringify({
      status: 'dry_run',
      command,
      preview: data
    }, null, 2));
  } else {
    console.log('--- Dry Run ---');
    console.log(`File:   ${data.file}`);
    console.log(`Title:  ${data.title}`);
    console.log(`Tags:   ${data.tags?.join(', ') || '(none)'}`);
    console.log(`Hash:   ${data.contentHash?.slice(0, 12)}...`);
    console.log(`Action: ${data.action}`);
  }
}

export function outputNoChanges(jsonMode = false) {
  if (jsonMode) {
    console.log(JSON.stringify({
      status: 'no_changes',
      message: 'No changes detected, skipping publication'
    }, null, 2));
  } else {
    console.log('No changes detected, skipping publication');
  }
}