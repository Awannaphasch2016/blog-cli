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
    workflow: { type: 'boolean', default: false },
    rich: { type: 'boolean', default: true },
    force: { type: 'boolean', default: false },
    verbose: { type: 'boolean', short: 'v', default: false },
    explain: { type: 'boolean', default: false },
    // Sale script options
    personalize: { type: 'boolean', default: false },
    industry: { type: 'string' },
    channel: { type: 'string' },
    duration: { type: 'string' },
    save: { type: 'boolean', default: false },
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
    await migrate({ json: values.json, workflow: values.workflow });
  } else if (command === 'new') {
    const { newPost } = await import('../src/commands/new.mjs');
    await newPost(rest[0], {
      template: values.template,
      target: values.target,
      json: values.json,
      help: values.help
    });
  } else if (command === 'spec') {
    const { spec } = await import('../src/commands/spec.mjs');
    await spec(rest, { json: values.json, help: values.help, rich: values.rich, force: values.force, verbose: values.verbose });
  } else if (command === 'generate') {
    const { generate } = await import('../src/commands/generate.mjs');
    await generate(rest[0], { dry: values.dry, json: values.json, help: values.help, template: values.template, target: values.target, explain: values.explain });
  } else if (command === 'dsl') {
    const { dsl } = await import('../src/commands/dsl.mjs');
    await dsl(rest, { json: values.json, help: values.help });
  } else if (command === 'create') {
    const { create } = await import('../src/commands/create.mjs');
    await create(rest, { json: values.json, help: values.help });
  } else if (command === 'edit') {
    const { edit } = await import('../src/commands/edit.mjs');
    await edit(rest, { json: values.json, help: values.help });
  } else if (command === 'explain') {
    const { explain } = await import('../src/commands/explain.mjs');
    await explain(rest, { json: values.json, help: values.help });
  } else if (command === 'init') {
    const { init } = await import('../src/commands/init.mjs');
    await init(rest, { json: values.json, help: values.help });
  } else if (command === 'inspect') {
    const { inspect } = await import('../src/commands/inspect.mjs');
    await inspect(rest, { json: values.json, help: values.help });
  } else if (command === 'suggest') {
    const { suggest } = await import('../src/commands/suggest.mjs');
    await suggest(rest, { json: values.json, help: values.help });
  } else if (command === 'sync') {
    const { sync } = await import('../src/commands/sync.mjs');
    await sync(rest, { json: values.json, help: values.help });
  } else if (command === 'workflow') {
    const { workflow } = await import('../src/commands/workflow.mjs');
    await workflow(rest, { json: values.json, help: values.help });
  } else if (command === 'repo') {
    const { repo } = await import('../src/commands/repo.mjs');
    await repo(rest[0], rest[1], { json: values.json, help: values.help });
  } else if (command === 'sale-script') {
    const subcommand = rest[0];
    if (subcommand === 'generate') {
      const { saleScriptGenerate } = await import('../src/commands/sale-script-generate.mjs');
      await saleScriptGenerate(rest[1], {
        template: values.template,
        personalize: values.personalize,
        industry: values.industry,
        channel: values.channel,
        duration: values.duration,
        json: values.json,
        save: values.save,
        force: values.force,
        help: values.help,
        verbose: values.verbose,
        explain: values.explain,
        config: values.config
      });
    } else if (subcommand === 'spec') {
      const { saleScriptSpec } = await import('../src/commands/sale-script-spec.mjs');
      await saleScriptSpec(rest.slice(1), {
        json: values.json,
        verbose: values.verbose,
        force: values.force,
        help: values.help
      });
    } else {
      if (values.json) {
        console.log(JSON.stringify({
          status: 'error',
          error: {
            code: 'UNKNOWN_SUBCOMMAND',
            message: `Unknown sale-script subcommand: ${subcommand || 'none'}`,
            available_subcommands: ['spec', 'generate']
          },
          suggestions: ['Use sale-script spec --help or sale-script generate --help']
        }, null, 2));
      } else {
        console.error(`Unknown sale-script subcommand: ${subcommand || 'none'}`);
        console.error('Available subcommands: spec, generate');
        console.error('Use sale-script <subcommand> --help for detailed usage');
      }
      process.exit(1);
    }
  } else {
    if (values.json) {
      console.log(JSON.stringify({
        status: 'error',
        error: {
          code: 'UNKNOWN_COMMAND',
          message: `Unknown command: ${command}`,
          available_commands: ['publish', 'status', 'list', 'validate', 'migrate', 'new', 'spec', 'generate', 'dsl', 'create', 'edit', 'explain', 'init', 'inspect', 'suggest', 'sync', 'workflow', 'repo', 'sale-script']
        },
        suggestions: ['Use --help to see available commands', 'Check command spelling']
      }, null, 2));
    } else {
      console.error(`Unknown command: ${command}`);
      console.error('Available commands: publish, status, list, validate, migrate, new, spec, generate, dsl, create, edit, explain, init, inspect, suggest, sync, workflow, repo, sale-script');
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
