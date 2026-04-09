import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';

const DEFAULT_CONFIG_PATH = join(homedir(), '.blog', 'config.json');
const DEFAULT_CONFIG = {
  github: {
    owner: null,
    repo: null,
    token: process.env.GITHUB_TOKEN || null
  },
  publish: {
    platform: 'devto',
    autoPublish: false,
    apiToken: process.env.DEV_IO_API_TOKEN || null
  },
  database: {
    url: process.env.SUPABASE_DATABASE_URL || null
  },
  output: {
    format: 'human',
    color: true
  },
  directories: {
    content: 'content',
    drafts: 'drafts'
  }
};

export function loadConfig(customPath = null) {
  const configPath = customPath || DEFAULT_CONFIG_PATH;

  // Load from file if exists
  if (existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      return mergeConfig(DEFAULT_CONFIG, fileConfig);
    } catch (error) {
      console.warn(`Warning: Failed to load config from ${configPath}:`, error.message);
    }
  }

  // Load from environment variables
  return mergeWithEnv(DEFAULT_CONFIG);
}

export function saveConfig(config, customPath = null) {
  // Debug logging
  if (typeof customPath === 'object') {
    console.error('WARNING: saveConfig received object instead of string:', customPath);
    customPath = null;
  }

  const configPath = customPath || DEFAULT_CONFIG_PATH;
  const configDir = dirname(configPath);

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Save config file
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function validateConfig(config) {
  const errors = [];

  // Check GitHub configuration
  if (!config.github.owner || !config.github.repo) {
    errors.push('GitHub owner and repository must be configured');
  }

  // Check for API tokens when needed
  if (config.publish.platform === 'devto' && !config.publish.apiToken) {
    errors.push('Dev.to API token is required for publishing (DEV_IO_API_TOKEN)');
  }

  if (!config.github.token) {
    errors.push('GitHub token is required (GITHUB_TOKEN)');
  }

  return { valid: errors.length === 0, errors };
}

function mergeConfig(defaults, overrides) {
  const merged = { ...defaults };

  for (const key in overrides) {
    if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      merged[key] = { ...defaults[key], ...overrides[key] };
    } else {
      merged[key] = overrides[key];
    }
  }

  return mergeWithEnv(merged);
}

function mergeWithEnv(config) {
  // Override with environment variables if present
  if (process.env.GITHUB_TOKEN) {
    config.github.token = process.env.GITHUB_TOKEN;
  }
  if (process.env.DEV_IO_API_TOKEN) {
    config.publish.apiToken = process.env.DEV_IO_API_TOKEN;
  }
  if (process.env.SUPABASE_DATABASE_URL) {
    config.database.url = process.env.SUPABASE_DATABASE_URL;
  }
  if (process.env.GITHUB_OWNER) {
    config.github.owner = process.env.GITHUB_OWNER;
  }
  if (process.env.GITHUB_REPO) {
    config.github.repo = process.env.GITHUB_REPO;
  }

  return config;
}