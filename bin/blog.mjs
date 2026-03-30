#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { showHelp } from '../src/lib/help.mjs';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    dry: { type: 'boolean', short: 'd', default: false },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    template: { type: 'string', short: 't', default: 'technical-post' },
    target: { type: 'string', default: 'drafts' },
  },
});

const [command, ...rest] = positionals;

if (values.help && !command) {
  showHelp(null, values.json);
  process.exit(0);
}

if (!command) {
  showHelp(null, values.json);
  process.exit(0);
}

try {
  if (command === 'publish') {
    const { publish } = await import('../src/commands/publish.mjs');
    await publish(rest[0], { dry: values.dry, json: values.json, help: values.help });
  } else if (command === 'status') {
    const { status } = await import('../src/commands/status.mjs');
    await status(rest[0], { json: values.json, help: values.help });
  } else if (command === 'list') {
    const { list } = await import('../src/commands/list.mjs');
    await list({ json: values.json, help: values.help });
  } else if (command === 'validate') {
    const { validate } = await import('../src/commands/validate.mjs');
    await validate(rest[0], { json: values.json, help: values.help });
  } else if (command === 'migrate') {
    const { migrate } = await import('../src/commands/migrate.mjs');
    await migrate({ json: values.json });
  } else if (command === 'new') {
    const { newPost } = await import('../src/commands/new.mjs');
    await newPost(rest[0], {
      template: values.template,
      target: values.target,
      json: values.json,
      help: values.help
    });
  } else if (command === 'repo') {
    const { repo } = await import('../src/commands/repo.mjs');
    await repo(rest[0], rest[1], { json: values.json, help: values.help });
  } else {
    if (values.json) {
      console.log(JSON.stringify({
        status: 'error',
        error: {
          code: 'UNKNOWN_COMMAND',
          message: `Unknown command: ${command}`,
          available_commands: ['publish', 'status', 'list', 'validate', 'migrate', 'new', 'repo']
        },
        suggestions: ['Use --help to see available commands', 'Check command spelling']
      }, null, 2));
    } else {
      console.error(`Unknown command: ${command}`);
      console.error('Available commands: publish, status, list, validate, migrate, new, repo');
      console.error('Use --help to see detailed usage information');
    }
    process.exit(1);
  }
} catch (err) {
  if (values.json) {
    console.log(JSON.stringify({
      status: 'error',
      error: {
        code: 'UNEXPECTED_ERROR',
        message: err.message
      }
    }, null, 2));
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(1);
}
