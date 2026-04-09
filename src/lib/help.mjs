export function getHelpData() {
  return {
    description: "Blog CLI - Serverless blog generation and publishing to Dev.to",
    usage: "blog <command> [options]",
    workflow: {
      description: "Complete serverless blog publishing workflow",
      steps: [
        "1. blog spec 'your idea' > spec.yaml  # Generate rich DSL specification",
        "2. cat spec.yaml | blog generate      # Send to Lambda for generation",
        "3. blog sync --id <content-id>        # Download from S3 (optional)",
        "4. blog publish posts/*.md            # Publish to Dev.to"
      ],
      examples: [
        "# Quick serverless workflow:",
        "echo 'Write about React hooks' | blog spec | blog generate | blog publish",
        "",
        "# With Doppler credentials:",
        "doppler run -- blog generate idea.yaml | blog publish",
        "",
        "# Save and publish:",
        "blog generate idea.yaml | tee draft.md | blog publish"
      ]
    },
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
      },
      spec: {
        description: "Convert natural language to rich cognitive DSL for blog generation",
        usage: "echo 'idea' | blog spec [options]",
        required: [],
        options: [
          { flag: "--simple", description: "Use simple BSL format instead of rich DSL" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for spec command" }
        ],
        examples: [
          "echo 'Write about React hooks' | blog spec",
          "cat ideas.txt | blog spec > spec.yaml",
          "echo 'Tutorial on Node.js' | blog spec --simple",
          "echo 'your idea' | blog spec | blog create issue"
        ]
      },
      generate: {
        description: "Generate blog content via serverless Lambda function",
        usage: "blog generate [input] [options]",
        required: [],
        options: [
          { flag: "--json", description: "Return job metadata instead of content" },
          { flag: "--async", description: "Return immediately with job ID" },
          { flag: "--save", description: "Save to S3 drafts folder" },
          { flag: "--retry", description: "Retry a failed generation by job ID" },
          { flag: "--help", description: "Show help for generate command" }
        ],
        examples: [
          "cat spec.yaml | blog generate",
          "blog generate idea.yaml",
          "echo 'Write about React' | blog spec | blog generate",
          "blog generate idea.yaml --json  # Returns job metadata"
        ]
      },
      edit: {
        description: "Edit existing blog posts",
        usage: "blog edit <file.md> [options]",
        required: ["file"],
        options: [
          { flag: "--editor", description: "Editor to use (default: $EDITOR or vim)" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for edit command" }
        ],
        examples: [
          "blog edit posts/my-post.md",
          "blog edit posts/my-post.md --editor code"
        ]
      },
      init: {
        description: "Initialize blog configuration for serverless",
        usage: "blog init [options]",
        required: [],
        options: [
          { flag: "--aws-region", description: "AWS region for Lambda/S3" },
          { flag: "--api-endpoint", description: "API Gateway endpoint URL" },
          { flag: "--s3-bucket", description: "S3 bucket for content storage" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for init command" }
        ],
        examples: [
          "blog init",
          "blog init --aws-region us-east-1",
          "blog init --api-endpoint https://xxx.execute-api.amazonaws.com/prod"
        ]
      },
      workflow: {
        description: "Show complete blog workflow visualization",
        usage: "blog workflow [options]",
        required: [],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for workflow command" }
        ],
        examples: [
          "blog workflow",
          "blog workflow --json"
        ]
      },
      sync: {
        description: "Sync blog content from S3 storage",
        usage: "blog sync [options]",
        required: [],
        options: [
          { flag: "--id", description: "Content ID to download from S3" },
          { flag: "--list", description: "List available drafts in S3" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for sync command" }
        ],
        examples: [
          "blog sync --list",
          "blog sync --id abc123",
          "blog sync --list --json"
        ]
      },
      describe: {
        description: "Get detailed information about a command",
        usage: "blog describe <command> [options]",
        required: ["command"],
        options: [
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for describe command" }
        ],
        examples: [
          "blog describe generate",
          "blog describe generate --json"
        ]
      },
      "sale-script": {
        description: "Generate sales scripts from natural language descriptions",
        usage: "blog sale-script <subcommand> [options]",
        required: ["subcommand"],
        subcommands: {
          spec: "Convert natural language to Sales Script DSL",
          generate: "Generate sales scripts from DSL specification"
        },
        options: [
          { flag: "--template <type>", description: "Script template (cold_call, discovery_call, demo_call, follow_up, closing_call)" },
          { flag: "--personalize", description: "Include personalization notes and talking points" },
          { flag: "--industry <name>", description: "Customize for specific industry" },
          { flag: "--channel <type>", description: "Communication channel (phone, video, in_person, email)" },
          { flag: "--duration <time>", description: "Target duration (15min, 30min, 45min, 60min)" },
          { flag: "--json", description: "Output structured JSON response" },
          { flag: "--help", description: "Show help for sale-script command" }
        ],
        examples: [
          'echo "discovery call for tech prospects" | sale-script spec | sale-script generate',
          'sale-script generate prospect.yaml --template demo_call',
          'sale-script generate script.yaml --personalize --industry healthcare',
          'echo "cold call for SaaS prospects, 15 minutes" | sale-script spec --json'
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

    if (helpData.workflow) {
      console.log('\n📋 WORKFLOW:');
      console.log(helpData.workflow.description);
      helpData.workflow.steps.forEach(step => {
        console.log(`  ${step}`);
      });
      console.log('\nExamples:');
      helpData.workflow.examples.forEach(ex => {
        console.log(`  ${ex}`);
      });
    }

    console.log('\n📚 COMMANDS:');
    Object.entries(helpData.commands).forEach(([name, cmd]) => {
      console.log(`  ${name.padEnd(12)} ${cmd.description}`);
      if (cmd.subcommands) {
        Object.entries(cmd.subcommands).forEach(([sub, desc]) => {
          console.log(`    ${sub.padEnd(10)} ${desc}`);
        });
      }
    });

    console.log('\n⚙️  GLOBAL OPTIONS:');
    console.log('  --json       Output structured JSON response');
    console.log('  --verbose    Show detailed output');
    console.log('  --quiet      Suppress non-essential output');
    console.log('  --help       Show help information');

    console.log('\nFile Format:');
    console.log('  Markdown files with YAML frontmatter');
    console.log('  Required: title');
    console.log('  Optional: tags, description, published, canonical_url, series');

    console.log('\nFor command-specific help: blog <command> --help');
  }
}