# In10x MCP - Post builds from Claude Code

Turn your coding sessions into social proof. This MCP generates engaging posts about what you're building and pushes them directly to [In10x](https://in10x.com).

## What it does

- **generate_content** - Creates X posts (280 chars) and In10x posts from your session context
- **quick_post** - Fast updates for quick wins
- **push_to_in10x** - Publishes directly to your In10x profile
- **connect_account** - Links your In10x account
- **set_project_context** - Stores project info for better posts

## Install

### 1. Clone and build

```bash
git clone https://github.com/TacoBadger/in10x-mcp.git
cd in10x-mcp
npm install
npm run build
```

### 2. Add to your editor

<details>
<summary><strong>Claude Desktop</strong></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "in10x": {
      "command": "node",
      "args": ["/path/to/in10x-mcp/build/index.js"]
    }
  }
}
```

On macOS with Homebrew Node:
```json
{
  "mcpServers": {
    "in10x": {
      "command": "/opt/homebrew/opt/node@20/bin/node",
      "args": ["/path/to/in10x-mcp/build/index.js"],
      "env": {
        "PATH": "/opt/homebrew/opt/node@20/bin:/opt/homebrew/bin:/usr/bin:/bin"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "in10x": {
      "command": "node",
      "args": ["/path/to/in10x-mcp/build/index.js"]
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Edit `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "in10x": {
      "command": "node",
      "args": ["/path/to/in10x-mcp/build/index.js"]
    }
  }
}
```

</details>

### 3. Restart your editor

Restart Claude Desktop / Cursor / Windsurf to load the MCP.

## Connect your account

1. Go to [in10x.com/connect/mcp](https://in10x.com/connect/mcp) and generate a token
2. In your editor, say: `connect_account token="in10x_xxxxx..."`
3. You're connected! Token is saved for future sessions.

## Usage

**After shipping something:**
```
"Just shipped auth, generate a post"
```

**Quick wins:**
```
"quick post: fixed that nasty bug"
```

**Manual triggers:**
- `generate content` or `gc` or `/post`
- `quick post` or `qp`

**Push to In10x:**
```
"push to in10x"
```

Or just code - the MCP will offer to generate posts when you say things like "done", "shipped", "finally works", etc.

## How it works

1. You code and ship things
2. MCP detects wins or you trigger manually
3. AI generates engaging posts from your session
4. You approve and push to In10x
5. Your profile shows what you've built

## License

MIT
