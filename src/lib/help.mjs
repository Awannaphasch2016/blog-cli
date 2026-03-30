export function getHelpData() {
  return {
    description: "CLI tool for publishing markdown articles to Dev.to with versioned tracking in Supabase",
    usage: "blog <command> [options]",
    commands: {
      publish: {
        description: "Publish markdown file to Dev.to platform",
        usage: "blog publish <file.md> [options]",
        required: ["file"],
        options: [
          { flag: "--dry", description: "Preview publication without actually publishing" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for publish command" }
        ],
        examples: [
          "blog publish my-post.md",
          "blog publish my-post.md --dry",
          "blog publish my-post.md --json"
        ]
      },
      status: {
        description: "Check publication status of markdown file",
        usage: "blog status [file.md] [options]",
        required: [],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for status command" }
        ],
        examples: [
          "blog status my-post.md",
          "blog status my-post.md --json",
          "blog status"
        ]
      },
      list: {
        description: "List all published articles",
        usage: "blog list [options]",
        required: [],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for list command" }
        ],
        examples: [
          "blog list",
          "blog list --json"
        ]
      },
      validate: {
        description: "Validate markdown file format before publishing",
        usage: "blog validate <file.md> [options]",
        required: ["file"],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for validate command" }
        ],
        examples: [
          "blog validate my-post.md",
          "blog validate my-post.md --json"
        ]
      },
      migrate: {
        description: "Create database tables for article tracking",
        usage: "blog migrate",
        required: [],
        options: [],
        examples: [
          "blog migrate"
        ]
      },
      new: {
        description: "Create new blog post from template",
        usage: "blog new <title> [options]",
        required: ["title"],
        options: [
          { flag: "--template", description: "Template to use (technical-post, tutorial, announcement, opinion)" },
          { flag: "--target", description: "Target directory (default: drafts)" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for new command" }
        ],
        examples: [
          "blog new \"How to Build a REST API\"",
          "blog new \"React Tutorial\" --template tutorial",
          "blog new \"My Opinion\" --template opinion --target drafts/ideas"
        ]
      },
      repo: {
        description: "Manage blog content repository",
        usage: "blog repo <action> [repository-url] [options]",
        required: ["action"],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for repo command" }
        ],
        examples: [
          "blog repo init",
          "blog repo clone https://github.com/user/blog-content.git",
          "blog repo sync",
          "blog repo status"
        ]
      }
    },
    file_requirements: {
      format: "markdown",
      frontmatter: {
        required: ["title"],
        optional: ["tags", "description", "published", "canonical_url", "series"]
      },
      example: `---
title: "My Blog Post"
tags: ["javascript", "react"]
description: "A great post about React"
published: true
---

# Post content here...`
    },
    environment: {
      required: [
        "DEV_IO_API_TOKEN - Your Dev.to API token",
        "SUPABASE_DATABASE_URL - Database connection string"
      ]
    }
  };
}

export function showHelp(command = null, jsonMode = false) {
  const helpData = getHelpData();

  if (jsonMode) {
    if (command) {
      console.log(JSON.stringify({
        command,
        ...helpData.commands[command]
      }, null, 2));
    } else {
      console.log(JSON.stringify(helpData, null, 2));
    }
    return;
  }

  // Human-readable help
  if (command && helpData.commands[command]) {
    const cmd = helpData.commands[command];
    console.log(`\n${cmd.description}`);
    console.log(`\nUsage: ${cmd.usage}`);

    if (cmd.options.length > 0) {
      console.log('\nOptions:');
      cmd.options.forEach(opt => {
        console.log(`  ${opt.flag.padEnd(12)} ${opt.description}`);
      });
    }

    console.log('\nExamples:');
    cmd.examples.forEach(example => {
      console.log(`  ${example}`);
    });
  } else {
    // General help
    console.log(helpData.description);
    console.log(`\nUsage: ${helpData.usage}`);
    console.log('\nCommands:');

    Object.entries(helpData.commands).forEach(([name, cmd]) => {
      console.log(`  ${name.padEnd(12)} ${cmd.description}`);
    });

    console.log('\nGlobal Options:');
    console.log('  --json       Output structured JSON response');
    console.log('  --help       Show help information');

    console.log('\nFile Format:');
    console.log('  Markdown files with YAML frontmatter');
    console.log('  Required: title');
    console.log('  Optional: tags, description, published, canonical_url, series');

    console.log('\nFor command-specific help: blog <command> --help');
  }
}