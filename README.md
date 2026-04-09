# Blog CLI

CLI tool to publish markdown articles to Dev.to with versioned snapshots in Supabase.

## Features

- ✍️ Create new blog post drafts
- 📝 Publish articles to Dev.to
- 💾 Automatic versioned snapshots in Supabase
- 🔄 Serverless function support for publishing
- 📊 Article status tracking

## Installation

### Via OpenCLI (Recommended)

```bash
opencli install blog
```

### Manual Installation

```bash
git clone https://github.com/blog-cli
cd blog-cli
npm install
npm link
```

## Configuration

Set the following environment variables:

```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-key"
export DEVTO_API_KEY="your-devto-api-key"
```

## Usage

### Create a new post

```bash
blog new "My Awesome Post" --tags javascript,tutorial
```

### Publish a post

```bash
# Publish as draft
blog publish ./my-post.md --draft

# Publish immediately
blog publish ./my-post.md --published

# Use serverless function
blog publish ./my-post.md --function v1
```

### List articles

```bash
blog list
blog list --published
```

### Check status

```bash
blog status ./my-post.md
```

## Serverless Functions

The CLI supports serverless publishing functions:

- `--function v1` - Current publishing implementation
- `--function v2` - Enhanced publishing (coming soon)
- `--function-url <url>` - Custom function endpoint
- `--local` - Force local publishing

## Commands

| Command | Description |
|---------|-------------|
| `new` | Create a new blog post draft |
| `publish` | Publish a post to Dev.to |
| `list` | List published articles |
| `status` | Check publishing status |

## Development

```bash
# Install dependencies
npm install

# Deploy serverless functions
cd lambda
npm install
npm run deploy

# Run tests
npm test
```

## License

MIT