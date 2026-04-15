# endlesstesting

AI-powered A/B testing from the command line. Endless Testing generates variants, allocates traffic with Thompson sampling, and auto-evaluates winners — no manual intervention needed.

## Install

```bash
npm install -g endlesstesting
```

## Quick start

```bash
# 1. Authenticate with your API key (get one at app.endlesstesting.ai)
endlesstesting auth et_live_abc123

# 2. Register your domain and get the SDK snippet
endlesstesting init

# 3. Start a test run (creates 5 AI-generated tests)
endlesstesting run https://example.com/pricing

# 4. Check test status
endlesstesting status

# 5. View results (impressions, conversions, uplift)
endlesstesting results
```

## Commands

| Command | Description |
|---------|-------------|
| `auth <key>` | Authenticate with your API key |
| `auth --status` | Check authentication status |
| `auth --logout` | Remove stored API key |
| `init` | Register a domain and get the SDK snippet |
| `run <url>` | Start a new AI test run for a page |
| `status` | List test runs and their status |
| `results` | Show variant performance data |
| `stop` | Activate kill switch (stop all tests) |
| `stop <id>` | Pause a specific test |
| `stop --resume` | Resume tests / deactivate kill switch |
| `mcp` | Start the MCP server for AI coding tools |
| `docs` | Open the documentation in your browser |

## MCP setup

Use Endless Testing from Claude Code, Cursor, or any MCP-compatible tool.

**Claude Code** (`~/.claude.json`):

```json
{
  "mcpServers": {
    "endlesstesting": {
      "command": "npx",
      "args": ["endlesstesting", "mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "endlesstesting": {
      "command": "npx",
      "args": ["endlesstesting", "mcp"]
    }
  }
}
```

## Documentation

Full docs at [docs.endlesstesting.ai](https://docs.endlesstesting.ai).

## License

[Endless Testing License v1.0](./LICENSE.md) -- free for individuals and teams of 3 or fewer.
